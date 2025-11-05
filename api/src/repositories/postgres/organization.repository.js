const BaseRepository = require('../../dal/repositories/base.repository');
const knex = require('../../dal/query-builder/knex');

const tableName = 'organization';

class OrganizationRepository {
    constructor() {
        this.provider = new BaseRepository(tableName);
    }

    async getOrganizationByApiKeyAsync(apiKey) {
        return knex(tableName)
            .join('organization_apikey', `${tableName}.organization_id`, 'organization_apikey.organization_id')
            .where('organization_apikey.api_key', apiKey)
            .first();
    }

    create(data) {
        return this.provider.create(data);
    }

    findById(id, columns) {
        return this.provider.findById(id, columns);
    }

    find(filter, options) {
        return this.provider.find(filter, options);
    }

    update(id, data) {
        return this.provider.update(id, data);
    }

    softDelete(id) {
        return this.provider.softDelete(id);
    }
}

module.exports = new OrganizationRepository();
