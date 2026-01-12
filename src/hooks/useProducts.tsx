import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

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
  condition: 'new' | 'like-new' | 'good' | 'fair';
  location?: string;
  seller: Seller | null;
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
    queryKey: ['products', filters],
    queryFn: async () => {
      const response = await api.get<Product[] | { products: Product[] } | { data: Product[] }>(
        '/products',
        filters
      );
      let products: Product[] = [];

      // Support multiple possible backend shapes: array, { products: [...] }, { data: [...] }
      if (Array.isArray(response)) {
        products = response as Product[];
      } else if (response && typeof response === 'object') {
        if ('products' in response && Array.isArray(response.products)) {
          products = response.products as Product[];
        } else if ('data' in response && Array.isArray(response.data)) {
          products = response.data as Product[];
        }
      } else {
        products = [];
      }

      // Apply client-side filtering/sorting as a fallback so search works
      if (filters) {
        // Search by title, description or category
        if (filters.search) {
          const q = String(filters.search).toLowerCase();
          products = products.filter(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q) ||
              p.category.toLowerCase().includes(q)
          );
        }

        // Category (exact match)
        if (filters.category) {
          products = products.filter(
            (p) => p.category.toLowerCase() === String(filters.category).toLowerCase()
          );
        }

        // Condition (comma-separated allowed)
        if (filters.condition) {
          const conds = String(filters.condition)
            .split(',')
            .map((c) => c.trim().toLowerCase())
            .filter(Boolean);
          if (conds.length > 0) {
            products = products.filter((p) => conds.includes(p.condition.toLowerCase()));
          }
        }

        // Price range
        if (filters.minPrice !== undefined) {
          products = products.filter((p) => p.price >= Number(filters.minPrice));
        }
        if (filters.maxPrice !== undefined) {
          products = products.filter((p) => p.price <= Number(filters.maxPrice));
        }

        // Sorting
        if (filters.sort) {
          if (filters.sort === 'newest') {
            products = products.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
          } else if (filters.sort === 'oldest') {
            products = products.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
          } else if (filters.sort === 'price-asc') {
            products = products.sort((a, b) => a.price - b.price);
          } else if (filters.sort === 'price-desc') {
            products = products.sort((a, b) => b.price - a.price);
          }
        }

        // Pagination
        if (filters.page !== undefined && filters.limit !== undefined) {
          const page = Number(filters.page) || 1;
          const limit = Number(filters.limit) || products.length;
          const start = (page - 1) * limit;
          products = products.slice(start, start + limit);
        }
      }

      return products;
    },
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useProduct = (id?: string) => {
  return useQuery<Product | undefined>({
    queryKey: ['products', id],
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
    queryKey: ['products', 'category', category],
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
    queryKey: ['products', 'seller', sellerId],
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
    queryKey: ['products', 'my-listings'],
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
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'my-listings'] });
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
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['products', 'my-listings'] });
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
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'my-listings'] });
    },
  });
};

export default useProducts;
