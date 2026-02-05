const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Metadata update (MUST come before /product/:id)
router.put('/product/meta-data', productController.updateMetadata);

// Search
router.get('/search/product', productController.searchProducts);

// Product CRUD operations
router.post('/product', productController.createProduct);
router.get('/product/:id', productController.getProduct);
router.put('/product/:id', productController.updateProduct);
router.delete('/product/:id', productController.deleteProduct);
router.get('/products', productController.getAllProducts);

module.exports = router;