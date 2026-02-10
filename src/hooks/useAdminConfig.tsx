import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ADMIN_BASE_URL = 'https://senapred-backend-853468393752.us-central1.run.app/api/config';

// Types
export type ConfigData = {
  keywords: string[];
  languages: string[];
  max_results: number;
  last_updated: string;
  is_active: boolean;
};

// Helper function for admin API requests
async function adminRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const url = `${ADMIN_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || res.statusText);
    }

    if (res.status === 204) return undefined as unknown as T;

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return res.json();
    return res.text() as unknown as T;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error. Please check your connection.');
  }
}

// Hook: Get full configuration
export const useAdminConfig = () => {
  return useQuery<ConfigData>({
    queryKey: ['adminConfig'],
    queryFn: () => adminRequest<ConfigData>('GET', '/'),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// Hook: Get keywords
export const useKeywords = () => {
  return useQuery<string[]>({
    queryKey: ['adminConfig', 'keywords'],
    queryFn: async () => {
      const data = await adminRequest<{ keywords: string[] }>('GET', '/keywords');
      return data.keywords || [];
    },
  });
};

// Hook: Add keyword
export const useAddKeyword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (word: string) => adminRequest('POST', '/keywords', { word }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminConfig'] });
      queryClient.invalidateQueries({ queryKey: ['adminConfig', 'keywords'] });
    },
  });
};

// Hook: Remove keyword
export const useRemoveKeyword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (word: string) => adminRequest('DELETE', '/keywords', { word }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminConfig'] });
      queryClient.invalidateQueries({ queryKey: ['adminConfig', 'keywords'] });
    },
  });
};

// Hook: Get languages
export const useLanguages = () => {
  return useQuery<string[]>({
    queryKey: ['adminConfig', 'languages'],
    queryFn: async () => {
      const data = await adminRequest<{ languages: string[] }>('GET', '/languages');
      return data.languages || [];
    },
  });
};

// Hook: Add language
export const useAddLanguage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lang: string) => adminRequest('POST', '/languages', { lang }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminConfig'] });
      queryClient.invalidateQueries({ queryKey: ['adminConfig', 'languages'] });
    },
  });
};

// Hook: Remove language
export const useRemoveLanguage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lang: string) => adminRequest('DELETE', '/languages', { lang }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminConfig'] });
      queryClient.invalidateQueries({ queryKey: ['adminConfig', 'languages'] });
    },
  });
};

// Hook: Get max results
export const useMaxResults = () => {
  return useQuery<number>({
    queryKey: ['adminConfig', 'maxResults'],
    queryFn: async () => {
      const data = await adminRequest<{ max_results: number }>('GET', '/max_results');
      return data.max_results || 0;
    },
  });
};

// Hook: Update max results
export const useUpdateMaxResults = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (value: number) => adminRequest('POST', '/max_results', { value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminConfig'] });
      queryClient.invalidateQueries({ queryKey: ['adminConfig', 'maxResults'] });
    },
  });
};

// Hook: Reset max results
export const useResetMaxResults = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => adminRequest('DELETE', '/max_results'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminConfig'] });
      queryClient.invalidateQueries({ queryKey: ['adminConfig', 'maxResults'] });
    },
  });
};
