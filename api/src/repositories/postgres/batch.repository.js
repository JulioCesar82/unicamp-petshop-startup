const PostgresProvider = require('../../dal/providers/postgres/postgres.provider');

class BatchRepository extends PostgresProvider {
    constructor() {
        super('execution_history', 'execution_id', false);
    }
}

module.exports = new BatchRepository();
