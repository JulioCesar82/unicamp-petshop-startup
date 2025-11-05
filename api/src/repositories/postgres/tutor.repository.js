const BaseRepository = require('../../dal/repositories/base.repository');

class TutorRepository {
    constructor() {
        // Used in tests
        this.provider = new BaseRepository('tutor');
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

module.exports = new TutorRepository();
