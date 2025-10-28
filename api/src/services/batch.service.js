const { exec } = require('child_process');

const { pool } = require('../config/database');
const { validateJobName, getAllowedCommand, getTableByJobName } = require('../utils/jobValidator');
const { batch_codes } = require('../config/general');
const { get_timeout } = require('../config/batch');

const startJobAsync = async (jobName) => {
    validateJobName(jobName);
    const command = getAllowedCommand(jobName);
    const targetTable = getTableByJobName(jobName);

    const runningJob = await pool.query(
        'SELECT * FROM execution_history WHERE target_table = $1 AND status = $2 AND start_time > $3',
        [targetTable, batch_codes.RUNNING, get_timeout()]
    );

    if (runningJob.rows.length > 0) {
        return { message: 'Job is already running', job: runningJob.rows[0] };
    }

    const startTime = new Date();
    const result = await pool.query(
        'INSERT INTO execution_history (target_table, start_time, status) VALUES ($1, $2, $3) RETURNING *',
        [targetTable, startTime, batch_codes.RUNNING]
    );
    const executionId = result.rows[0].execution_id;

    console.log(`Starting job ${jobName} with execution ID ${executionId}`);
    console.log(`Executing command: ${command}`);

    exec(command, (error, stdout, stderr) => {
        const endTime = new Date();
        if (error) {
            console.error(`Error executing job ${jobName}: ${error}`);

            pool.query(
                'UPDATE execution_history SET end_time = $1, status = $2, error_message = $3 WHERE execution_id = $4',
                [endTime, batch_codes.FAILED, stderr, executionId]
            );
        } else {
            console.log(`Job ${jobName} completed successfully.`);
            
            pool.query(
                'UPDATE execution_history SET end_time = $1, status = $2 WHERE execution_id = $3',
                [endTime, batch_codes.COMPLETED, executionId]
            );
        }
    });

    return result.rows[0];
};

module.exports = {
    startJobAsync
};
