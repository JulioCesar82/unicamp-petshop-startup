---
title: BemEstar.pet API
emoji: 🚀
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
---

<!-- ds header -->
<div align="center">
  <a href="https://github.com/thedatasociety" rel="noopener" target="_blank">
 <img src="https://avatars3.githubusercontent.com/u/47368510?s=200&v=4" alt="The Data Science & Engineering Society" width="100px">
    </a>
 <h5>BemEstar.pet API from The Data Science & Engineering Society</h5>
 
</div>
<!-- /ds header -->

# Explorando o setor de animais de estimação

Um laboratório para aprendizado de Hadoop, Redis e PostgreSQL para Pets.

## Execução do ambiente


Usando recursos da Binder:

<!-- 
[![Binder a partir da imagem Docker pronta](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/git/https%3A%2F%2Fhub.docker.com%2Fr%2Fjulio471%2Fjupter-hadoop-pets/master?urlpath=lab/tree)
-->

[![Binder a partir do Dockerfile-jupter](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/JulioCesar82/lab-hadoop-for-pet/master?urlpath=/)


ou então Localmente (mais recomendado via DockerHub):

```bash
docker run -d -p 8889:8888 --name my-jupter-hadoop-pets julio471/jupter-hadoop-pets:20.0 start-notebook.py --NotebookApp.token='my-token'
```
e acesse: [http://localhost:8889/lab?token=my-token](http://localhost:8889/lab?token=my-token)


ou Build local (menos recomendado porque demora muito, gerando um Container por volta de 4 a 5 GB):

```bash
docker build -t jupter-hadoop-pets -f Dockerfile-jupter.development .
docker run -d -p 8889:8888 --name my-jupter-hadoop-pets jupter-hadoop-pets start-notebook.py --NotebookApp.token='my-token'
```

e acesse: [http://localhost:8889/lab?token=my-token](http://localhost:8889/lab?token=my-token)

# Construção da API com base nos laboratórios

Esta API fornece os serviços essenciais para que os parceiros possam receber recomendações para seus usuários.

## Stack Tecnológico

- Plataforma Cloud: Google Cloud Platform (GCP)
- Linguagem: Node.js (versão LTS)
- Framework: Express.js
- Documentação REST: Especificação OpenAPI 3.0
- Banco de Dados: Em memória ou PostgreSQL
- Segurança: Google Cloud IAM, Secret Manager
- CI/CD: Google Cloud Build

## Arquitetura

A solução implantada como uma Google Cloud Function (Node.js) que expõe endpoints REST através de um API Gateway. O banco de dados utilizado o PostgreSQL.

```ascii
                                      +-----------------+
                                      |    Parceiros    |
                                      +--------+--------+
                                               |
                                               v
+---------------------------------------------------------------------------------------------+
|                                     Google Cloud Platform (GCP)                             |
|                         +-----------------------------------------+                         |
|                         |         Google Cloud API Gateway        |                         |
|                         +---------------------+-------------------+                         |
|                                               |                                             |
|                                               v                                             |
|                               +----------------------------------+                          |
|                               |  Google Cloud Function (Node.js) |                          |
|                               |  - Endpoint REST                 |                          |
|                               +-----------------+----------------+                          |
|                                                 |                                           |
|                                                 v                                           |
|                                     +------------------------+                              |
|                                     |       PostgreSQL       |                              |
|                                     +------------------------+                              |
+---------------------------------------------------------------------------------------------+

```

Endpoints (Local)
REST API Base URL: http://localhost:3000/api/v1
Swagger UI: http://localhost:3000/api-docs

Como Rodar Localmente
Instale as dependências:

```Bash
npm install
```

Para usar o PostgreSQL localmente:

```Bash
docker run --name meu-postgres \
  -e POSTGRES_USER=meu_usuario \
  -e POSTGRES_PASSWORD=minha_senha \
  -e POSTGRES_DB=meu_banco \
  -p 5432:5432 \
  -d postgres
```

Configure a variável de ambiente PostgreSQL:

```Bash
# PowerShell
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DB_USER="meu_usuario"
$env:DB_PASSWORD="minha_senha"
$env:DB_NAME="meu_banco"
$env:DB_SSLMODE=false

# No Mac/Linux
export DB_HOST="localhost"
export DB_PORT="5432"
export DB_USER="meu_usuario"
export DB_PASSWORD="minha_senha"
export DB_NAME="meu_banco"
export DB_SSLMODE=false
```

Inicie a aplicação:
```Bash
npm start
```

Como Rodar os Testes
```Bash
npm test
npm run test:bdd
```

## Execução do ambiente

Localmente via Docker:

```bash
docker build -t api-pets -f Dockerfile .
docker run -d -p 3000:3000 --name my-api-pets api-pets \
  -e RESOURCES_PATH='/api-resources' \
  -e API_PORT=3000 \

  -e DB_HOST='localhost' \
  -e DB_PORT='5432' \
  -e DB_USER='meu_usuario' \
  -e DB_PASSWORD='minha_senha' \
  -e DB_NAME='meu_banco' \
  -e DB_SSLMODE='false' \

  -e CLOUDINARY_CLOUD_NAME='' \
  -e CLOUDINARY_API_KEY='' \
  -e CLOUDINARY_API_SECRET='' \
  -e CLOUDINARY_UPLOAD_FOLDER='pet-images' \
  -e CLOUDINARY_UPLOAD_FORMAT='png'

  -e EMAIL_HOST='smtp.gmail.com' \
  -e EMAIL_PORT='465' \
  -e EMAIL_USER='' \
  -e EMAIL_PASS='' \
  -e EMAIL_FROM='Petshop Notificações' \
  -e EMAIL_SECURE='true' \
  -e EMAIL_SUBJECT='Novas Recomendações de Serviços para seu Pet' \
  -e EMAIL_TEMPLATE_PATH='src/templates/email-template.html'
```

---

## User Story

TODO...


## Membros atuais da equipe do projeto

* [JulioCesar82](https://github.com/JulioCesar82) -
**Julio Ávila** <https://www.linkedin.com/in/juliocesar82>


## Créditos

Um enorme agradecimento ao [Prof. Matheus Mota](https://www.linkedin.com/in/motams/), por todo o conhecimento e energia durante as aulas de banco de dados ministradas na Unicamp.
