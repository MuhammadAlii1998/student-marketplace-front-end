import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Product } from './useProducts';

export type CartItem = {
  product: Product | string;
  quantity: number;
  _id?: string;
};

export type Cart = {
  _id: string;
  user: string;
  items: CartItem[];
  updatedAt: string;
};

export const useCart = () => {
  return useQuery<Cart>({
    queryKey: ['cart'],
    queryFn: async () => {
      const data = await api.get<Cart>('/cart');

      // Ensure items is always an array
      if (data && typeof data === 'object') {
        return {
          ...data,
          items: Array.isArray(data.items) ? data.items : [],
        };
      }

      // Return empty cart structure if data is invalid
      return {
        _id: '',
        user: '',
        items: [],
        updatedAt: new Date().toISOString(),
      };
    },
    // Only fetch if user is authenticated
    // Will need auth context to check this
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { productId: string; quantity?: number }) => {
      return api.post('/cart', {
        productId: params.productId,
        quantity: params.quantity || 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { productId: string; quantity: number }) => {
      return api.put(`/cart/${params.productId}`, {
        quantity: params.quantity,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      return api.del(`/cart/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return api.del('/cart');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};
