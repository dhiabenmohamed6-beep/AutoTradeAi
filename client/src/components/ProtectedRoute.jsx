import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Force users to subscribe if their trial is expired and they don't have an active subscription
  const isAdmin = user.role === 'admin';
  const hasActiveSub = user.subscription?.active;
  const now = new Date();
  const trialExpired = user.trialExpiresAt ? new Date(user.trialExpiresAt) < now : true;

  if (!isAdmin && trialExpired && !hasActiveSub && location.pathname !== '/subscription') {
    return <Navigate to="/subscription" />;
  }

  return children;
};

export default ProtectedRoute;
