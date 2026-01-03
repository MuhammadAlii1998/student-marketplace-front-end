import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Lock, User, GraduationCap, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import esilvLogo from '@/assets/esilv-marketplace-logo.png';
import { useLogin, useRegister } from '@/hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [studentId, setStudentId] = useState('');

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic client-side validation
    if (!loginEmail || !loginPassword) {
      toast.error('Please enter both email and password');
      return;
    }

    try {
      await loginMutation.mutateAsync({
        email: loginEmail,
        password: loginPassword,
      });
      toast.success('Login successful! Welcome back to ESILV Marketplace.');
      navigate('/');
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number; isNetworkError?: boolean };
      console.error('Login error:', err);

      // Check if email verification is required
      if (err.message && err.message.toLowerCase().includes('verif')) {
        toast.error(err.message || 'Please verify your email before logging in');
        setTimeout(() => {
          navigate(`/verification-pending?email=${encodeURIComponent(loginEmail)}`);
        }, 2000);
        return;
      }

      // Network error
      if (err.isNetworkError || !err.status) {
        toast.error('Unable to connect to server. Please check your internet connection.');
        return;
      }

      // Backend already sends specific error messages
      const message = err.message || 'Login failed. Please try again.';
      toast.error(message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic client-side validation
    if (!registerName || !registerEmail || !registerPassword || !studentId) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (registerName.trim().length < 2) {
      toast.error('Name must be at least 2 characters long');
      return;
    }

    // ESILV email validation
    if (!registerEmail.endsWith('@edu.devinci.fr') && !registerEmail.endsWith('@devinci.fr')) {
      toast.error('Please use your ESILV email (@edu.devinci.fr or @devinci.fr)');
      return;
    }

    // Student ID validation (7-digit badge number format)
    if (!/^\d{7}$/.test(studentId)) {
      toast.error('Student ID must be exactly 7 digits (e.g., 7277000)');
      return;
    }

    if (registerPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      const result = await registerMutation.mutateAsync({
        name: registerName.trim(),
        email: registerEmail.toLowerCase().trim(),
        password: registerPassword,
        university: 'ESILV',
        studentId: studentId,
      });

      // Check if email verification is required
      if (result.verificationRequired) {
        toast.success('Registration successful! Check your email to verify your account.');
        navigate(`/verification-pending?email=${encodeURIComponent(registerEmail)}`);
      } else {
        toast.success(`Welcome ${registerName}! Your account has been created.`);
        setTimeout(() => navigate('/'), 500);
      }
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number; isNetworkError?: boolean };
      console.error('Registration error:', err);

      // Network error
      if (err.isNetworkError || !err.status) {
        toast.error('Unable to connect to server. Please check your internet connection.');
        return;
      }

      // Backend already sends specific error messages
      const message = err.message || 'Registration failed. Please try again.';
      toast.error(message); // Will show "Student ID already registered", "Email already exists", etc.
    }
  };

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <img src={esilvLogo} alt="ESILV" className="h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-heading font-bold mb-2">Welcome to ESILV Marketplace</h1>
            <p className="text-muted-foreground">
              Sign in with your ESILV credentials or create a new account.
            </p>
          </div>

          {/* Auth Tabs */}
          <div className="bg-card rounded-xl border border-border/50 p-6">
            <Tabs defaultValue="login" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your.name@edu.devinci.fr"
                        className="pl-10"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox id="remember" />
                      <label
                        htmlFor="remember"
                        className="text-sm text-muted-foreground cursor-pointer"
                      >
                        Remember me
                      </label>
                    </div>
                    <Link to="/help" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>

                  <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="John Doe"
                        className="pl-10"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">ESILV Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="your.name@edu.devinci.fr"
                        className="pl-10"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Use your official ESILV email (@edu.devinci.fr)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-student-id">Student ID (Badge Number)</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-student-id"
                        type="text"
                        placeholder="7277000"
                        className="pl-10"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        maxLength={7}
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter your 7-digit badge number from your student ID card
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a secure password"
                        className="pl-10 pr-10"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox id="terms" required />
                    <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                      I agree to the Terms of Service and Privacy Policy
                    </label>
                  </div>

                  <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                    {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          {/* Help */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Need help?{' '}
            <Link to="/help" className="text-primary hover:underline">
              Visit our Help Center
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
