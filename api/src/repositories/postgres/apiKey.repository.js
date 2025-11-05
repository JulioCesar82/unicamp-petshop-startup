const PostgresProvider = require('../../dal/providers/postgres/postgres.provider');

class ApiKeyRepository extends PostgresProvider {
    constructor() {
        super('organization_apikey', ['organization_id', 'api_key']);
    }
}

module.exports = new ApiKeyRepository();
