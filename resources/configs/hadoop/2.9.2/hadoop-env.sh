#!/usr/bin/env bash
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
export HADOOP_CLIENT_OPTS="-Djava.net.preferIPv4Stack=true ${HADOOP_CLIENT_OPTS}"
export HADOOP_OPTS="-Djava.library.path=${HADOOP_HOME}/lib/native ${HADOOP_OPTS}"
export HADOOP_COMMON_LIB_NATIVE_DIR="${HADOOP_HOME}/lib/native"
export YARN_OPTS="$YARN_OPTS -Djava.library.path=$HADOOP_HOME/lib/native"
