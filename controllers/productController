const Product = require('../models/Product');
const asyncHandler = require('express-async-handler'); // For cleaner async error handling
const { validationResult } = require('express-validator');

// @desc    Get all products (with search)
// @route   GET /api/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res) => {
    const search = req.query.search || '';
    const query = {};

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } } // Added category to search
        ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 }); // Sort by newest
    res.json(products);
});

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findById(req.params.id);
    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});


// @desc    Create a new product
// @route   POST /api/products
// @access  Private (should be protected in a real app)
exports.createProduct = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, category, units, imagePath } = req.body;

    const product = new Product({
        name,
        description,
        category,
        units,
        imagePath: imagePath || '', // Default to empty string if not provided
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (should be protected)
exports.updateProduct = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = req.body.name || product.name;
        product.description = req.body.description || product.description;
        product.category = req.body.category || product.category;
        product.units = req.body.units || product.units;
        product.imagePath = req.body.imagePath !== undefined ? req.body.imagePath : product.imagePath;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (should be protected)
exports.deleteProduct = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findById(req.params.id);

    if (product) {
        await product.deleteOne(); // Mongoose 6+ uses deleteOne() on the document
        res.json({ message: 'Product removed successfully' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Upload an image for a product
// @route   POST /api/products/upload
// @access  Private (should be protected)
exports.uploadImage = asyncHandler(async (req, res) => {
    if (req.file) {
        // The path should be relative to how it's served statically
        // e.g. if app.use('/uploads', express.static('uploads')) is used
        // then the path should be /uploads/filename.ext
        const imagePath = `/uploads/${req.file.filename}`;
        res.status(200).json({
            message: 'Image uploaded successfully',
            imagePath: imagePath
        });
    } else {
        res.status(400);
        throw new Error('No image file provided or upload failed.');
    }
});