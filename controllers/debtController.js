// controllers/debtController.js
const DebtRecord = require('../models/DebtRecord');
const Customer = require('../models/Customer');
const Product = require('../models/Product'); // To verify product and get price if needed
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');


// @desc    Create a new debt record
// @route   POST /api/debts
// @access  Private (should be protected)
exports.createDebtRecord = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { customer: customerId, items: rawItems, debtDate, dueDate, notes, amountPaid } = req.body;

    // Verify customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
        res.status(404);
        throw new Error('Customer not found.');
    }

    const processedItems = [];
    let calculatedTotalAmount = 0;

    for (const rawItem of rawItems) {
        const product = await Product.findById(rawItem.product);
        if (!product) {
            res.status(404);
            throw new Error(`Product with ID ${rawItem.product} not found.`);
        }

        // Find the specific unit from the product to get its price
        const productUnit = product.units.find(u => u.label.toLowerCase() === rawItem.unitLabel.toLowerCase());
        if (!productUnit) {
            res.status(400);
            throw new Error(`Unit '${rawItem.unitLabel}' not found for product '${product.name}'.`);
        }

        // Use provided priceAtTimeOfDebt if available, otherwise fetch current sellingPrice of the unit
        const priceForThisItem = rawItem.priceAtTimeOfDebt !== undefined ? rawItem.priceAtTimeOfDebt : productUnit.sellingPrice;

        if (priceForThisItem === undefined || priceForThisItem < 0) {
            res.status(400);
            throw new Error(`Invalid price for unit '${rawItem.unitLabel}' of product '${product.name}'. Ensure priceAtTimeOfDebt is provided or the product unit has a selling price.`);
        }

        const itemTotalPrice = rawItem.quantity * priceForThisItem;
        calculatedTotalAmount += itemTotalPrice;

        processedItems.push({
            product: product._id,
            productName: product.name, // Denormalized product name
            unitLabel: productUnit.label, // Use the matched unit label for consistency
            quantity: rawItem.quantity,
            priceAtTimeOfDebt: priceForThisItem,
            totalPrice: itemTotalPrice,
        });
    }

    const debtRecord = new DebtRecord({
        customer: customerId,
        items: processedItems,
        totalAmount: calculatedTotalAmount, // Use server-calculated total
        debtDate: debtDate || Date.now(),
        dueDate,
        notes,
        amountPaid: amountPaid || 0
    });

    // The pre-save hook in DebtRecord model will handle status and re-calculate totalAmount.
    const createdDebtRecord = await debtRecord.save();
    res.status(201).json(createdDebtRecord);
});


// @desc    Get all debt records (with filters)
// @route   GET /api/debts
// @access  Private (should be protected)
exports.getDebtRecords = asyncHandler(async (req, res) => {
    const { customerId, status, startDate, endDate } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (customerId) {
        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            res.status(400); throw new Error('Invalid customer ID format for filter.');
        }
        query.customer = customerId;
    }
    if (status) {
        query.status = status.toUpperCase();
    }
    if (startDate) {
        query.debtDate = { ...query.debtDate, $gte: new Date(startDate) };
    }
    if (endDate) {
        // Add 1 day to endDate to include the whole day
        let endOfDay = new Date(endDate);
        endOfDay.setDate(endOfDay.getDate() + 1);
        query.debtDate = { ...query.debtDate, $lt: endOfDay };
    }

    const debtRecords = await DebtRecord.find(query)
        .populate('customer', 'name phoneNumber') // Populate customer details
        .populate('items.product', 'name category') // Populate basic product info in items
        .sort({ debtDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const totalDebtRecords = await DebtRecord.countDocuments(query);

    res.json({
        debtRecords,
        currentPage: page,
        totalPages: Math.ceil(totalDebtRecords / limit),
        totalDebtRecords,
    });
});

// @desc    Get debt records for a specific customer
// @route   GET /api/customers/:customerId/debts
// @access  Private
exports.getDebtsByCustomer = asyncHandler(async (req, res) => {
    const errors = validationResult(req); // For param validation
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const customerId = req.params.customerId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const customer = await Customer.findById(customerId);
    if (!customer) {
        res.status(404); throw new Error('Customer not found.');
    }

    const query = { customer: customerId };
    const { status, startDate, endDate } = req.query; // Additional filters
    if (status) query.status = status.toUpperCase();
    if (startDate) query.debtDate = { ...query.debtDate, $gte: new Date(startDate) };
    if (endDate) {
        let endOfDay = new Date(endDate);
        endOfDay.setDate(endOfDay.getDate() + 1);
        query.debtDate = { ...query.debtDate, $lt: endOfDay };
    }


    const debtRecords = await DebtRecord.find(query)
        .populate('items.product', 'name category')
        .sort({ debtDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const totalDebtRecords = await DebtRecord.countDocuments(query);

    res.json({
        customerName: customer.name, // Optional: return customer name too
        debtRecords,
        currentPage: page,
        totalPages: Math.ceil(totalDebtRecords / limit),
        totalDebtRecords,
    });
});


// @desc    Get a single debt record by ID
// @route   GET /api/debts/:id
// @access  Private (should be protected)
exports.getDebtRecordById = asyncHandler(async (req, res) => {
    const errors = validationResult(req); // For param validation
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const debtRecord = await DebtRecord.findById(req.params.id)
        .populate('customer', 'name phoneNumber address')
        .populate('items.product', 'name category imagePath units'); // More product details

    if (debtRecord) {
        res.json(debtRecord);
    } else {
        res.status(404);
        throw new Error('Debt record not found');
    }
});

// @desc    Update a debt record (e.g., for payments)
// @route   PUT /api/debts/:id
// @access  Private (should be protected)
exports.updateDebtRecord = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const debtRecord = await DebtRecord.findById(req.params.id);

    if (!debtRecord) {
        res.status(404);
        throw new Error('Debt record not found');
    }

    const { newPayment, notes, dueDate } = req.body; // newPayment would be an object like { amount: 100, method: 'Cash', paymentDate: '...', notes: '...' }

    if (newPayment && newPayment.amount > 0) {
        // Basic validation for newPayment object
        if (typeof newPayment.amount !== 'number' || newPayment.amount <= 0) {
            res.status(400); throw new Error('Invalid payment amount.');
        }
        const paymentDate = newPayment.paymentDate ? new Date(newPayment.paymentDate) : new Date();
        if (isNaN(paymentDate)) {
            res.status(400); throw new Error('Invalid payment date.');
        }

        debtRecord.paymentHistory.push({
            amount: newPayment.amount,
            paymentDate: paymentDate,
            method: newPayment.method, // Optional
            notes: newPayment.notes    // Optional
        });
    }

    // Update other fields if provided
    if (notes !== undefined) {
        debtRecord.notes = notes;
    }
    if (dueDate !== undefined) {
        debtRecord.dueDate = dueDate;
    }
    // Do NOT directly set debtRecord.amountPaid or debtRecord.status here.
    // Let the pre-save hook handle it.

    const updatedDebtRecord = await debtRecord.save();
    res.json(updatedDebtRecord);
});

// @desc    Delete a debt record
// @route   DELETE /api/debts/:id
// @access  Private (should be protected - use with caution)
// exports.deleteDebtRecord = asyncHandler(async (req, res) => {
//   const errors = validationResult(req); // For param validation
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }
//   const debtRecord = await DebtRecord.findById(req.params.id);
//   if (debtRecord) {
//     await debtRecord.deleteOne();
//     res.json({ message: 'Debt record removed successfully' });
//   } else {
//     res.status(404);
//     throw new Error('Debt record not found');
//   }
// });
// Generally, deleting financial records isn't a good idea.
// Consider soft delete (e.g., an `isActive: false` flag) or just marking as 'VOID' or similar.