const PostgresProvider = require('../../dal/providers/postgres/postgres.provider');

class TutorRepository extends PostgresProvider {
    constructor() {
        super('tutor');
    }
}

module.exports = new TutorRepository();
