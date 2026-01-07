// routes/productRoutes.js (ADD THESE ENDPOINTS)
const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { protect } = require('../middleware/auth'); // Your existing auth middleware
const Product = require('../models/Product'); // Your Product model

// @route   POST /api/products/upload-image
// @desc    Upload single product image to Cloudinary
// @access  Private
router.post('/upload-image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Cloudinary automatically uploads the file and returns the URL
    res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl: req.file.path, // Cloudinary URL (https://res.cloudinary.com/...)
      publicId: req.file.filename, // For deletion if needed
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      message: 'Failed to upload image',
      error: error.message,
    });
  }
});

// @route   POST /api/products
// @desc    Create a new product listing
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      originalPrice,
      category,
      condition,
      location,
      images,
      image,
    } = req.body;

    // Validation
    if (!title || !description || !price || !category || !condition || !location) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    if (!images || images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    if (images.length > 6) {
      return res.status(400).json({ message: 'Maximum 6 images allowed' });
    }

    // Create product
    const product = await Product.create({
      seller: req.user._id, // From auth middleware
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      category,
      condition,
      location: location.trim(),
      images,
      image: image || images[0], // Primary image
      status: 'active',
    });

    // Populate seller details
    await product.populate('seller', 'name email avatar university');

    res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({
      message: 'Failed to create product',
      error: error.message,
    });
  }
});

// @route   DELETE /api/products/:id/image/:publicId
// @desc    Delete image from Cloudinary (optional cleanup endpoint)
// @access  Private
router.delete('/:id/image/:publicId', protect, async (req, res) => {
  try {
    const { cloudinary } = require('../config/cloudinary');
    const product = await Product.findById(req.params.id);

    // Check if product exists and user is the owner
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this image' });
    }

    // Delete from Cloudinary
    const publicId = `esilv-marketplace/products/${req.params.publicId}`;
    await cloudinary.uploader.destroy(publicId);

    // Remove image URL from product
    product.images = product.images.filter((img) => !img.includes(req.params.publicId));

    // Update primary image if needed
    if (product.image.includes(req.params.publicId)) {
      product.image = product.images[0] || '';
    }

    await product.save();

    res.status(200).json({
      message: 'Image deleted successfully',
      product,
    });
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({
      message: 'Failed to delete image',
      error: error.message,
    });
  }
});

module.exports = router;
