const crudController = require('./crud.controller');
const petRepository = require('../repositories/postgres/pet.repository');
const petService = require('../services/pet.service');
const catchAsync = require('../utils/catchAsync');
const { statusCodes } = require('../config/general');

const petCrudController = crudController(petRepository);

const findPetsByCriteriaAsync = catchAsync(async (req, res) => {
    if (req.query.id) {
        return petCrudController.getByIdAsync(req, res);
    }

    const { page, pageSize, ...criteria } = req.query;
    const pets = await petRepository.findPetsByCriteriaAsync(criteria, req.organization_id, page, pageSize);

    res.status(statusCodes.OK).send(pets);
});

const uploadImageAsync = catchAsync(async (req, res) => {
    const pet = await petService.uploadImageAsync(req, res, req.organization_id);

    if (pet) {
        res.status(statusCodes.OK).send(pet);
    } else {
        res.status(statusCodes.NOT_FOUND).send({ message: 'Pet not found' });
    }
});

const updateRecommendationAsync = catchAsync(async (req, res) => {
    const { id, ignore } = req.body;
    const pet = await petRepository.updateRecommendationAsync(id, ignore, req.organization_id);

    if (pet) {
        res.status(statusCodes.OK).send(pet);
    } else {
        res.status(statusCodes.NOT_FOUND).send({ message: 'Pet not found' });
    }
});

const getBookingRecommendationsAsync = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { page, pageSize } = req.query;
    const recommendations = await petRepository.getBookingRecommendationsAsync(id, req.organization_id, page, pageSize);

    res.status(statusCodes.OK).send(recommendations);
});

const getVaccineRecommendationsAsync = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { page, pageSize } = req.query;
    const recommendations = await petRepository.getVaccineRecommendationsAsync(id, req.organization_id, page, pageSize);

    res.status(statusCodes.OK).send(recommendations);
});

const disableBookingRecommendationAsync = catchAsync(async (req, res) => {
    const { id } = req.params;
    await petRepository.disableBookingRecommendationAsync(id, req.organization_id);

    res.status(statusCodes.NO_CONTENT).send();
});

const disableVaccineRecommendationAsync = catchAsync(async (req, res) => {
    const { id, vaccineName } = req.params;
    await petRepository.disableVaccineRecommendationAsync(id, vaccineName, req.organization_id);

    res.status(statusCodes.NO_CONTENT).send();
});

module.exports = {
    ...petCrudController,
    findPetsByCriteriaAsync,
    uploadImageAsync,
    updateRecommendationAsync,
    getBookingRecommendationsAsync,
    getVaccineRecommendationsAsync,
    disableBookingRecommendationAsync,
    disableVaccineRecommendationAsync
};
