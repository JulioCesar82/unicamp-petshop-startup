#!/bin/bash

# Install PostgreSQL client if not already installed
sudo apt-get update && \
    sudo apt-get install -y postgresql-client-17

# Definir variáveis de ambiente para Java e Hadoop
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV HADOOP_VERSION=2.9.2
ENV SQOOP_VERSION=1.4.7
ENV HADOOP_HOME=/usr/local/hadoop
ENV SQOOP_HOME=/usr/local/sqoop
ENV PATH=$PATH:${JAVA_HOME}/bin:${HADOOP_HOME}/bin:${HADOOP_HOME}/sbin:${SQOOP_HOME}/bin

# Baixar e configurar o Hadoop
RUN if [ ! -d "${HADOOP_HOME}" ]; then \
    wget -q https://archive.apache.org/dist/hadoop/common/hadoop-${HADOOP_VERSION}/hadoop-${HADOOP_VERSION}.tar.gz && \
    tar -xvf hadoop-${HADOOP_VERSION}.tar.gz -C /usr/local && \
    rm hadoop-${HADOOP_VERSION}.tar.gz && \
    mv /usr/local/hadoop-${HADOOP_VERSION} ${HADOOP_HOME} && \
    wget -q https://jdbc.postgresql.org/download/postgresql-42.2.5.jar -O ${HADOOP_HOME}/share/hadoop/common/lib/postgresql-42.2.5.jar; \
    fi

# Baixar e configurar o Sqoop
RUN if [ ! -d "${SQOOP_HOME}" ]; then \
    wget -q https://archive.apache.org/dist/sqoop/${SQOOP_VERSION}/sqoop-${SQOOP_VERSION}.bin__hadoop-2.6.0.tar.gz && \
    tar -xvf sqoop-${SQOOP_VERSION}.bin__hadoop-2.6.0.tar.gz -C /usr/local && \
    rm sqoop-${SQOOP_VERSION}.bin__hadoop-2.6.0.tar.gz && \
    mv /usr/local/sqoop-${SQOOP_VERSION}.bin__hadoop-2.6.0 ${SQOOP_HOME} && \
    cp ${HADOOP_HOME}/share/hadoop/common/lib/postgresql-42.2.5.jar ${SQOOP_HOME}/lib/ && \
    rm -f ${SQOOP_HOME}/lib/commons-lang3-*.jar && \
    cp ${HADOOP_HOME}/share/hadoop/common/lib/commons-lang-2.6.jar ${SQOOP_HOME}/lib/; \
    fi

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

# Ensures that the scripts are executable.
chmod +x $MAPPER_PATH
chmod +x $REDUCER_PATH

# Run Hadoop job
echo "Running Hadoop MapReduce job..."
hadoop jar $HADOOP_HOME/share/hadoop/tools/lib/hadoop-streaming-*.jar \
    -file $MAPPER_PATH \
    -mapper 'python3 mapper.py' \
    -file $REDUCER_PATH \
    -reducer 'python3 reducer.py' \
    -input $INPUT_DIR \
    -output $OUTPUT_DIR

# Renomeia o arquivo de saída para seguir o padrão 'part-r-00000'
hdfs dfs -mv $OUTPUT_DIR/part-00000 $OUTPUT_DIR/part-r-00000

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