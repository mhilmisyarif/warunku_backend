// routes/debtRoutes.js
const express = require('express');
const router = express.Router();
const {
    createDebtRecord,
    getDebtRecords,
    getDebtRecordById,
    updateDebtRecord,
    // deleteDebtRecord, // Uncomment if you implement delete
} = require('../controllers/debtController');
const {
    validateCreateDebtRecord,
    validateUpdateDebtRecord,
    validateIdParam,
} = require('../middleware/validators/debtValidator');

// Middleware to handle validation results
const { validationResult } = require('express-validator');
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

router.route('/')
    .post(validateCreateDebtRecord, handleValidationErrors, createDebtRecord)
    .get(getDebtRecords);

router.route('/:id')
    .get(validateIdParam, handleValidationErrors, getDebtRecordById)
    .put(validateUpdateDebtRecord, handleValidationErrors, updateDebtRecord);
// .delete(validateIdParam, handleValidationErrors, deleteDebtRecord); // Uncomment if implemented

module.exports = router;