const PostgresProvider = require('../../dal/providers/postgres/postgres.provider');

class BookingRecommendationRepository extends PostgresProvider {
    constructor() {
        super('booking_recommendation');
    }
}

module.exports = new BookingRecommendationRepository();
