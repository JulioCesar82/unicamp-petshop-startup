const batchRepository = require('../repositories/postgres/batch.repository');
const batchService = require('../services/batch.service');
const catchAsync = require('../utils/catchAsync');
const { statusCodes } = require('../config/general');
const { validateJobName } = require('../utils/jobValidator');

exports.startJobAsync = catchAsync(async (req, res) => {
    const { entity } = req.params;

    try 
    {
        validateJobName(entity);
    }
    catch (error) {
        return res.status(statusCodes.BAD_REQUEST).send({ message: error.message });
    }

    const result = await batchService.startJobAsync(entity);

    res.status(statusCodes.OK).send(result);
});

exports.getJobStatusAsync = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await batchRepository.getJobStatusAsync(id);
   
    res.status(statusCodes.OK).send(result);
});

exports.getJobResultAsync = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await batchRepository.getJobResultAsync(id);
   
    res.status(statusCodes.OK).send(result);
});

exports.getLTVByPetProfileAsync = catchAsync(async (req, res) => {
    const result = await batchRepository.getLTVByPetProfileAsync();
  
    res.status(statusCodes.OK).send(result);
});
