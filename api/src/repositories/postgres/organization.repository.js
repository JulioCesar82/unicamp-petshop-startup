const { pool } = require('../../config/database');
const crudRepository = require('./crud.repository');
const { generateApiKey } = require('../../config/organizarion');

const organizationFields = ['name', 'social_name', 'description', 'identification_code', 'links'];
const organizationCrudRepository = crudRepository('organization', 'organization_id', organizationFields);

const createOrganizationAsync = async (organizationData, inviteCode) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const inviteResult = await client.query(
            'SELECT * FROM organization_invite WHERE invite_code = $1 AND nenabled = TRUE AND (expiration_date IS NULL OR expiration_date > NOW())',
            [inviteCode]
        );

        if (inviteResult.rows.length === 0) {
            throw new Error('Invalid or expired invite code.');
        }

        const newOrganization = await organizationCrudRepository.createAsync(organizationData);

        await client.query(
            'UPDATE organization_invite SET nenabled = FALSE WHERE invite_code = $1',
            [inviteCode]
        );

        const apiKey = generateApiKey();
        await client.query(
            'INSERT INTO organization_apikey (organization_id, api_key) VALUES ($1, $2)',
            [newOrganization.organization_id, apiKey]
        );

        await client.query('COMMIT');

        return { ...newOrganization, apiKey };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const getOrganizationByApiKeyAsync = async (apiKey) => {
    const client = await pool.connect();
    
    const result = await client.query(
        'SELECT o.* FROM organization o JOIN organization_apikey oa ON o.organization_id = oa.organization_id WHERE oa.api_key = $1 AND o.nenabled = TRUE AND oa.nenabled = TRUE',
        [apiKey]
    );

    return result.rows[0];
};

module.exports = {
    createOrganizationAsync,
    getOrganizationByIdAsync: organizationCrudRepository.getByIdAsync,
    disableOrganizationAsync: organizationCrudRepository.removeAsync,
    getOrganizationByApiKeyAsync
};
