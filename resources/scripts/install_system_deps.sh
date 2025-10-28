#!/bin/bash
set -e

# Create a config file to disable date checking for apt
echo 'Acquire::Check-Valid-Until "false";' > /etc/apt/apt.conf.d/99-no-check-valid-until

# Update and install system dependencies
# rm -rf /var/lib/apt/lists/*
apt-get update || true
apt-get install -f -y || true
apt-get upgrade -y --fix-missing || true
# apt-get install -y --no-install-recommends mvn 
apt-get install -y --no-install-recommends \
    ca-certificates \
    ssh \
    maven \
    curl \
    unzip \
    wget \
    redis-server \
    net-tools \
    iproute2

# Install PostgreSQL

# apt-get install -y --no-install-recommends \
    # postgresql \
    # postgresql-client \
    # postgresql-contrib \

# Add PostgreSQL 17 repository
apt-get install -y --no-install-recommends \
    gnupg2 \
    lsb-release

curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/keyrings/postgresql.gpg
echo "deb [signed-by=/usr/share/keyrings/postgresql.gpg] http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list

# Update package list and install PostgreSQL 17
apt-get update
apt-get install -y  \
    postgresql-17  \
    postgresql-client-17  \
    postgresql-contrib-17

# Clean up the apt config file
rm /etc/apt/apt.conf.d/99-no-check-valid-until
