
const tutorRepository = require('../repositories/postgres/tutor.repository');
const petRepository = require('../repositories/postgres/pet.repository');
const notificationService = require('./notification.service');
const { default_page, max_page_size } = require('../config/database');

const getBookingRecommendationsAsync = async ({ tutorId, organizationId, page, pageSize }) => {
    const pets = await petRepository.findWithTutor({ 'pet.tutor_id': tutorId }, { organizationId, pageSize: max_page_size });
    const petIds = pets.data.map(p => p.pet_id);
    // NOTE: This is a placeholder. The actual implementation would be more complex.
    // We are assuming a booking_recommendation table exists.
    const recommendations = await petRepository.find({ pet_id: petIds }, { page, pageSize });
    return recommendations;
};

const getVaccineRecommendationsAsync = async ({ tutorId, organizationId, page, pageSize }) => {
    const pets = await petRepository.findWithTutor({ 'pet.tutor_id': tutorId }, { organizationId, pageSize: max_page_size });
    const petIds = pets.data.map(p => p.pet_id);
    // NOTE: This is a placeholder. The actual implementation would be more complex.
    // We are assuming a vaccine_recommendation table exists.
    const recommendations = await petRepository.find({ pet_id: petIds }, { page, pageSize });
    return recommendations;
};

const updateRecommendationAsync = async (tutorId, ignore, organizationId) => {
    const pets = await petRepository.findWithTutor({ 'pet.tutor_id': tutorId }, { organizationId, pageSize: max_page_size });
    if (!pets.data || pets.data.length === 0) {
        return null;
    }
    const petIds = pets.data.map(p => p.pet_id);
    // NOTE: This is a placeholder. The actual implementation would be more complex.
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
