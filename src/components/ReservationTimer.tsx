import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatTimeRemaining, getTimeRemaining } from '@/hooks/useReservations';
import { cn } from '@/lib/utils';

interface ReservationTimerProps {
  expiresAt: string;
  isOwnReservation?: boolean;
  className?: string;
  compact?: boolean;
}

export function ReservationTimer({
  expiresAt,
  isOwnReservation = false,
  className,
  compact = false,
}: ReservationTimerProps) {
  const [timeLeft, setTimeLeft] = useState(() => formatTimeRemaining(expiresAt));
  const [isExpired, setIsExpired] = useState(() => getTimeRemaining(expiresAt) === 0);

  useEffect(() => {
    // Update immediately
    const remaining = getTimeRemaining(expiresAt);
    setIsExpired(remaining === 0);
    setTimeLeft(formatTimeRemaining(expiresAt));

    // If already expired, no need to set interval
    if (remaining === 0) return;

    // Update every second
    const interval = setInterval(() => {
      const newRemaining = getTimeRemaining(expiresAt);
      if (newRemaining === 0) {
        setIsExpired(true);
        setTimeLeft('Expired');
        clearInterval(interval);
      } else {
        setTimeLeft(formatTimeRemaining(expiresAt));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (isExpired) {
    return null; // Don't show expired timers
  }

  if (compact) {
    return (
      <Badge
        variant={isOwnReservation ? 'default' : 'secondary'}
        className={cn('gap-1.5', className)}
      >
        <Clock className="h-3 w-3" />
        {timeLeft}
      </Badge>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-2 rounded-lg border',
        isOwnReservation
          ? 'bg-primary/10 border-primary/20 text-primary'
          : 'bg-secondary/50 border-border/50 text-muted-foreground',
        className
      )}
    >
      <Clock className="h-4 w-4" />
      <div className="flex flex-col">
        <span className="text-xs font-medium">
          {isOwnReservation ? 'Reserved by you' : 'Reserved'}
        </span>
        <span className="text-sm font-bold">{timeLeft} left</span>
      </div>
    </div>
  );
}
