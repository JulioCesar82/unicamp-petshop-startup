const BaseRepository = require('../../dal/repositories/base.repository');
const knex = require('../../dal/query-builder/knex');
const { default_page, default_page_size } = require('../../config/database');

const tableName = 'pet';
const primaryKey = 'pet_id';

class PetRepository {
    constructor() {
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

    async findWithTutor(filter = {}, { page = default_page, pageSize = default_page_size, columns = ['pet.*', 'tutor.name as tutor_name'], organizationId = null }) {
        const query = knex(tableName)
            .select(columns)
            .join('tutor', `${tableName}.tutor_id`, 'tutor.tutor_id')
            .where({ ...filter, [`${tableName}.nenabled`]: true, 'tutor.nenabled': true });

        if (organizationId) {
            query.andWhere({ 'tutor.organization_id': organizationId });
        }

        const offset = (page - 1) * pageSize;
        query.limit(pageSize).offset(offset);

        const data = await query;

        const totalQuery = knex(tableName)
            .join('tutor', `${tableName}.tutor_id`, 'tutor.tutor_id')
            .count(`${tableName}.${primaryKey}`)
            .where({ ...filter, [`${tableName}.nenabled`]: true, 'tutor.nenabled': true });

        if (organizationId) {
            totalQuery.andWhere({ 'tutor.organization_id': organizationId });
        }
        const [{ count }] = await totalQuery;

        return {
            data,
            pagination: {
                page: parseInt(page),
                pageSize: parseInt(pageSize, 0),
                total: parseInt(count, 10),
            },
        };
    }
}

module.exports = new PetRepository();
