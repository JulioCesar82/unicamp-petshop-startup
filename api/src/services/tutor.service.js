
const tutorRepository = require('../repositories/postgres/tutor.repository');
const petRepository = require('../repositories/postgres/pet.repository');
const knex = require('../dal/query-builder/knex');
const notificationService = require('./notification.service');
const { default_page, max_page_size } = require('../config/database');

const getBookingRecommendationsAsync = async ({ tutorId, organizationId, page, pageSize }) => {
    const pets = await petRepository.findWithTutor({ 'pet.tutor_id': tutorId }, { organizationId, pageSize: max_page_size });
    if (!pets.data || pets.data.length === 0) {
        return { data: [], pagination: { page, pageSize, total: 0 } };
    }
    const petIds = pets.data.map(p => p.pet_id);

    const query = knex('booking_recommendation')
        .join('pet', 'booking_recommendation.pet_id', 'pet.pet_id')
        .whereIn('booking_recommendation.pet_id', petIds)
        .andWhere('booking_recommendation.nenabled', true);

    const offset = (page - 1) * pageSize;
    query.limit(pageSize).offset(offset);

    const data = await query.select('booking_recommendation.*', 'pet.name as pet_name');

    const totalQuery = knex('booking_recommendation')
        .whereIn('booking_recommendation.pet_id', petIds)
        .andWhere('booking_recommendation.nenabled', true);

    const [{ count }] = await totalQuery.count('* as count');

    return {
        data,
        pagination: {
            page: parseInt(page, default_page),
            pageSize: parseInt(pageSize, 0),
            total: parseInt(count, 0),
        },
    };
};

const getVaccineRecommendationsAsync = async ({ tutorId, organizationId, page, pageSize }) => {
    const pets = await petRepository.findWithTutor({ 'pet.tutor_id': tutorId }, { organizationId, pageSize: max_page_size });
    if (!pets.data || pets.data.length === 0) {
        return { data: [], pagination: { page, pageSize, total: 0 } };
    }
    const petIds = pets.data.map(p => p.pet_id);

    const query = knex('vaccine_recommendation')
        .join('pet', 'vaccine_recommendation.pet_id', 'pet.pet_id')
        .whereIn('vaccine_recommendation.pet_id', petIds)
        .andWhere('vaccine_recommendation.nenabled', true);

    const offset = (page - 1) * pageSize;
    query.limit(pageSize).offset(offset);

    const data = await query.select('vaccine_recommendation.*', 'pet.name as pet_name');

    const totalQuery = knex('vaccine_recommendation')
        .whereIn('vaccine_recommendation.pet_id', petIds)
        .andWhere('vaccine_recommendation.nenabled', true);

    const [{ count }] = await totalQuery.count('* as count');

    return {
        data,
        pagination: {
            page: parseInt(page, default_page),
            pageSize: parseInt(pageSize, 0),
            total: parseInt(count, 0),
        },
    };
};

const updateRecommendationAsync = async (tutorId, ignore, organizationId) => {
    const pets = await petRepository.findWithTutor({ 'pet.tutor_id': tutorId }, { organizationId, pageSize: max_page_size });
    if (!pets.data || pets.data.length === 0) {
        return null;
    }
    const petIds = pets.data.map(p => p.pet_id);
    // We are assuming a booking_recommendation and vaccine_recommendation table exists.
    const updatedPets = await petRepository.update(petIds, { ignore_recommendation: ignore });
    return updatedPets;
};

const notifyAllTutorsAsync = async (organizationId) => {
    const allTutors = await tutorRepository.find({}, { pageSize: max_page_size, organizationId });

    for (const tutor of allTutors.data) {
        const bookingRecommendations = await getBookingRecommendationsAsync({ tutorId: tutor.tutor_id, organizationId });
        const vaccineRecommendations = await getVaccineRecommendationsAsync({ tutorId: tutor.tutor_id, organizationId });
        const allRecommendations = [...bookingRecommendations.data, ...vaccineRecommendations.data];

        if (allRecommendations.length > 0) {
            console.log(`Tutor ${tutor.name} (ID: ${tutor.tutor_id}) tem ${allRecommendations.length} recomendações. Enviando notificações...`);
            notificationService.notifyTutorAsync(tutor, allRecommendations);
        }
    }
};

module.exports = {
    getBookingRecommendationsAsync,
    getVaccineRecommendationsAsync,
    updateRecommendationAsync,
    notifyAllTutorsAsync
};
