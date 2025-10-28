const crudRepository = require('./crud.repository');
const petRepository = require('./pet.repository');

const tutorFields = ['name', 'email', 'phone'];
const tutorCrudRepository = crudRepository('tutor', 'tutor_id', tutorFields);
const { default_page, default_page_size, max_page_size } = require('../../config/database');

// Generic aggregator to collect recommendations across all pets of a tutor
const aggregateRecommendationsAsync = async (tutorId, organizationId, page, pageSize, fetchRecommendationsForPet) => {
    // Fetch all pets for the tutor so we can aggregate all recommendations
    const pets = await petRepository.findPetsByCriteriaAsync({ tutor_id: tutorId }, organizationId, default_page, max_page_size);
    const recommendations = [];

    for (const pet of pets.data) {
        // fetch all recommendations for each pet (fetchRecommendationsForPet should follow signature (petId, orgId, page, pageSize))
        const petRecommendations = await fetchRecommendationsForPet(pet.pet_id, organizationId, default_page, max_page_size);
        recommendations.push(...(petRecommendations.data || []));
    }

    // Pagination over aggregated recommendations
    const total = recommendations.length;
    const pageNumber = page || default_page;
    let size = pageSize || default_page_size;
    if (max_page_size && size > max_page_size) size = max_page_size;
    const totalPages = size > 0 ? Math.ceil(total / size) : 0;
    const start = (pageNumber - 1) * size;
    const pagedData = recommendations.slice(start, start + size);

    return {
        data: pagedData,
        pagination: {
            totalItems: total,
            totalPages,
            currentPage: pageNumber,
            pageSize: size
        }
    };
};

const getBookingRecommendationsAsync = async (tutorId, organizationId, page, pageSize) => {
    return await aggregateRecommendationsAsync(tutorId, organizationId, page, pageSize, petRepository.getBookingRecommendationsAsync);
};

const getVaccineRecommendationsAsync = async (tutorId, organizationId, page, pageSize) => {
    return await aggregateRecommendationsAsync(tutorId, organizationId, page, pageSize, petRepository.getVaccineRecommendationsAsync);
};

const updateRecommendationAsync = async (tutorId, ignore, organizationId) => {
    const pets = await petRepository.findAsync({ tutor_id: tutorId }, organizationId, default_page, max_page_size);

    if (!pets || pets.length === 0) {
        return null;
    }

    const updatedPets = [];
    for (const pet of pets.data) {
        const updatedPet = await petRepository.updateRecommendationAsync(pet.pet_id, ignore, organizationId);
        updatedPets.push(updatedPet);
    }
    
    return updatedPets;
};

module.exports = {
    ...tutorCrudRepository,
    getBookingRecommendationsAsync,
    getVaccineRecommendationsAsync,
    updateRecommendationAsync
};
