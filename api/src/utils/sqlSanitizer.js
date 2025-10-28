const { allowed_tables, allowed_table_pattern, allowed_column_pattern} = require('../config/database');

/**
 * Validates if a table name is allowed
 * @param {string} tableName 
 * @throws {Error} If table name is invalid
 */
const validateTableName = (tableName) => {
    if (!tableName || typeof tableName !== 'string') {
        throw new Error('Invalid table name: must be a non-empty string');
    }
    
    if (!allowed_tables.has(tableName)) {
        throw new Error(`Invalid table name: "${tableName}" is not in the allowed tables list`);
    }

    if (!allowed_table_pattern.test(tableName)) {
        throw new Error('Invalid table name: contains invalid characters');
    }
};

/**
 * Validates if a column name is allowed
 * @param {string} columnName 
 * @throws {Error} If column name is invalid
 */
const validateColumnName = (columnName) => {
    if (!columnName || typeof columnName !== 'string') {
        throw new Error('Invalid column name: must be a non-empty string');
    }

    if (!allowed_column_pattern.test(columnName)) {
        throw new Error(`Invalid column name: "${columnName}" contains invalid characters`);
    }
};

/**
 * Validates if a value is safe for use in a query
 * @param {any} value 
 * @throws {Error} If value is unsafe
 */
const validateValue = (value) => {
    // Allow null values
    if (value === null || value === undefined) {
        return;
    }

    // Check for potentially dangerous patterns in strings
    if (typeof value === 'string') {
        // Check for common SQL injection patterns
        const dangerousPatterns = [
            /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,          // Basic SQL injection chars
            /(\%3D)|(=)|(\%3B)|(;)/i,                  // Equals and semicolons
            /union\s+select|exec\s+xp_|update\s+.+\s+set|insert\s+into|delete\s+from|drop\s+table/i  // Common SQL commands
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(value)) {
                throw new Error('Invalid value: contains potentially dangerous SQL patterns');
            }
        }
    }
};

/**
 * Validates an array of field names
 * @param {string[]} fields 
 * @throws {Error} If any field name is invalid
 */
const validateFields = (fields) => {
    if (!Array.isArray(fields)) {
        throw new Error('Fields must be an array');
    }

    fields.forEach(field => validateColumnName(field));
};

module.exports = {
    validateTableName,
    validateColumnName,
    validateFields,
    validateValue
};