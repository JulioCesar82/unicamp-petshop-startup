#!/bin/bash
set -e

# Install Python dependencies on a single line to avoid shell interpretation issues
# We are removing the strict jupyterlab pin to allow pip to resolve a compatible version.
pip install --no-cache-dir \
    beakerx \
    py4j \
    jupyterlab \
    ipywidgets \
    jupyter-server-proxy \
    jupyter-vscode-proxy \
    mrjob \
    pprintpp \
    numpy \
    pandas \
    matplotlib \
    plotly \
    sqlalchemy \
    ipython-sql \
    psycopg2-binary \
    faker \
    redis
