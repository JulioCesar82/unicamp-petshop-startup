const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const appConfig = require('../../package.json');

const description = `${appConfig.description}

---
**Base URL (Produção):** \`/api/v1/\`
**Swagger JSON:** [api-docs.json](/api-docs.json)

`;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: appConfig.name,
      version: appConfig.version,
      description,
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Servidor de desenvolvimento - v1',
      },
      {
        url: 'https://julio471-inf332-hackaton-petshop.hf.space/api/v1',
        description: 'Servidor de Produção - v1',
      },
    ],
    components: {
      schemas: {
        PaginatedResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              description: 'Array of items'
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  description: 'The current page number'
                },
                pageSize: {
                  type: 'integer',
                  description: 'Number of items per page'
                },
                total: {
                  type: 'integer',
                  description: 'Total number of items'
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensagem de erro'
            },
            statusCode: {
              type: 'integer',
              description: 'Tipo do erro'
            }
          },
          example: {
            message: 'Recurso não encontrado',
            statusCode: 500
          }
        }
      },
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key'
        }
      }
    },
    security: [{
      ApiKeyAuth: []
    }]
  },
  apis: ['./src/routes/*.js'], // Path to the files containing the API annotations
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};
