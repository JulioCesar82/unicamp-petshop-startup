
const createCrudRepository = require('../repositories/postgres/crud.repository');
const notificationService = require('./notification.service');
const { getBookingRecommendationsAsync, getVaccineRecommendationsAsync } = require('../repositories/postgres/tutor.repository');
const { default_page, max_page_size } = require('../config/database');

const tutorFields = ['name', 'email', 'phone'];
const tutorCrudrepository = createCrudRepository('tutor', 'tutor_id', tutorFields);

const notifyAllTutorsAsync = async (organizationId) => {
    // 1. Busca todos os tutores
    const allTutors = await tutorCrudrepository.findAsync({}, organizationId, default_page, max_page_size);

    // 2. Itera sobre cada tutor para verificar e enviar notificações
    for (const tutor of allTutors.data) {
        // Busca recomendações de agendamento e vacinas
        const bookingRecommendations = await getBookingRecommendationsAsync(tutor.tutor_id, organizationId);
        const vaccineRecommendations = await getVaccineRecommendationsAsync(tutor.tutor_id, organizationId);
        const allRecommendations = [...bookingRecommendations, ...vaccineRecommendations];

        // 3. Se houver recomendações, notifica o tutor
        if (allRecommendations.length > 0) {
            console.log(`Tutor ${tutor.name} (ID: ${tutor.tutor_id}) tem ${allRecommendations.length} recomendações. Enviando notificações...`);
            notificationService.notifyTutorAsync(tutor, allRecommendations);
        }
    }
};

module.exports = {
    notifyAllTutorsAsync
};