import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  count?: number;
};

export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get<Category[] | { categories: Category[] }>('/categories');

      // Handle both response formats: array or object with categories property
      if (Array.isArray(response)) {
        return response;
      } else if (response && typeof response === 'object' && 'categories' in response) {
        return Array.isArray(response.categories) ? response.categories : [];
      }

      return [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    initialData: [], // Ensure data is always an array
  });
};

export const useCategory = (slug?: string) => {
  return useQuery<Category | undefined>({
    queryKey: ['categories', slug],
    queryFn: async () => {
      if (!slug) return undefined;
      const data = await api.get<Category>(`/categories/${slug}`);
      return data;
    },
    enabled: !!slug,
  });
};

export default useCategories;
