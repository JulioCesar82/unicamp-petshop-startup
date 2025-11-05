const { exec } = require('child_process');
const batchRepository = require('../repositories/postgres/batch.repository');
const { validateJobName, getAllowedCommand, getTableByJobName } = require('../utils/jobValidator');
const { job_by_table } = require('../config/batch');
const { batch_codes } = require('../config/general');
const { get_timeout } = require('../config/batch');
const knex = require('../dal/query-builder/knex');

const startJobAsync = async (jobName) => {
    validateJobName(jobName);
    const command = getAllowedCommand(jobName);
    const targetTable = getTableByJobName(jobName);

    const [runningJob] = await batchRepository.find({
        target_table: targetTable,
        status: batch_codes.RUNNING,
    }).where('start_time', '>', get_timeout());

    if (runningJob) {
        return { message: 'Job is already running', job: runningJob };
    }

    const newExecution = await batchRepository.create({
        target_table: targetTable,
        start_time: new Date(),
        status: batch_codes.RUNNING
    });
    const executionId = newExecution.execution_id;

    console.log(`Starting job ${jobName} with execution ID ${executionId}`);
    console.log(`Executing command: ${command}`);

    exec(command, (error, stdout, stderr) => {
        const endTime = new Date();
        if (error) {
            console.error(`Error executing job ${jobName}: ${error}`);
            batchRepository.update(executionId, {
                end_time: endTime,
                status: batch_codes.FAILED,
                error_message: stderr
            });
        } else {
            console.log(`Job ${jobName} completed successfully.`);
            batchRepository.update(executionId, {
                end_time: endTime,
                status: batch_codes.COMPLETED
            });
        }
    });

    return newExecution;
};

const getJobStatusAsync = async (jobId) => {
    return batchRepository.findById(jobId);
};

const getJobResultAsync = async (jobId) => {
    const job = await batchRepository.findById(jobId);
    if (job && job.status === batch_codes.COMPLETED) {
        const jobName = job_by_table.get(job.target_table);
        validateJobName(jobName);
        const tableName = job.target_table;
        return knex(tableName).select();
    }
    return null;
};

const getLTVByPetProfileAsync = async () => {
    return knex('ltv_by_pet_profile').select();
};

module.exports = {
    startJobAsync,
    getJobStatusAsync,
    getJobResultAsync,
    getLTVByPetProfileAsync
};
