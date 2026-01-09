import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Clock, AlertCircle } from 'lucide-react';
import {
  useCreateReservation,
  type ReservationDuration,
  getDurationLabel,
} from '@/hooks/useReservations';
import { useIsAuthenticated } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ReservationModalProps {
  productId: string;
  productTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const DURATION_OPTIONS: ReservationDuration[] = [30, 60, 120, 1440];

export function ReservationModal({
  productId,
  productTitle,
  isOpen,
  onClose,
  onSuccess,
}: ReservationModalProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useIsAuthenticated();
  const [selectedDuration, setSelectedDuration] = useState<ReservationDuration>(60);
  const createReservation = useCreateReservation();

  const handleReserve = async () => {
    // Validate inputs
    if (!productId || typeof productId !== 'string') {
      toast.error('Invalid product', {
        description: 'Product ID is missing or invalid.',
      });
      onClose();
      return;
    }

    // Check authentication
    if (!isAuthenticated) {
      toast.error('Login required', {
        description: 'Please login to reserve products.',
      });
      onClose();
      navigate('/login');
      return;
    }

    try {
      const response = await createReservation.mutateAsync({
        productId,
        durationMinutes: selectedDuration, // matches backend API
      });

      // Validate response
      if (!response?.reservation?.expiresAt) {
        throw new Error('Invalid response from server');
      }

      const expiresAt = new Date(response.reservation.expiresAt);

      // Check if date is valid
      if (isNaN(expiresAt.getTime())) {
        throw new Error('Invalid expiration date received');
      }

      const formattedTime = expiresAt.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      toast.success('Product reserved!', {
        description: `${productTitle || 'Product'} is reserved until ${formattedTime}`,
        duration: 5000,
      });

      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to reserve product. Please try again.';
      toast.error('Reservation failed', {
        description: errorMessage,
        duration: 5000,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Reserve Product
          </DialogTitle>
          <DialogDescription>
            Reserve <span className="font-semibold text-foreground">{productTitle}</span> for a
            specific duration. This prevents others from purchasing it during your reservation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label className="text-base">Select duration:</Label>
            <RadioGroup
              value={selectedDuration.toString()}
              onValueChange={(value) => setSelectedDuration(Number(value) as ReservationDuration)}
            >
              {DURATION_OPTIONS.map((duration) => (
                <div
                  key={duration}
                  className={cn(
                    'flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-accent/50',
                    selectedDuration === duration ? 'border-primary bg-accent/30' : 'border-border'
                  )}
                  onClick={() => setSelectedDuration(duration)}
                >
                  <RadioGroupItem value={duration.toString()} id={`duration-${duration}`} />
                  <Label
                    htmlFor={`duration-${duration}`}
                    className="flex-1 cursor-pointer font-medium"
                  >
                    {getDurationLabel(duration)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Reservation Notice
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                The product will be held exclusively for you during the selected time. Make sure to
                complete your purchase before the reservation expires.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={createReservation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleReserve} disabled={createReservation.isPending} className="gap-2">
            <Clock className="h-4 w-4" />
            {createReservation.isPending ? 'Reserving...' : 'Confirm Reservation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
