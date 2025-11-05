const crudController = require('./crud.controller');
const tutorRepository = require('../repositories/postgres/tutor.repository');
const tutorService = require('../services/tutor.service');
const catchAsync = require('../utils/catchAsync');
const { statusCodes } = require('../config/general');

const tutorCrudController = crudController(tutorRepository);

const getBookingRecommendationsAsync = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { page, pageSize } = req.query;
    const recommendations = await tutorService.getBookingRecommendationsAsync({ tutorId: id, organizationId: req.organization_id, page, pageSize });

    res.status(statusCodes.OK).send(recommendations);
});

const getVaccineRecommendationsAsync = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { page, pageSize } = req.query;
    const recommendations = await tutorService.getVaccineRecommendationsAsync({ tutorId: id, organizationId: req.organization_id, page, pageSize });

    res.status(statusCodes.OK).send(recommendations);
});

const updateRecommendationAsync = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { ignore } = req.body;

    const result = await tutorService.updateRecommendationAsync(id, ignore, req.organization_id);

    if (result) {
        res.status(statusCodes.OK).send(result);
    } else {
        res.status(statusCodes.NOT_FOUND).send({ message: 'Tutor not found or no pets to update.' });
    }
});

const notifyAllTutorsAsync = catchAsync(async (req, res) => {
    tutorService.notifyAllTutorsAsync(req.organization_id);

    res.status(statusCodes.ACCEPTED).send({ message: "Processo de notificação para todos os tutores foi iniciado." });
});

module.exports = {
    ...tutorCrudController,
    getBookingRecommendationsAsync,
    getVaccineRecommendationsAsync,
    updateRecommendationAsync,
    notifyAllTutorsAsync
};
