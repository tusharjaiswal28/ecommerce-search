const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: 'text'
  },
  description: {
    type: String,
    required: true,
    index: 'text'
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  mrp: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'Rupee'
  },
  // Sales metrics
  unitsSold: {
    type: Number,
    default: 0
  },
  salesVelocity: {
    type: Number,
    default: 0 // units sold per day
  },
  returnRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100 // percentage
  },
  complaintCount: {
    type: Number,
    default: 0
  },
  
  // Product metadata
  metadata: {
    category: String,
    brand: String,
    model: String,
    color: String,
    ram: String,
    storage: String,
    screenSize: String,
    brightness: String,
    processor: String,
    battery: String,
    camera: String,
    displayType: String,
    soundOutput: String,
    // Can add more fields as needed
  },
  
  // Search optimization
  searchKeywords: [{
    type: String
  }],
  
  // Computed fields
  discountPercentage: {
    type: Number,
    default: 0
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better search performance
productSchema.index({ title: 'text', description: 'text', 'metadata.brand': 'text', 'metadata.model': 'text' });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ unitsSold: -1 });
productSchema.index({ stock: -1 });

// Calculate discount percentage before saving
productSchema.pre('save', function(next) {
  if (this.mrp && this.price) {
    this.discountPercentage = ((this.mrp - this.price) / this.mrp) * 100;
  }
  next();
});

// Virtual for availability status
productSchema.virtual('availabilityStatus').get(function() {
  if (this.stock === 0) return 'OUT_OF_STOCK';
  if (this.stock < 10) return 'LOW_STOCK';
  return 'IN_STOCK';
});

module.exports = mongoose.model('Product', productSchema);
