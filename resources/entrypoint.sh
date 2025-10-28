#!/bin/bash
set -x

# Create a logs directory if it doesn't exist
mkdir -p ~/logs

# Start services in the background
echo "Starting services..."
nohup redis-server &> ~/logs/redis.log &
/usr/sbin/sshd -f /etc/ssh/sshd_config &> ~/logs/sshd.log &
nohup ~/resources/code-server-${CODE_SERVER_VERSION}/bin/code-server &> ~/logs/vscode.log &

# Wait for SSH port to be open
echo "Waiting for SSH port 8822 to open..."
while ! ss -tuln | grep -q ':8822'; do
    echo "Port 8822 is not open yet, waiting..."
    sleep 1
done
echo "SSH port 8822 is open."

# Wait for SSH to be ready for authentication
echo "Waiting for SSH to be ready for authentication..."
until ssh -o StrictHostKeyChecking=no -p 8822 ${NB_USER}@localhost exit; do
    echo "SSH authentication failed, waiting..."
    sleep 1
done
echo "SSH is ready for authentication."

# Start and configure PostgreSQL using a non-root method
echo "Initializing PostgreSQL in user's home directory..."

# Add PostgreSQL binaries to the PATH (version 17 is assumed from logs)
export PATH="/usr/lib/postgresql/17/bin:$PATH"

# Define local directories for PostgreSQL
PG_HOME="$HOME/postgres_nonroot"
PG_DATA="$PG_HOME/data"
PG_LOG="$PG_HOME/log"

# Create directories if they don't exist
mkdir -p "$PG_DATA" "$PG_LOG"

# Initialize the database cluster if it doesn't exist
if [ ! -f "$PG_DATA/PG_VERSION" ]; then
    echo "Initializing new PostgreSQL cluster in $PG_DATA..."
    initdb -D "$PG_DATA" > "$PG_LOG/initdb.log" 2>&1
else
    echo "PostgreSQL cluster already exists in $PG_DATA."
fi

# Start the PostgreSQL server
echo "Starting PostgreSQL server..."
pg_ctl -D "$PG_DATA" -l "$PG_LOG/postgresql.log" -o "-p 5432" start

# Wait for PostgreSQL to be ready with a timeout
echo "Waiting for PostgreSQL to be ready..."
for i in {1..20}; do
    if pg_isready -h localhost -p 5432 -q; then
        echo "PostgreSQL is ready."
        break
    fi
    echo "PostgreSQL not ready, waiting... (attempt $i/20)"
    sleep 1
done

# Final check, exit if it failed to start
if ! pg_isready -h localhost -p 5432 -q; then
    echo "ERROR: PostgreSQL failed to start after 20 seconds."
    echo "Displaying last 50 lines of log for debugging:"
    tail -n 50 "$PG_LOG/postgresql.log"
    exit 1
fi

# Configure database and users to mimic a standard setup.
# The user running the script (${NB_USER}) is the default superuser.
echo "Configuring PostgreSQL database and users..."
createdb postgres 2>/dev/null || echo "Database 'postgres' already exists."
psql -d postgres -c "CREATE USER postgres WITH PASSWORD 'postgres' SUPERUSER;" 2>/dev/null || psql -d postgres -c "ALTER USER postgres WITH SUPERUSER PASSWORD 'postgres';"
psql -d postgres -c "GRANT ALL ON SCHEMA public TO postgres;"

# Format and start Hadoop
echo "Formatting and starting Hadoop..."
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
export HADOOP_CONF_DIR=${HADOOP_HOME}/etc/hadoop
if [ ! -d /tmp/hadoop-jovyan/dfs/name/current ]; then
  echo "Formatting HDFS..."
  hdfs namenode -format -force -nonInteractive &> ~/logs/hadoop-format.log
else
  echo "HDFS already formatted."
fi

# Source Hadoop environment variables
. ${HADOOP_HOME}/etc/hadoop/hadoop-env.sh
start-dfs.sh &> ~/logs/hadoop-dfs.log 2>&1
start-yarn.sh &> ~/logs/hadoop-yarn.log 2>&1

# Wait for Hadoop to be ready
echo "Waiting for NameNode process to start..."
while ! jps | grep -q NameNode; do
    echo "NameNode process not found, waiting..."
    cat ~/logs/hadoop-dfs.log
    cat ~/logs/hadoop-yarn.log
    sleep 1
done
echo "NameNode process started."

echo "Waiting for NameNode port 9000 to open..."
while ! ss -tuln | grep -q ':9000'; do
    echo "Port 9000 is not open yet, waiting..."
    sleep 1
done
echo "NameNode port 9000 is open."

echo "Waiting for HDFS to exit safe mode..."
until hdfs dfsadmin -safemode get | grep -q "Safe mode is OFF"; do
    echo "HDFS still in safe mode, waiting..."
    sleep 1
done
echo "HDFS is ready!"

# Start HBase
echo "Starting HBase..."
${HBASE_HOME}/bin/start-hbase.sh &> ~/logs/hbase.log

echo "All services started."

# Execute the command passed to the container
exec "$@"
