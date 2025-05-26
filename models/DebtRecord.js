// models/DebtRecord.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// New Sub-schema for individual payment entries
const paymentEntrySchema = new Schema({
    amount: {
        type: Number,
        required: [true, 'Payment amount is required.'],
        min: [0.01, 'Payment amount must be positive.'] // Individual payment should be > 0
    },
    paymentDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    method: { // Optional: e.g., 'Cash', 'Transfer', 'Digital Wallet'
        type: String,
        trim: true
    },
    notes: { // Optional: Notes specific to this payment
        type: String,
        trim: true
    },
    // recordedBy: { type: Schema.Types.ObjectId, ref: 'User' } // Optional: If you add user auth
}, {
    _id: true, // Keep default _id for sub-documents if needed for individual manipulation, or set to false
    timestamps: { createdAt: 'recordedAt', updatedAt: false } // Only record when this entry was created
});

const debtItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product ID is required for a debt item.'],
    },
    productName: {
        type: String,
        required: [true, 'Product name is required.'],
    },
    unitLabel: {
        type: String,
        required: [true, 'Product unit label is required.'],
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required.'],
        min: [0.01, 'Quantity must be greater than 0.'],
    },
    priceAtTimeOfDebt: {
        type: Number,
        required: [true, 'Price at time of debt is required.'],
        min: [0, 'Price cannot be negative.']
    },
    totalPrice: {
        type: Number,
        required: [true, 'Total price for the item is required.'],
        min: [0, 'Total price cannot be negative.']
    },
});

const debtRecordSchema = new Schema(
    {
        customer: {
            type: Schema.Types.ObjectId,
            ref: 'Customer',
            required: [true, 'Customer is required for a debt record.'],
            index: true,
        },
        items: {
            type: [debtItemSchema],
            validate: [v => Array.isArray(v) && v.length > 0, 'At least one item is required in a debt record.']
        },
        totalAmount: { // Sum of all items[i].totalPrice
            type: Number,
            required: [true, 'Total debt amount is required.'],
            min: [0, 'Total amount cannot be negative.']
        },
        amountPaid: { // This will now be calculated from paymentHistory
            type: Number,
            default: 0,
            min: [0, 'Amount paid cannot be negative.']
        },
        paymentHistory: [paymentEntrySchema], // <-- NEW FIELD FOR PAYMENT TIMELINE
        status: {
            type: String,
            enum: ['UNPAID', 'PARTIALLY_PAID', 'PAID'],
            default: 'UNPAID',
            index: true,
        },
        debtDate: {
            type: Date,
            default: Date.now,
            index: true,
        },
        dueDate: {
            type: Date,
            optional: true,
        },
        notes: { // General notes for the debt record
            type: String,
            trim: true,
            optional: true,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt for the DebtRecord itself
    }
);

// Pre-save hook to calculate totalAmount from items,
// and amountPaid from paymentHistory, and then set status.
debtRecordSchema.pre('save', function (next) {
    // Calculate totalAmount from items (if items are modified or it's a new record)
    if (this.isModified('items') || this.isNew) {
        this.totalAmount = this.items.reduce((acc, item) => acc + (item.totalPrice || 0), 0);
    }

    // Calculate amountPaid from paymentHistory (if paymentHistory is modified)
    if (this.isModified('paymentHistory') || this.isNew) {
        this.amountPaid = this.paymentHistory.reduce((acc, payment) => acc + (payment.amount || 0), 0);
    }

    // Update status based on amountPaid and totalAmount
    // Ensure totalAmount is not zero before division or comparison to prevent NaN issues with status
    if (this.totalAmount > 0) {
        if (this.amountPaid >= this.totalAmount) {
            this.status = 'PAID';
        } else if (this.amountPaid > 0 && this.amountPaid < this.totalAmount) {
            this.status = 'PARTIALLY_PAID';
        } else {
            this.status = 'UNPAID';
        }
    } else { // If totalAmount is 0 (e.g. all items removed or priced at 0)
        this.status = 'PAID'; // Or 'VOID', depending on business logic
    }
    next();
});

// Removed the previous standalone validator for amountPaid <= totalAmount
// as it's now implicitly handled by the pre-save hook logic and how status is derived.
// If you still want an explicit check, it should be done carefully considering when totalAmount is set.

module.exports = mongoose.model('DebtRecord', debtRecordSchema);