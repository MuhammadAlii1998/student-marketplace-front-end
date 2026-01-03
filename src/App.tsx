import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Sell from './pages/Sell';
import Profile from './pages/Profile';
import Category from './pages/Category';
import Login from './pages/Login';
import About from './pages/About';
import Help from './pages/Help';
import NotFound from './pages/NotFound';
import VerificationPending from './pages/VerificationPending';
import VerifyEmail from './pages/VerifyEmail';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/category/:slug" element={<Category />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/help" element={<Help />} />
          <Route path="/verification-pending" element={<VerificationPending />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
