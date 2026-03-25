import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';
import api from './lib/axios';

import LoginPage from './features/auth/pages/LoginPage';
import SignupPage from './features/auth/pages/SignupPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import SubscriptionPage from './features/subscription/pages/SubscriptionPage';
import PaymentSuccess from './features/subscription/pages/PaymentSuccess';
import PaymentCancelled from './features/subscription/pages/PaymentCancelled';
import LeaderboardPage from './features/scores/pages/LeaderboardPage';
import DrawsPage from './features/draws/pages/DrawsPage';
import CharitiesPage from './features/charities/pages/CharitiesPage';
import WinnersPage from './features/winners/pages/WinnersPage';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import LandingPage from './features/landing/pages/LandingPage';
import ProfilePage from './features/auth/pages/ProfilePage';

// Create a heavily cached QueryClient for snappy UX
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Cache all data for 5 minutes
      refetchOnWindowFocus: false, // Prevent aggressive refetching 
      refetchOnMount: false, // Use cached data instantly when switching tabs
    },
  },
});

// Auth layout (no sidebar)
const AuthLayout = ({ children }) => (
  <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center">
    {children}
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <div className="text-white">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
};

function App() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/auth/profile');
        setUser(res.data.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [setUser, setLoading]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
          <Route path="/signup" element={<AuthLayout><SignupPage /></AuthLayout>} />
          <Route path="/payment-success" element={<AuthLayout><PaymentSuccess /></AuthLayout>} />
          <Route path="/payment-cancelled" element={<AuthLayout><PaymentCancelled /></AuthLayout>} />

          {/* Protected Routes inside DashboardLayout */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><DashboardPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/subscription" element={<ProtectedRoute><DashboardLayout><SubscriptionPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/scores" element={<ProtectedRoute><DashboardLayout><LeaderboardPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/draws" element={<ProtectedRoute><DashboardLayout><DrawsPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/charities" element={<ProtectedRoute><DashboardLayout><CharitiesPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/winners" element={<ProtectedRoute><DashboardLayout><WinnersPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><DashboardLayout><ProfilePage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><DashboardLayout><AdminDashboard /></DashboardLayout></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
      {/* Global Toast Notifications */}
      <Toaster position="top-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
    </QueryClientProvider>
  );
}

export default App;

