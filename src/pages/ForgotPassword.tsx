import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import esilvLogo from '@/assets/esilv-marketplace-logo.png';
import api from '@/lib/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post<{ message: string; email: string }>('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });

      setIsSuccess(true);
      toast.success('Password reset email sent!', {
        description: 'Check your inbox for the reset link.',
      });
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number; isNetworkError?: boolean };
      console.error('Forgot password error:', err);

      if (err.isNetworkError || !err.status) {
        toast.error('Unable to connect to server. Please check your internet connection.');
        return;
      }

      const message = err.message || 'Failed to send reset email. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <img src={esilvLogo} alt="ESILV" className="h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-heading font-bold mb-2">Forgot Password</h1>
            <p className="text-muted-foreground">
              {isSuccess
                ? 'Check your email for reset instructions'
                : 'Enter your email to receive a password reset link'}
            </p>
          </div>

          {/* Form or Success Message */}
          <div className="bg-card rounded-xl border border-border/50 p-6">
            {isSuccess ? (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Email Sent!</h3>
                  <p className="text-sm text-muted-foreground">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    The link will expire in 1 hour. If you don't see the email, check your spam
                    folder.
                  </p>
                </div>

                <div className="space-y-3 pt-4">
                  <Button asChild className="w-full">
                    <Link to="/login">Back to Login</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setIsSuccess(false);
                      setEmail('');
                    }}
                  >
                    Send to Different Email
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.name@edu.devinci.fr or @devinci.fr"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter the email address associated with your account
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </Button>

                <div className="pt-4">
                  <Link
                    to="/login"
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </Link>
                </div>
              </form>
            )}
          </div>

          {/* Help */}
          {!isSuccess && (
            <p className="text-center text-sm text-muted-foreground mt-6">
              Need help?{' '}
              <Link to="/help" className="text-primary hover:underline">
                Visit our Help Center
              </Link>
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
