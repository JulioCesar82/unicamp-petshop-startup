const catchAsync = require('../utils/catchAsync');
const { statusCodes } = require('../config/general');

const getAllAsync = (repository) => catchAsync(async (req, res) => {
    const { page, pageSize } = req.query;
    const items = await repository.findAsync({}, req.organization_id, page, pageSize);

    res.status(statusCodes.OK).send(items);
});

const getByIdAsync = (repository) => catchAsync(async (req, res) => {
    const { id } = req.params;
    const item = await repository.getByIdAsync(id, req.organization_id);

    if (item) {
        res.status(statusCodes.OK).send(item);
    } else {
        res.status(statusCodes.NOT_FOUND).send({ message: 'Item not found' });
    }
});

const createAsync = (repository) => catchAsync(async (req, res) => {
    const item = await repository.createAsync(req.body, req.organization_id);

    res.status(statusCodes.CREATED).send(item);
});

const updateAsync = (repository) => catchAsync(async (req, res) => {
    const { id } = req.params;
    const item = await repository.updateAsync(id, req.body, req.organization_id);

    if (item) {
        res.status(statusCodes.OK).send(item);
    } else {
        res.status(statusCodes.NOT_FOUND).send({ message: 'Item not found' });
    }
});

const removeAsync = (repository) => catchAsync(async (req, res) => {
    const { id } = req.params;
    const item = await repository.removeAsync(id, req.organization_id);

    if (item) {
        res.status(statusCodes.OK).send({ message: 'Item deleted successfully' });
    } else {
        res.status(statusCodes.NOT_FOUND).send({ message: 'Item not found' });
    }
});

const createWithListAsync = (repository) => catchAsync(async (req, res) => {
    const items = await repository.createWithListAsync(req.body, req.organization_id);

    res.status(statusCodes.CREATED).send(items);
});

const updateWithListAsync = (repository) => catchAsync(async (req, res) => {
    const items = await repository.updateWithListAsync(req.body, req.organization_id);

    res.status(statusCodes.OK).send(items);
});

const deleteWithListAsync = (repository) => catchAsync(async (req, res) => {
    const items = await repository.deleteWithListAsync(req.body, req.organization_id);
    
    res.status(statusCodes.OK).send({ message: 'Items deleted successfully', deletedItems: items });
});

module.exports = (repository) => ({
    getAllAsync: getAllAsync(repository),
    getByIdAsync: getByIdAsync(repository),
    createAsync: createAsync(repository),
    updateAsync: updateAsync(repository),
    removeAsync: removeAsync(repository),
    createWithListAsync: createWithListAsync(repository),
    updateWithListAsync: updateWithListAsync(repository),
    deleteWithListAsync: deleteWithListAsync(repository),
});
