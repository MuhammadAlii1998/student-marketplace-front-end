import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export type User = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  university: string;
  studentId?: string;
  rating: number;
  reviews: number;
  favorites: string[];
  createdAt: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
  university?: string;
  studentId?: string;
};

export type AuthResponse = {
  token: string;
  user: User;
  verificationRequired?: boolean;
};

// Local storage helpers
const TOKEN_KEY = 'auth_token';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// Hook to get current user profile
export const useProfile = () => {
  return useQuery<User>({
    queryKey: ['profile'],
    queryFn: async () => {
      const data = await api.get<User>('/auth/profile');
      return data;
    },
    enabled: !!getAuthToken(), // Only fetch if token exists
    retry: false, // Don't retry on auth failure
  });
};

// Hook to login
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const data = await api.post<AuthResponse>('/auth/login', credentials);
      setAuthToken(data.token);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data.user);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
};

// Hook to register
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: RegisterData) => {
      const data = await api.post<AuthResponse>('/auth/register', userData);
      // Only set token if verification is not required
      if (!data.verificationRequired && data.token) {
        setAuthToken(data.token);
      }
      return data;
    },
    onSuccess: (data) => {
      // Only set user data if verification is not required
      if (!data.verificationRequired && data.user) {
        queryClient.setQueryData(['profile'], data.user);
      }
    },
  });
};

// Hook to resend verification email
export const useResendVerification = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const data = await api.post('/auth/resend-verification', { email });
      return data;
    },
  });
};

// Hook to logout
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      clearAuthToken();
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.clear(); // Clear all cached data
    },
  });
};

// Hook to update profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<User>) => {
      const data = await api.put<User>('/auth/profile', updates);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
    },
  });
};

// Hook to check if user is authenticated
export const useIsAuthenticated = () => {
  const { data: user, isLoading } = useProfile();
  return {
    isAuthenticated: !!user,
    isLoading,
    user,
  };
};
