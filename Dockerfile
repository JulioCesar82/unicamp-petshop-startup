# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY ./api/package*.json .

# Install any needed packages
RUN npm install

# Bundle app source
COPY ./api .

COPY ./api-resources /api-resources

# Instalar dependências do sistema essenciais
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    openjdk-17-jdk \
    python3 \
    python3-pip \
    python3-dateutil \
    curl \
    wget \
    unzip \
    gnupg2 \
    lsb-release && \
    rm -rf /var/lib/apt/lists/*

# Adicionar o repositório PostgreSQL (This part should now run correctly)
RUN apt-get update && \
    curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | \
    gpg --dearmor -o /usr/share/keyrings/postgresql.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/postgresql.gpg] http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list

# Instalar PostgreSQL
RUN apt-get update && \
    apt-get install -y \
    postgresql-17 \
    postgresql-client-17 \
    postgresql-contrib-17 && \
    rm -rf /var/lib/apt/lists/*

# RUN apt-get update && \
    # redis-server

# Definir variáveis de ambiente para Java e Hadoop
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV HADOOP_VERSION=2.9.2
ENV SQOOP_VERSION=1.4.7
ENV HADOOP_HOME=/usr/local/hadoop
ENV SQOOP_HOME=/usr/local/sqoop
ENV PATH=$PATH:${JAVA_HOME}/bin:${HADOOP_HOME}/bin:${HADOOP_HOME}/sbin:${SQOOP_HOME}/bin

# Baixar e configurar o Hadoop
RUN wget -q https://archive.apache.org/dist/hadoop/common/hadoop-${HADOOP_VERSION}/hadoop-${HADOOP_VERSION}.tar.gz && \
    tar -xvf hadoop-${HADOOP_VERSION}.tar.gz -C /usr/local && \
    rm hadoop-${HADOOP_VERSION}.tar.gz && \
    mv /usr/local/hadoop-${HADOOP_VERSION} ${HADOOP_HOME} && \
    wget -q https://jdbc.postgresql.org/download/postgresql-42.2.5.jar -O ${HADOOP_HOME}/share/hadoop/common/lib/postgresql-42.2.5.jar

# Baixar e configurar o Sqoop
RUN wget -q https://archive.apache.org/dist/sqoop/${SQOOP_VERSION}/sqoop-${SQOOP_VERSION}.bin__hadoop-2.6.0.tar.gz && \
    tar -xvf sqoop-${SQOOP_VERSION}.bin__hadoop-2.6.0.tar.gz -C /usr/local && \
    rm sqoop-${SQOOP_VERSION}.bin__hadoop-2.6.0.tar.gz && \
    mv /usr/local/sqoop-${SQOOP_VERSION}.bin__hadoop-2.6.0 ${SQOOP_HOME} && \
    cp ${HADOOP_HOME}/share/hadoop/common/lib/postgresql-42.2.5.jar ${SQOOP_HOME}/lib/

# Copiar arquivos de configuração do Hadoop
# Define the command to run your app
CMD [ "node", "src/index.js" ]
