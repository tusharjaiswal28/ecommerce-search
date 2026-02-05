// Test queries to verify search functionality
// Run these after starting the server and seeding the database

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

// Test queries
const testQueries = [
  'Sasta iPhone',
  'iPhone 16 red color',
  'Ifone 16',
  'Latest iPhone',
  'Samsung phone 50000',
  'iPhone cover strong',
  'laptop 16GB RAM',
  'mehenga headphone',
  'iPhone 16 more storage',
  'budget samsung phone'
];

async function testSearch() {
  console.log('🧪 Testing Search API\n');
  
  for (const query of testQueries) {
    try {
      const response = await axios.get(`${BASE_URL}/search/product`, {
        params: { query, limit: 5 }
      });
      
      const { data, metadata } = response.data;
      
      console.log(`\n📝 Query: "${query}"`);
      console.log(`⏱️  Processing Time: ${metadata.processingTime}`);
      console.log(`📊 Total Results: ${metadata.totalResults}`);
      console.log(`🎯 Intent Detected: ${JSON.stringify(metadata.query)}`);
      console.log('\n🏆 Top 3 Results:');
      
      data.slice(0, 3).forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.title}`);
        console.log(`     Price: ₹${product.price} (MRP: ₹${product.mrp})`);
        console.log(`     Rating: ${product.rating}⭐ | Stock: ${product.stock}`);
        console.log(`     Score: ${product._score}`);
      });
      
      console.log('\n' + '='.repeat(80));
    } catch (error) {
      console.error(`❌ Error testing query "${query}":`, error.message);
    }
  }
}

async function testCreateProduct() {
  console.log('\n🧪 Testing Create Product API\n');
  
  try {
    const newProduct = {
      title: 'Test Product - iPhone 17 Pro Max',
      description: 'A test product for API verification',
      rating: 4.5,
      reviewCount: 100,
      stock: 50,
      price: 139999,
      mrp: 159999,
      currency: 'Rupee',
      metadata: {
        category: 'Mobile Phone',
        brand: 'Apple',
        model: 'iPhone 17 Pro Max',
        color: 'Black',
        ram: '8GB',
        storage: '256GB'
      }
    };
    
    const response = await axios.post(`${BASE_URL}/product`, newProduct);
    console.log('✅ Product created:', response.data);
    
    return response.data.productId;
  } catch (error) {
    console.error('❌ Error creating product:', error.response?.data || error.message);
  }
}

async function testUpdateMetadata(productId) {
  console.log('\n🧪 Testing Update Metadata API\n');
  
  try {
    const response = await axios.put(`${BASE_URL}/product/meta-data`, {
      productId,
      metadata: {
        ram: '12GB',
        storage: '512GB',
        screenSize: '6.7 inches',
        brightness: '3000 nits'
      }
    });
    
    console.log('✅ Metadata updated:', response.data);
  } catch (error) {
    console.error('❌ Error updating metadata:', error.response?.data || error.message);
  }
}

async function runAllTests() {
  console.log('\n🚀 Starting API Tests...\n');
  console.log('='.repeat(80));
  
  // Test create product
  const productId = await testCreateProduct();
  
  // Test update metadata
  if (productId) {
    await testUpdateMetadata(productId);
  }
  
  // Test search
  await testSearch();
  
  console.log('\n✅ All tests completed!\n');
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { testSearch, testCreateProduct, testUpdateMetadata };
