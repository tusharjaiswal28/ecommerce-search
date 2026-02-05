# E-commerce Search Engine

A sophisticated search and ranking engine for an electronics e-commerce platform targeting Tier-2 and Tier-3 cities in India.

## 🚀 Features

- **Advanced Search Algorithm**: Handles typos, Hinglish queries, and intent-based searches
- **Multi-Factor Ranking**: Considers price, ratings, sales, stock, and relevance
- **Smart Query Processing**: 
  - Spelling correction (ifone → iphone)
  - Hinglish support (sasta → cheap)
  - Intent detection (budget/premium queries)
  - Attribute extraction (color, storage, price range)
- **Fast Performance**: Optimized for <1000ms response time
- **RESTful APIs**: Clean, well-documented endpoints
- **MongoDB Database**: Scalable product catalog storage

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **NLP**: Natural (for text processing and fuzzy matching)
- **Additional**: Axios, Cheerio (for scraping)

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
```bash
git clone "https://github.com/tusharjaiswal28/ecommerce-search.git"
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
# .env file is already created with defaults
# Modify if needed:
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ecommerce-search
NODE_ENV=development
```

4. **Start MongoDB**
```bash
# Make sure MongoDB is running on your system
# For Ubuntu/Linux:
sudo systemctl start mongod

# For macOS (Homebrew):
brew services start mongodb-community

# For Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

5. **Seed the database**
```bash
npm run seed
```

6. **Start the server**
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Endpoints

#### 1. Create Product
```http
POST /api/v1/product
```

**Request Body:**
```json
{
  "title": "iPhone 17",
  "description": "6.3-inch 120Hz ProMotion OLED display...",
  "rating": 4.2,
  "stock": 1000,
  "price": 81999,
  "mrp": 82999,
  "currency": "Rupee"
}
```

**Response:**
```json
{
  "success": true,
  "productId": "507f1f77bcf86cd799439011",
  "message": "Product created successfully"
}
```

#### 2. Update Product Metadata
```http
PUT /api/v1/product/meta-data
```

**Request Body:**
```json
{
  "productId": "507f1f77bcf86cd799439011",
  "metadata": {
    "ram": "8GB",
    "screenSize": "6.3 inches",
    "model": "iPhone 17",
    "storage": "128GB",
    "brightness": "3000 nits"
  }
}
```

**Response:**
```json
{
  "success": true,
  "productId": "507f1f77bcf86cd799439011",
  "metadata": {
    "ram": "8GB",
    "screenSize": "6.3 inches",
    "model": "iPhone 17",
    "storage": "128GB",
    "brightness": "3000 nits"
  }
}
```

#### 3. Search Products
```http
GET /api/v1/search/product?query=Sasta iPhone&page=1&limit=20
```

**Query Parameters:**
- `query` (required): Search query
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "iPhone 13 (Black, 128GB)",
      "description": "...",
      "price": 35000,
      "mrp": 62999,
      "rating": 4.5,
      "stock": 10,
      "metadata": {...},
      "_score": 87.5
    }
  ],
  "metadata": {
    "totalResults": 45,
    "page": 1,
    "limit": 20,
    "processingTime": "156ms",
    "query": {
      "originalQuery": "Sasta iPhone",
      "cleanedText": "iphone",
      "cheapIntent": true
    }
  }
}
```

#### 4. Get Single Product
```http
GET /api/v1/product/:id
```

#### 5. Get All Products (with filters)
```http
GET /api/v1/products?category=Mobile Phone&brand=Apple&minPrice=30000&maxPrice=80000
```

#### 6. Update Product
```http
PUT /api/v1/product/:id
```

#### 7. Delete Product (Soft Delete)
```http
DELETE /api/v1/product/:id
```

## 🔍 Search Capabilities

### Supported Query Types

1. **Basic Search**
   - `iPhone` - Find all iPhone products
   - `Samsung laptop` - Find Samsung laptops

2. **Hinglish Queries**
   - `Sasta iPhone` - Cheap iPhone (prioritizes lower prices)
   - `Mehenga headphone` - Expensive headphones (prioritizes premium)

3. **Spelling Mistakes**
   - `Ifone 16` → Corrected to iPhone 16
   - `Samsang phone` → Corrected to Samsung phone

4. **Intent-based**
   - `iPhone 50k rupees` - iPhones around ₹50,000
   - `iPhone red color` - Red iPhones
   - `iPhone 16 more storage` - iPhone 16 with larger storage

5. **Specific Attributes**
   - `iPhone cover strong` - Durable iPhone covers
   - `laptop 16GB RAM` - Laptops with 16GB RAM

## 🎯 Ranking Algorithm

The ranking system uses a weighted scoring mechanism:

| Factor | Weight | Description |
|--------|--------|-------------|
| **Relevance** | 30% | Text matching, brand/model match, fuzzy matching |
| **Rating** | 20% | Product rating + review count bonus |
| **Sales** | 15% | Units sold (popularity indicator) |
| **Stock** | 10% | Availability preference |
| **Price** | 15% | Intent-based (cheap/expensive/exact) |
| **Discount** | 10% | Discount percentage |

### Additional Factors
- **Penalties**: High return rate, complaints, out of stock
- **Fuzzy Matching**: Levenshtein distance for typo tolerance
- **Hinglish Translation**: Automatic query translation

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   └── Product.js            # Product schema
│   ├── controllers/
│   │   └── productController.js  # API logic
│   ├── services/
│   │   └── searchService.js      # Search & ranking engine
│   ├── routes/
│   │   └── productRoutes.js      # API routes
│   ├── utils/
│   │   └── seedData.js           # Database seeder
│   └── server.js                 # Express server
├── .env                          # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## 🧪 Testing the API

### Using cURL

**Search for products:**
```bash
curl "http://localhost:3000/api/v1/search/product?query=sasta%20iphone"
```

**Create a product:**
```bash
curl -X POST http://localhost:3000/api/v1/product \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Product",
    "description": "Test description",
    "rating": 4.0,
    "stock": 100,
    "price": 9999,
    "mrp": 14999
  }'
```

### Using Postman

1. Import the collection (create one with above endpoints)
2. Set base URL: `http://localhost:3000/api/v1`
3. Test each endpoint

## 🚀 Performance Optimizations

- **Database Indexing**: Text indexes on title, description, brand, model
- **In-memory Caching**: Can be added for frequent queries
- **Query Optimization**: MongoDB aggregation for complex filters
- **Response Compression**: Gzip compression enabled
- **Efficient Ranking**: Pre-computed scores where possible

## 🔐 Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Request validation
- **Error Handling**: Graceful error responses

## 📊 Sample Queries & Expected Behavior

| Query | Expected Behavior |
|-------|-------------------|
| `Sasta iPhone` | iPhone 13, SE ranked higher (lower price) |
| `iPhone 16 red color` | Red iPhone 16 models at top |
| `Ifone 16` | Auto-corrected to iPhone 16 |
| `Samsung phone 50000` | Samsung phones around ₹50k |
| `Latest iPhone` | iPhone 16 series ranked higher |
| `iPhone cover strong` | Durable iPhone covers prioritized |

## 🛣️ Roadmap

- [ ] Add Elasticsearch for better full-text search
- [ ] Implement caching layer (Redis)
- [ ] Add user behavior tracking for personalization
- [ ] Implement A/B testing for ranking algorithms
- [ ] Add recommendation engine
- [ ] API rate limiting
- [ ] GraphQL support

## 📝 Notes

- All prices are in Indian Rupees (₹)
- The database is seeded with 1000+ products across phones, laptops, headphones, and accessories
- Search queries are case-insensitive
- API responses include processing time for performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes with clear messages
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is part of an assignment and is available for educational purposes.

## 👤 Author

Built as part of an e-commerce search engine assignment.

---

**Happy Searching! 🔍**
