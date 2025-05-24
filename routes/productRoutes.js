const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
} = require('../controllers/productController');
const { upload } = require('../middleware/multerConfig');
const {
    validateCreateProduct,
    validateUpdateProduct,
    validateIdParam,
} = require('../middleware/validators/productValidator');
const { validationResult } = require('express-validator'); // Helper to process validation results

// Middleware to handle validation results neatly
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Image Upload Route - place it before routes with :id if /upload could be mistaken for an ID
router.post('/upload', upload.single('image'), uploadImage);


router.route('/')
    .get(getProducts)
    .post(validateCreateProduct, handleValidationErrors, createProduct);

router.route('/:id')
    .get(validateIdParam, handleValidationErrors, getProductById)
    .put(validateUpdateProduct, handleValidationErrors, updateProduct) // validateUpdateProduct includes ID validation
    .delete(validateIdParam, handleValidationErrors, deleteProduct);


module.exports = router;