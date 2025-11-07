const BaseRepository = require('../../repositories/base.repository');

class PostgresProvider extends BaseRepository {
    constructor(tableName, primaryKey, useNenabled = true, useDlastupdate = true) {
        super(tableName, primaryKey, useNenabled, useDlastupdate);
    }
}

module.exports = PostgresProvider;
