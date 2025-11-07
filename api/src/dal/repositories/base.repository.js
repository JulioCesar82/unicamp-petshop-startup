const knex = require('../query-builder/knex');
const { default_page, default_page_size } = require('../../config/database');

class BaseRepository {
    constructor(tableName, primaryKey = `${tableName}_id`, useNenabled = true, useDlastupdate = true) {
        this.tableName = tableName;
        this.primaryKey = primaryKey;
        this.useNenabled = useNenabled;
        this.useDlastupdate = useDlastupdate;
    }

    async create(data) {
        const [result] = await knex(this.tableName).insert(data).returning('*');
        return result;
    }

    async createWithList(data) {
        const result = await knex(this.tableName).insert(data).returning('*');
        return result;
    }

    async findById(id, columns = ['*']) {
        const where = { [this.primaryKey]: id };
        if (this.useNenabled) {
            where.nenabled = true;
        }

        return knex(this.tableName)
            .select(columns)
            .where(where)
            .first();
    }

    async find(filter = {}, { page = default_page, pageSize = default_page_size, columns = ['*'], organizationId = null }) {
        const where = { ...filter };
        if (this.useNenabled) {
            where.nenabled = true;
        }

        const query = knex(this.tableName)
            .select(columns);

        const whereClauses = {};
        const whereInClauses = {};

        for (const key in where) {
            if (Array.isArray(where[key])) {
                if (where[key].length > 0) {
                    whereInClauses[key] = where[key];
                }
            } else {
                whereClauses[key] = where[key];
            }
        }

        query.where(whereClauses);

        for (const key in whereInClauses) {
            query.whereIn(key, whereInClauses[key]);
        }

        if (organizationId) {
            query.andWhere({ organization_id: organizationId });
        }

        const offset = (page - 1) * pageSize;
        query.limit(pageSize).offset(offset);

        const data = await query;

        const totalQuery = knex(this.tableName).count('* as count');

        totalQuery.where(whereClauses);

        for (const key in whereInClauses) {
            totalQuery.whereIn(key, whereInClauses[key]);
        }

        if (organizationId) {
            totalQuery.andWhere({ organization_id: organizationId });
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

    async update(id, data) {
        const where = typeof id === 'object' && !Array.isArray(id) ? id : { [this.primaryKey]: id };

        const dataToUpdate = { ...data };
        if (this.useDlastupdate) {
            dataToUpdate.dlastupdate = new Date();
        }

        const [result] = await knex(this.tableName)
            .where(where)
            .update(dataToUpdate)
            .returning('*');
        return result;
    }

    async updateWithList(data) {
        const result = await knex.transaction(async trx => {
            const queries = data.map(item => {
                const dataToUpdate = { ...item };
                if (this.useDlastupdate) {
                    dataToUpdate.dlastupdate = new Date();
                }
                return knex(this.tableName)
                    .where({ [this.primaryKey]: item[this.primaryKey] })
                    .update(dataToUpdate)
                    .returning('*')
                    .transacting(trx);
            });
            return Promise.all(queries);
        });

        return result.flat();
    }

    async softDelete(id) {
        return this.update(id, { nenabled: false });
    }

    async deleteWithList(ids) {
        return knex(this.tableName)
            .whereIn(this.primaryKey, ids)
            .update({ nenabled: false, dlastupdate: new Date() });
    }
}

module.exports = BaseRepository;
