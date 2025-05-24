// middleware/validators/customerValidator.js
const { body, param } = require('express-validator');
const mongoose = require('mongoose');
const Customer = require('../../models/Customer'); // Adjust path as necessary

exports.validateIdParam = [
    param('id').custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error('Invalid Customer ID format');
        }
        return true;
    }),
];

exports.validateCreateCustomer = [
    body('name')
        .notEmpty().withMessage('Customer name is required.')
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Customer name must be between 2 and 100 characters.'),
    body('phoneNumber')
        .optional({ checkFalsy: true })
        .trim()
        .isMobilePhone('any', { strictMode: false }).withMessage('Invalid phone number format.'), // General mobile phone validation
    // Example for specific uniqueness check if needed:
    // .custom(async (value) => {
    //   if (value) {
    //     const customer = await Customer.findOne({ phoneNumber: value });
    //     if (customer) {
    //       return Promise.reject('Phone number already in use.');
    //     }
    //   }
    // }),
    body('address')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 255 }).withMessage('Address cannot exceed 255 characters.'),
];

exports.validateUpdateCustomer = [
    // ID validation should be part of the route or handled separately if combined
    param('id').custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error('Invalid Customer ID format');
        }
        return true;
    }),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Customer name must be between 2 and 100 characters.'),
    body('phoneNumber')
        .optional({ checkFalsy: true })
        .trim()
        .isMobilePhone('any', { strictMode: false }).withMessage('Invalid phone number format.'),
    // Example for specific uniqueness check on update (ignoring self):
    // .custom(async (value, { req }) => {
    //   if (value) {
    //     const customer = await Customer.findOne({ phoneNumber: value });
    //     if (customer && customer._id.toString() !== req.params.id) {
    //       return Promise.reject('Phone number already in use by another customer.');
    //     }
    //   }
    // }),
    body('address')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 255 }).withMessage('Address cannot exceed 255 characters.'),
];