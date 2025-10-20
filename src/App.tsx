import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './services/auth/authContext';
import { Login } from './pages/Login';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Scenarios } from './pages/Scenarios';
import { Sessions } from './pages/Sessions';
import { SessionPage } from './pages/Session';
import { Settings } from './pages/Settings';
import { Chat } from './pages/Chat';
import { ConfigError } from './pages/ConfigError';
import { Layout } from './components/ui/Layout';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  // Debug pour voir ce que PrivateRoute voit
  console.log('🛡️ PrivateRoute check:', {
    isAuthenticated,
    loading,
    hasUser: !!user,
    userEmail: user?.email
  });

  if (loading) {
    console.log('🔄 PrivateRoute - Loading, affichage spinner');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600">Chargement de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    console.log('✅ PrivateRoute - Authentifié, affichage Dashboard');
    return <Layout>{children}</Layout>;
  } else {
    console.log('❌ PrivateRoute - Non authentifié, redirection vers login');
    return <Navigate to="/login" replace />;
  }
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/scenarios"
        element={
          <PrivateRoute>
            <Scenarios />
          </PrivateRoute>
        }
      />
      <Route
        path="/sessions"
        element={
          <PrivateRoute>
            <Sessions />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        }
      />
      <Route
        path="/chat/:sessionId"
        element={
          <PrivateRoute>
            <Chat />
          </PrivateRoute>
        }
      />
      <Route
        path="/session/:sessionId"
        element={
          <PrivateRoute>
            <SessionPage />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Landing />} />
    </Routes>
  );
};

const ConfigChecker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const isUrlMissing = !supabaseUrl || supabaseUrl === 'votre_supabase_url';
  const isKeyMissing = !supabaseKey || supabaseKey === 'votre_supabase_anon_key';
  const hasConfigIssues = isUrlMissing || isKeyMissing;

  if (hasConfigIssues) {
    return <ConfigError />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ConfigChecker>
      <AuthProvider>
        <Router>
          <div className="App">
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </ConfigChecker>
  );
}

export default App
