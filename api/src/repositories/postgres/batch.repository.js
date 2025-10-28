const { pool } = require('../../config/database');

const getJobStatusAsync = async (id) => {
    const result = await pool.query(
        'SELECT * FROM execution_history WHERE execution_id = $1',
        [id]
    );
    
    return result.rows[0];
};

const getJobResultAsync = async (id) => {
    const jobResult = await pool.query(
        'SELECT target_table FROM execution_history WHERE execution_id = $1',
        [id]
    );
    const tableName = jobResult.rows[0].target_table;
    
    const result = await pool.query(`SELECT * FROM ${tableName} WHERE nenabled = TRUE`);

    return result.rows;
};

const getLTVByPetProfileAsync = async () => {
    const result = await pool.query('SELECT species, animal_type, fur_type, total_value FROM ltv_by_pet_profile WHERE nenabled = TRUE');

    return result.rows;
};

module.exports = {
    getJobStatusAsync,
    getJobResultAsync,
    getLTVByPetProfileAsync
};
