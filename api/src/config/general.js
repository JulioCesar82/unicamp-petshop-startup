module.exports = {
    resourcesPath: process.env.RESOURCES_PATH || '/api-resources',
    apiKeyHeaderName: 'x-api-key',
    apiPort: process.env.API_PORT || 3000,
    statusCodes: {
        OK: 200,
        CREATED: 201,
        ACCEPTED: 202,
        NO_CONTENT: 204,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        INTERNAL_SERVER_ERROR: 500,
    },
    batch_codes: {
        RUNNING: 'RUNNING',
        FAILED: 'FAILED',
        COMPLETED: 'COMPLETED'
    }
};