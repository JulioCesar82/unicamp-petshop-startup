const apiKeyRepository = require('../repositories/postgres/apiKey.repository');
const catchAsync = require('../utils/catchAsync');
const { statusCodes } = require('../config/general');
const { generateApiKey } = require('../config/organizarion');

const createAsync = catchAsync(async (req, res) => {
    const newApiKey = await apiKeyRepository.create({
        organization_id: req.organization_id,
        api_key: generateApiKey()
    });
    
    res.status(statusCodes.CREATED).json(newApiKey);
});

const findAllAsync = catchAsync(async (req, res) => {
    const { page, pageSize } = req.query;
    const apiKeys = await apiKeyRepository.find({ organization_id: req.organization_id }, { page, pageSize });

    res.status(statusCodes.OK).json(apiKeys);
});

const removeAsync = catchAsync(async (req, res) => {
    const { api_key } = req.params;
    const deletedApiKey = await apiKeyRepository.softDelete({
        organization_id: req.organization_id,
        api_key: api_key
    });

    if (!deletedApiKey) {
        return res.status(statusCodes.NOT_FOUND).json({ message: 'API key not found.' });
    }

    res.status(statusCodes.NO_CONTENT).send();
});

module.exports = {
    createAsync,
    findAllAsync,
    removeAsync
};
