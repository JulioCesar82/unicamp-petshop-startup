const { default_page, default_page_size } = require('../../../config/database');

class InMemoryProvider {
    constructor(tableName, primaryKey = `${tableName}_id`) {
        this.tableName = tableName;
        this.primaryKey = primaryKey;
        this.data = [];
        this.nextId = 1;
    }

    async create(item) {
        const newItem = {
            ...item,
            [this.primaryKey]: this.nextId++,
            dcreated: new Date(),
            dlastupdate: new Date(),
            nenabled: true,
        };
        this.data.push(newItem);
        return newItem;
    }

    async findById(id, columns = ['*']) {
        const item = this.data.find(
            (d) => d[this.primaryKey] === id && d.nenabled
        );
        return item ? this.selectColumns(item, columns) : undefined;
    }

    async find(filter = {}, { page = default_page, pageSize = default_page_size, columns = ['*'], organizationId = null }) {
        let filteredData = this.data.filter(item => {
            if (!item.nenabled) return false;
            for (const key in filter) {
                if (item[key] !== filter[key]) return false;
            }
            if (organizationId && item.organization_id !== organizationId) {
                return false;
            }
            return true;
        });

        const total = filteredData.length;
        const offset = (page - 1) * pageSize;
        const paginatedData = filteredData.slice(offset, offset + pageSize);

        return {
            data: paginatedData.map(item => this.selectColumns(item, columns)),
            pagination: {
                page,
                pageSize,
                total,
            },
        };
    }

    async update(id, item) {
        const index = this.data.findIndex((d) => d[this.primaryKey] === id);
        if (index === -1) {
            return null;
        }
        this.data[index] = {
            ...this.data[index],
            ...item,
            dlastupdate: new Date(),
        };
        return this.data[index];
    }

    async softDelete(id) {
        return this.update(id, { nenabled: false });
    }

    selectColumns(item, columns) {
        if (columns.includes('*')) {
            return item;
        }
        const selected = {};
        columns.forEach(col => {
            if (item.hasOwnProperty(col)) {
                selected[col] = item[col];
            }
        });
        return selected;
    }
}

module.exports = InMemoryProvider;
