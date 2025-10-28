
const { Pool } = require('pg');
require('dotenv').config();

const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSLMODE === 'true'
};

const pool = new Pool(dbConfig);

module.exports = {
    pool,
    dbConfig,
    allowed_table_pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
    allowed_column_pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
    allowed_tables: new Set([
        'organization',
        'organization_invite',
        'organization_apikey',
        'tutor',
        'pet',
        'product',
        'purchase',
        'booking',
        'vaccination_record',
        'vaccine_recommendation',
        'booking_recommendation',
        'vaccine_reference',
        'vaccine_equivalence',
        'ltv_by_pet_profile',
        'execution_history'
    ]),
    organizationTables: [
        'tutor',
        'pet',
        'product',
        'purchase',
        'booking',
        'vaccination_record',
        'vaccine_recommendation',
        'booking_recommendation'
    ],
    tableRelationships: {
        pet: { joinTable: 'tutor', joinColumn: 'tutor_id' },
        purchase: { joinTable: 'tutor', joinColumn: 'tutor_id' },
        booking: { joinTable: 'pet', joinColumn: 'pet_id' },
        vaccination_record: { joinTable: 'pet', joinColumn: 'pet_id' },
        vaccine_recommendation: { joinTable: 'pet', joinColumn: 'pet_id' },
        booking_recommendation: { joinTable: 'pet', joinColumn: 'pet_id' },
    },
    default_page: 1, 
    default_page_size: 10,
    max_page_size: Number.MAX_SAFE_INTEGER
};