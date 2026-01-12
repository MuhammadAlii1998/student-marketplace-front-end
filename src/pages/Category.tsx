import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/ProductCard';
import { getProductsByCategory, categories, products as allProducts } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  BookOpen,
  Laptop,
  Sofa,
  Shirt,
  Music,
  Dumbbell,
  LucideIcon,
  Bell,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const categoryIcons: Record<string, LucideIcon> = {
  books: BookOpen,
  electronics: Laptop,
  furniture: Sofa,
  clothing: Shirt,
  music: Music,
  sports: Dumbbell,
};

const categoryDescriptions: Record<string, string> = {
  books: 'Textbooks, novels, study guides, and academic materials from fellow students.',
  electronics: 'Laptops, phones, tablets, headphones, and other tech gadgets.',
  furniture: 'Desks, chairs, shelves, and dorm essentials for your space.',
  clothing: 'Clothes, shoes, and accessories in great condition.',
  music: 'Instruments, audio equipment, and music accessories.',
  sports: 'Sports equipment, gym gear, and outdoor accessories.',
};

const categoryTips: Record<string, string[]> = {
  books: [
    '📚 Check the edition number - newer editions may have updated content',
    '✏️ Look for minimal highlighting or notes in the margins',
    '💰 Compare prices with new textbooks to find the best deal',
    '📖 Verify that all pages are present and in good condition',
  ],
  electronics: [
    '🔋 Check battery health and request proof of working condition',
    '📱 Verify all accessories are included (chargers, cables, etc.)',
    '✅ Ask about warranty status and return policy',
    '📦 Request photos from different angles before buying',
  ],
  furniture: [
    '📏 Measure dimensions carefully - dormitory spaces are small',
    '🪑 Check for stains, scratches, or damage before purchasing',
    '🚚 Confirm delivery or pickup options with the seller',
    '🛠️ Verify that all parts and assembly instructions are included',
  ],
  clothing: [
    '👕 Always check the size chart - different brands vary',
    '🧵 Look for stains, tears, or loose seams',
    '🎨 Request multiple photos to verify color accuracy',
    '🔄 Confirm the return or exchange policy before buying',
  ],
  music: [
    '🎵 For instruments, request a video of it being played',
    '🔊 Test audio equipment before completing the transaction',
    '🎸 Verify condition of strings, keys, and all moving parts',
    '📋 Check for original documentation or certification',
  ],
  sports: [
    '⚽ Verify equipment is suitable for your skill level',
    '🏋️ Check for wear, damage, or safety concerns',
    '📐 Confirm sizing and fit requirements before purchasing',
    '✨ Look for proper storage and maintenance history',
  ],
};

const Category = () => {
  const { slug } = useParams();
  const categoryProducts = getProductsByCategory(slug || '');
  const category = categories.find((c) => c.slug === slug);
  const Icon = categoryIcons[slug || ''] || BookOpen;
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySubmitted, setNotifySubmitted] = useState(false);

  // Get recently added products from similar categories (excluding current category)
  const getRecentlyAddedProducts = () => {
    const similarCategoryProducts = allProducts.filter(
      (p) => p.category !== category?.name && p.category
    );
    return similarCategoryProducts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  };

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail) {
      toast.error('Please enter your email');
      return;
    }
    // In a real app, this would send to your backend
    toast.success(`We'll notify you when items are added to ${category?.name}!`);
    setNotifySubmitted(true);
    setNotifyEmail('');
    setTimeout(() => setNotifySubmitted(false), 3000);
  };

  if (!category) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The category you're looking for doesn't exist.
          </p>
          <Link to="/products">
            <Button>Browse All Products</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary">
            Products
          </Link>
          <span>/</span>
          <span className="text-foreground">{category.name}</span>
        </div>

        {/* Category Header */}
        <div className="flex items-start gap-6 mb-8">
          <div className="h-16 w-16 rounded-xl gradient-primary flex items-center justify-center shrink-0">
            <Icon className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{category.name}</h1>
            <p className="text-muted-foreground max-w-2xl">
              {categoryDescriptions[slug || ''] ||
                `Browse all ${category.name.toLowerCase()} available on campus.`}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {categoryProducts.length} item{categoryProducts.length !== 1 && 's'} available
            </p>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {categories.map((cat) => {
            const CatIcon = categoryIcons[cat.slug] || BookOpen;
            return (
              <Link key={cat.slug} to={`/category/${cat.slug}`}>
                <Button
                  variant={cat.slug === slug ? 'default' : 'outline'}
                  size="sm"
                  className="gap-2 shrink-0"
                >
                  <CatIcon className="h-4 w-4" />
                  {cat.name}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Products Grid */}
        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categoryProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                price={product.price}
                image={product.image}
                category={product.category}
                condition={product.condition}
                location={product.location}
                seller={product.seller?.name || 'Unknown Seller'}
                isFavorite={product.isFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {/* Empty State Header */}
            <div className="text-center py-16">
              <Icon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No items in {category.name}</h3>
              <p className="text-muted-foreground mb-6">
                Be the first to list an item in this category!
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/sell">
                  <Button>List an Item</Button>
                </Link>
                <Link to="/products">
                  <Button variant="outline">Browse All Products</Button>
                </Link>
              </div>
            </div>

            {/* Category Tips Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-xl p-8 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3 mb-6">
                <Lightbulb className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1 shrink-0" />
                <div>
                  <h4 className="text-xl font-semibold mb-2">Tips for Buying {category.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Follow these guidelines to make the best purchase decisions
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryTips[slug || '']?.map((tip, index) => (
                  <div key={index} className="flex gap-3">
                    <span className="text-lg shrink-0">✓</span>
                    <p className="text-sm text-foreground">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Notification Section */}
            <div className="bg-card rounded-xl border border-border p-8">
              <div className="flex items-start gap-3 mb-4">
                <Bell className="h-6 w-6 text-primary mt-1 shrink-0" />
                <div>
                  <h4 className="text-lg font-semibold mb-1">Get Notified</h4>
                  <p className="text-sm text-muted-foreground">
                    Be the first to know when someone lists a {category.name.toLowerCase()} item
                  </p>
                </div>
              </div>
              <form onSubmit={handleNotifyMe} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  className="flex-1"
                  disabled={notifySubmitted}
                />
                <Button type="submit" disabled={notifySubmitted}>
                  {notifySubmitted ? '✓ Subscribed' : 'Subscribe'}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-3">
                We'll send you an email whenever new {category.name.toLowerCase()} items are added.
              </p>
            </div>

            {/* Recently Added from Other Categories */}
            {getRecentlyAddedProducts().length > 0 && (
              <div>
                <div className="mb-6">
                  <h4 className="text-xl font-semibold mb-2">Check Out These Items</h4>
                  <p className="text-sm text-muted-foreground">
                    While you wait for {category.name.toLowerCase()} items, browse recently added
                    products from other categories
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {getRecentlyAddedProducts().map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      title={product.title}
                      price={product.price}
                      image={product.image}
                      category={product.category}
                      condition={product.condition}
                      location={product.location}
                      seller={product.seller?.name || 'Unknown Seller'}
                      isFavorite={product.isFavorite}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Category;
