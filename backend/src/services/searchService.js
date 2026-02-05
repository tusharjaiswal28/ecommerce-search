const natural = require('natural');
const Product = require('../models/Product');

class SearchService {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.metaphone = natural.Metaphone;
    this.levenshtein = natural.LevenshteinDistance;
    
    // Common Hinglish to English mappings
    this.hinglishMap = {
      'sasta': 'cheap',
      'sastha': 'cheap',
      'mehenga': 'expensive',
      'accha': 'good',
      'acha': 'good',
      'best': 'best',
      'latest': 'latest',
      'naya': 'new',
      'purana': 'old',
      'bada': 'big',
      'chota': 'small'
    };
    
    // Common misspellings
    this.commonMisspellings = {
      'ifone': 'iphone',
      'ifonn': 'iphone',
      'aifone': 'iphone',
      'sumsung': 'samsung',
      'samsang': 'samsung',
      'smasung': 'samsung',
      'leptop': 'laptop',
      'hedphone': 'headphone'
    };
  }

  /**
   * Main search function
   */
  async search(query, options = {}) {
    const startTime = Date.now();
    
    try {
      // Step 1: Parse and clean query
      const parsedQuery = this.parseQuery(query);
      
      // Step 2: Build MongoDB query
      const dbQuery = this.buildDatabaseQuery(parsedQuery);
      
      // Step 3: Fetch products
      let products = await Product.find(dbQuery).lean();
      
      // If no results with strict matching, try fuzzy search
      if (products.length === 0) {
        products = await this.fuzzySearch(parsedQuery.cleanedText);
      }
      
      // Step 4: Score and rank products
      const rankedProducts = this.rankProducts(products, parsedQuery);
      
      // Step 5: Apply pagination
      const page = options.page || 1;
      const limit = options.limit || 20;
      const startIndex = (page - 1) * limit;
      const paginatedResults = rankedProducts.slice(startIndex, startIndex + limit);
      
      const endTime = Date.now();
      
      return {
        data: paginatedResults,
        metadata: {
          totalResults: rankedProducts.length,
          page,
          limit,
          processingTime: `${endTime - startTime}ms`,
          query: parsedQuery
        }
      };
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  /**
   * Parse query to extract intent, corrections, and filters
   */
  parseQuery(query) {
    let text = query.toLowerCase().trim();
    
    // Extract price intent
    const priceMatch = text.match(/(\d+)k?\s*(rupees?|rs\.?|inr)?/i);
    const priceIntent = priceMatch ? {
      value: parseInt(priceMatch[1]) * (priceMatch[1].includes('k') ? 1000 : 1),
      type: 'exact'
    } : null;
    
    // Detect cheap/expensive intent (Hinglish support)
    const cheapIntent = /sasta|sastha|cheap|budget|affordable/i.test(text);
    const expensiveIntent = /mehenga|expensive|premium|luxury/i.test(text);
    
    // Extract color
    const colors = ['red', 'blue', 'black', 'white', 'green', 'yellow', 'pink', 'purple', 'gold', 'silver', 'grey', 'gray'];
    const colorMatch = colors.find(color => text.includes(color));
    
    // Extract storage size
    const storageMatch = text.match(/(\d+)\s*(gb|tb)/i);
    const storage = storageMatch ? `${storageMatch[1]}${storageMatch[2].toUpperCase()}` : null;
    
    // Translate Hinglish
    Object.keys(this.hinglishMap).forEach(hindi => {
      const regex = new RegExp(hindi, 'gi');
      text = text.replace(regex, this.hinglishMap[hindi]);
    });
    
    // Fix common misspellings
    Object.keys(this.commonMisspellings).forEach(wrong => {
      const regex = new RegExp(wrong, 'gi');
      text = text.replace(regex, this.commonMisspellings[wrong]);
    });
    
    // Remove price and other extracted info from search text
    text = text.replace(/(\d+)k?\s*(rupees?|rs\.?|inr)?/gi, '');
    text = text.replace(/(cheap|budget|affordable|expensive|premium|luxury)/gi, '');
    text = text.replace(/\b(sasta|sastha|mehenga)\b/gi, '');
    
    return {
      originalQuery: query,
      cleanedText: text.trim(),
      priceIntent,
      cheapIntent,
      expensiveIntent,
      color: colorMatch,
      storage,
      tokens: this.tokenizer.tokenize(text)
    };
  }

  /**
   * Build MongoDB query from parsed query
   */
  buildDatabaseQuery(parsedQuery) {
    const query = { isActive: true };
    
    // Text search
    if (parsedQuery.cleanedText) {
      query.$text = { $search: parsedQuery.cleanedText };
    }
    
    // Price filters
    if (parsedQuery.priceIntent) {
      const price = parsedQuery.priceIntent.value;
      query.price = { 
        $gte: price * 0.8, 
        $lte: price * 1.2 
      };
    }
    
    // Color filter
    if (parsedQuery.color) {
      query['metadata.color'] = new RegExp(parsedQuery.color, 'i');
    }
    
    // Storage filter
    if (parsedQuery.storage) {
      query['metadata.storage'] = new RegExp(parsedQuery.storage, 'i');
    }
    
    return query;
  }

  /**
   * Fuzzy search when exact match fails
   */
  async fuzzySearch(text) {
    const allProducts = await Product.find({ isActive: true }).limit(1000).lean();
    
    return allProducts.filter(product => {
      const searchText = `${product.title} ${product.description} ${product.metadata?.brand || ''} ${product.metadata?.model || ''}`.toLowerCase();
      const queryTokens = this.tokenizer.tokenize(text.toLowerCase());
      
      return queryTokens.some(token => {
        return searchText.split(' ').some(word => {
          const distance = this.levenshtein(token, word);
          return distance <= 2; // Allow 2 character difference
        });
      });
    });
  }

  /**
   * Rank products based on multiple factors
   */
  rankProducts(products, parsedQuery) {
    return products.map(product => {
      let score = 0;
      const weights = {
        relevance: 30,
        rating: 20,
        sales: 15,
        stock: 10,
        price: 15,
        discount: 10
      };
      
      // 1. Relevance Score (30%)
      const relevanceScore = this.calculateRelevanceScore(product, parsedQuery);
      score += relevanceScore * weights.relevance;
      
      // 2. Rating Score (20%)
      const ratingScore = product.rating / 5;
      const reviewBonus = Math.min(product.reviewCount / 1000, 1) * 0.2;
      score += (ratingScore + reviewBonus) * weights.rating;
      
      // 3. Sales Score (15%)
      const salesScore = Math.min(product.unitsSold / 10000, 1);
      score += salesScore * weights.sales;
      
      // 4. Stock Availability Score (10%)
      let stockScore = 0;
      if (product.stock > 100) stockScore = 1;
      else if (product.stock > 10) stockScore = 0.7;
      else if (product.stock > 0) stockScore = 0.3;
      score += stockScore * weights.stock;
      
      // 5. Price Score (15%)
      let priceScore = 0;
      if (parsedQuery.cheapIntent) {
        // Lower price = higher score for cheap intent
        const maxPrice = 150000;
        priceScore = 1 - (product.price / maxPrice);
      } else if (parsedQuery.expensiveIntent) {
        // Higher price = higher score for premium intent
        const maxPrice = 150000;
        priceScore = product.price / maxPrice;
      } else if (parsedQuery.priceIntent) {
        // Close to target price = higher score
        const diff = Math.abs(product.price - parsedQuery.priceIntent.value);
        priceScore = 1 - Math.min(diff / parsedQuery.priceIntent.value, 1);
      } else {
        // Mid-range products get preference
        priceScore = 0.5;
      }
      score += priceScore * weights.price;
      
      // 6. Discount Score (10%)
      const discountScore = product.discountPercentage / 100;
      score += discountScore * weights.discount;
      
      // Penalties
      if (product.returnRate > 10) score *= 0.9;
      if (product.complaintCount > 50) score *= 0.85;
      if (product.stock === 0) score *= 0.5; // Out of stock penalty
      
      return {
        ...product,
        _score: parseFloat(score.toFixed(2))
      };
    })
    .sort((a, b) => b._score - a._score);
  }

  /**
   * Calculate relevance score for a product
   */
  calculateRelevanceScore(product, parsedQuery) {
    let score = 0;
    const searchText = `${product.title} ${product.description} ${product.metadata?.brand || ''} ${product.metadata?.model || ''}`.toLowerCase();
    const queryTokens = parsedQuery.tokens || this.tokenizer.tokenize(parsedQuery.cleanedText);
    
    queryTokens.forEach(token => {
      token = token.toLowerCase();
      
      // Exact match in title (highest relevance)
      if (product.title.toLowerCase().includes(token)) {
        score += 1.0;
      }
      
      // Exact match in brand/model
      if (product.metadata?.brand?.toLowerCase().includes(token) || 
          product.metadata?.model?.toLowerCase().includes(token)) {
        score += 0.8;
      }
      
      // Match in description
      if (product.description.toLowerCase().includes(token)) {
        score += 0.5;
      }
      
      // Fuzzy match
      const words = searchText.split(' ');
      words.forEach(word => {
        const distance = this.levenshtein(token, word);
        if (distance <= 1) score += 0.3;
        else if (distance === 2) score += 0.1;
      });
    });
    
    // Normalize score
    return Math.min(score / Math.max(queryTokens.length, 1), 1);
  }
}

module.exports = new SearchService();
