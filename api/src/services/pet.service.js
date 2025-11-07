const util = require('util');

const petRepository = require('../repositories/postgres/pet.repository');
const bookingRecommendationRepository = require('../repositories/postgres/bookingRecommendation.repository');
const vaccineRecommendationRepository = require('../repositories/postgres/vaccineRecommendation.repository');
const knex = require('../dal/query-builder/knex');
const { client } = require('../providers/storage');
const createUpload = require('../config/upload-multipart-form-data');
const { folder } = require('../config/cloudinary');

const petImageUpload = createUpload({
    folder: (req, file) => folder,
    public_id: (req, file) => `pet${req.params.id}-image`,
});

const uploadToBucketAsync = util.promisify(petImageUpload.single('image'));

const findPetsByCriteriaAsync = async ({ filters, organizationId, page, pageSize }) => {
    return petRepository.findWithTutor(filters, { organizationId, page, pageSize });
};

const uploadImageAsync = async (req, res, organizationId) => {
    const petId = req.params.id;
    // First, check if the pet exists and belongs to the organization.
    const petExists = await petRepository.findById(petId);
    if (!petExists || petExists.organization_id !== organizationId) {
        return null;
    }

    // Knex transaction
    const trx = await knex.transaction();
    try {
        await uploadToBucketAsync(req, res);
        const imagePath = req.file.path;

        const updatedPet = await petRepository.update(petId, { image_path: imagePath }, trx);

        await trx.commit();
        return updatedPet;
    } catch (error) {
        await trx.rollback();
        if (req.file) {
            client.uploader.destroy(req.file.filename);
        }
        throw error;
    }
};

const updateRecommendationAsync = async (petId, ignore, organizationId) => {
    const pet = await petRepository.findById(petId);
    if (!pet || pet.organization_id !== organizationId) {
        return null;
    }
    return petRepository.update(petId, { ignore_recommendation: ignore });
};

const getBookingRecommendationsAsync = async ({ petIds, organizationId, page, pageSize }) => {
    const query = knex('booking_recommendation')
        .join('pet', 'booking_recommendation.pet_id', 'pet.pet_id')
        .join('tutor', 'pet.tutor_id', 'tutor.tutor_id')
        .where('tutor.organization_id', organizationId)
        .andWhere('booking_recommendation.nenabled', true);

    if (petIds) {
        const ids = Array.isArray(petIds) ? petIds : [petIds];
        query.whereIn('booking_recommendation.pet_id', ids);
    }

    const offset = (page - 1) * pageSize;
    query.limit(pageSize).offset(offset);

    const data = await query.select('booking_recommendation.*', 'pet.name as pet_name', 'tutor.name as tutor_name');

    const totalQuery = knex('booking_recommendation')
        .join('pet', 'booking_recommendation.pet_id', 'pet.pet_id')
        .join('tutor', 'pet.tutor_id', 'tutor.tutor_id')
        .where('tutor.organization_id', organizationId)
        .andWhere('booking_recommendation.nenabled', true);

    if (petIds) {
        const ids = Array.isArray(petIds) ? petIds : [petIds];
        totalQuery.whereIn('booking_recommendation.pet_id', ids);
    }

    const [{ count }] = await totalQuery.count('* as count');

    return {
        data,
        pagination: {
            page: parseInt(page),
            pageSize: parseInt(pageSize, 0),
            total: parseInt(count, 10),
        },
    };
};

const getVaccineRecommendationsAsync = async ({ petIds, organizationId, page, pageSize }) => {
    const query = knex('vaccine_recommendation')
        .join('pet', 'vaccine_recommendation.pet_id', 'pet.pet_id')
        .join('tutor', 'pet.tutor_id', 'tutor.tutor_id')
        .where('tutor.organization_id', organizationId)
        .andWhere('vaccine_recommendation.nenabled', true);

    if (petIds) {
        const ids = Array.isArray(petIds) ? petIds : [petIds];
        query.whereIn('vaccine_recommendation.pet_id', ids);
    }

    const offset = (page - 1) * pageSize;
    query.limit(pageSize).offset(offset);

    const data = await query.select('vaccine_recommendation.*', 'pet.name as pet_name', 'tutor.name as tutor_name');

    const totalQuery = knex('vaccine_recommendation')
        .join('pet', 'vaccine_recommendation.pet_id', 'pet.pet_id')
        .join('tutor', 'pet.tutor_id', 'tutor.tutor_id')
        .where('tutor.organization_id', organizationId)
        .andWhere('vaccine_recommendation.nenabled', true);

    if (petIds) {
        const ids = Array.isArray(petIds) ? petIds : [petIds];
        totalQuery.whereIn('vaccine_recommendation.pet_id', ids);
    }

    const [{ count }] = await totalQuery.count('* as count');

    return {
        data,
        pagination: {
            page: parseInt(page),
            pageSize: parseInt(pageSize, 0),
            total: parseInt(count, 10),
        },
    };
};

const disableBookingRecommendationAsync = async (petId, organizationId) => {
    const pet = await petRepository.findById(petId);
    if (!pet || pet.organization_id !== organizationId) {
        return null;
    }
    return bookingRecommendationRepository.softDelete({ pet_id: petId });
};

const disableVaccineRecommendationAsync = async (petId, vaccineName, organizationId) => {
    const pet = await petRepository.findById(petId);
    if (!pet || pet.organization_id !== organizationId) {
        return null;
    }
    return vaccineRecommendationRepository.softDelete({ pet_id: petId, vaccine_name: vaccineName });
};

module.exports = {
    findPetsByCriteriaAsync,
    uploadImageAsync,
    updateRecommendationAsync,
    getBookingRecommendationsAsync,
    getVaccineRecommendationsAsync,
    disableBookingRecommendationAsync,
    disableVaccineRecommendationAsync,
};
