// controllers/customerController.js
const Customer = require('../models/Customer');
const DebtRecord = require('../models/DebtRecord');
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');

// @desc    Create a new customer
// @route   POST /api/customers
// @access  Private (should be protected)
exports.createCustomer = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, phoneNumber, address } = req.body;

    // Optional: Check if customer with the same phone number already exists
    if (phoneNumber) {
        const existingCustomer = await Customer.findOne({ phoneNumber });
        if (existingCustomer) {
            res.status(400);
            throw new Error('Customer with this phone number already exists.');
        }
    }

    const customer = await Customer.create({
        name,
        phoneNumber,
        address,
    });

    res.status(201).json(customer);
});

// @desc    Get all customers (with search and pagination)
// @route   GET /api/customers
// @access  Public (or Private)
exports.getCustomers = asyncHandler(async (req, res) => {
    const search = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { phoneNumber: { $regex: search, $options: 'i' } },
        ];
    }

    const customers = await Customer.find(query)
        .sort({ name: 1 }) // Sort by name
        .skip(skip)
        .limit(limit);

    const totalCustomers = await Customer.countDocuments(query);

    res.json({
        customers,
        currentPage: page,
        totalPages: Math.ceil(totalCustomers / limit),
        totalCustomers,
    });
});

// @desc    Get a single customer by ID
// @route   GET /api/customers/:id
// @access  Public (or Private)
exports.getCustomerById = asyncHandler(async (req, res) => {
    const errors = validationResult(req); // For param validation
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const customer = await Customer.findById(req.params.id);
    if (customer) {
        res.json(customer);
    } else {
        res.status(404);
        throw new Error('Customer not found');
    }
});

// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Private (should be protected)
exports.updateCustomer = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const customer = await Customer.findById(req.params.id);

    if (!customer) {
        res.status(404);
        throw new Error('Customer not found');
    }

    const { name, phoneNumber, address } = req.body;

    // Optional: Check for phone number uniqueness if it's being changed
    if (phoneNumber && phoneNumber !== customer.phoneNumber) {
        const existingCustomer = await Customer.findOne({ phoneNumber });
        if (existingCustomer && existingCustomer._id.toString() !== req.params.id) {
            res.status(400);
            throw new Error('Phone number already in use by another customer.');
        }
    }

    customer.name = name || customer.name;
    customer.phoneNumber = phoneNumber !== undefined ? phoneNumber : customer.phoneNumber;
    customer.address = address !== undefined ? address : customer.address;

    const updatedCustomer = await customer.save();
    res.json(updatedCustomer);
});

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Private (should be protected)
exports.deleteCustomer = asyncHandler(async (req, res) => {
    const errors = validationResult(req); // For param validation
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const customer = await Customer.findById(req.params.id);

    if (customer) {
        // **Consideration**: What to do with debts associated with this customer?
        // Option 1: Prevent deletion if debts exist
        const customerDebts = await DebtRecord.findOne({ customer: req.params.id, status: { $ne: 'PAID' } });
        if (customerDebts) {
            res.status(400);
            throw new Error('Cannot delete customer. There are outstanding debts associated with this customer.');
        }
        // Option 2: Anonymize debts (less common) or delete them (data loss risk).
        // For now, let's assume we prevent deletion if unpaid debts exist.

        await customer.deleteOne();
        res.json({ message: 'Customer removed successfully' });
    } else {
        res.status(404);
        throw new Error('Customer not found');
    }
});