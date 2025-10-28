const crudRepository = require('./crud.repository');
const { generateApiKey } = require('../../config/organizarion');

const apiKeyFields = ['organization_id', 'api_key'];
const apiKeyCrudRepository = crudRepository('organization_apikey', 'api_key', apiKeyFields);

const createApiKeyAsync = async (organizationId) => {
    const apiKey = generateApiKey();
    return await apiKeyCrudRepository.createAsync({ organization_id: organizationId, api_key: apiKey });
};

const getApiKeysByOrganizationIdAsync = async (organizationId, page, pageSize) => {
    return await apiKeyCrudRepository.findAsync({ organization_id: organizationId, nenabled: true }, organizationId, page, pageSize);
};

const deleteApiKeyAsync = async (organizationId, apiKey) => {
    const { pool } = require('../../config/database');

    const client = await pool.connect();

    const result = await client.query(
        'UPDATE organization_apikey SET nenabled = FALSE WHERE organization_id = $1 AND api_key = $2 RETURNING *',
        [organizationId, apiKey]
    );

    return result.rows[0];
};

const getOrganizationByApiKeyAsync = async (apiKey) => {
    const results = await apiKeyCrudRepository.findAsync({ api_key: apiKey, nenabled: true });
    return results.data[0];
};

module.exports = {
    createApiKeyAsync,
    getApiKeysByOrganizationIdAsync,
    deleteApiKeyAsync,
    getOrganizationByApiKeyAsync
};
