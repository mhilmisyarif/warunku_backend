// seed.js
require('dotenv').config(); // Load environment variables from .env
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const DebtRecord = require('./models/DebtRecord');

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/inventory';

const seedDatabase = async () => {
    try {
        await mongoose.connect(mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected for seeding...');

        // Clear existing data
        await Product.deleteMany();
        console.log('Products cleared.');
        await Customer.deleteMany();
        console.log('Customers cleared.');
        await DebtRecord.deleteMany();
        console.log('Debt Records cleared.');

        // 1. Seed Products
        const productsToSeed = [
            {
                name: 'Sugar',
                description: 'Refined white sugar',
                category: 'Groceries',
                units: [{ label: 'kg', sellingPrice: 12500 }],
                imagePath: '/uploads/sample-sugar.jpg', // Example placeholder
            },
            {
                name: 'Eggs',
                description: 'Free range chicken eggs',
                category: 'Groceries',
                units: [
                    { label: 'kg', sellingPrice: 26000 },
                    { label: 'tray (30 pcs)', sellingPrice: 65000 }
                ],
                imagePath: '/uploads/sample-eggs.jpg',
            },
            {
                name: 'Cooking Oil',
                description: '1L vegetable oil bottle',
                category: 'Groceries',
                units: [
                    { label: 'liter', sellingPrice: 17000 },
                    { label: '2 liter pouch', sellingPrice: 32000 }
                ],
                imagePath: '/uploads/sample-oil.jpg',
            },
            {
                name: 'Instant Noodles (Mie Sedap Goreng)',
                description: 'Popular Indonesian instant fried noodles',
                category: 'Instant Food',
                units: [
                    { label: 'pcs', sellingPrice: 3500 },
                    { label: 'box (40 pcs)', sellingPrice: 130000 }
                ],
                imagePath: '/uploads/sample-mie-sedap.jpg',
            },
            {
                name: 'Mineral Water (Aqua 600ml)',
                description: 'Bottled mineral water',
                category: 'Beverages',
                units: [
                    { label: 'bottle', sellingPrice: 3000 },
                    { label: 'box (24 bottles)', sellingPrice: 60000 }
                ],
                imagePath: '/uploads/sample-aqua.jpg',
            }
        ];
        const seededProducts = await Product.insertMany(productsToSeed);
        console.log(`${seededProducts.length} sample products inserted.`);

        // 2. Seed Customers
        const customersToSeed = [
            { name: 'Budi Santoso', phoneNumber: '081234567890', address: 'Jl. Merdeka No. 10' },
            { name: 'Siti Aminah', phoneNumber: '085678901234', address: 'Jl. Kembang No. 5A' },
            { name: 'Agus Wijaya', phoneNumber: '087712345678', address: 'Jl. Pahlawan Blok C2' },
        ];
        const seededCustomers = await Customer.insertMany(customersToSeed);
        console.log(`${seededCustomers.length} sample customers inserted.`);

        // 3. Seed Debt Records
        // Helper to find product details
        const findProduct = (name) => seededProducts.find(p => p.name === name);

        const debtsToSeed = [
            // Debt for Budi Santoso
            {
                customer: seededCustomers[0]._id,
                items: [
                    {
                        product: findProduct('Sugar')._id,
                        productName: findProduct('Sugar').name,
                        unitLabel: 'kg',
                        quantity: 2,
                        priceAtTimeOfDebt: findProduct('Sugar').units.find(u => u.label === 'kg').sellingPrice,
                        totalPrice: 2 * findProduct('Sugar').units.find(u => u.label === 'kg').sellingPrice,
                    },
                    {
                        product: findProduct('Instant Noodles (Mie Sedap Goreng)')._id,
                        productName: findProduct('Instant Noodles (Mie Sedap Goreng)').name,
                        unitLabel: 'pcs',
                        quantity: 5,
                        priceAtTimeOfDebt: findProduct('Instant Noodles (Mie Sedap Goreng)').units.find(u => u.label === 'pcs').sellingPrice,
                        totalPrice: 5 * findProduct('Instant Noodles (Mie Sedap Goreng)').units.find(u => u.label === 'pcs').sellingPrice,
                    },
                ],
                debtDate: new Date('2024-05-20'),
                notes: 'Untuk acara keluarga.',
                amountPaid: 10000, // Partial payment
            },
            // Another debt for Budi Santoso (fully unpaid)
            {
                customer: seededCustomers[0]._id,
                items: [
                    {
                        product: findProduct('Cooking Oil')._id,
                        productName: findProduct('Cooking Oil').name,
                        unitLabel: 'liter',
                        quantity: 1,
                        priceAtTimeOfDebt: findProduct('Cooking Oil').units.find(u => u.label === 'liter').sellingPrice,
                        totalPrice: 1 * findProduct('Cooking Oil').units.find(u => u.label === 'liter').sellingPrice,
                    },
                ],
                debtDate: new Date('2024-05-22'),
                status: 'UNPAID',
            },
            // Debt for Siti Aminah
            {
                customer: seededCustomers[1]._id,
                items: [
                    {
                        product: findProduct('Eggs')._id,
                        productName: findProduct('Eggs').name,
                        unitLabel: 'tray (30 pcs)',
                        quantity: 1,
                        priceAtTimeOfDebt: findProduct('Eggs').units.find(u => u.label === 'tray (30 pcs)').sellingPrice,
                        totalPrice: 1 * findProduct('Eggs').units.find(u => u.label === 'tray (30 pcs)').sellingPrice,
                    },
                    {
                        product: findProduct('Mineral Water (Aqua 600ml)')._id,
                        productName: findProduct('Mineral Water (Aqua 600ml)').name,
                        unitLabel: 'box (24 bottles)',
                        quantity: 1,
                        priceAtTimeOfDebt: findProduct('Mineral Water (Aqua 600ml)').units.find(u => u.label === 'box (24 bottles)').sellingPrice,
                        totalPrice: 1 * findProduct('Mineral Water (Aqua 600ml)').units.find(u => u.label === 'box (24 bottles)').sellingPrice,
                    }
                ],
                debtDate: new Date('2024-05-21'),
                // totalAmount will be calculated by pre-save hook
                status: 'UNPAID',
            },
            // Debt for Agus Wijaya (already paid)
            {
                customer: seededCustomers[2]._id,
                items: [
                    {
                        product: findProduct('Sugar')._id,
                        productName: findProduct('Sugar').name,
                        unitLabel: 'kg',
                        quantity: 1,
                        priceAtTimeOfDebt: findProduct('Sugar').units.find(u => u.label === 'kg').sellingPrice,
                        totalPrice: 1 * findProduct('Sugar').units.find(u => u.label === 'kg').sellingPrice,
                    }
                ],
                debtDate: new Date('2024-05-15'),
                amountPaid: findProduct('Sugar').units.find(u => u.label === 'kg').sellingPrice * 1, // Paid in full
                // Status will be set to PAID by pre-save hook
            },
        ];

        // Need to save one by one if we want pre-save hooks for totalAmount and status to run correctly
        // or ensure totalAmount is pre-calculated if using insertMany for DebtRecords.
        // The DebtRecord model's pre-save hook calculates totalAmount and sets status.
        for (const debtData of debtsToSeed) {
            const debt = new DebtRecord(debtData);
            await debt.save();
        }
        console.log(`${debtsToSeed.length} sample debt records inserted.`);

    } catch (error) {
        console.error('Error seeding the database:', error);
        console.error(error.stack);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected.');
    }
};

// Run the seeder
seedDatabase();