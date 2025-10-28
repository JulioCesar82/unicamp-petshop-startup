#!/bin/bash
set -e

# Create necessary directories
mkdir -p ~/resources/local ~/logs ~/.ssh

# Setup passphraseless SSH
ssh-keygen -t rsa -P '' -f ~/.ssh/id_rsa && \
    cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys && \
    chmod 0600 ~/.ssh/authorized_keys && \
    chmod 0700 ~/.ssh
