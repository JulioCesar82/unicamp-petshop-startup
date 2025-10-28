const { body, validationResult } = require('express-validator');

const validateTutor = [
  body('name').isString().notEmpty().withMessage('Name is required'),
  body('phone').isString().notEmpty().withMessage('Phone is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateTutorList = [
  body().isArray().withMessage('Request body must be an array'),
  body('*.name').isString().notEmpty().withMessage('Name is required'),
  body('*.phone').isString().notEmpty().withMessage('Phone is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateDeleteTutorList = [
  body('ids').isArray().withMessage('ids must be an array'),
  body('ids.*').isInt().withMessage('ids must contain only integers'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  validateTutor,
  validateTutorList,
  validateDeleteTutorList,
};
