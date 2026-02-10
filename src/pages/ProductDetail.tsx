import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { getProductById } from '@/data/products';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useAddToCart } from '@/hooks/useCart';
import { useToggleFavorite } from '@/hooks/useFavorites';
import { useIsAuthenticated } from '@/hooks/useAuth';
import { useProductReservation, isReservationActive } from '@/hooks/useReservations';
import { ProductCard } from '@/components/ProductCard';
import { ContactSellerButton } from '@/components/ContactSellerButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReservationModal } from '@/components/ReservationModal';
import { ReservationTimer } from '@/components/ReservationTimer';
import {
  Heart,
  Share2,
  MapPin,
  ShoppingCart,
  Star,
  ChevronLeft,
  Calendar,
  Shield,
  Clock,
} from 'lucide-react';
import { useState } from 'react';
import { cn, formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

const conditionColors = {
  new: 'bg-success text-success-foreground',
  'like-new': 'bg-accent text-accent-foreground',
  good: 'bg-primary text-primary-foreground',
  fair: 'bg-warning text-warning-foreground',
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading: productLoading } = useProduct(id);
  const { data: products = [] } = useProducts();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { isAuthenticated } = useIsAuthenticated();
  const addToCart = useAddToCart();
  const { toggleFavorite, isLoading: favoriteLoading } = useToggleFavorite();
  const [isFavorite, setIsFavorite] = useState(product?.isFavorite || false);
  const [showReservationModal, setShowReservationModal] = useState(false);

  // Get reservation status for this product
  const { data: reservation } = useProductReservation(id);
  const isReserved = !!reservation && isReservationActive(reservation);
  const isOwnReservation = isReserved && reservation && isAuthenticated;

  // If backend product is missing (e.g., API down), fall back to local seed data
  const fallbackProduct = !product && id ? getProductById(id) : undefined;
  const effectiveProduct = product || fallbackProduct;

  // Show loading state
  if (productLoading) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </Layout>
    );
  }
  if (!effectiveProduct) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const relatedProducts = (products || [])
    .filter((p) => p.category === effectiveProduct?.category && p.id !== effectiveProduct?.id)
    .slice(0, 4);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Login required', {
        description: 'Please login to add items to your cart.',
      });
      navigate('/login');
      return;
    }

    try {
      await addToCart.mutateAsync({ productId: effectiveProduct.id, quantity: 1 });
      toast.success('Added to cart!', {
        description: `${effectiveProduct.title} has been added to your cart.`,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Please try again.';
      toast.error('Failed to add to cart', {
        description: errorMessage,
      });
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Login required', {
        description: 'Please login to save favorites.',
      });
      navigate('/login');
      return;
    }

    try {
      await toggleFavorite(effectiveProduct.id, isFavorite);
      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Please try again.';
      toast.error('Failed to update favorites', {
        description: errorMessage,
      });
    }
  };

  const handleReserve = () => {
    if (!isAuthenticated) {
      toast.error('Login required', {
        description: 'Please login to reserve products.',
      });
      navigate('/login');
      return;
    }

    setShowReservationModal(true);
  };

  const savings = effectiveProduct.originalPrice
    ? Math.round(
        ((effectiveProduct.originalPrice - effectiveProduct.price) /
          effectiveProduct.originalPrice) *
          100
      )
    : 0;

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
          <Link
            to={`/category/${effectiveProduct.category.toLowerCase()}`}
            className="hover:text-primary"
          >
            {effectiveProduct.category}
          </Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-[200px]">{effectiveProduct.title}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
              <img
                src={effectiveProduct.images[selectedImageIndex] || effectiveProduct.image}
                alt={effectiveProduct.title}
                className="h-full w-full object-cover"
              />
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'absolute top-4 right-4 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm',
                  isFavorite && 'text-primary'
                )}
                onClick={handleFavoriteToggle}
                disabled={favoriteLoading}
              >
                <Heart className={cn('h-5 w-5', isFavorite && 'fill-current')} />
              </Button>
              <Badge
                className={cn('absolute top-4 left-4', conditionColors[effectiveProduct.condition])}
              >
                {effectiveProduct.condition.charAt(0).toUpperCase() +
                  effectiveProduct.condition.slice(1).replace('-', ' ')}
              </Badge>
            </div>

            {effectiveProduct.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {effectiveProduct.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={cn(
                      'shrink-0 h-20 w-20 rounded-lg overflow-hidden border-2 transition-all',
                      selectedImageIndex === idx
                        ? 'border-primary'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    )}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{effectiveProduct.category}</Badge>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {effectiveProduct.location}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold mb-1">{effectiveProduct.title}</h1>
              <p className="text-sm text-muted-foreground mb-3">
                {effectiveProduct.description.slice(0, 120)}
                {effectiveProduct.description.length > 120 ? '...' : ''}
              </p>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl md:text-4xl font-bold text-primary">
                  {formatPrice(effectiveProduct.price)}
                </span>
                {effectiveProduct.originalPrice && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(effectiveProduct.originalPrice)}
                    </span>
                    <Badge className="bg-success text-success-foreground">Save {savings}%</Badge>
                  </>
                )}
              </div>
            </div>

            {/* Seller Info */}
            <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={effectiveProduct.seller?.avatar}
                    alt={effectiveProduct.seller?.name || 'Seller'}
                  />
                  <AvatarFallback>{effectiveProduct.seller?.name?.charAt(0) || 'S'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">
                    {effectiveProduct.seller?.name || 'Unknown Seller'}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {effectiveProduct.seller?.rating && (
                      <>
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                          {effectiveProduct.seller.rating}
                        </span>
                        <span>•</span>
                      </>
                    )}
                    {effectiveProduct.seller?.reviews && (
                      <>
                        <span>{effectiveProduct.seller.reviews} reviews</span>
                        <span>•</span>
                      </>
                    )}
                    {effectiveProduct.seller?.university && (
                      <span>{effectiveProduct.seller.university}</span>
                    )}
                  </div>
                </div>
                <ContactSellerButton
                  productId={effectiveProduct.id}
                  sellerId={effectiveProduct.seller?.id || ''}
                  sellerName={effectiveProduct.seller?.name || 'Seller'}
                  variant="outline"
                  size="sm"
                />
              </div>
            </div>

            {/* Reservation Status */}
            {isReserved && reservation && (
              <div className="p-4 rounded-lg border bg-secondary/30">
                <ReservationTimer
                  expiresAt={reservation.expiresAt}
                  isOwnReservation={isOwnReservation}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="flex-1 gap-2"
                  onClick={handleAddToCart}
                  disabled={addToCart.isPending || (isReserved && !isOwnReservation)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {addToCart.isPending ? 'Adding...' : 'Add to Cart'}
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="flex-1 gap-2"
                  onClick={async () => {
                    // Buy now: add to cart then go to cart/checkout
                    if (!isAuthenticated) {
                      toast.error('Login required', { description: 'Please login to continue.' });
                      navigate('/login');
                      return;
                    }

                    try {
                      await addToCart.mutateAsync({ productId: effectiveProduct.id, quantity: 1 });
                      navigate('/cart');
                    } catch (err) {
                      const msg = err instanceof Error ? err.message : 'Please try again.';
                      toast.error('Failed to proceed to buy', { description: msg });
                    }
                  }}
                  disabled={isReserved && !isOwnReservation}
                >
                  Buy Now
                </Button>
              </div>

              <Button
                size="lg"
                variant="outline"
                className="w-full gap-2"
                onClick={handleReserve}
                disabled={isReserved}
              >
                <Clock className="h-5 w-5" />
                {isReserved
                  ? isOwnReservation
                    ? 'Already Reserved by You'
                    : 'Reserved by Another Student'
                  : 'Reserve Product'}
              </Button>
            </div>

            <Button variant="ghost" className="w-full gap-2">
              <Share2 className="h-4 w-4" />
              Share this listing
            </Button>

            {/* Reservation Modal */}
            <ReservationModal
              productId={effectiveProduct.id}
              productTitle={effectiveProduct.title}
              isOpen={showReservationModal}
              onClose={() => setShowReservationModal(false)}
            />

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {effectiveProduct.description}
              </p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-sm text-muted-foreground mb-1">Condition</p>
                <p className="font-medium capitalize">
                  {effectiveProduct.condition.replace('-', ' ')}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-sm text-muted-foreground mb-1">Listed</p>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(effectiveProduct.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Safety Tip */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/10 border border-accent/20">
              <Shield className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Safety Tips</p>
                <p className="text-sm text-muted-foreground">
                  Meet in public places, inspect items before payment, and use campus-approved
                  payment methods.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Similar Items</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  title={p.title}
                  price={p.price}
                  image={p.image}
                  category={p.category}
                  condition={p.condition}
                  location={p.location}
                  seller={p.seller.name}
                  isFavorite={p.isFavorite}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
