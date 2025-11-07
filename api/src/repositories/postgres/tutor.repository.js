const BaseRepository = require('../../dal/repositories/base.repository');

const tableName = 'tutor';
const primaryKey = 'tutor_id';

class TutorRepository {
    constructor() {
        // Used in tests
        this.provider = new BaseRepository(tableName, primaryKey);
    }

    create(data) {
        return this.provider.create(data);
    }

    createWithList(data) {
        return this.provider.createWithList(data);
    }

    findById(id, columns) {
        return this.provider.findById(id, columns);
    }

    find(filter, options) {
        return this.provider.find(filter, options);
    }

    update(id, data, trx = null) {
        return this.provider.update(id, data, trx);
    }

    softDelete(id) {
        return this.provider.softDelete(id);
    }

    deleteWithList(ids) {
        return this.provider.deleteWithList(ids);
    }

    updateWithList(data) {
        return this.provider.updateWithList(data);
    }
}

module.exports = new TutorRepository();
