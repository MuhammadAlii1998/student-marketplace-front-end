import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Product } from './useProducts';

export const useFavorites = () => {
  return useQuery<Product[]>({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await api.get<Product[] | { favorites: Product[] }>('/auth/favorites');

      // Handle both response formats: array or object with favorites property
      if (Array.isArray(response)) {
        return response;
      } else if (response && typeof response === 'object' && 'favorites' in response) {
        return Array.isArray(response.favorites) ? response.favorites : [];
      }

      return [];
    },
    initialData: [], // Ensure data is always an array
  });
};

export const useAddFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      return api.post(`/auth/favorites/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      return api.del(`/auth/favorites/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useToggleFavorite = () => {
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  return {
    toggleFavorite: async (productId: string, isFavorite: boolean) => {
      if (isFavorite) {
        return removeFavorite.mutateAsync(productId);
      } else {
        return addFavorite.mutateAsync(productId);
      }
    },
    isLoading: addFavorite.isPending || removeFavorite.isPending,
  };
};
