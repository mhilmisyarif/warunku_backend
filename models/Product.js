const mongoose = require('mongoose');

// Define unit-price variant schema
const unitSchema = new mongoose.Schema({
    label: { type: String, required: true },           // e.g., pcs, 1/4 kg, 1 kg
    // purchasePrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    // stock: Number,
});

// Define product schema
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    category: { type: String, required: true },
    units: [unitSchema],            // List of unit-price variants
    imagePath: String,
});

module.exports = mongoose.model('Product', productSchema);
