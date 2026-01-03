import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import esilvLogo from '@/assets/esilv-marketplace-logo.png';
import api from '@/lib/api';

const VerificationPending = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResendEmail = async () => {
    if (cooldown > 0) return;

    setIsResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      toast.success('Verification email sent!', {
        description: 'Please check your inbox and spam folder.',
      });
      setCooldown(60); // 60 second cooldown
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error('Failed to resend email', {
        description: err.message || 'Please try again later.',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <img src={esilvLogo} alt="ESILV" className="h-16 mx-auto mb-4" />
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-heading font-bold mb-2">Check Your Email</h1>
              <p className="text-muted-foreground">We've sent a verification email to your inbox</p>
            </div>

            {/* Email Display */}
            <div className="bg-secondary rounded-lg p-4 mb-6">
              <p className="text-center font-medium">{email}</p>
            </div>

            {/* Instructions */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Check your inbox</p>
                  <p className="text-sm text-muted-foreground">
                    Look for an email from ESILV Marketplace with verification instructions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Click the verification link</p>
                  <p className="text-sm text-muted-foreground">
                    Open the email and click the verification button to activate your account.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Check your spam folder</p>
                  <p className="text-sm text-muted-foreground">
                    If you don't see the email within a few minutes, please check your spam or junk
                    folder.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                disabled={isResending || cooldown > 0}
                variant="outline"
                className="w-full"
              >
                {isResending
                  ? 'Sending...'
                  : cooldown > 0
                  ? `Resend Email (${cooldown}s)`
                  : 'Resend Verification Email'}
              </Button>

              <Button onClick={() => navigate('/login')} variant="ghost" className="w-full">
                Back to Login
              </Button>
            </div>

            {/* Help Text */}
            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Need help?{' '}
                <a href="/help" className="text-primary hover:underline">
                  Contact Support
                </a>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default VerificationPending;
