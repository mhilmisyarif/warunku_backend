// models/Customer.js
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Customer name is required.'],
            trim: true,
            index: true,
        },
        phoneNumber: {
            type: String,
            trim: true,
            // unique: true, // Consider if phone numbers must be unique
            // sparse: true, // Allow multiple nulls if unique is true
            // match: [/^[0-9]{10,15}$/, 'Please fill a valid phone number'], // Optional: basic phone validation
        },
        address: {
            type: String,
            trim: true,
        },
        // You might add more fields like email, notes about the customer, etc.
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);

module.exports = mongoose.model('Customer', customerSchema);