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
INPUT_DIR=/petshop/input_ltv
OUTPUT_DIR=/petshop/output_ltv
MAPPER_PATH=/api-resources/ltv-by-pet-profile-python/mapper.py
REDUCER_PATH=/api-resources/ltv-by-pet-profile-python/reducer.py
export PGPASSWORD=$DB_PASSWORD

echo "Starting LTV by pet profile pipeline..."

# Clean HDFS input dir
echo "Cleaning HDFS input directory..."
hdfs dfs -test -d $INPUT_DIR && hdfs dfs -rm -r $INPUT_DIR || true

# Sqoop import
echo "Importing data from PostgreSQL with Sqoop..."
sqoop import \
    --connect jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME \
    --username $DB_USER \
    --password $DB_PASSWORD \
    --query "SELECT CONCAT(p.species, ';', p.animal_type, ';', p.fur_type) AS perfil_pet, (hc.quantity * hc.price) AS valor_compra FROM purchase hc JOIN pet p ON hc.tutor_id = p.tutor_id WHERE hc.nenabled = TRUE AND p.nenabled = TRUE AND \$CONDITIONS" \
    --target-dir $INPUT_DIR \
    --m 1 \
    --split-by hc.purchase_id

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
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "TRUNCATE TABLE ltv_by_pet_profile;"

hdfs dfs -cat $OUTPUT_DIR/part-r-00000 | while IFS=$'\t' read -r pet_profile total_value; do
  species=$(echo $pet_profile | cut -d';' -f1)
  animal_type=$(echo $pet_profile | cut -d';' -f2)
  fur_type=$(echo $pet_profile | cut -d';' -f3)
  
  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "INSERT INTO ltv_by_pet_profile (species, animal_type, fur_type, total_value) VALUES ('$species', '$animal_type', '$fur_type', $total_value);"
done

echo "Pipeline finished successfully!"