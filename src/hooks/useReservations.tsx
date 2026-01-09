import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export type ReservationDuration = 30 | 60 | 120 | 1440; // 30 min, 1 hour, 2 hours, 24 hours (in minutes)

export type Reservation = {
  _id: string;
  productId: string;
  userId: string;
  userName?: string;
  reservedAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  durationMinutes: number;
};

export type CreateReservationData = {
  productId: string;
  durationMinutes: ReservationDuration; // in minutes - matches backend
};

export type ReservationResponse = {
  reservation: Reservation;
  message: string;
};

// Get all active reservations for current user
export function useMyReservations() {
  return useQuery<Reservation[]>({
    queryKey: ['reservations', 'my'],
    queryFn: () => api.get<Reservation[]>('/reservations/my'),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // refetch every minute to keep timers accurate
  });
}

// Helper to check if a string is a valid MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  // MongoDB ObjectIds are 24 character hex strings
  return /^[0-9a-fA-F]{24}$/.test(id);
}

// Get reservation for a specific product
export function useProductReservation(productId?: string) {
  return useQuery<Reservation | null>({
    queryKey: ['reservations', 'product', productId],
    queryFn: () => api.get<Reservation | null>(`/reservations/product/${productId}`),
    enabled: !!productId && isValidObjectId(productId), // Only fetch if valid ObjectId
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // refetch every minute
  });
}

// Get a specific reservation by ID
export function useReservation(reservationId?: string) {
  return useQuery<Reservation>({
    queryKey: ['reservations', reservationId],
    queryFn: () => api.get<Reservation>(`/reservations/${reservationId}`),
    enabled: !!reservationId && isValidObjectId(reservationId), // Only fetch if valid ObjectId
    staleTime: 1000 * 30,
  });
}

// Create a new reservation
export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation<ReservationResponse, Error, CreateReservationData>({
    mutationFn: (data: CreateReservationData) =>
      api.post<ReservationResponse>('/reservations', data),
    onSuccess: (response, variables) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['products', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Cancel a reservation
export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: (reservationId: string) =>
      api.del<{ message: string }>(`/reservations/${reservationId}`),
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Helper function to check if reservation is expired
export function isReservationExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

// Helper function to get time remaining in milliseconds
export function getTimeRemaining(expiresAt: string): number {
  const remaining = new Date(expiresAt).getTime() - Date.now();
  return remaining > 0 ? remaining : 0;
}

// Helper function to format time remaining
export function formatTimeRemaining(expiresAt: string): string {
  const remaining = getTimeRemaining(expiresAt);
  if (remaining === 0) return 'Expired';

  const seconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

// Helper function to get duration label
export function getDurationLabel(minutes: ReservationDuration): string {
  if (minutes === 30) return '30 minutes';
  if (minutes === 60) return '1 hour';
  if (minutes === 120) return '2 hours';
  if (minutes === 1440) return '24 hours';
  return `${minutes} minutes`;
}

// Helper to check if reservation status is active (supports both formats)
export function isReservationActive(reservation: Reservation): boolean {
  const status = reservation.status.toUpperCase();
  return status === 'ACTIVE' && !isReservationExpired(reservation.expiresAt);
}
