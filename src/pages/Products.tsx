import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/ProductCard";
import { useProducts, Product } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const conditions = ["new", "like-new", "good", "fair"] as const;

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "price-asc" | "price-desc">("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories for filter dropdown
  const { data: categories = [] } = useCategories();

  // Build filters object for API
  const filters = useMemo(() => ({
    search: searchQuery || undefined,
    category: selectedCategory || undefined,
    condition: selectedConditions.length > 0 ? selectedConditions.join(',') : undefined,
    sort: sortBy,
  }), [searchQuery, selectedCategory, selectedConditions, sortBy]);

  // Fetch products with filters
  const { data: products = [], isLoading, isError } = useProducts(filters);

  const toggleCondition = (condition: string) => {
    setSelectedConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedConditions([]);
    setSortBy("newest");
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedConditions.length > 0;

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Browse Products</h1>
          <p className="text-muted-foreground">
            {isLoading ? "Loading products..." : `Discover ${products.length} items from your campus community`}
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.slug} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={sortBy} 
              onValueChange={(value) => setSortBy(value as typeof sortBy)}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="gap-2 md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Filters</h3>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear all
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Condition</h4>
                <div className="space-y-2">
                  {conditions.map((condition) => (
                    <div key={condition} className="flex items-center gap-2">
                      <Checkbox
                        id={condition}
                        checked={selectedConditions.includes(condition)}
                        onCheckedChange={() => toggleCondition(condition)}
                      />
                      <label htmlFor={condition} className="text-sm capitalize cursor-pointer">
                        {condition.replace("-", " ")}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Categories</h4>
                <div className="space-y-2">
                  {Array.from(new Set(products.map((p) => p.category))).map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category.toLowerCase() ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(category.toLowerCase())}
                      >
                        {category}
                        <span className="ml-auto text-xs opacity-60">{products.filter((p) => p.category === category).length}</span>
                      </Button>
                    ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="fixed inset-0 z-50 bg-background p-4 md:hidden overflow-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Filters</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Condition</h4>
                  <div className="space-y-2">
                    {conditions.map((condition) => (
                      <div key={condition} className="flex items-center gap-2">
                        <Checkbox
                          id={`mobile-${condition}`}
                          checked={selectedConditions.includes(condition)}
                          onCheckedChange={() => toggleCondition(condition)}
                        />
                        <label htmlFor={`mobile-${condition}`} className="text-sm capitalize cursor-pointer">
                          {condition.replace("-", " ")}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Categories</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <Button
                        key={category.slug}
                        variant={selectedCategory === category.slug ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          setSelectedCategory(category.slug);
                        }}
                      >
                        {category.name}
                        <span className="ml-auto text-xs opacity-60">{category.count}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={clearFilters}>
                    Clear All
                  </Button>
                  <Button className="flex-1" onClick={() => setShowFilters(false)}>
                    Show {products.length} Results
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">Failed to load products. Please try again.</p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    image={product.image || product.images[0]}
                    category={product.category}
                    condition={product.condition}
                    location={product.location}
                    seller={product.seller.name}
                    isFavorite={product.isFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">No products found matching your criteria.</p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Products;
