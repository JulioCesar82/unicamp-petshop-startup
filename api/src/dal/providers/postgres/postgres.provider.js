const BaseRepository = require('../../repositories/base.repository');

class PostgresProvider extends BaseRepository {
    constructor(tableName, primaryKey, useNenabled = true) {
        super(tableName, primaryKey, useNenabled);
    }
}

module.exports = PostgresProvider;
