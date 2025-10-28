#!/bin/bash
set -e

# Install JupyterLab extensions
# jupyter labextension install @jupyterlab/toc --no-build && \
beakerx install && \
    jupyter lab build --dev-build=False --minimize=True
