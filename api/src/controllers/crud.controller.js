const catchAsync = require('../utils/catchAsync');
const { statusCodes } = require('../config/general');

const getAllAsync = (repository) => catchAsync(async (req, res) => {
    const { page, pageSize } = req.query;
    const items = await repository.find({}, { organizationId: req.organization_id, page, pageSize });

    res.status(statusCodes.OK).send(items);
});

const getByIdAsync = (repository) => catchAsync(async (req, res) => {
    const { id } = req.params;
    const item = await repository.findById(id);

    if (item) {
        res.status(statusCodes.OK).send(item);
    } else {
        res.status(statusCodes.NOT_FOUND).send({ message: 'Item not found' });
    }
});

const createAsync = (repository) => catchAsync(async (req, res) => {
    const item = await repository.create(req.body);

    res.status(statusCodes.CREATED).send(item);
});

const createWithListAsync = (repository) => catchAsync(async (req, res) => {
    if (!repository.createWithList) {
        return res.status(statusCodes.BAD_REQUEST).send({ message: 'This operation is not supported.' });
    }
    const items = await repository.createWithList(req.body);

    res.status(statusCodes.CREATED).send(items);
});

const updateAsync = (repository) => catchAsync(async (req, res) => {
    const { id } = req.params;
    const item = await repository.update(id, req.body);

    if (item) {
        res.status(statusCodes.OK).send(item);
    } else {
        res.status(statusCodes.NOT_FOUND).send({ message: 'Item not found' });
    }
});

const updateWithListAsync = (repository) => catchAsync(async (req, res) => {
    if (!repository.updateWithList) {
        return res.status(statusCodes.BAD_REQUEST).send({ message: 'This operation is not supported.' });
    }
    const items = await repository.updateWithList(req.body);

    if (items) {
        res.status(statusCodes.OK).send(items);
    } else {
        res.status(statusCodes.NOT_FOUND).send({ message: 'Item not found' });
    }
});

const removeAsync = (repository) => catchAsync(async (req, res) => {
    const { id } = req.params;
    const item = await repository.softDelete(id);

    if (item) {
        res.status(statusCodes.OK).send({ message: 'Item deleted successfully' });
    } else {
        res.status(statusCodes.NOT_FOUND).send({ message: 'Item not found' });
    }
});

const deleteWithListAsync = (repository) => catchAsync(async (req, res) => {
    if (!repository.deleteWithList) {
        return res.status(statusCodes.BAD_REQUEST).send({ message: 'This operation is not supported.' });
    }
    const items = await repository.deleteWithList(req.body);

    if (items) {
        res.status(statusCodes.OK).send({ message: 'Items deleted successfully' });
    } else {
        res.status(statusCodes.NOT_FOUND).send({ message: 'Items not found' });
    }
});

module.exports = (repository) => ({
    getAllAsync: getAllAsync(repository),
    getByIdAsync: getByIdAsync(repository),
    createAsync: createAsync(repository),
    updateAsync: updateAsync(repository),
    removeAsync: removeAsync(repository),
    createWithListAsync: createWithListAsync(repository),
    updateWithListAsync: updateWithListAsync(repository),
    deleteWithListAsync: deleteWithListAsync(repository)
});
