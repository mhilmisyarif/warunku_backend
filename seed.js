const mongoose = require('mongoose');
const Product = require('./models/Product');

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/inventory';

mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(async () => {
    console.log('Connected to MongoDB for seeding');

    await Product.deleteMany();

    const products = [
        {
            name: 'Sugar',
            description: 'Refined white sugar',
            category: 'Groceries',
            units: [
                {
                    label: 'kg',
                    // purchasePrice: 10000,
                    sellingPrice: 12000,
                    // stock: 50,
                },
            ],
            imagePath: '',
        },
        {
            name: 'Eggs',
            description: 'Free range chicken eggs',
            category: 'Groceries',
            units: [
                {
                    label: 'kg',
                    // purchasePrice: 1500,
                    sellingPrice: 1800,
                    // stock: 200,
                },
            ],
            imagePath: '',
        },
        {
            name: 'Cooking Oil',
            description: '1L vegetable oil bottle',
            category: 'Groceries',
            units: [
                {
                    label: 'kg',
                    // purchasePrice: 14000,
                    sellingPrice: 16000,
                    // stock: 100,
                },
            ],
            imagePath: '',
        },
    ];

    await Product.insertMany(products);
    console.log('Sample products inserted');

    mongoose.disconnect();
}).catch(err => {
    console.error('Seed error:', err);
});
