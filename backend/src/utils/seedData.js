require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Sample data generator for electronics
const brands = {
  phones: ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme', 'Oppo', 'Vivo', 'Google', 'Motorola', 'Nokia'],
  laptops: ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'MSI', 'Samsung'],
  headphones: ['Sony', 'JBL', 'Boat', 'Sennheiser', 'Audio-Technica', 'Bose', 'Apple', 'Samsung'],
  accessories: ['Anker', 'Belkin', 'Amazon Basics', 'Mi', 'Realme', 'Samsung']
};

const colors = ['Black', 'White', 'Blue', 'Red', 'Green', 'Silver', 'Gold', 'Purple', 'Pink'];
const phoneModels = [
  // iPhones
  { brand: 'Apple', model: 'iPhone 16 Pro Max', basePrice: 159900, ram: '8GB', storage: ['256GB', '512GB', '1TB'] },
  { brand: 'Apple', model: 'iPhone 16 Pro', basePrice: 134900, ram: '8GB', storage: ['128GB', '256GB', '512GB'] },
  { brand: 'Apple', model: 'iPhone 16', basePrice: 79900, ram: '6GB', storage: ['128GB', '256GB', '512GB'] },
  { brand: 'Apple', model: 'iPhone 15', basePrice: 69900, ram: '6GB', storage: ['128GB', '256GB'] },
  { brand: 'Apple', model: 'iPhone 14', basePrice: 59900, ram: '6GB', storage: ['128GB', '256GB'] },
  { brand: 'Apple', model: 'iPhone 13', basePrice: 49900, ram: '4GB', storage: ['128GB', '256GB'] },
  { brand: 'Apple', model: 'iPhone SE', basePrice: 43900, ram: '4GB', storage: ['64GB', '128GB'] },
  
  // Samsung
  { brand: 'Samsung', model: 'Galaxy S24 Ultra', basePrice: 129999, ram: '12GB', storage: ['256GB', '512GB', '1TB'] },
  { brand: 'Samsung', model: 'Galaxy S24', basePrice: 79999, ram: '8GB', storage: ['128GB', '256GB'] },
  { brand: 'Samsung', model: 'Galaxy A54', basePrice: 35999, ram: '8GB', storage: ['128GB', '256GB'] },
  { brand: 'Samsung', model: 'Galaxy M34', basePrice: 18999, ram: '6GB', storage: ['128GB'] },
  
  // OnePlus
  { brand: 'OnePlus', model: '12 Pro', basePrice: 64999, ram: '12GB', storage: ['256GB', '512GB'] },
  { brand: 'OnePlus', model: '11', basePrice: 54999, ram: '8GB', storage: ['128GB', '256GB'] },
  { brand: 'OnePlus', model: 'Nord CE 3', basePrice: 24999, ram: '8GB', storage: ['128GB'] },
  
  // Xiaomi
  { brand: 'Xiaomi', model: '14 Pro', basePrice: 79999, ram: '12GB', storage: ['256GB', '512GB'] },
  { brand: 'Xiaomi', model: '13', basePrice: 54999, ram: '8GB', storage: ['128GB', '256GB'] },
  { brand: 'Xiaomi', model: 'Redmi Note 13 Pro', basePrice: 24999, ram: '8GB', storage: ['128GB', '256GB'] },
  
  // Realme
  { brand: 'Realme', model: '12 Pro+', basePrice: 29999, ram: '8GB', storage: ['128GB', '256GB'] },
  { brand: 'Realme', model: 'GT 3', basePrice: 42999, ram: '12GB', storage: ['256GB'] },
  
  // Google
  { brand: 'Google', model: 'Pixel 8 Pro', basePrice: 106999, ram: '12GB', storage: ['128GB', '256GB', '512GB'] },
  { brand: 'Google', model: 'Pixel 7a', basePrice: 43999, ram: '8GB', storage: ['128GB'] },
];

const laptops = [
  { brand: 'Apple', model: 'MacBook Air M2', basePrice: 114900, ram: ['8GB', '16GB'], storage: ['256GB', '512GB'] },
  { brand: 'Apple', model: 'MacBook Pro M3', basePrice: 169900, ram: ['16GB', '32GB'], storage: ['512GB', '1TB'] },
  { brand: 'Dell', model: 'XPS 13', basePrice: 89990, ram: ['8GB', '16GB'], storage: ['256GB', '512GB'] },
  { brand: 'HP', model: 'Pavilion 15', basePrice: 45990, ram: ['8GB', '16GB'], storage: ['512GB', '1TB'] },
  { brand: 'Lenovo', model: 'ThinkPad X1', basePrice: 125990, ram: ['16GB', '32GB'], storage: ['512GB', '1TB'] },
  { brand: 'Asus', model: 'ROG Strix G15', basePrice: 89990, ram: ['16GB', '32GB'], storage: ['512GB', '1TB'] },
];

const headphones = [
  { brand: 'Sony', model: 'WH-1000XM5', price: 29990, type: 'Over-Ear' },
  { brand: 'Apple', model: 'AirPods Pro 2', price: 24900, type: 'In-Ear' },
  { brand: 'JBL', model: 'Tune 750BTNC', price: 4999, type: 'Over-Ear' },
  { brand: 'Boat', model: 'Rockerz 450', price: 1499, type: 'Over-Ear' },
  { brand: 'Samsung', model: 'Galaxy Buds 2 Pro', price: 14990, type: 'In-Ear' },
  { brand: 'Bose', model: 'QuietComfort 45', price: 32900, type: 'Over-Ear' },
];

function generateProducts() {
  const products = [];
  
  // Generate phones with variants
  phoneModels.forEach(phone => {
    phone.storage.forEach(storage => {
      colors.slice(0, 5).forEach(color => {
        const storageMultiplier = storage === '1TB' ? 1.4 : storage === '512GB' ? 1.2 : storage === '256GB' ? 1.1 : 1;
        const mrp = Math.round(phone.basePrice * storageMultiplier);
        const discountPercent = Math.random() * 20 + 5; // 5-25% discount
        const price = Math.round(mrp * (1 - discountPercent / 100));
        
        products.push({
          title: `${phone.brand} ${phone.model} (${color}, ${storage})`,
          description: `${phone.brand} ${phone.model} with ${phone.ram} RAM and ${storage} storage in ${color} color. Features advanced camera system, powerful processor, and long battery life. Perfect for photography, gaming, and daily use.`,
          rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
          reviewCount: Math.floor(Math.random() * 5000) + 100,
          stock: Math.floor(Math.random() * 500),
          price,
          mrp,
          currency: 'Rupee',
          unitsSold: Math.floor(Math.random() * 10000),
          salesVelocity: parseFloat((Math.random() * 50).toFixed(1)),
          returnRate: parseFloat((Math.random() * 5).toFixed(1)),
          complaintCount: Math.floor(Math.random() * 100),
          metadata: {
            category: 'Mobile Phone',
            brand: phone.brand,
            model: phone.model,
            color: color,
            ram: phone.ram,
            storage: storage,
            screenSize: '6.1-6.7 inches',
            battery: '4000-5000mAh',
            processor: phone.brand === 'Apple' ? 'A17 Bionic' : 'Snapdragon 8 Gen 2'
          },
          searchKeywords: [phone.brand.toLowerCase(), phone.model.toLowerCase(), 'phone', 'smartphone', color.toLowerCase()]
        });
      });
    });
  });
  
  // Generate laptops
  laptops.forEach(laptop => {
    laptop.ram.forEach(ram => {
      laptop.storage.forEach(storage => {
        const storageMultiplier = storage === '1TB' ? 1.2 : storage === '512GB' ? 1.1 : 1;
        const ramMultiplier = ram === '32GB' ? 1.3 : ram === '16GB' ? 1.15 : 1;
        const mrp = Math.round(laptop.basePrice * storageMultiplier * ramMultiplier);
        const price = Math.round(mrp * 0.9);
        
        products.push({
          title: `${laptop.brand} ${laptop.model} (${ram} RAM, ${storage} SSD)`,
          description: `${laptop.brand} ${laptop.model} laptop with ${ram} RAM and ${storage} SSD storage. Perfect for work, study, and entertainment. Features high-resolution display and powerful performance.`,
          rating: parseFloat((4.0 + Math.random() * 1).toFixed(1)),
          reviewCount: Math.floor(Math.random() * 2000) + 50,
          stock: Math.floor(Math.random() * 200),
          price,
          mrp,
          currency: 'Rupee',
          unitsSold: Math.floor(Math.random() * 3000),
          salesVelocity: parseFloat((Math.random() * 20).toFixed(1)),
          returnRate: parseFloat((Math.random() * 3).toFixed(1)),
          complaintCount: Math.floor(Math.random() * 50),
          metadata: {
            category: 'Laptop',
            brand: laptop.brand,
            model: laptop.model,
            ram: ram,
            storage: storage,
            screenSize: '13-15 inches',
            processor: laptop.brand === 'Apple' ? 'M2/M3 Chip' : 'Intel Core i5/i7'
          },
          searchKeywords: [laptop.brand.toLowerCase(), laptop.model.toLowerCase(), 'laptop', 'computer']
        });
      });
    });
  });
  
  // Generate headphones
  headphones.forEach(headphone => {
    colors.slice(0, 3).forEach(color => {
      const mrp = headphone.price;
      const price = Math.round(mrp * (0.8 + Math.random() * 0.15));
      
      products.push({
        title: `${headphone.brand} ${headphone.model} Wireless Headphones (${color})`,
        description: `${headphone.brand} ${headphone.model} ${headphone.type} wireless headphones in ${color}. Features noise cancellation, premium sound quality, and comfortable design. Perfect for music lovers and professionals.`,
        rating: parseFloat((3.8 + Math.random() * 1.2).toFixed(1)),
        reviewCount: Math.floor(Math.random() * 3000) + 200,
        stock: Math.floor(Math.random() * 1000),
        price,
        mrp,
        currency: 'Rupee',
        unitsSold: Math.floor(Math.random() * 15000),
        salesVelocity: parseFloat((Math.random() * 100).toFixed(1)),
        returnRate: parseFloat((Math.random() * 4).toFixed(1)),
        complaintCount: Math.floor(Math.random() * 80),
        metadata: {
          category: 'Headphones',
          brand: headphone.brand,
          model: headphone.model,
          color: color,
          soundOutput: 'Stereo',
          type: headphone.type
        },
        searchKeywords: [headphone.brand.toLowerCase(), 'headphones', 'audio', 'wireless', color.toLowerCase()]
      });
    });
  });
  
  // Generate accessories
  const accessories = [
    { type: 'iPhone Cover', prefix: 'iPhone', models: ['16', '15', '14', '13'], price: [499, 1999] },
    { type: 'iPhone Charger', prefix: 'iPhone', models: ['Fast Charger', '20W', '30W'], price: [799, 2499] },
    { type: 'Phone Case', prefix: 'Samsung', models: ['S24', 'S23', 'A54'], price: [399, 1499] },
    { type: 'Screen Guard', prefix: 'Tempered Glass', models: ['iPhone', 'Samsung', 'OnePlus'], price: [199, 999] },
  ];
  
  accessories.forEach(acc => {
    acc.models.forEach(model => {
      const price = Math.floor(Math.random() * (acc.price[1] - acc.price[0]) + acc.price[0]);
      const mrp = Math.round(price * 1.3);
      
      products.push({
        title: `${acc.prefix} ${model} ${acc.type}`,
        description: `High-quality ${acc.type} for ${acc.prefix} ${model}. Durable, protective, and stylish accessory.`,
        rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        reviewCount: Math.floor(Math.random() * 1000) + 50,
        stock: Math.floor(Math.random() * 2000),
        price,
        mrp,
        currency: 'Rupee',
        unitsSold: Math.floor(Math.random() * 20000),
        salesVelocity: parseFloat((Math.random() * 150).toFixed(1)),
        returnRate: parseFloat((Math.random() * 6).toFixed(1)),
        complaintCount: Math.floor(Math.random() * 150),
        metadata: {
          category: 'Accessory',
          brand: brands.accessories[Math.floor(Math.random() * brands.accessories.length)],
          model: `${acc.prefix} ${model}`
        },
        searchKeywords: [acc.type.toLowerCase(), acc.prefix.toLowerCase(), model.toLowerCase()]
      });
    });
  });
  
  return products;
}

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');
    
    // Generate and insert products
    const products = generateProducts();
    console.log(`📦 Generated ${products.length} products`);
    
    await Product.insertMany(products);
    console.log('✅ Successfully seeded database with products');
    
    // Print some stats
    const stats = {
      total: await Product.countDocuments(),
      phones: await Product.countDocuments({ 'metadata.category': 'Mobile Phone' }),
      laptops: await Product.countDocuments({ 'metadata.category': 'Laptop' }),
      headphones: await Product.countDocuments({ 'metadata.category': 'Headphones' }),
      accessories: await Product.countDocuments({ 'metadata.category': 'Accessory' })
    };
    
    console.log('\n📊 Database Statistics:');
    console.log(`Total Products: ${stats.total}`);
    console.log(`Mobile Phones: ${stats.phones}`);
    console.log(`Laptops: ${stats.laptops}`);
    console.log(`Headphones: ${stats.headphones}`);
    console.log(`Accessories: ${stats.accessories}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { generateProducts, seedDatabase };
