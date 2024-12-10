// src/routes/schoolRoutes.js

const express = require('express');
const { body, param, validationResult } = require('express-validator');
const schoolController = require('../controllers/schoolController');

const router = express.Router();

const schoolValidationRules = [
  body('school_name')
    .exists().withMessage('School name is required')
    .isString().withMessage('School name must be a string'),
  
  body('city')
    .exists().withMessage('City is required')
    .isString().withMessage('City must be a string'),
  
  body('academic_year_start')
    .exists().withMessage('Academic year start is required')
    .isInt({ min: 1900, max: 2100 }).withMessage('Academic year start must be a valid year'),
  
  body('academic_year_end')
    .exists().withMessage('Academic year end is required')
    .isInt({ min: 1900, max: 2100 }).withMessage('Academic year end must be a valid year'),
  
  body('student_count')
    .exists().withMessage('Student count is required')
    .isInt({ min: 0 }).withMessage('Student count must be a non-negative integer'),
  
  body('student_sent_last1')
    .exists().withMessage('Student sent last1 is required')
    .isInt({ min: 0 }).withMessage('Student sent last1 must be a non-negative integer'),
  
  body('student_sent_last2')
    .exists().withMessage('Student sent last2 is required')
    .isInt({ min: 0 }).withMessage('Student sent last2 must be a non-negative integer'),
  
  body('student_sent_last3')
    .exists().withMessage('Student sent last3 is required')
    .isInt({ min: 0 }).withMessage('Student sent last3 must be a non-negative integer'),
  
  body('lgs_score')
    .exists().withMessage('LGS score is required')
    .isFloat({ min: 0.0, max: 500.0 }).withMessage('LGS score must be between 0 and 500'),
];

// Middleware to handle validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Add a new school
router.post(
  '/addSchool',
  schoolValidationRules,
  validate,
  schoolController.addSchool
);

// Get all schools
router.get(
  '/getAllSchools',
  schoolController.getAllSchools
);

// Get a school by ID
router.get(
  '/schools/:id',
  [
    param('id')
      .exists().withMessage('ID parameter is required')
      .isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  ],
  validate,
  schoolController.getSchoolById
);

// Update a school by ID
router.put(
  '/schools/:id',
  [
    param('id')
      .exists().withMessage('ID parameter is required')
      .isInt({ min: 1 }).withMessage('ID must be a positive integer'),
    ...schoolValidationRules,
  ],
  validate,
  schoolController.updateSchool
);

// Delete a school by ID
router.delete(
  '/schools/:id',
  [
    param('id')
      .exists().withMessage('ID parameter is required')
      .isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  ],
  validate,
  schoolController.deleteSchool
);

module.exports = router;