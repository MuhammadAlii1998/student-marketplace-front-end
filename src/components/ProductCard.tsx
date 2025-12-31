import { Link, useNavigate } from "react-router-dom";
import { Heart, MapPin, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAddToCart } from "@/hooks/useCart";
import { useToggleFavorite } from "@/hooks/useFavorites";
import { useIsAuthenticated } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useState } from "react";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  condition: "new" | "like-new" | "good" | "fair";
  location?: string;
  seller?: string;
  isFavorite?: boolean;
}

const conditionColors = {
  new: "bg-success text-success-foreground",
  "like-new": "bg-accent text-accent-foreground",
  good: "bg-primary text-primary-foreground",
  fair: "bg-warning text-warning-foreground",
};

export function ProductCard({
  id,
  title,
  price,
  image,
  category,
  condition,
  location,
  seller,
  isFavorite = false,
}: ProductCardProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useIsAuthenticated();
  const addToCart = useAddToCart();
  const toggleFavorite = useToggleFavorite();
  const [favorite, setFavorite] = useState(isFavorite);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error("Login required", {
        description: "Please login to add items to your cart.",
      });
      navigate("/login");
      return;
    }

    try {
      await addToCart.mutateAsync({ productId: id, quantity: 1 });
      toast.success("Added to cart!", {
        description: `${title} has been added to your cart.`,
      });
    } catch (error: any) {
      toast.error("Failed to add to cart", {
        description: error.message || "Please try again.",
      });
    }
  };

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error("Login required", {
        description: "Please login to save favorites.",
      });
      navigate("/login");
      return;
    }

    try {
      await toggleFavorite.toggleFavorite(id, favorite);
      setFavorite(!favorite);
      toast.success(favorite ? "Removed from favorites" : "Added to favorites");
    } catch (error: any) {
      toast.error("Failed to update favorites", {
        description: error.message || "Please try again.",
      });
    }
  };

  return (
    <Link
      to={`/product/${id}`}
      className="group block rounded-xl bg-card border border-border/50 overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-3 right-3 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm",
            favorite && "text-primary"
          )}
          onClick={handleFavoriteToggle}
          disabled={toggleFavorite.isLoading}
        >
          <Heart className={cn("h-4 w-4", favorite && "fill-current")} />
        </Button>
        <Badge className={cn("absolute top-3 left-3", conditionColors[condition])}>
          {condition.charAt(0).toUpperCase() + condition.slice(1).replace("-", " ")}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </div>
        
        <p className="text-2xl font-bold text-primary mb-2">
          ${price.toFixed(2)}
        </p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary" className="font-normal">
            {category}
          </Badge>
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {location}
            </span>
          )}
        </div>

        {seller && (
          <p className="text-xs text-muted-foreground mt-2">
            Sold by <span className="font-medium text-foreground">{seller}</span>
          </p>
        )}

        {/* Add to Cart Button */}
        <Button
          size="sm"
          className="w-full mt-3 gap-2"
          onClick={handleAddToCart}
          disabled={addToCart.isPending}
        >
          <ShoppingCart className="h-4 w-4" />
          {addToCart.isPending ? "Adding..." : "Add to Cart"}
        </Button>
      </div>
    </Link>
  );
}
