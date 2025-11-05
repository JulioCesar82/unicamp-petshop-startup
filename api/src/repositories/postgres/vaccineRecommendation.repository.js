const PostgresProvider = require('../../dal/providers/postgres/postgres.provider');

class VaccineRecommendationRepository extends PostgresProvider {
    constructor() {
        super('vaccine_recommendation');
    }
}

module.exports = new VaccineRecommendationRepository();
