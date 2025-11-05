const PostgresProvider = require('../../dal/providers/postgres/postgres.provider');
const knex = require('../../dal/query-builder/knex');

class OrganizationRepository extends PostgresProvider {
    constructor() {
        super('organization');
    }

    async getOrganizationByApiKeyAsync(apiKey) {
        return knex(this.tableName)
            .join('organization_apikey', 'organization.organization_id', 'organization_apikey.organization_id')
            .where('organization_apikey.api_key', apiKey)
            .first();
    }
}

module.exports = new OrganizationRepository();
