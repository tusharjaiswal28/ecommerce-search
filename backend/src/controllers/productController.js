const Product = require('../models/Product');
const searchService = require('../services/searchService');

class ProductController {
  /**
   * Create a new product
   * POST /api/v1/product
   */
  async createProduct(req, res) {
    try {
      const productData = req.body;
      
      // Validate required fields
      if (!productData.title || !productData.description || !productData.price || productData.stock === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: title, description, price, stock'
        });
      }
      
      // Create product
      const product = new Product(productData);
      await product.save();
      
      res.status(201).json({
        success: true,
        productId: product._id,
        message: 'Product created successfully'
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create product',
        message: error.message
      });
    }
  }

  /**
   * Update product metadata
   * PUT /api/v1/product/meta-data
   */
  async updateMetadata(req, res) {
    try {
      const { productId, metadata } = req.body;
      
      if (!productId) {
        return res.status(400).json({
          success: false,
          error: 'Product ID is required'
        });
      }
      
      const product = await Product.findById(productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      // Update metadata
      product.metadata = { ...product.metadata, ...metadata };
      await product.save();
      
      res.status(200).json({
        success: true,
        productId: product._id,
        metadata: product.metadata
      });
    } catch (error) {
      console.error('Update metadata error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update metadata',
        message: error.message
      });
    }
  }

  /**
   * Search products
   * GET /api/v1/search/product?query=...
   */
  async searchProducts(req, res) {
    try {
      const { query, page, limit } = req.query;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }
      
      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20
      };
      
      const results = await searchService.search(query, options);
      
      res.status(200).json({
        success: true,
        ...results
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({
        success: false,
        error: 'Search failed',
        message: error.message
      });
    }
  }

  /**
   * Get product by ID
   * GET /api/v1/product/:id
   */
  async getProduct(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product',
        message: error.message
      });
    }
  }

  /**
   * Update product
   * PUT /api/v1/product/:id
   */
  async updateProduct(req, res) {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update product',
        message: error.message
      });
    }
  }

  /**
   * Delete product
   * DELETE /api/v1/product/:id
   */
  async deleteProduct(req, res) {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Product deactivated successfully'
      });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete product',
        message: error.message
      });
    }
  }

  /**
   * Get all products with filters
   * GET /api/v1/products
   */
  async getAllProducts(req, res) {
    try {
      const { page = 1, limit = 20, category, brand, minPrice, maxPrice } = req.query;
      
      const query = { isActive: true };
      
      if (category) query['metadata.category'] = category;
      if (brand) query['metadata.brand'] = new RegExp(brand, 'i');
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
      }
      
      const products = await Product.find(query)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });
      
      const total = await Product.countDocuments(query);
      
      res.status(200).json({
        success: true,
        data: products,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get all products error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch products',
        message: error.message
      });
    }
  }
}

module.exports = new ProductController();
