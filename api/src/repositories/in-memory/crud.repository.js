const inMemoryDb = {};
const { organizationTables } = require('../../config/database');

const findAsync = (tableName) => async (filters, organizationId) => {
    if (!inMemoryDb[tableName]) {
        return [];
    }

    let results = inMemoryDb[tableName];

    if (organizationTables.includes(tableName) && organizationId) {
        results = results.filter(item => item.organization_id === organizationId);
    }

    return results.filter(item => {
        return Object.keys(filters).every(key => item[key] === filters[key]);
    });
};

const getByIdAsync = (tableName, idField) => async (id, organizationId) => {
    const items = await findAsync(tableName)({ [idField]: id }, organizationId);
    return items.data[0];
};

const createAsync = (tableName, fields) => async (data, organizationId) => {
    if (!inMemoryDb[tableName]) {
        inMemoryDb[tableName] = [];
    }
    
    const newItem = { ...data };
    if (organizationTables.includes(tableName) && organizationId) {
        newItem.organization_id = organizationId;
    }

    inMemoryDb[tableName].push(newItem);

    return newItem;
};

const updateAsync = (tableName, idField, fields) => async (id, data, organizationId) => {
    const items = await findAsync(tableName)({ [idField]: id }, organizationId);

    if (items.data.length === 0) {
        return null;
    }

    const itemToUpdate = items.data[0];
    fields.forEach(field => {
        if (data[field] !== undefined) {
            itemToUpdate[field] = data[field];
        }
    });

    return itemToUpdate;
};

const removeAsync = (tableName, idField) => async (id, organizationId) => {
    const items = await findAsync(tableName)({ [idField]: id }, organizationId);

    if (items.length === 0) {
        return null;
    }

    const itemToRemove = items.data[0];
    itemToRemove.nenabled = false;

    return itemToRemove;
};

const createWithListAsync = (tableName, fields) => async (items, organizationId) => {
    const createdItems = [];
    for (const item of items) {
        const createdItem = await createAsync(tableName, fields)(item, organizationId);
        createdItems.push(createdItem);
    }

    return createdItems;
};

const updateWithList = (tableName, idField, fields) => async (items, organizationId) => {
    const updatedItems = [];

    for (const item of items) {
        const updatedItem = await updateAsync(tableName, idField, fields)(item[idField], item, organizationId);
        updatedItems.push(updatedItem);
    }

    return updatedItems;
};

const deleteWithListAsync = (tableName, idField) => async (ids, organizationId) => {
    const deletedItems = [];
    
    for (const id of ids) {
        const deletedItem = await removeAsync(tableName, idField)(id, organizationId);
        deletedItems.push(deletedItem);
    }
    
    return deletedItems;
};

module.exports = (tableName, idField, fields) => ({
    findAsync: findAsync(tableName),
    getByIdAsync: getByIdAsync(tableName, idField),
    createAsync: createAsync(tableName, fields),
    updateAsync: updateAsync(tableName, idField, fields),
    removeAsync: removeAsync(tableName, idField),
    createWithListAsync: createWithListAsync(tableName, fields),
    updateWithListAsync: updateWithList(tableName, idField, fields),
    deleteWithListAsync: deleteWithListAsync(tableName, idField),
});
