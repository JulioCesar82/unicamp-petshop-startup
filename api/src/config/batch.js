const { resourcesPath } = require('../config/general');
const { dbConfig } = require('../config/database');

const allowed_commands = new Map([
    ['vaccine-recommendation', `bash ${resourcesPath}/run_vaccine_pipeline.sh '${dbConfig.user}' '${dbConfig.host}' '${dbConfig.database}' '${dbConfig.password}' '${dbConfig.port}'`],
    ['booking-reference', `bash ${resourcesPath}/run_booking_reference_pipeline.sh '${dbConfig.user}' '${dbConfig.host}' '${dbConfig.database}' '${dbConfig.password}' '${dbConfig.port}'`],
    ['booking-recommendation', `bash ${resourcesPath}/run_booking_recommendation_pipeline.sh '${dbConfig.user}' '${dbConfig.host}' '${dbConfig.database}' '${dbConfig.password}' '${dbConfig.port}'`],
    ['ltv-by-pet-profile', `bash ${resourcesPath}/run_ltv_by_pet_profile_pipeline.sh '${dbConfig.user}' '${dbConfig.host}' '${dbConfig.database}' '${dbConfig.password}' '${dbConfig.port}'`]
]);

const table_by_job = new Map([
    ['vaccine-recommendation', 'vaccine_recommendation'],
    ['booking-reference', 'booking_reference'],
    ['booking-recommendation', 'booking_recommendation'],
    ['ltv-by-pet-profile', 'ltv_by_pet_profile']
]);

const allowed_jobs = new Set(allowed_commands.keys());

module.exports = {
    allowed_commands,
    allowed_jobs,
    table_by_job,
    get_timeout: () => new Date(Date.now() - 10 * 60 * 1000) // ten minutes
};