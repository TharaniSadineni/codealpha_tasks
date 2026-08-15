const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Electronics', 'Fashion', 'Books', 'Accessories'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive']
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required']
    },
    fullDescription: {
      type: String,
      required: [true, 'Full description is required']
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      default: 10,
      min: [0, 'Stock cannot be negative']
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5
    },
    reviewsCount: {
      type: Number,
      default: 12
    },
    image: {
      type: String,
      required: [true, 'Image path is required']
    },
    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
