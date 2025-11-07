const organizationRepository = require('../repositories/postgres/organization.repository');
const apiKeyRepository = require('../repositories/postgres/apiKey.repository');
const organizationInviteRepository = require('../repositories/postgres/organizationInvite.repository');
const catchAsync = require('../utils/catchAsync');
const { statusCodes } = require('../config/general');
const { generateApiKey } = require('../config/organizarion');
const knex = require('../dal/query-builder/knex');

const createAsync = catchAsync(async (req, res) => {
    const { invite_code, ...organizationData } = req.body;

    if (!invite_code) {
        return res.status(statusCodes.BAD_REQUEST).json({ message: 'Invite code is required.' });
    }

    const validInvite = await organizationInviteRepository.findValidInvite(invite_code);

    if (!validInvite) {
        return res.status(statusCodes.BAD_REQUEST).json({ message: 'Invalid invite code.' });
    }

    const trx = await knex.transaction();
    try {
        const newOrganization = await organizationRepository.create(organizationData).transacting(trx);
        const apiKey = generateApiKey();
        await apiKeyRepository.create({
            organization_id: newOrganization.organization_id,
            api_key: apiKey
        }).transacting(trx);

        await organizationInviteRepository.markAsUsed(invite_code, newOrganization.organization_id, trx);

        await trx.commit();

        res.status(statusCodes.CREATED).json({ ...newOrganization, apiKey });
    } catch (error) {
        await trx.rollback();
        throw error;
    }
});

const findOneAsync = catchAsync(async (req, res) => {
    const organization = await organizationRepository.findById(req.organization_id);

    if (!organization) {
        return res.status(statusCodes.NOT_FOUND).json({ message: 'Organization not found.' });
    }

    res.status(statusCodes.OK).json(organization);
});

const disableAsync = catchAsync(async (req, res) => {
    const disabledOrganization = await organizationRepository.softDelete(req.organization_id);
    
    if (!disabledOrganization) {
        return res.status(statusCodes.NOT_FOUND).json({ message: 'Organization not found or already disabled.' });
    }

    res.status(statusCodes.OK).json(disabledOrganization);
});

module.exports = {
    createAsync,
    findOneAsync,
    disableAsync
};
