// models/Product.js (UPDATE YOUR PRODUCT MODEL)
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative'],
      validate: {
        validator: function (value) {
          return !value || value > this.price;
        },
        message: 'Original price must be greater than selling price',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Books', 'Electronics', 'Furniture', 'Clothing', 'Music', 'Sports'],
        message: '{VALUE} is not a valid category',
      },
      index: true,
    },
    condition: {
      type: String,
      required: [true, 'Condition is required'],
      enum: {
        values: ['new', 'like-new', 'good', 'fair'],
        message: '{VALUE} is not a valid condition',
      },
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    // UPDATED: Multiple images support
    images: {
      type: [String],
      required: [true, 'At least one image is required'],
      validate: {
        validator: function (v) {
          return v && v.length > 0 && v.length <= 6;
        },
        message: 'Product must have between 1 and 6 images',
      },
    },
    // UPDATED: Primary/cover image
    image: {
      type: String,
      required: [true, 'Primary image is required'],
    },
    status: {
      type: String,
      enum: ['active', 'sold', 'pending', 'inactive'],
      default: 'active',
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ price: 1 });

// Virtual for calculating discount percentage
productSchema.virtual('discountPercentage').get(function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Pre-remove hook to delete images from Cloudinary when product is deleted
productSchema.pre('remove', async function (next) {
  try {
    const { cloudinary } = require('../config/cloudinary');

    // Extract public IDs from image URLs and delete from Cloudinary
    for (const imageUrl of this.images) {
      if (imageUrl.includes('cloudinary.com')) {
        // Extract public ID from URL
        const parts = imageUrl.split('/');
        const filename = parts[parts.length - 1].split('.')[0];
        const publicId = `esilv-marketplace/products/${filename}`;

        await cloudinary.uploader.destroy(publicId);
      }
    }
    next();
  } catch (error) {
    console.error('Error deleting images from Cloudinary:', error);
    next(); // Continue even if image deletion fails
  }
});

module.exports = mongoose.model('Product', productSchema);
