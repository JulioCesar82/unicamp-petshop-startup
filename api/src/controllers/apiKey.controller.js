const apiKeyRepository = require('../repositories/postgres/apiKey.repository');
const catchAsync = require('../utils/catchAsync');
const { statusCodes } = require('../config/general');

const createAsync = catchAsync(async (req, res) => {
    const newApiKey = await apiKeyRepository.createApiKeyAsync(req.organization_id);
    
    res.status(statusCodes.CREATED).json(newApiKey);
});

const findAllAsync = catchAsync(async (req, res) => {
    const { page, pageSize } = req.query;
    const apiKeys = await apiKeyRepository.getApiKeysByOrganizationIdAsync(req.organization_id, page, pageSize);

    res.status(statusCodes.OK).json(apiKeys);
});

const removeAsync = catchAsync(async (req, res) => {
    const { api_key } = req.params;
    const deletedApiKey = await apiKeyRepository.deleteApiKeyAsync(req.organization_id, api_key);

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
