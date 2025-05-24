// routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const {
    createCustomer,
    getCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
} = require('../controllers/customerController');
const {
    validateCreateCustomer,
    validateUpdateCustomer,
    validateIdParam,
} = require('../middleware/validators/customerValidator');
const { getDebtsByCustomer } = require('../controllers/debtController'); // For nested route
const { validateCustomerIdParam } = require('../middleware/validators/debtValidator');


// Middleware to handle validation results (optional, can be done in controller)
const { validationResult } = require('express-validator');
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};


router.route('/')
    .post(validateCreateCustomer, handleValidationErrors, createCustomer)
    .get(getCustomers);

router.route('/:id')
    .get(validateIdParam, handleValidationErrors, getCustomerById)
    .put(validateUpdateCustomer, handleValidationErrors, updateCustomer) // validateUpdateCustomer includes ID
    .delete(validateIdParam, handleValidationErrors, deleteCustomer);

// Nested route to get debts for a specific customer
router.route('/:customerId/debts')
    .get(validateCustomerIdParam, handleValidationErrors, getDebtsByCustomer);


module.exports = router;