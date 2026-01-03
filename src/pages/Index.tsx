import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Laptop,
  Sofa,
  Shirt,
  Music,
  Dumbbell,
  Shield,
  Users,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/ProductCard';
import { CategoryCard } from '@/components/CategoryCard';
import { products, categories } from '@/data/products';

const categoryIcons = {
  books: BookOpen,
  electronics: Laptop,
  furniture: Sofa,
  clothing: Shirt,
  music: Music,
  sports: Dumbbell,
};

const features = [
  {
    icon: Shield,
    title: 'Secure Transactions',
    description: 'All transactions are protected with end-to-end encryption.',
  },
  {
    icon: Users,
    title: 'Verified Students',
    description: 'Only verified university students can join our marketplace.',
  },
  {
    icon: Zap,
    title: 'Instant Messaging',
    description: 'Connect directly with buyers and sellers in real-time.',
  },
];

const Index = () => {
  const featuredProducts = products.slice(0, 4);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent)/0.1),transparent_50%)]" />

        <div className="container relative py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Join ESILV students already trading
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight mb-6">
              Buy, Sell & Exchange
              <span className="block text-gradient lg:pb-2 lg:pt-4">Within ESILV Community</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The official ESILV student marketplace. Find textbooks, electronics, furniture, and
              more at student-friendly prices within our engineering community.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button size="lg" className="text-base px-8 gap-2">
                  Start Shopping
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/sell">
                <Button size="lg" variant="outline" className="text-base px-8">
                  List an Item
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Browse Categories</h2>
              <p className="text-muted-foreground">Find what you need, fast.</p>
            </div>
            <Link to="/products">
              <Button variant="ghost" className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => {
              const Icon = categoryIcons[category.slug as keyof typeof categoryIcons] || BookOpen;
              return (
                <CategoryCard
                  key={category.slug}
                  name={category.name}
                  icon={Icon}
                  href={`/category/${category.slug}`}
                  count={category.count}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Featured Listings</h2>
              <p className="text-muted-foreground">
                Discover the latest items from fellow students.
              </p>
            </div>
            <Link to="/products">
              <Button variant="ghost" className="gap-2">
                See All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
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
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-2">
              Why ESILV Marketplace?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built by ESILV students, for ESILV students. We understand what engineers need.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="text-center p-6 rounded-xl bg-card border border-border/50"
              >
                <div className="h-14 w-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="relative rounded-2xl overflow-hidden gradient-hero p-8 md:p-12 lg:p-16 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
            <div className="relative">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Start Selling?
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
                List your items in minutes and reach thousands of students on campus.
              </p>
              <Link to="/sell">
                <Button size="lg" variant="secondary" className="text-base px-8">
                  List Your First Item
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
