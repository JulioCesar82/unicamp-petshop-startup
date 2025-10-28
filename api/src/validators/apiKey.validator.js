const { param } = require('express-validator');

const deleteApiKeyValidator = [
    param('organization_id').isInt(),
    param('api_key').isString().notEmpty(),
];

module.exports = {
    deleteApiKeyValidator,
};
