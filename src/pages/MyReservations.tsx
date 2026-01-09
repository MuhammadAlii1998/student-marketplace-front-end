import { Layout } from '@/components/layout/Layout';
import {
  useMyReservations,
  useCancelReservation,
  isReservationActive,
} from '@/hooks/useReservations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReservationTimer } from '@/components/ReservationTimer';
import { Clock, Package, XCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const MyReservations = () => {
  const { data: reservations, isLoading } = useMyReservations();
  const cancelReservation = useCancelReservation();
  const [reservationToCancel, setReservationToCancel] = useState<string | null>(null);

  const handleCancelReservation = async (reservationId: string) => {
    try {
      await cancelReservation.mutateAsync(reservationId);
      toast.success('Reservation cancelled', {
        description: 'The product is now available for others to purchase.',
      });
      setReservationToCancel(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel reservation';
      toast.error('Cancellation failed', {
        description: errorMessage,
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Clock className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your reservations...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const activeReservations = reservations?.filter((r) => isReservationActive(r)) || [];
  const expiredReservations =
    reservations?.filter((r) => r.status.toUpperCase() === 'EXPIRED') || [];
  const cancelledReservations =
    reservations?.filter((r) => r.status.toUpperCase() === 'CANCELLED') || [];

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Reservations</h1>
          <p className="text-muted-foreground">
            Manage your product reservations and view your reservation history.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="text-2xl font-bold">{activeReservations.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Expired</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                <span className="text-2xl font-bold">{expiredReservations.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cancelled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                <span className="text-2xl font-bold">{cancelledReservations.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Reservations */}
        {activeReservations.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Active Reservations</h2>
            <div className="space-y-4">
              {activeReservations.map((reservation) => (
                <Card key={reservation._id} className="border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-primary/10">
                            <Package className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="default">Active</Badge>
                              <ReservationTimer
                                expiresAt={reservation.expiresAt}
                                isOwnReservation
                                compact
                              />
                            </div>
                            <h3 className="font-semibold mb-1">
                              Product ID: {reservation.productId}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Reserved for {reservation.durationMinutes} minutes
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Reserved on {new Date(reservation.reservedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/product/${reservation.productId}`}>View Product</Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setReservationToCancel(reservation._id)}
                          disabled={cancelReservation.isPending}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {activeReservations.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No active reservations</h3>
              <p className="text-muted-foreground text-center mb-6">
                Reserve products to hold them temporarily before purchase
              </p>
              <Button asChild>
                <Link to="/products">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Expired Reservations */}
        {expiredReservations.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Expired Reservations</h2>
            <div className="space-y-4">
              {expiredReservations.map((reservation) => (
                <Card key={reservation._id} className="opacity-60">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-warning/10">
                          <AlertCircle className="h-6 w-6 text-warning" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">Expired</Badge>
                          </div>
                          <h3 className="font-semibold mb-1">
                            Product ID: {reservation.productId}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Expired on {new Date(reservation.expiresAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/product/${reservation.productId}`}>View Product</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Cancelled Reservations */}
        {cancelledReservations.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Cancelled Reservations</h2>
            <div className="space-y-4">
              {cancelledReservations.map((reservation) => (
                <Card key={reservation._id} className="opacity-60">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-destructive/10">
                          <XCircle className="h-6 w-6 text-destructive" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="destructive">Cancelled</Badge>
                          </div>
                          <h3 className="font-semibold mb-1">
                            Product ID: {reservation.productId}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Reserved on {new Date(reservation.reservedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/product/${reservation.productId}`}>View Product</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Cancel Confirmation Dialog */}
        <AlertDialog
          open={!!reservationToCancel}
          onOpenChange={(open) => !open && setReservationToCancel(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Reservation?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this reservation? The product will become available
                for others to purchase immediately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Reservation</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => reservationToCancel && handleCancelReservation(reservationToCancel)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Cancel Reservation
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default MyReservations;
