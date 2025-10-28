const { query, validationResult } = require('express-validator');
const { statusCodes } = require('../config/general');

const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer.'),
    query('pageSize')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page size must be a positive integer.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(statusCodes.BAD_REQUEST).json({ errors: errors.array() });
        }

        req.query.page = req.query.page ? parseInt(req.query.page, 10) : 1;
        req.query.pageSize = req.query.pageSize ? parseInt(req.query.pageSize, 10) : 10;
        
        next();
    }
];

module.exports = {
    validatePagination
};
