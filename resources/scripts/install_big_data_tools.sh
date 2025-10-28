#!/bin/bash
set -e

# Hadoop (349 MB)
wget -q https://archive.apache.org/dist/hadoop/common/hadoop-${HADOOP_VERSION}/hadoop-${HADOOP_VERSION}.tar.gz && \
    tar -xvf hadoop-${HADOOP_VERSION}.tar.gz >> /dev/null && \
    rm hadoop-${HADOOP_VERSION}.tar.gz

# Hive (273 MB)
wget -q https://archive.apache.org/dist/hive/hive-${HIVE_VERSION}/apache-hive-${HIVE_VERSION}-bin.tar.gz && \
    tar -xvf apache-hive-${HIVE_VERSION}-bin.tar.gz >> /dev/null && \
    rm apache-hive-${HIVE_VERSION}-bin.tar.gz && \
    mv apache-hive-${HIVE_VERSION}-bin hive-${HIVE_VERSION}

# Sqoop (1 MB)
wget -q https://archive.apache.org/dist/sqoop/${SQOOP_VERSION}/sqoop-${SQOOP_VERSION}.bin__hadoop-2.6.0.tar.gz && \
    tar -xf sqoop-${SQOOP_VERSION}.bin__hadoop-2.6.0.tar.gz >> /dev/null && \
    rm sqoop-${SQOOP_VERSION}.bin__hadoop-2.6.0.tar.gz && \
    mv sqoop-${SQOOP_VERSION}.bin__hadoop-2.6.0 sqoop-${SQOOP_VERSION}

# HBase (210 MB)
wget -q https://archive.apache.org/dist/hbase/${HBASE_VERSION}/hbase-${HBASE_VERSION}-bin.tar.gz && \
    tar -xf hbase-${HBASE_VERSION}-bin.tar.gz >> /dev/null && \
    rm hbase-${HBASE_VERSION}-bin.tar.gz

# Flume (64 MB)
wget -q https://archive.apache.org/dist/flume/${FLUME_VERSION}/apache-flume-${FLUME_VERSION}-bin.tar.gz && \
    tar -xf apache-flume-${FLUME_VERSION}-bin.tar.gz > /dev/null && \
    rm apache-flume-${FLUME_VERSION}-bin.tar.gz && \
    mv apache-flume-${FLUME_VERSION}-bin flume-${FLUME_VERSION}



# Download PostgreSQL JDBC driver
wget -q https://jdbc.postgresql.org/download/postgresql-42.2.5.jar -O postgresql-driver.jar
chmod 644 postgresql-driver.jar

# Create lib directory for Hive if it doesn't exist
mkdir -p ${HIVE_HOME}/lib

# Copy driver to all relevant lib directories
cp postgresql-driver.jar ${SQOOP_HOME}/lib/

cp ${SQOOP_HOME}/sqoop-${SQOOP_VERSION}.jar ${SQOOP_HOME}/lib/

cp postgresql-driver.jar ${HIVE_HOME}/lib/
cp postgresql-driver.jar ${HADOOP_HOME}/share/hadoop/common/lib/
