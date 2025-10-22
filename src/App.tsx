import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './services/auth/authContext';
import { useAuth } from './services/auth/useAuth';
import { ToastProvider } from './contexts/ToastProvider';
import { Login } from './pages/Login';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Scenarios } from './pages/Scenarios';
import { Sessions } from './pages/Sessions';
import { SessionPage } from './pages/Session';
import { Settings } from './pages/Settings';
import { Chat } from './pages/Chat';
import { ConfigErrorSimple } from './pages/ConfigErrorSimple';
import { TestSupabase } from './pages/TestSupabase';
import { Layout } from './components/ui/Layout';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
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
    return <Layout>{children}</Layout>;
  } else {
    return <Navigate to="/login" replace />;
  }
});

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/test-supabase" element={<TestSupabase />} />
      <Route path="/config-error" element={<ConfigErrorSimple />} />
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
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Validation de l'URL plus robuste
    const isValidUrl = (url: string) => {
      if (!url || url.length < 8) return false;
      try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
      } catch {
        return false;
      }
    };

    // Validation plus stricte de l'URL
    const isUrlInvalid = !supabaseUrl ||
                      supabaseUrl === 'votre_supabase_url' ||
                      supabaseUrl.includes('localhost') && !supabaseUrl.includes('http') ||
                      !isValidUrl(supabaseUrl);

    const isKeyMissing = !supabaseKey || supabaseKey === 'votre_supabase_anon_key' || supabaseKey.length < 50;
    const hasConfigIssues = isUrlInvalid || isKeyMissing;

    // Logging pour le debug
    console.log('🔍 ConfigChecker - Configuration check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      isUrlValid: supabaseUrl ? isValidUrl(supabaseUrl) : false,
      isUrlInvalid,
      isKeyMissing,
      hasConfigIssues,
      urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'none',
      keyLength: supabaseKey ? supabaseKey.length : 0
    });

    // Si la configuration est correcte, afficher l'application avec authentification
    if (!hasConfigIssues) {
      console.log('✅ Supabase configuration OK - Loading main app');
      return (
        <ToastProvider>
          <AuthProvider>
            <Router>
              <div className="App">
                {children}
              </div>
            </Router>
          </AuthProvider>
        </ToastProvider>
      );
    }

    // Par défaut, afficher ConfigErrorSimple (si la configuration est incorrecte)
    console.log('❌ Supabase configuration invalid - Showing ConfigErrorSimple');
    return (
      <ToastProvider>
        <Router>
          <div className="App">
            <ConfigErrorSimple />
          </div>
        </Router>
      </ToastProvider>
    );
  } catch (error) {
    console.error('❌ ConfigChecker error:', error);
    // En cas d'erreur dans le ConfigChecker, afficher ConfigErrorSimple par défaut
    return (
      <ToastProvider>
        <Router>
          <div className="App">
            <ConfigErrorSimple />
          </div>
        </Router>
      </ToastProvider>
    );
  }
};

function App() {
  return (
    <ConfigChecker>
      <AppRoutes />
    </ConfigChecker>
  );
}

export default App
