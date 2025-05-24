const { body, param } = require('express-validator');
const mongoose = require('mongoose');

exports.validateIdParam = [
    param('id').custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error('Invalid product ID format');
        }
        return true;
    }),
];

exports.validateCreateProduct = [
    body('name')
        .notEmpty().withMessage('Product name is required.')
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters.'),
    body('description')
        .optional({ checkFalsy: true }) // Allows empty string or null
        .trim()
        .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters.'),
    body('category')
        .notEmpty().withMessage('Product category is required.')
        .trim(),
    body('units')
        .isArray({ min: 1 }).withMessage('At least one product unit is required.'),
    body('units.*.label')
        .notEmpty().withMessage('Unit label is required.')
        .trim(),
    body('units.*.sellingPrice')
        .isFloat({ gt: 0 }).withMessage('Selling price must be a positive number.'),
    // body('units.*.purchasePrice').optional().isFloat({ gt: 0 }).withMessage('Purchase price must be a positive number.'),
    // body('units.*.stock').optional().isInt({ gt: -1 }).withMessage('Stock must be a non-negative integer.'),
    body('imagePath')
        .optional({ checkFalsy: true })
        .isString().withMessage('Image path must be a string.') // Or URL if you validate URLs
];

// For updates, you might want fields to be optional or have different rules
exports.validateUpdateProduct = [
    // Similar to create, but most fields could be optional
    param('id').custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error('Invalid product ID format');
        }
        return true;
    }),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters.'),
    body('description')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters.'),
    body('category')
        .optional()
        .trim(),
    body('units')
        .optional()
        .isArray({ min: 1 }).withMessage('If units are provided, at least one is required.'),
    body('units.*.label')
        .optional() // If units array is present, then label is required within unit
        .if((value, { req, path }) => req.body.units && req.body.units[path.split('[')[1].split(']')[0]])
        .notEmpty().withMessage('Unit label is required when unit is provided.')
        .trim(),
    body('units.*.sellingPrice')
        .optional()
        .if((value, { req, path }) => req.body.units && req.body.units[path.split('[')[1].split(']')[0]])
        .isFloat({ gt: 0 }).withMessage('Selling price must be a positive number when unit is provided.'),
    body('imagePath')
        .optional({ checkFalsy: true })
        .isString().withMessage('Image path must be a string.')
];