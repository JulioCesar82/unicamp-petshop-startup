# Guia Prático: Replicando as Etapas do Projeto de Big Data

Este diretório contém uma série de notebooks Jupyter que servem como um guia prático para replicar as etapas do projeto para Petshop.

## 1. Visão Geral da Arquitetura

A arquitetura deste projeto é composta pelos seguintes serviços:

- **PostgreSQL (`petshop_db`):** Nosso banco de dados transacional, onde os dados brutos de agendamentos, pets e tutores são armazenados.
- **Hadoop (`hadoop-master`):** O coração do nosso processamento de dados, incluindo HDFS para armazenamento distribuído e MapReduce para processamento em lote. O Sqoop também está neste contêiner para ingestão de dados.
- **Redis (`petshop_cache`):** Um banco de dados em memória usado como cache para armazenar e servir rapidamente os resultados processados, como as recomendações de serviços.
- **Python Loader (`loader-py`):** Um serviço customizado que lê os resultados do HDFS e os carrega no Redis.

## 2. Guias Práticos e Interativos (Notebooks)

Siga os notebooks na ordem abaixo para executar cada etapa do projeto de forma interativa. Cada notebook contém células de código `%%bash` ou Python que manipulam o ambiente Docker diretamente.

1.  **[Lab 1: Configuração do Banco de Dados (PostgreSQL)](./lab1-postgresql-setup.ipynb)**
    *   Este notebook usa uma biblioteca Python para se conectar ao contêiner do PostgreSQL e executa os scripts de criação e população do banco de dados.

2.  **[Lab 2.1: Pipeline de genração da frequência de ida ao Banho e Tosa](./lab2.1-pipeline-banho-e-tosa-referencia.ipynb)**
    *   Este notebook executa o pipeline de geração da frequência de ida ao banho e tosa de ponta a ponta.

3.  **[Lab 2.2: Pipeline de Recomendação de ida ao Banho e Tosa](./lab2.2-pipeline-banho-e-tosa-predicao.ipynb)**
    *   Este notebook executa o pipeline de recomendação de ida ao banho e tosa de ponta a ponta.

4.  **[Lab 3: Pipeline de Cálculo de Valor por Perfil de Pet](./lab3-pipeline-valor-por-perfil.ipynb)**
    *   Este notebook executa o pipeline de cálculo de Valor por Perfil de Pet (LTV).

5.  **[Lab 4: Pipeline para Recomendação de Vacinas](./lab4-pipeline-vacinacao-predicao.ipynb)**
    *   Este notebook executa o pipeline de recomendação de vacinas para cães e gatos.
