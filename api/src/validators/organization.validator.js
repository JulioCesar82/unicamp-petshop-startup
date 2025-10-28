const { body } = require('express-validator');

const createOrganizationValidator = [
    body('name').isString().notEmpty(),
    body('social_name').isString().notEmpty(),
    body('description').isString().notEmpty(),
    body('identification_code').isString().notEmpty(),
    body('invite_code').isString().notEmpty(),
    body('links').optional().isArray().withMessage('links must be an array of strings'),
    body('links.*').optional().isURL().withMessage('Each link must be a valid URL'),
];

module.exports = {
    createOrganizationValidator
};
