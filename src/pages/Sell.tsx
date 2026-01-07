import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCategories } from '@/hooks/useCategories';
import { useCreateProduct } from '@/hooks/useProducts';
import { useIsAuthenticated } from '@/hooks/useAuth';
import { Camera, Upload, X, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

const conditions = [
  { value: 'new', label: 'New', description: 'Brand new, never used' },
  { value: 'like-new', label: 'Like New', description: 'Used once or twice, no visible wear' },
  { value: 'good', label: 'Good', description: 'Normal use, minor wear' },
  { value: 'fair', label: 'Fair', description: 'Significant wear, fully functional' },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 6;
const MAX_IMAGE_DIMENSION = 1920; // Max width/height for compressed images
const COMPRESSION_QUALITY = 0.85; // 85% quality for JPEG compression

// Default categories fallback if API fails
const DEFAULT_CATEGORIES = [
  { _id: '1', name: 'Books', slug: 'books' },
  { _id: '2', name: 'Electronics', slug: 'electronics' },
  { _id: '3', name: 'Furniture', slug: 'furniture' },
  { _id: '4', name: 'Clothing', slug: 'clothing' },
  { _id: '5', name: 'Sports', slug: 'sports' },
  { _id: '6', name: 'Music', slug: 'music' },
  { _id: '7', name: 'Others', slug: 'others' },
];

const Sell = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useIsAuthenticated();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const createProduct = useCreateProduct();

  // Use fetched categories or fallback to default, and ensure "Others" is included
  const categories = useMemo(() => {
    const fetchedCategories = categoriesData || DEFAULT_CATEGORIES;
    const hasOthers = fetchedCategories.some(
      (cat) => cat.name.toLowerCase() === 'others' || cat.slug.toLowerCase() === 'others'
    );

    if (!hasOthers) {
      return [...fetchedCategories, { _id: 'others', name: 'Others', slug: 'others' }];
    }

    return fetchedCategories;
  }, [categoriesData]);

  // Separate state for actual files and preview URLs
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [location, setLocation] = useState('');

  // Check authentication and redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Compress image using Canvas API
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > MAX_IMAGE_DIMENSION) {
              height = (height * MAX_IMAGE_DIMENSION) / width;
              width = MAX_IMAGE_DIMENSION;
            }
          } else {
            if (height > MAX_IMAGE_DIMENSION) {
              width = (width * MAX_IMAGE_DIMENSION) / height;
              height = MAX_IMAGE_DIMENSION;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Draw image on canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Convert canvas to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              // Create new file from blob
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });

              // Log compression results
              const originalSize = (file.size / 1024).toFixed(2);
              const compressedSize = (compressedFile.size / 1024).toFixed(2);
              const reduction = (((file.size - compressedFile.size) / file.size) * 100).toFixed(1);

              console.log(
                `Compressed ${file.name}: ${originalSize}KB → ${compressedSize}KB (${reduction}% reduction)`
              );

              resolve(compressedFile);
            },
            'image/jpeg',
            COMPRESSION_QUALITY
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentImageCount = imageFiles.length;
    const remainingSlots = MAX_IMAGES - currentImageCount;

    if (remainingSlots <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    let processedCount = 0;
    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    // Show processing toast
    const processingToast = toast.loading('Processing images...', {
      description: `Compressing ${filesToProcess.length} image${
        filesToProcess.length > 1 ? 's' : ''
      }`,
    });

    for (const file of filesToProcess) {
      try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} exceeds 5MB limit`);
          continue;
        }

        // Compress image
        const compressedFile = await compressImage(file);
        newFiles.push(compressedFile);

        // Generate preview from compressed image
        const reader = new FileReader();
        await new Promise<void>((resolve) => {
          reader.onload = (e) => {
            if (e.target?.result) {
              newPreviews.push(e.target.result as string);
            }
            resolve();
          };
          reader.readAsDataURL(compressedFile);
        });

        processedCount++;
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
        toast.error(`Failed to process ${file.name}`);
      }
    }

    // Dismiss processing toast
    toast.dismiss(processingToast);

    if (processedCount > 0) {
      setImageFiles((prev) => [...prev, ...newFiles]);
      setImagePreviews((prev) => [...prev, ...newPreviews]);
      toast.success(`${processedCount} image${processedCount > 1 ? 's' : ''} added successfully`);
    }

    // Reset input
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImagesToCloudinary = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    const token = localStorage.getItem('auth_token');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await fetch(`${api.baseUrl}/products/upload-image`, {
          method: 'POST',
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Upload failed: ${response.statusText}`);
        }

        const data = (await response.json()) as { imageUrl: string };
        if (data.imageUrl) {
          uploadedUrls.push(data.imageUrl);
        }
      } catch (error) {
        console.error(`Failed to upload image ${i + 1}:`, error);
        throw new Error(
          `Failed to upload image ${i + 1}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (imageFiles.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    if (originalPrice && parseFloat(originalPrice) < parseFloat(price)) {
      toast.error('Original price must be greater than selling price');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Upload images to Cloudinary
      setUploadingImages(true);
      toast.info('Uploading images...', {
        description: `Uploading ${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''}`,
      });

      const imageUrls = await uploadImagesToCloudinary(imageFiles);
      setUploadingImages(false);

      toast.success('Images uploaded successfully!');

      // Step 2: Create product with uploaded image URLs
      const productData = {
        title,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        category,
        condition: condition as 'new' | 'like-new' | 'good' | 'fair',
        location,
        images: imageUrls,
        image: imageUrls[0], // Primary/cover image
      };

      await createProduct.mutateAsync(productData);

      toast.success('Listing created successfully!', {
        description: 'Your item is now visible to other students.',
      });

      // Navigate to products page or user's listings
      setTimeout(() => navigate('/profile'), 1000);
    } catch (error) {
      setUploadingImages(false);
      toast.error('Failed to create listing', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    imageFiles.length > 0 && title && description && category && condition && price && location;

  return (
    <Layout>
      <div className="container py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Sell an Item</h1>
          <p className="text-muted-foreground">
            Create a listing and reach thousands of students on campus.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Photos *</Label>
              <span className="text-sm text-muted-foreground">
                {imageFiles.length} of {MAX_IMAGES} photos
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Add up to 6 photos (max 5MB each). The first photo will be your cover image.
            </p>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {imagePreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden bg-secondary"
                >
                  <img src={preview} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                      Cover
                    </span>
                  )}
                </div>
              ))}

              {imageFiles.length < MAX_IMAGES && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer flex flex-col items-center justify-center">
                  <Camera className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-semibold">
              Title *
            </Label>
            <Input
              id="title"
              placeholder="e.g., Calculus Textbook 8th Edition"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground text-right">{title.length}/100</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-semibold">
              Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your item, including condition details, what's included, and any defects..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">{description.length}/1000</p>
          </div>

          {/* Category & Condition */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.slug} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Location *</Label>
              <Input
                placeholder="e.g., Campus Library, Engineering Building"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Condition */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Condition *</Label>
            <RadioGroup
              value={condition}
              onValueChange={setCondition}
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              {conditions.map((cond) => (
                <label
                  key={cond.value}
                  className={`flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    condition === cond.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value={cond.value} className="sr-only" />
                  <span className="font-medium mb-1">{cond.label}</span>
                  <span className="text-xs text-muted-foreground">{cond.description}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Price */}
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-base font-semibold">
                  Selling Price *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="originalPrice" className="text-base font-semibold">
                  Original Price (Optional)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="originalPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Show buyers how much they're saving</p>
              </div>
            </div>

            <div className="flex gap-3 p-4 bg-muted/50 rounded-lg">
              <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-muted-foreground text-sm">
                Set a competitive price. Check similar listings to see what others are charging.
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="submit"
              size="lg"
              className="flex-1 gap-2"
              disabled={!isFormValid || isSubmitting || uploadingImages}
            >
              {uploadingImages ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading images...
                </>
              ) : isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating listing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Publish Listing
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="sm:w-auto"
              onClick={() => navigate('/profile')}
              disabled={isSubmitting || uploadingImages}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Sell;
