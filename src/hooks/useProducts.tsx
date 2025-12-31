import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export type Seller = {
  id: string;
  name: string;
  avatar?: string;
  rating?: number;
  reviews?: number;
  university?: string;
};

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images: string[];
  category: string;
  condition: "new" | "like-new" | "good" | "fair";
  location?: string;
  seller: Seller;
  isFavorite?: boolean;
  createdAt: string;
};

export type ProductFilters = {
  search?: string;
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'oldest' | 'price-asc' | 'price-desc';
  page?: number;
  limit?: number;
};

export const useProducts = (filters?: ProductFilters) => {
  return useQuery<Product[]>({
    queryKey: ["products", filters],
    queryFn: async () => {
      const response = await api.get<{ products: Product[] }>('/products', filters);
      return response.products || [];
    },
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useProduct = (id?: string) => {
  return useQuery<Product | undefined>({
    queryKey: ["products", id],
    queryFn: async () => {
      if (!id) return undefined;
      const data = await api.get<Product>(`/products/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useProductsByCategory = (category?: string) => {
  return useQuery<Product[]>({
    queryKey: ["products", "category", category],
    queryFn: async () => {
      if (!category) return [];
      const data = await api.get<Product[]>(`/products/category/${category}`);
      return data || [];
    },
    enabled: !!category,
  });
};

export const useSellerProducts = (sellerId?: string) => {
  return useQuery<Product[]>({
    queryKey: ["products", "seller", sellerId],
    queryFn: async () => {
      if (!sellerId) return [];
      const data = await api.get<Product[]>(`/products/seller/${sellerId}`);
      return data || [];
    },
    enabled: !!sellerId,
  });
};

export const useMyListings = () => {
  return useQuery<Product[]>({
    queryKey: ["products", "my-listings"],
    queryFn: async () => {
      const data = await api.get<Product[]>('/products/my/listings');
      return data || [];
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productData: Partial<Product>) => {
      return api.post<Product>('/products', productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", "my-listings"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: { id: string; data: Partial<Product> }) => {
      return api.put<Product>(`/products/${params.id}`, params.data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["products", "my-listings"] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return api.del(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", "my-listings"] });
    },
  });
};

export default useProducts;
