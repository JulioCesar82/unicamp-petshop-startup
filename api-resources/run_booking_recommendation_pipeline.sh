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
INPUT_DIR=/petshop/input_booking_recommendation
OUTPUT_DIR=/petshop/output_booking_recommendation
MAPPER_PATH=/api-resources/booking-recommendation-python/mapper.py
REDUCER_PATH=/api-resources/booking-recommendation-python/reducer.py
export PGPASSWORD=$DB_PASSWORD

echo "Starting booking recommendation pipeline..."

# Clean HDFS input dir
echo "Cleaning HDFS input directory..."
hdfs dfs -test -d $INPUT_DIR && hdfs dfs -rm -r $INPUT_DIR || true

# Sqoop import
echo "Importing data from PostgreSQL with Sqoop..."
sqoop import \
    --connect jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME \
    --username $DB_USER \
    --password $DB_PASSWORD \
    --query "SELECT b.pet_id, b.booking_date, br.frequency_days FROM booking b JOIN pet p ON b.pet_id = p.pet_id JOIN booking_reference br ON p.species = br.species AND p.animal_type = br.animal_type AND p.fur_type = br.fur_type WHERE b.status = 'Realizado' AND p.ignore_recommendation = false AND p.nenabled = TRUE AND b.nenabled = TRUE AND br.nenabled = TRUE AND \$CONDITIONS" \
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

# Load results to Redis
# echo "Loading results to Redis..."
# redis-cli -h localhost KEYS "recommendation:booking:pet:*" | xargs -r redis-cli -h localhost DEL
# hdfs dfs -cat $OUTPUT_DIR/part-r-00000 | while IFS=$'\t' read -r pet_id values; do
#     sug_date=$(echo $values | cut -d',' -f1)
#     avg_freq=$(echo $values | cut -d',' -f2)
#     redis-cli -h localhost HSET "recommendation:booking:pet:$pet_id" suggested_date "$sug_date" average_frequency_days "$avg_freq"
# done

# Load results to PostgreSQL
echo "Loading results to PostgreSQL..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "TRUNCATE TABLE booking_recommendation;"

hdfs dfs -cat $OUTPUT_DIR/part-r-00000 | while IFS=$'\t' read -r pet_id values; do
  suggested_date=$(echo $values | cut -d',' -f1)
  avg_freq_days=$(echo $values | cut -d',' -f2)
  
  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "INSERT INTO booking_recommendation (pet_id, suggested_date, average_frequency_days) VALUES ($pet_id, '$suggested_date', $avg_freq_days);"
done

echo "Pipeline finished successfully!"