import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import esilvLogo from '@/assets/esilv-logo.png';
import api from '@/lib/api';
import { setAuthToken } from '@/hooks/useAuth';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. Please try again.');
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/api/auth/verify-email?token=${token}`);

        if (response.ok) {
          const data = await response.json();
          // Save JWT token
          if (data.token) {
            localStorage.setItem('token', data.token);
            setAuthToken(data.token);
          }
          setStatus('success');
          setMessage('Your email has been successfully verified!');
          // Redirect to dashboard/home after 2 seconds
          setTimeout(() => navigate('/'), 2000);
        } else {
          const errorData = await response.json();
          setStatus('error');
          setMessage(errorData.message || 'Verification failed. The link may have expired.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Something went wrong. Please try again later.');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-md mx-auto">
          <Card className="p-8">
            <div className="text-center">
              <img src={esilvLogo} alt="ESILV" className="h-16 mx-auto mb-6" />

              {status === 'verifying' && (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </div>
                  <h1 className="text-2xl font-heading font-bold mb-2">Verifying Your Email</h1>
                  <p className="text-muted-foreground">
                    Please wait while we verify your email address...
                  </p>
                </>
              )}

              {status === 'success' && (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-4">
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  </div>
                  <h1 className="text-2xl font-heading font-bold mb-2 text-success">
                    Email Verified Successfully!
                  </h1>
                  <p className="text-muted-foreground mb-6">{message}</p>
                  <p className="text-sm text-muted-foreground">
                    Redirecting you to the homepage...
                  </p>
                </>
              )}

              {status === 'error' && (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
                    <XCircle className="h-8 w-8 text-destructive" />
                  </div>
                  <h1 className="text-2xl font-heading font-bold mb-2 text-destructive">
                    Verification Failed
                  </h1>
                  <p className="text-muted-foreground mb-6">{message}</p>
                  <div className="space-y-2">
                    <Button onClick={() => navigate('/login')} className="w-full">
                      Back to Login
                    </Button>
                    <Button
                      onClick={() => navigate('/verification-pending')}
                      variant="outline"
                      className="w-full"
                    >
                      Resend Verification Email
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default VerifyEmail;
