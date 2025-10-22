import React, { useState, useEffect } from 'react';
import { Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/auth/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [searchParams] = useSearchParams();
  const { user, login, loading, error, isAuthenticated } = useAuth();
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // État local pour le loading
  const navigate = useNavigate();

  // Debug pour suivre l'état de l'authentification
  useEffect(() => {
    console.log('🔍 Login state debug:', {
      hasUser: !!user,
      userEmail: user?.email,
      isAuthenticated,
      loading,
      isSubmitting,
      loginAttempted,
      error: error?.substring(0, 50)
    });
  }, [user, isAuthenticated, loading, isSubmitting, loginAttempted, error]);

  // Pré-remplir l'email si venant de l'inscription
  useEffect(() => {
    const emailFromUrl = searchParams.get('email');
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginAttempted(true);
    setIsSubmitting(true); // Activer le loading local

    try {
      await login(email, password);
      // Forcer la redirection après un court délai pour laisser le temps à l'état de se mettre à jour
      setTimeout(() => {
        console.log('🔄 Timeout redirection - State check:', {
          hasUser: !!user,
          isAuthenticated,
          loading
        });
        if (user || isAuthenticated) {
          console.log('🚀 Redirection forcée vers dashboard');
          navigate('/dashboard', { replace: true });
        }
      }, 1000);
    } catch (error) {
      console.error('❌ Login failed:', error);
    } finally {
      setIsSubmitting(false); // Désactiver le loading local
    }
  };

  // Surveiller les changements après tentative de login
  useEffect(() => {
    console.log('🔍 useEffect check:', { loginAttempted, isAuthenticated, loading, hasUser: !!user });
    if (loginAttempted && isAuthenticated && !loading) {
      console.log('✅ Redirection vers le dashboard - Authenticated:', user?.email);
      navigate('/dashboard', { replace: true });
    }
  }, [loginAttempted, isAuthenticated, loading, navigate, user]);

  if (isAuthenticated) {
    console.log('🚀 Redirection immédiate - User already authenticated:', user?.email);
    return <Navigate to="/dashboard" replace />;
  }

  // Alternative: Si on a un user mais isAuthenticated est false (désynchronisation)
  if (user && !isAuthenticated ) {
    console.log('⚠️ Désynchronisation détectée - User existe mais isAuthenticated est false:', user.email);
    // Forcer la redirection quand même
    return <Navigate to="/dashboard" replace />;
  }

  // Plus d'écran de loading initial - le formulaire est visible immédiatement

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            CandiVoc
          </h1>
          <p className="mt-2 text-gray-600">
            {searchParams.get('registered') === 'true'
              ? 'Votre compte a été créé ! Entrez votre mot de passe pour vous connecter'
              : 'Connexion à votre espace'
            }
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Adresse email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="vous@email.com"
              autoFocus={searchParams.get('email') ? false : true}
            />

            <Input
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              autoFocus={searchParams.get('email') ? true : false}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="gray"
              className="w-full"
              disabled={isSubmitting} // Utiliser seulement l'état local de soumission
            >
              {isSubmitting ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Pas de compte ?{' '}
              <a
                href="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Créer un compte
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
