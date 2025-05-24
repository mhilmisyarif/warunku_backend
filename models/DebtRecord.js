// models/DebtRecord.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const debtItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product', // Reference to your existing Product model
        required: [true, 'Product ID is required for a debt item.'],
    },
    productName: { // Denormalized for easier display and historical accuracy
        type: String,
        required: [true, 'Product name is required.'],
    },
    unitLabel: { // e.g., 'kg', 'pcs', 'liter'
        type: String,
        required: [true, 'Product unit label is required.'],
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required.'],
        min: [0.01, 'Quantity must be greater than 0.'], // Or 1 if only whole units allowed
    },
    priceAtTimeOfDebt: { // Price per unitLabel at the time of debt
        type: Number,
        required: [true, 'Price at time of debt is required.'],
        min: [0, 'Price cannot be negative.']
    },
    totalPrice: { // quantity * priceAtTimeOfDebt
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
        amountPaid: {
            type: Number,
            default: 0,
            min: [0, 'Amount paid cannot be negative.']
        },
        status: {
            type: String,
            enum: ['UNPAID', 'PARTIALLY_PAID', 'PAID'],
            default: 'UNPAID',
            index: true,
        },
        debtDate: { // The date the transaction/debt occurred
            type: Date,
            default: Date.now,
            index: true,
        },
        dueDate: {
            type: Date,
            optional: true,
        },
        notes: {
            type: String,
            trim: true,
            optional: true,
        },
        // You might add fields for payment history array if needed
        // paymentHistory: [
        //   {
        //     amount: Number,
        //     paymentDate: Date,
        //     method: String, // e.g., 'cash', 'transfer'
        //     notes: String
        //   }
        // ]
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);

// Pre-save middleware to calculate totalAmount if not provided or to ensure consistency
debtRecordSchema.pre('save', function (next) {
    this.totalAmount = this.items.reduce((acc, item) => acc + item.totalPrice, 0);

    // Update status based on amountPaid and totalAmount
    if (this.amountPaid >= this.totalAmount) {
        this.status = 'PAID';
    } else if (this.amountPaid > 0 && this.amountPaid < this.totalAmount) {
        this.status = 'PARTIALLY_PAID';
    } else {
        this.status = 'UNPAID';
    }
    next();
});

// Validate that amountPaid does not exceed totalAmount
debtRecordSchema.path('amountPaid').validate(function (value) {
    return value <= this.totalAmount;
}, 'Amount paid cannot exceed the total debt amount.');


module.exports = mongoose.model('DebtRecord', debtRecordSchema);