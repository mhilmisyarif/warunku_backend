const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
    label: {
        type: String,
        required: [true, 'Unit label is required.'],
        trim: true,
    },
    sellingPrice: {
        type: Number,
        required: [true, 'Selling price is required.'],
        min: [0, 'Selling price cannot be negative.']
    },
    // purchasePrice: { type: Number, min: [0, 'Purchase price cannot be negative.'] },
    // stock: { type: Number, min: [0, 'Stock cannot be negative.'] }
});

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required.'],
            trim: true,
            index: true, // Good for search performance
        },
        description: {
            type: String,
            trim: true,
            index: true, // Good for search performance
        },
        category: {
            type: String,
            required: [true, 'Product category is required.'],
            trim: true,
        },
        units: {
            type: [unitSchema],
            validate: [v => Array.isArray(v) && v.length > 0, 'At least one unit is required.']
        },
        imagePath: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields automatically
    }
);

module.exports = mongoose.model('Product', productSchema);