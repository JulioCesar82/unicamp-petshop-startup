const crudRepository = require('./crud.repository');

const petFields = ['tutor_id', 'name', 'image_path', 'birth_date', 'species', 'animal_type', 'fur_type'];
const petCrudRepository = crudRepository('pet', 'pet_id', petFields);

const petCrud = crudRepository('pet', 'pet_id', ['tutor_id', 'name', 'image_path', 'birth_date', 'species', 'animal_type', 'fur_type', 'ignore_recommendation']);
const bookingRecCrud = crudRepository('booking_recommendation', 'booking_recommendation_id', ['ignore_recommendation']);
const vaccineRecCrud = crudRepository('vaccine_recommendation', 'vaccine_recommendation_id', ['ignore_recommendation']);
const { default_page, max_page_size } = require('../../config/database');

const updateRecommendationAsync = async (petId, ignore, organizationId) => {
    return await petCrud.updateAsync(petId, { ignore_recommendation: ignore }, organizationId);
};

const disableBookingRecommendationAsync = async (petId, organizationId) => {
    const recommendations = await bookingRecCrud.findAsync({ pet_id: petId }, organizationId, default_page, max_page_size );

    for (const rec of recommendations.data) {
        await bookingRecCrud.updateAsync(rec.booking_recommendation_id, { ignore_recommendation: true }, organizationId);
    }
};

const disableVaccineRecommendationAsync = async (petId, vaccineName, organizationId) => {
    const recommendations = await vaccineRecCrud.findAsync({ pet_id: petId, vaccine_name: vaccineName }, organizationId, default_page, max_page_size);
    
    for (const rec of recommendations.data) {
        await vaccineRecCrud.updateAsync(rec.vaccine_recommendation_id, { ignore_recommendation: true }, organizationId);
    }
};

const findPetsByCriteriaAsync = async (criteria, organizationId, page, pageSize) => {
    return await petCrud.findAsync(criteria, organizationId, page, pageSize);
};

const getBookingRecommendationsAsync = async (petId, organizationId, page, pageSize) => {
    return await bookingRecCrud.findAsync({ pet_id: petId, ignore_recommendation: false }, organizationId, page, pageSize);
};

const getVaccineRecommendationsAsync = async (petId, organizationId, page, pageSize) => {
    return await vaccineRecCrud.findAsync({ pet_id: petId, ignore_recommendation: false }, organizationId, page, pageSize);
};

module.exports = {
    ...petCrudRepository,
    updateRecommendationAsync,
    findPetsByCriteriaAsync,
    getBookingRecommendationsAsync,
    getVaccineRecommendationsAsync,
    disableBookingRecommendationAsync,
    disableVaccineRecommendationAsync
};
