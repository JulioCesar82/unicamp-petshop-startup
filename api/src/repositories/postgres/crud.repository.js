const { pool } = require('../../config/database');
const { 
    validateTableName, 
    validateColumnName, 
    validateFields,
    validateValue 
} = require('../../utils/sqlSanitizer');
const { organizationTables, tableRelationships, default_page, default_page_size } = require('../../config/database');

const applyOrganizationFilter = (query, params, tableName, organizationId) => {
    let newQuery = query;
    const newParams = [...params];

    if (organizationTables.includes(tableName) && organizationId) {
        const relationship = tableRelationships[tableName];
        if (relationship) {
            if (newQuery.trim().toUpperCase().startsWith('UPDATE')) {
                let returningClause = '';
                if (newQuery.toUpperCase().includes('RETURNING')) {
                    const returningIndex = newQuery.toUpperCase().indexOf('RETURNING');
                    returningClause = newQuery.substring(returningIndex);
                    newQuery = newQuery.substring(0, returningIndex);
                }

                const fromTables = [];
                const whereConditions = [];
                let currentTable = tableName;
                let currentRelationship = relationship;

                while (currentRelationship) {
                    const { joinTable, joinColumn } = currentRelationship;
                    fromTables.push(joinTable);
                    whereConditions.push(`${currentTable}.${joinColumn} = ${joinTable}.${joinColumn}`);
                    
                    currentTable = joinTable;
                    currentRelationship = tableRelationships[joinTable];
                }
                
                const parts = newQuery.split(' WHERE ');
                const updateSetPart = parts[0];
                const wherePart = parts[1];

                const orgCondition = `${currentTable}.organization_id = $${newParams.length + 1}`;
                newParams.push(organizationId);

                whereConditions.push(orgCondition);

                newQuery = `${updateSetPart} FROM ${fromTables.join(', ')} WHERE ${wherePart} AND ${whereConditions.join(' AND ')} ${returningClause}`;
            } else { // SELECT logic
                const { joinTable, joinColumn } = relationship;
                const joinAlias = `${tableName}_join`;
                if (tableRelationships[joinTable]) {
                    const nestedRelationship = tableRelationships[joinTable];
                    const nestedJoinAlias = `${joinTable}_join`;
                    newQuery = newQuery.replace(
                        `FROM ${tableName}`,
                        `FROM ${tableName} 
                         JOIN ${joinTable} ${joinAlias} ON ${tableName}.${joinColumn} = ${joinAlias}.${joinColumn}
                         JOIN ${nestedRelationship.joinTable} ${nestedJoinAlias} ON ${joinAlias}.${nestedRelationship.joinColumn} = ${nestedJoinAlias}.${nestedRelationship.joinColumn}`
                    );
                    const whereClause = ` ${nestedJoinAlias}.organization_id = $${newParams.length + 1}`;
                    newQuery += newQuery.toUpperCase().includes(' WHERE ') ? ` AND ${whereClause}` : ` WHERE ${whereClause}`;
                    newParams.push(organizationId);
                } else {
                    newQuery = newQuery.replace(
                        `FROM ${tableName}`,
                        `FROM ${tableName} JOIN ${joinTable} ${joinAlias} ON ${tableName}.${joinColumn} = ${joinAlias}.${joinColumn}`
                    );
                    const whereClause = ` ${joinAlias}.organization_id = $${newParams.length + 1}`;
                    newQuery += newQuery.toUpperCase().includes(' WHERE ') ? ` AND ${whereClause}` : ` WHERE ${whereClause}`;
                    newParams.push(organizationId);
                }
            }
        } else {
            const whereClause = ` ${tableName}.organization_id = $${newParams.length + 1}`;
            const isUpdateWithReturning = newQuery.trim().toUpperCase().startsWith('UPDATE') && newQuery.toUpperCase().includes('RETURNING');

            if (isUpdateWithReturning) {
                const returningIndex = newQuery.toUpperCase().indexOf('RETURNING');
                const queryBeforeReturning = newQuery.substring(0, returningIndex);
                const returningClause = newQuery.substring(returningIndex);

                newQuery = queryBeforeReturning.trim();
                newQuery += newQuery.toUpperCase().includes(' WHERE ') ? ` AND ${whereClause}` : ` WHERE ${whereClause}`;
                newQuery += ` ${returningClause}`;
            } else {
                newQuery += newQuery.toUpperCase().includes(' WHERE ') ? ` AND ${whereClause}` : ` WHERE ${whereClause}`;
            }
            
            newParams.push(organizationId);
        }
    }

    return { query: newQuery, params: newParams };
};

const findAsync = (tableName) => async (filters, organizationId, page = default_page, pageSize = default_page_size) => {
    validateTableName(tableName);

    let selectQuery = `SELECT * FROM ${tableName}`;
    let countQuery = `SELECT COUNT(*) FROM ${tableName}`;
    const params = [];

    const filterKeys = Object.keys(filters || {});
    if (filterKeys.length > 0) {
        filterKeys.forEach(key => {
            validateColumnName(key);
            validateValue(filters[key]);
        });

        const whereClauses = filterKeys.map((key, i) => `${tableName}.${key} = $${i + 1}`);
        const whereString = ` WHERE ${whereClauses.join(' AND ')}`;
        selectQuery += whereString;
        countQuery += whereString;

        params.push(...Object.values(filters));
    }

    const { query: filteredSelectQuery, params: finalSelectParams } = applyOrganizationFilter(selectQuery, params, tableName, organizationId);
    const { query: filteredCountQuery, params: finalCountParams } = applyOrganizationFilter(countQuery, [...params], tableName, organizationId);

    const totalItemsResult = await pool.query(filteredCountQuery, finalCountParams);
    const totalItems = parseInt(totalItemsResult.rows[0].count, default_page_size);
    const totalPages = Math.ceil(totalItems / pageSize);
    const offset = (page - default_page) * pageSize;

    const paginatedQuery = `${filteredSelectQuery} LIMIT $${finalSelectParams.length + 1} OFFSET $${finalSelectParams.length + 2}`;
    const paginatedParams = [...finalSelectParams, pageSize, offset];

    const result = await pool.query(paginatedQuery, paginatedParams);

    return {
        data: result.rows,
        pagination: {
            totalItems,
            totalPages,
            currentPage: page,
            pageSize,
        },
    };
};

const getByIdAsync = (tableName, idField) => async (id, organizationId) => {
    const rows = await findAsync(tableName)({ [idField]: id }, organizationId);
    return rows.data[0];
};

const createAsync = (tableName, fields) => async (data, organizationId) => {
    validateTableName(tableName);
    validateFields(fields);
    
    const allFields = [...fields];
    const dataWithOrg = { ...data };
    
    // Validate all values in the data object
    Object.values(data || {}).forEach(value => validateValue(value));

    if (organizationTables.includes(tableName) && organizationId && !tableRelationships[tableName]) {
        if (!allFields.includes('organization_id')) {
            allFields.push('organization_id');
        }

        dataWithOrg.organization_id = organizationId;
    }

    const columns = allFields.map(f => `${f}`).join(', ');
    const placeholders = allFields.map((_, i) => `$${i + 1}`).join(', ');
    const values = allFields.map(field => dataWithOrg[field]);

    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
    const result = await pool.query(query, values);

    return result.rows[0];
};

const updateAsync = (tableName, idField, fields) => async (id, data, organizationId, client) => {
    const dataFields = Object.keys(data).filter(field => fields.includes(field) && data[field] !== undefined);
    if (dataFields.length === 0) {
        return null;
    }

    const setClause = dataFields.map((field, i) => `${field} = $${i + 2}`).join(', ');
    const values = dataFields.map(field => data[field]);
    
    let query = `UPDATE ${tableName} SET ${setClause} WHERE ${idField} = $1 RETURNING *`;
    let params = [id, ...values];

    const { query: filteredQuery, params: finalParams } = applyOrganizationFilter(query, params, tableName, organizationId);
    
    const queryRunner = client || pool;
    const result = await queryRunner.query(filteredQuery, finalParams);

    return result.rows[0];
};

const removeAsync = (tableName, idField) => async (id, organizationId) => {
    let query = `UPDATE ${tableName} SET nenabled = FALSE WHERE ${idField} = $1`;
    let params = [id];

    const { query: filteredQuery, params: finalParams } = applyOrganizationFilter(query, params, tableName, organizationId);
    
    const result = await pool.query(filteredQuery, finalParams);

    return result.rows[0];
};

const createWithListAsync = (tableName, fields) => async (items, organizationId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const createdItems = [];

        for (const item of items) {
            const createdItem = await createAsync(tableName, fields)(item, organizationId);
            createdItems.push(createdItem);
        }

        await client.query('COMMIT');

        return createdItems;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const updateWithListAsync = (tableName, idField, fields) => async (items, organizationId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const updatedItems = [];

        for (const item of items) {
            const updatedItem = await updateAsync(tableName, idField, fields)(item[idField], item, organizationId);
            updatedItems.push(updatedItem);
        }

        await client.query('COMMIT');

        return updatedItems;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const deleteWithListAsync = (tableName, idField) => async (ids, organizationId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const deletedItems = [];

        for (const id of ids) {
            const deletedItem = await removeAsync(tableName, idField)(id, organizationId);
            deletedItems.push(deletedItem);
        }

        await client.query('COMMIT');
        
        return deletedItems;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};


module.exports = (tableName, idField, fields) => ({
    findAsync: findAsync(tableName),
    getByIdAsync: getByIdAsync(tableName, idField),
    createAsync: createAsync(tableName, fields),
    updateAsync: updateAsync(tableName, idField, fields),
    removeAsync: removeAsync(tableName, idField),
    createWithListAsync: createWithListAsync(tableName, fields),
    updateWithListAsync: updateWithListAsync(tableName, idField, fields),
    deleteWithListAsync: deleteWithListAsync(tableName, idField),
});
