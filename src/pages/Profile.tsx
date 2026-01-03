import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductCard } from '@/components/ProductCard';
import {
  Settings,
  MapPin,
  Star,
  Calendar,
  ShoppingBag,
  Heart,
  Package,
  Edit,
  GraduationCap,
  LogOut,
  Mail,
  Phone,
} from 'lucide-react';
import { useProfile, useLogout } from '@/hooks/useAuth';
import { useMyListings } from '@/hooks/useProducts';
import { useFavorites } from '@/hooks/useFavorites';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Product } from '@/hooks/useProducts';

const Profile = () => {
  const navigate = useNavigate();
  const { data: user, isLoading: userLoading } = useProfile();
  const { data: myListings = [], isLoading: listingsLoading } = useMyListings();
  const { data: favorites = [], isLoading: favoritesLoading } = useFavorites();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast.error('Logout failed', { description: errorMessage });
    }
  };

  if (userLoading) {
    return (
      <Layout>
        <div className="container py-16 text-center">Loading profile...</div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <p className="mb-4">Please log in to view your profile.</p>
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
        </div>
      </Layout>
    );
  }

  const purchases: Product[] = []; // Purchases endpoint not yet implemented

  return (
    <Layout>
      <div className="container py-8">
        {/* Profile Header */}
        <div className="relative mb-8">
          {/* Cover */}
          <div className="h-32 md:h-48 rounded-xl gradient-hero" />

          {/* Profile Info */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 -mt-12 md:-mt-16 px-4 md:px-6">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 pt-2 md:pt-12">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{user.name}</h1>
                <Badge variant="secondary" className="w-fit">
                  <Star className="h-3 w-3 fill-warning text-warning mr-1" />
                  {user.rating} ({user.reviews} reviews)
                </Badge>
              </div>

              <p className="text-muted-foreground mb-3">{user.university}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {user.university || 'ESILV'}
                </span>
                {user.studentId && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    Student ID: {user.studentId}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Member since{' '}
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* <div className="flex gap-2 md:pt-12">
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div> */}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
            <p className="text-2xl font-bold text-primary">{myListings.length}</p>
            <p className="text-sm text-muted-foreground">Items Listed</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
            <p className="text-2xl font-bold text-primary">{purchases.length}</p>
            <p className="text-sm text-muted-foreground">Purchases</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
            <p className="text-2xl font-bold text-primary">{myListings.length}</p>
            <p className="text-sm text-muted-foreground">Active Listings</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
            <p className="text-2xl font-bold text-primary">{favorites.length}</p>
            <p className="text-sm text-muted-foreground">Favorites</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none h-auto p-0 space-x-6">
            <TabsTrigger
              value="listings"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              My Listings
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3"
            >
              <Heart className="h-4 w-4 mr-2" />
              Favorites
            </TabsTrigger>
            <TabsTrigger
              value="purchases"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3"
            >
              <Package className="h-4 w-4 mr-2" />
              Purchases
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            {myListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {myListings.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    image={product.image}
                    category={product.category}
                    condition={product.condition}
                    location={product.location}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start selling by listing your first item.
                </p>
                <Button>Create Listing</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites">
            {favorites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favorites.map((product) => (
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
                    isFavorite
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
                <p className="text-muted-foreground">
                  Save items you like by clicking the heart icon.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="purchases">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {purchases.map((product) => (
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
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="max-w-2xl space-y-6">
              <div className="p-6 rounded-xl bg-card border border-border/50">
                <h3 className="font-semibold mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p>{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p>Not provided</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-card border border-border/50">
                <h3 className="font-semibold mb-4">Account Actions</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="h-4 w-4" />
                    {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
