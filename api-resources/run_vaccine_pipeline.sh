#!/bin/bash

# Exit on error
set -e

# Args
DB_USER=$1
DB_HOST=$2
DB_NAME=$3
DB_PASSWORD=$4
DB_PORT=$5

# Vars
INPUT_DIR=/petshop/input_vaccine_recommendation
OUTPUT_DIR=/petshop/output_vaccine_recommendation
MAPPER_PATH=/api-resources/vaccine-recommendation-python/mapper.py
REDUCER_PATH=/api-resources/vaccine-recommendation-python/reducer.py
export PGPASSWORD=$DB_PASSWORD

echo "Starting vaccine recommendation pipeline..."

# Clean HDFS input dir
echo "Cleaning HDFS input directory..."
hdfs dfs -test -d $INPUT_DIR && hdfs dfs -rm -r $INPUT_DIR || true

# Sqoop import
echo "Importing data from PostgreSQL with Sqoop..."
sqoop import \
    --connect jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME \
    --username $DB_USER \
    --password $DB_PASSWORD \
    --query "SELECT p.pet_id, p.species, p.birth_date, vr.vaccine_reference_id, vr.vaccine_name, vr.description, vr.target_species, vr.first_dose_age_months, vr.booster_interval_months, vr.mandatory, vc.application_date FROM pet p CROSS JOIN vaccine_reference vr LEFT JOIN vaccination_record vc ON p.pet_id = vc.pet_id AND vr.vaccine_reference_id = vc.vaccine_reference_id WHERE p.ignore_recommendation = false AND p.nenabled = TRUE AND vr.nenabled = TRUE AND \$CONDITIONS" \
    --target-dir $INPUT_DIR \
    --m 1 \
    --split-by p.pet_id

# Clean HDFS output dir
echo "Cleaning HDFS output directory..."
hdfs dfs -test -d $OUTPUT_DIR && hdfs dfs -rm -r $OUTPUT_DIR || true

# Run Hadoop job
echo "Running Hadoop MapReduce job..."
hadoop jar $HADOOP_HOME/share/hadoop/tools/lib/hadoop-streaming-*.jar \
    -file $MAPPER_PATH -mapper $MAPPER_PATH \
    -file $REDUCER_PATH -reducer $REDUCER_PATH \
    -input $INPUT_DIR \
    -output $OUTPUT_DIR

# Load results to PostgreSQL
echo "Loading results to PostgreSQL..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "TRUNCATE TABLE vaccine_recommendation;"

hdfs dfs -cat $OUTPUT_DIR/part-r-00000 | while IFS=$'\t' read -r pet_id values; do
  vaccine_name=$(echo $values | cut -d',' -f1)
  description=$(echo $values | cut -d',' -f2)
  mandatory=$(echo $values | cut -d',' -f3)
  sug_date=$(echo $values | cut -d',' -f4)
  
  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "INSERT INTO vaccine_recommendation (pet_id, vaccine_name, description, mandatory, suggested_date) VALUES ($pet_id, '$vaccine_name', '$description', $mandatory, '$sug_date');"
done

echo "Pipeline finished successfully!"