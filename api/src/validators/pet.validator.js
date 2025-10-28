const { body, validationResult } = require('express-validator');

const validatePet = [
  body('name').isString().notEmpty().withMessage('Name is required'),
  body('species').isString().notEmpty().withMessage('Species is required'),
  body('animal_type').isString().notEmpty().withMessage('Animal type is required'),
  body('fur_type').isString().optional(),
  body('birth_date').isISO8601().toDate().withMessage('Must be a valid date'),
  body('tutor_id').isInt().withMessage('Tutor ID must be an integer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validatePetList = [
  body().isArray().withMessage('Request body must be an array of pets'),
  body('*.name').isString().notEmpty().withMessage('Name is required'),
  body('*.species').isString().notEmpty().withMessage('Species is required'),
  body('*.animal_type').isString().notEmpty().withMessage('Animal type is required'),
  body('*.fur_type').isString().optional(),
  body('*.birth_date').isISO8601().toDate().withMessage('Must be a valid date'),
  body('*.tutor_id').isInt().withMessage('Tutor ID must be an integer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateDeletePetList = [
  body('ids').isArray().withMessage('Request body must be an object with an array of ids'),
  body('ids.*').isInt().withMessage('All ids must be integers'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  validatePet,
  validatePetList,
  validateDeletePetList,
};
