import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCategories } from "@/hooks/useCategories";
import { useCreateProduct } from "@/hooks/useProducts";
import { useIsAuthenticated } from "@/hooks/useAuth";
import { Camera, Upload, X, Info, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const conditions = [
  { value: "new", label: "New", description: "Brand new, never used" },
  { value: "like-new", label: "Like New", description: "Used once or twice, no visible wear" },
  { value: "good", label: "Good", description: "Normal use, minor wear" },
  { value: "fair", label: "Fair", description: "Significant wear, fully functional" },
];

const Sell = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useIsAuthenticated();
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();

  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [location, setLocation] = useState("");

  // Check authentication and redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImages((prev) => [...prev.slice(0, 5), e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    try {
      const productData = {
        title,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        category,
        condition: condition as "new" | "like-new" | "good" | "fair",
        location,
        images: images, // In production, upload to storage service first
        image: images[0], // Primary image
      };

      await createProduct.mutateAsync(productData);
      
      toast.success("Listing created successfully!", {
        description: "Your item is now visible to other students.",
      });
      
      // Navigate to products page or user's listings
      setTimeout(() => navigate("/profile"), 1000);
    } catch (error: any) {
      toast.error("Failed to create listing", {
        description: error.message || "Please try again.",
      });
    }
  };

  const isFormValid = images.length > 0 && title && description && category && condition && price && location;

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
            <Label className="text-base font-semibold">Photos *</Label>
            <p className="text-sm text-muted-foreground">
              Add up to 6 photos. The first photo will be your cover image.
            </p>
            
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-secondary">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
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
              
              {images.length < 6 && (
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
            <Label htmlFor="title" className="text-base font-semibold">Title *</Label>
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
            <Label htmlFor="description" className="text-base font-semibold">Description *</Label>
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
            <RadioGroup value={condition} onValueChange={setCondition} className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {conditions.map((cond) => (
                <label
                  key={cond.value}
                  className={`flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    condition === cond.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
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
                <Label htmlFor="price" className="text-base font-semibold">Selling Price *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
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
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
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
                <p className="text-xs text-muted-foreground">
                  Show buyers how much they're saving
                </p>
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
              disabled={!isFormValid || createProduct.isPending}
            >
              {createProduct.isPending ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Publishing...
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
              onClick={() => navigate("/profile")}
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
