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

        // 1. Seed Products (same as before)
        const productsToSeed = [
            {
                name: 'Fine Sugar',
                description: 'Refined white sugar, 1kg pack',
                category: 'Groceries',
                units: [{ label: 'kg', sellingPrice: 14000 }],
                imagePath: '',
            },
            {
                name: 'Premium Eggs',
                description: 'Omega-3 rich chicken eggs',
                category: 'Groceries',
                units: [
                    { label: 'kg', sellingPrice: 28000 },
                    { label: 'tray (30 pcs)', sellingPrice: 70000 },
                    { label: 'pcs', sellingPrice: 2500 },
                ],
                imagePath: '',
            },
            {
                name: 'Palm Cooking Oil',
                description: '1 liter pouch of palm cooking oil',
                category: 'Groceries',
                units: [
                    { label: 'liter', sellingPrice: 18500 },
                    { label: '2 liter pouch', sellingPrice: 35000 }
                ],
                imagePath: '',
            },
            {
                name: 'Instant Noodles - Ayam Bawang',
                description: 'Chicken Onion flavor instant noodles',
                category: 'Instant Food',
                units: [
                    { label: 'pcs', sellingPrice: 3200 },
                    { label: '5-pack', sellingPrice: 15500 },
                    { label: 'box (40 pcs)', sellingPrice: 120000 }
                ],
                imagePath: '',
            },
            {
                name: 'Mineral Water Bottle 600ml',
                description: 'Standard bottled mineral water',
                category: 'Beverages',
                units: [
                    { label: 'bottle', sellingPrice: 3500 },
                    { label: 'box (24 bottles)', sellingPrice: 65000 }
                ],
                imagePath: '',
            },
            {
                name: 'White Rice - Medium Grain',
                description: 'Locally sourced medium grain white rice',
                category: 'Groceries',
                units: [
                    { label: 'kg', sellingPrice: 13000 },
                    { label: '5 kg pack', sellingPrice: 63000 },
                    { label: 'liter (approx 0.8kg)', sellingPrice: 10500 },
                ],
                imagePath: '',
            },
            {
                name: 'Black Coffee Powder',
                description: 'Ground robusta coffee powder',
                category: 'Beverages',
                units: [
                    { label: '100g pack', sellingPrice: 15000 },
                    { label: '250g pack', sellingPrice: 35000 },
                ],
                imagePath: '',
            },
            {
                name: 'Laundry Detergent Powder',
                description: '800g pack of powder detergent',
                category: 'Household',
                units: [
                    { label: '800g pack', sellingPrice: 22000 },
                    { label: 'sachet (45g)', sellingPrice: 1500 },
                ],
                imagePath: '',
            }
        ];
        const seededProducts = await Product.insertMany(productsToSeed);
        console.log(`${seededProducts.length} sample products inserted.`);

        // 2. Seed Customers (same as before)
        const customersToSeed = [
            { name: 'Budi Santoso', phoneNumber: '081234567890', address: 'Jl. Merdeka No. 10' },
            { name: 'Siti Aminah', phoneNumber: '085678901234', address: 'Jl. Kembang No. 5A' },
            { name: 'Agus Wijaya', phoneNumber: '087712345678', address: 'Jl. Pahlawan Blok C2' },
            { name: 'Dewi Lestari', phoneNumber: '081100001111', address: 'Jl. Mawar No. 1A RT 01 RW 02, Kel. Melati, Kec. Anggrek' },
        ];
        const seededCustomers = await Customer.insertMany(customersToSeed);
        console.log(`${seededCustomers.length} sample customers inserted.`);

        // 3. Seed Debt Records
        const findProduct = (name) => seededProducts.find(p => p.name === name);
        const getUnitSellingPrice = (productName, unitLabel) => {
            const product = findProduct(productName);
            if (!product) throw new Error(`Seeder error: Product "${productName}" not found.`);
            const unit = product.units.find(u => u.label === unitLabel);
            if (!unit) throw new Error(`Seeder error: Unit "${unitLabel}" for product "${productName}" not found.`);
            if (typeof unit.sellingPrice !== 'number') {
                throw new Error(`Seeder error: Unit "${unitLabel}" for product "${productName}" has no valid sellingPrice.`);
            }
            return unit.sellingPrice;
        };

        const debtsToSeedDataInput = [ // Renamed to avoid confusion before processing
            {
                customer: seededCustomers[0]._id,
                items: [
                    { productRef: 'Fine Sugar', unitLabel: 'kg', quantity: 2 },
                    { productRef: 'Instant Noodles - Ayam Bawang', unitLabel: 'pcs', quantity: 5 },
                ],
                debtDate: new Date('2024-05-20T10:00:00Z'),
                notes: 'Untuk acara keluarga Budi.',
                amountPaid: 10000,
            },
            {
                customer: seededCustomers[0]._id,
                items: [{ productRef: 'Palm Cooking Oil', unitLabel: 'liter', quantity: 1 }],
                debtDate: new Date('2024-05-22T15:30:00Z'),
            },
            {
                customer: seededCustomers[1]._id,
                items: [
                    { productRef: 'Premium Eggs', unitLabel: 'tray (30 pcs)', quantity: 1 },
                    { productRef: 'Mineral Water Bottle 600ml', unitLabel: 'box (24 bottles)', quantity: 1 },
                ],
                debtDate: new Date('2024-05-21T09:15:00Z'),
                notes: 'Stok mingguan.',
            },
            {
                customer: seededCustomers[3]._id,
                items: [
                    { productRef: 'White Rice - Medium Grain', unitLabel: '5 kg pack', quantity: 2 },
                    { productRef: 'Laundry Detergent Powder', unitLabel: '800g pack', quantity: 1 },
                ],
                debtDate: new Date('2024-05-23T11:00:00Z'),
                amountPaid: 50000,
            },
        ];

        for (const rawDebtData of debtsToSeedDataInput) {
            let calculatedTotalAmountForRecord = 0;
            const processedItems = rawDebtData.items.map(itemInput => {
                const product = findProduct(itemInput.productRef);
                if (!product) throw new Error(`Seeder error: Product reference "${itemInput.productRef}" not found for debt item.`);
                const priceAtTime = getUnitSellingPrice(itemInput.productRef, itemInput.unitLabel);
                const itemTotalPrice = itemInput.quantity * priceAtTime;
                calculatedTotalAmountForRecord += itemTotalPrice;
                return {
                    product: product._id,
                    productName: product.name,
                    unitLabel: itemInput.unitLabel,
                    quantity: itemInput.quantity,
                    priceAtTimeOfDebt: priceAtTime,
                    totalPrice: itemTotalPrice
                };
            });

            // Construct the final debtData object including the calculated totalAmount
            const finalDebtData = {
                customer: rawDebtData.customer,
                items: processedItems,
                totalAmount: calculatedTotalAmountForRecord, // Set totalAmount here
                debtDate: rawDebtData.debtDate,
                notes: rawDebtData.notes,
                amountPaid: rawDebtData.amountPaid, // amountPaid can be undefined, Mongoose default will apply
                // status will be set by pre-save hook based on amountPaid and totalAmount
            };

            const debt = new DebtRecord(finalDebtData);
            await debt.save();
        }
        console.log(`${debtsToSeedDataInput.length} sample debt records inserted.`);

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