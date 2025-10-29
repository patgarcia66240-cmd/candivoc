import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../services/auth/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { OAuthButtons } from '../components/ui/OAuthButtons';
import { supabase } from '../services/supabase/client';

export const Landing: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { user, login, register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Debug pour suivre l'état sur la landing
  useEffect(() => {
    console.log('🏠 Landing state:', {
      hasUser: !!user,
      loading,
      isSubmitting,
      email,
      hasPassword: !!password
    });
  }, [user, loading, isSubmitting, email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsSubmitting(true);

    console.log('🔑 Landing - Tentative de connexion:', { email, isLogin });

    try {
      if (isLogin) {
        await login(email, password);

        // FORCER LA REDIRECTION après un court délai pour contourner le problème
        setTimeout(() => {
          console.log('🚀 FORCAGE REDIRECTION vers dashboard (TanStack Router)');
          navigate({ to: '/app/dashboard' });
        }, 500);
      } else {
        await register(email, password, 'John', 'Doe', 'user');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'linkedin_oidc' | 'github') => {
    try {
      if (!supabase) {
        console.error('❌ Supabase client is not initialized.');
        return;
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/app/dashboard`,
        },
      });
      if (error) throw error;
      console.log('🔑 OAuth login triggered:', provider, data);
    } catch (err) {
      console.error('❌ OAuth login error:', err);
    }
  };

  if (user) {
    console.log('🚀 Landing - Redirection vers dashboard (TanStack Router) - User:', user.email);
    return <div>Redirection vers dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 to-secondary-100 dark:from-gray-900 dark:to-gray-800 transition-colors">

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          {/* Hero Section */}
          <div className="flex flex-col">
            <div
              className="relative overflow-hidden rounded-2xl shadow-2xl flex-1"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <img
                src={isHovered ? "/images/landing2.png" : "/images/landing.png"}
                alt="Préparez-vous aux entretiens d'embauche avec l'IA"
                className="w-full h-full object-cover transition-all duration-500 ease-in-out transform hover:scale-105"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-3xl font-bold text-primary-600 mb-2">50+</div>
                  <div className="text-secondary-600">Scénarios d'entretien</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-3xl font-bold text-primary-600 mb-2">AI</div>
                  <div className="text-secondary-600">Feedback intelligent</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-3xl font-bold text-primary-600 mb-2">24/7</div>
                  <div className="text-secondary-600">Entraînement flexible</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg mt-8">
              <h3 className="text-lg font-semibold mb-3">Pourquoi CandiVoc ?</h3>
              <ul className="space-y-2 text-secondary-600">
                <li className="flex items-center">
                  <span className="text-success-500 mr-2">✓</span>
                  Pratique du français professionnel
                </li>
                <li className="flex items-center">
                  <span className="text-success-500 mr-2">✓</span>
                  Simulation d'entretiens réels
                </li>
                <li className="flex items-center">
                  <span className="text-success-500 mr-2">✓</span>
                  Retour détaillé sur vos réponses
                </li>
              </ul>
            </div>
          </div>

          {/* Login/Signup Form */}
          <div className="lg:pl-8 flex flex-col">
            <div className="bg-white rounded-2xl p-8 shadow-xl flex-1 flex flex-col justify-center">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {isLogin ? 'Connexion' : 'Inscription'}
                </h2>
                <p className="text-gray-600">
                  {isLogin
                    ? 'Accédez à votre compte CandiVoc'
                    : 'Créez votre compte et commencez l\'entraînement'
                  }
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                  label="Adresse email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="vous@email.com"
                  className="text-lg"
                />

                <Input
                  label="Mot de passe"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="text-lg"
                />

                {error && (
                  <div className="bg-error-50 border border-error-200 rounded-lg p-4">
                    <p className="text-sm text-error-600">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full py-4 text-lg font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Chargement...
                    </span>
                  ) : (
                    isLogin ? 'Se connecter' : 'S\'inscrire'
                  )}
                </Button>
              </form>

              {/* --- Bloc OAuth --- */}
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Ou continuez avec</span>
                  </div>
                </div>

                <div className="mt-6">
                  <OAuthButtons onOAuthLogin={handleOAuthLogin} />
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                >
                  {isLogin
                    ? 'Pas de compte ? Inscrivez-vous'
                    : 'Déjà un compte ? Connectez-vous'}
                </button>
              </div>

              {/* Demo account info */}
              <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                <p className="text-sm text-primary-800">
                  <strong>Pas de compte ?</strong><br />
                  Essayez notre version d'essai gratuite<br />
                  ou <span
                  onClick={() => window.location.href = 'mailto:contact@candivoc.com'}
                  className="text-gray-600 hover:text-gray-800 underline font-bold cursor-pointer"
                >
                  contactez-nous
                </span> pour une démo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
