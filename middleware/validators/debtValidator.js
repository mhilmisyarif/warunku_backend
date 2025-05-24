// middleware/validators/debtValidator.js
const { body, param, check } = require('express-validator');
const mongoose = require('mongoose');

exports.validateIdParam = [
    param('id').custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error('Invalid Debt Record ID format');
        }
        return true;
    }),
];

exports.validateCustomerIdParam = [ // For routes like /customers/:customerId/debts
    param('customerId').custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error('Invalid Customer ID format');
        }
        return true;
    }),
]

exports.validateCreateDebtRecord = [
    body('customer')
        .notEmpty().withMessage('Customer ID is required.')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid Customer ID format for debt record.');
            }
            return true;
        }),
    body('items')
        .isArray({ min: 1 }).withMessage('At least one debt item is required.'),
    body('items.*.product')
        .notEmpty().withMessage('Product ID is required for each item.')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid Product ID format in items.');
            }
            return true;
        }),
    body('items.*.productName')
        .notEmpty().withMessage('Product name is required for each item.')
        .trim(),
    body('items.*.unitLabel')
        .notEmpty().withMessage('Unit label is required for each item.')
        .trim(),
    body('items.*.quantity')
        .isFloat({ gt: 0 }).withMessage('Item quantity must be a positive number.'),
    body('items.*.priceAtTimeOfDebt')
        .isFloat({ gte: 0 }).withMessage('Item price at time of debt must be a non-negative number.'),
    // totalPrice will be calculated, so no direct validation needed if it's server-calculated
    // totalAmount will be calculated

    body('debtDate')
        .optional()
        .isISO8601().toDate().withMessage('Invalid debt date format.'),
    body('dueDate')
        .optional()
        .isISO8601().toDate().withMessage('Invalid due date format.')
        .custom((value, { req }) => {
            if (req.body.debtDate && value && new Date(value) < new Date(req.body.debtDate)) {
                throw new Error('Due date cannot be before the debt date.');
            }
            return true;
        }),
    body('notes')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters.'),
    body('amountPaid')
        .optional()
        .isFloat({ gte: 0 }).withMessage('Amount paid must be a non-negative number.')
];

exports.validateUpdateDebtRecord = [
    // ID validation for the debt record itself
    param('id').custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error('Invalid Debt Record ID format');
        }
        return true;
    }),
    // You might not allow changing customer or items once created, or have specific rules.
    // For simplicity, this example focuses on payment and status.
    body('amountPaid')
        .optional()
        .isFloat({ gte: 0 }).withMessage('Amount paid must be a non-negative number.'),
    body('status')
        .optional()
        .isIn(['UNPAID', 'PARTIALLY_PAID', 'PAID']).withMessage('Invalid status value.'),
    body('notes')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters.'),
    body('dueDate')
        .optional()
        .isISO8601().toDate().withMessage('Invalid due date format.')
];