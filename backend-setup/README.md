# 🎯 COMPLETE SETUP GUIDE - Backend Image Upload

## ✅ Your Cloudinary Account
```
Cloud Name: dh4ra1ft7
API Key: 161996979621751
API Secret: 9GEmwfK1-XyFTpnAM2ssg9ghcjo
URL: https://console.cloudinary.com/console/c-47e82c5e7a2/media_library/folders/home
```

---

## 🚀 QUICK START (5 Minutes)

### Option A: Automatic Setup (Recommended)
```bash
cd /Users/Apple/Downloads/Data/student-marketplace-front-end
./backend-setup/setup.sh
```
Then follow the on-screen instructions.

### Option B: Manual Setup
Follow steps 1-5 below.

---

## 📋 MANUAL SETUP STEPS

### Step 1: Install Packages
```bash
cd /Users/Apple/Downloads/Data/student-marketplace-backend
npm install cloudinary multer multer-storage-cloudinary
```

### Step 2: Create Cloudinary Config

**Create file:** `config/cloudinary.js`

**Copy from:** `../student-marketplace-front-end/backend-setup/config-cloudinary.js`

Or create manually with this content:
```javascript
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dh4ra1ft7',
  api_key: process.env.CLOUDINARY_API_KEY || '161996979621751',
  api_secret: process.env.CLOUDINARY_API_SECRET || '9GEmwfK1-XyFTpnAM2ssg9ghcjo',
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'esilv-marketplace/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto:good' },
    ],
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

module.exports = { cloudinary, upload };
```

### Step 3: Update Product Routes

**File:** `routes/productRoutes.js`

**Add this endpoint:**
```javascript
const { upload } = require('../config/cloudinary');

// ADD THIS: Image upload endpoint
router.post('/upload-image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl: req.file.path,
      publicId: req.file.filename,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ 
      message: 'Failed to upload image',
      error: error.message 
    });
  }
});
```

**Update the product creation endpoint:**
```javascript
// UPDATE THIS: Handle images array
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, price, originalPrice, category, condition, location, images, image } = req.body;

    // Validation
    if (!images || images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const product = await Product.create({
      seller: req.user._id,
      title,
      description,
      price,
      originalPrice,
      category,
      condition,
      location,
      images,        // Array of Cloudinary URLs
      image: image || images[0],  // Primary image
    });

    await product.populate('seller', 'name email avatar university');

    res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
});
```

### Step 4: Update Product Model

**File:** `models/Product.js`

**Add/Update these fields:**
```javascript
const productSchema = new mongoose.Schema({
  // ... other fields ...
  
  images: {
    type: [String],
    required: [true, 'At least one image is required'],
    validate: {
      validator: function(v) {
        return v && v.length > 0 && v.length <= 6;
      },
      message: 'Product must have between 1 and 6 images',
    },
  },
  image: {
    type: String,
    required: [true, 'Primary image is required'],
  },
  
  // ... other fields ...
});
```

### Step 5: Add Environment Variables

**File:** `.env`

**Add these lines:**
```env
CLOUDINARY_CLOUD_NAME=dh4ra1ft7
CLOUDINARY_API_KEY=161996979621751
CLOUDINARY_API_SECRET=9GEmwfK1-XyFTpnAM2ssg9ghcjo
```

---

## 🧪 TESTING

### Test 1: Local Backend Test
```bash
cd /Users/Apple/Downloads/Data/student-marketplace-backend
npm run dev
```

### Test 2: Image Upload Endpoint
```bash
# Get a JWT token first by logging in
# Then test upload:

curl -X POST http://localhost:3000/api/products/upload-image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -F "image=@/path/to/test-image.jpg"
```

Expected response:
```json
{
  "message": "Image uploaded successfully",
  "imageUrl": "https://res.cloudinary.com/dh4ra1ft7/image/upload/v.../esilv-marketplace/products/abc123.jpg",
  "publicId": "esilv-marketplace/products/abc123"
}
```

### Test 3: Frontend Integration
1. Start backend: `cd backend && npm run dev`
2. Frontend is already running at http://localhost:8082
3. Go to: http://localhost:8082/sell
4. Login if needed
5. Add images (click + button)
6. Fill form and submit
7. Check:
   - Browser console for any errors
   - Backend console for upload logs
   - Cloudinary dashboard for uploaded images

### Test 4: Verify on Cloudinary
1. Go to: https://console.cloudinary.com/console/c-47e82c5e7a2/media_library
2. Navigate to folder: `esilv-marketplace/products`
3. Your uploaded images should appear there

---

## 🚢 DEPLOYMENT TO VERCEL

### Step 1: Add Environment Variables
```bash
# Go to Vercel Dashboard
# Settings → Environment Variables

Add these three variables:
Name: CLOUDINARY_CLOUD_NAME
Value: dh4ra1ft7

Name: CLOUDINARY_API_KEY
Value: 161996979621751

Name: CLOUDINARY_API_SECRET
Value: 9GEmwfK1-XyFTpnAM2ssg9ghcjo
```

### Step 2: Deploy
```bash
cd /Users/Apple/Downloads/Data/student-marketplace-backend
git add .
git commit -m "feat: Add Cloudinary image upload for products"
git push origin main
```

Vercel will automatically redeploy.

### Step 3: Test Production
1. Go to: https://esilv-store.vercel.app/sell
2. Login
3. Create a listing with images
4. Verify it works!

---

## 📁 FILE LOCATIONS

All backend setup files are in:
```
student-marketplace-front-end/backend-setup/
├── config-cloudinary.js       ← Copy to backend/config/cloudinary.js
├── productRoutes.js            ← Reference for updating routes
├── Product-model.js            ← Reference for updating model
├── SETUP_INSTRUCTIONS.md       ← Detailed instructions
└── setup.sh                    ← Automatic setup script
```

---

## ✅ CHECKLIST

Complete this checklist as you go:

Backend Setup:
- [ ] Installed packages (cloudinary, multer, multer-storage-cloudinary)
- [ ] Created config/cloudinary.js
- [ ] Updated routes/productRoutes.js (added upload-image endpoint)
- [ ] Updated models/Product.js (added images field)
- [ ] Added .env variables

Testing:
- [ ] Backend starts without errors
- [ ] Image upload endpoint works (curl test)
- [ ] Frontend can upload images
- [ ] Images appear on Cloudinary dashboard
- [ ] Product creation works with images

Deployment:
- [ ] Added environment variables to Vercel
- [ ] Pushed to GitHub
- [ ] Verified Vercel deployment succeeded
- [ ] Tested on production (esilv-store.vercel.app/sell)

---

## 🆘 TROUBLESHOOTING

### Error: "Module not found: 'cloudinary'"
```bash
npm install cloudinary multer multer-storage-cloudinary
# Restart backend server
```

### Error: "No image file provided"
- Check route: `upload.single('image')`
- Frontend sends field: 'image'
- Check Content-Type: multipart/form-data

### Error: "Invalid signature"
- Check CLOUDINARY_API_SECRET in .env
- Restart backend server
- Verify credentials match Cloudinary dashboard

### Images not uploading
- Check file size (< 5MB)
- Check file type (must be image/*)
- Check JWT token is valid
- Check backend logs for errors

### CORS errors
- Verify CORS allows your frontend domain
- Check Authorization header is included

---

## 📚 REFERENCE LINKS

- Cloudinary Dashboard: https://console.cloudinary.com/console/c-47e82c5e7a2
- Frontend Sell Page: http://localhost:8082/sell (local) or https://esilv-store.vercel.app/sell (prod)
- Backend API: http://localhost:3000/api (local) or https://student-marketplace-backend.vercel.app/api (prod)

---

## 🎉 YOU'RE DONE!

Once you complete the checklist above:
✅ Users can upload up to 6 images per listing
✅ Images are stored on Cloudinary (free 25GB)
✅ Products display beautiful image galleries
✅ Everything works on production

**Need help?** Check the troubleshooting section or review the setup files in `backend-setup/`
