const { allowed_commands, table_by_job, allowed_jobs } = require('../config/batch');

/**
 * Validates if a job name is allowed
 * @param {string} jobName 
 * @throws {Error} If job name is invalid
 */
const validateJobName = (jobName) => {
    if (!jobName || typeof jobName !== 'string') {
        throw new Error('Invalid job name: must be a non-empty string');
    }

    if (!allowed_jobs.has(jobName)) {
        throw new Error(`Invalid job name: "${jobName}" is not in the allowed jobs list`);
    }
};

/**
 * Gets the allowed command for a job
 * @param {string} jobName 
 * @returns {string} The command to execute
 * @throws {Error} If job name is not allowed
 */
const getAllowedCommand = (jobName) => {
    validateJobName(jobName);
    
    return allowed_commands.get(jobName);
};

const getTableByJobName = (jobName) => {
    validateJobName(jobName);
    
    return table_by_job.get(jobName);
};

module.exports = {
    validateJobName,
    getAllowedCommand,
    getTableByJobName
};