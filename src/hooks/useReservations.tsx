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

// Helper to validate if a reservation object is valid
function isValidReservation(reservation: unknown): reservation is Reservation {
  if (!reservation || typeof reservation !== 'object') return false;
  const r = reservation as Record<string, unknown>;

  // Check required string fields
  if (
    typeof r._id !== 'string' ||
    typeof r.productId !== 'string' ||
    typeof r.userId !== 'string' ||
    typeof r.status !== 'string' ||
    typeof r.expiresAt !== 'string'
  ) {
    return false;
  }

  // Validate expiresAt is a valid date
  const expiryDate = new Date(r.expiresAt);
  if (isNaN(expiryDate.getTime())) {
    return false;
  }

  // Validate reservedAt if present
  if (r.reservedAt && typeof r.reservedAt === 'string') {
    const reservedDate = new Date(r.reservedAt);
    if (isNaN(reservedDate.getTime())) {
      return false;
    }
  }

  return true;
}

// Get all active reservations for current user
export function useMyReservations() {
  return useQuery<Reservation[]>({
    queryKey: ['reservations', 'my'],
    queryFn: async () => {
      try {
        const response = await api.get<Reservation[] | { reservations: Reservation[] }>(
          '/reservations/my'
        );

        let reservations: unknown[] = [];

        // Handle both response formats: array or object with reservations property
        if (Array.isArray(response)) {
          reservations = response;
        } else if (response && typeof response === 'object' && 'reservations' in response) {
          const res = response.reservations;
          reservations = Array.isArray(res) ? res : [];
        }

        // Filter out invalid reservations and return only valid ones
        return reservations.filter(isValidReservation);
      } catch (error) {
        // Return empty array on error instead of throwing
        console.warn('Failed to fetch user reservations:', error);
        return [];
      }
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // refetch every minute to keep timers accurate
    initialData: [], // Ensure data is always an array, even before first fetch
    retry: 1, // Only retry once on failure
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
    queryFn: async () => {
      try {
        return await api.get<Reservation | null>(`/reservations/product/${productId}`);
      } catch (error) {
        // Return null on error instead of throwing (product might just not be reserved)
        console.warn(`Failed to fetch reservation for product ${productId}:`, error);
        return null;
      }
    },
    enabled: !!productId && isValidObjectId(productId), // Only fetch if valid ObjectId
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // refetch every minute
    retry: 1, // Only retry once on failure
  });
}

// Get a specific reservation by ID
export function useReservation(reservationId?: string) {
  return useQuery<Reservation | null>({
    queryKey: ['reservations', reservationId],
    queryFn: async () => {
      try {
        const reservation = await api.get<Reservation>(`/reservations/${reservationId}`);
        // Validate the returned reservation
        return isValidReservation(reservation) ? reservation : null;
      } catch (error) {
        console.warn(`Failed to fetch reservation ${reservationId}:`, error);
        return null;
      }
    },
    enabled: !!reservationId && isValidObjectId(reservationId), // Only fetch if valid ObjectId
    staleTime: 1000 * 30,
    retry: 1,
  });
}

// Create a new reservation
export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation<ReservationResponse, Error, CreateReservationData>({
    mutationFn: (data: CreateReservationData) => {
      // Validate input data
      if (!data.productId || !isValidObjectId(data.productId)) {
        throw new Error('Invalid product ID');
      }
      if (!data.durationMinutes || ![30, 60, 120, 1440].includes(data.durationMinutes)) {
        throw new Error('Invalid duration. Must be 30, 60, 120, or 1440 minutes');
      }
      return api.post<ReservationResponse>('/reservations', data);
    },
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
    mutationFn: (reservationId: string) => {
      // Validate reservationId before making request
      if (!reservationId || !isValidObjectId(reservationId)) {
        throw new Error('Invalid reservation ID');
      }
      return api.del<{ message: string }>(`/reservations/${reservationId}`);
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Helper function to check if reservation is expired
export function isReservationExpired(expiresAt: string): boolean {
  if (!expiresAt) return true; // If no expiry date, consider it expired
  const expiryTime = new Date(expiresAt).getTime();
  if (isNaN(expiryTime)) return true; // If invalid date, consider it expired
  return expiryTime < Date.now();
}

// Helper function to get time remaining in milliseconds
export function getTimeRemaining(expiresAt: string): number {
  if (!expiresAt) return 0;
  const expiryTime = new Date(expiresAt).getTime();
  if (isNaN(expiryTime)) return 0; // If invalid date, return 0
  const remaining = expiryTime - Date.now();
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
export function isReservationActive(reservation: Reservation | null | undefined): boolean {
  if (!reservation || !reservation.status || !reservation.expiresAt) return false;
  const status = reservation.status.toUpperCase();
  return status === 'ACTIVE' && !isReservationExpired(reservation.expiresAt);
}
