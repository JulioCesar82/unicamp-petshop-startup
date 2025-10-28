#!/bin/bash
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
export PATH=$PATH:${JAVA_HOME}/bin


export HADOOP_VERSION=2.9.2
export HIVE_VERSION=2.3.9
export SQOOP_VERSION=1.4.7
export HBASE_VERSION=2.2.5
export FLUME_VERSION=1.9.0
export CODE_SERVER_VERSION=3.4.1


export HADOOP_HOME=/home/${NB_USER}/resources/hadoop-${HADOOP_VERSION}
export HIVE_HOME=/home/${NB_USER}/resources/hive-${HIVE_VERSION}
export SQOOP_HOME=/home/${NB_USER}/resources/sqoop-${SQOOP_VERSION}
export HBASE_HOME=/home/${NB_USER}/resources/hbase-${HBASE_VERSION}
export FLUME_HOME=/home/${NB_USER}/resources/flume-${FLUME_VERSION}
export CODE_SERVER_HOME=/home/${NB_USER}/resources/code-server-${CODE_SERVER_VERSION}
export PATH=$PATH:${HADOOP_HOME}/bin:${HADOOP_HOME}/sbin:${HIVE_HOME}/bin:${SQOOP_HOME}/bin:${HBASE_HOME}/bin:${FLUME_HOME}/bin:${CODE_SERVER_HOME}/bin
export HADOOP_SSH_OPTS="-o StrictHostKeyChecking=no -p 8822"
export PDSH_RCMD_TYPE=ssh
export HADOOP_IDENT_STRING=jovyan
