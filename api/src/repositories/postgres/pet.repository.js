const PostgresProvider = require('../../dal/providers/postgres/postgres.provider');
const knex = require('../../dal/query-builder/knex');
const { default_page, default_page_size } = require('../../config/database');

class PetRepository extends PostgresProvider {
    constructor() {
        super('pet');
    }

    async findWithTutor(filter = {}, { page = default_page, pageSize = default_page_size, columns = ['pet.*', 'tutor.name as tutor_name'], organizationId = null }) {
        const query = knex(this.tableName)
            .select(columns)
            .join('tutor', 'pet.tutor_id', 'tutor.tutor_id')
            .where({ ...filter, 'pet.nenabled': true, 'tutor.nenabled': true });

        if (organizationId) {
            query.andWhere({ 'tutor.organization_id': organizationId });
        }

        const offset = (page - 1) * pageSize;
        query.limit(pageSize).offset(offset);

        const data = await query;

        const totalQuery = knex(this.tableName)
            .join('tutor', 'pet.tutor_id', 'tutor.tutor_id')
            .count(`${this.tableName}.${this.primaryKey}`)
            .where({ ...filter, 'pet.nenabled': true, 'tutor.nenabled': true });

        if (organizationId) {
            totalQuery.andWhere({ 'tutor.organization_id': organizationId });
        }
        const [{ count }] = await totalQuery;

        return {
            data,
            pagination: {
                page,
                pageSize,
                total: parseInt(count, 10),
            },
        };
    }
}

module.exports = new PetRepository();
