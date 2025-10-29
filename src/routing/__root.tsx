import * as React from 'react';
import { Outlet, useRouterState } from '@tanstack/react-router';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuth } from '../services/auth/useAuth';
import { SEOHead } from '../components/seo/SEOHead';

export const RootLayout: React.FC = () => {
  const { user } = useAuth();
  const { location } = useRouterState();
  const currentPath = location.pathname;

  // 🧭 Détermination du titre courant
  const getPageTitle = () => {
    switch (currentPath) {
      case '/app/dashboard':
        return 'Tableau de bord';
      case '/app/scenarios':
        return 'Scénarios';
      case '/app/sessions':
        return 'Sessions';
      case '/app/pricing':
        return 'Tarifs';
      case '/app/settings':
        return 'Paramètres';
      case '/app/success':
        return 'Paiement réussi';
      case '/':
        return 'CandiVoc';
      default:
        if (currentPath.startsWith('/app/chat/')) return 'Chat';
        if (currentPath.startsWith('/app/session/')) return 'Session';
        if (currentPath === '/config-error') return 'Erreur de configuration';
        return '';
    }
  };

  const title = getPageTitle();

  // Si l'utilisateur n'est pas authentifié, afficher juste le outlet sans sidebar
  if (!user) {
    return (
      <>
        <SEOHead title={title} />
        <Outlet />
      </>
    );
  }

  return (
    <>
      <SEOHead title={title} />
      <div className="flex h-screen bg-[var(--bg-app)] text-[var(--text-primary)]">
        {/* Barre latérale */}
        <Sidebar />

        {/* Contenu principal */}
        <main className="flex-1 overflow-auto pb-16 md:pb-0 md:p-6 transition-all duration-300 relative">
          {/* 🟠 Header mobile fixe */}
          <header
            className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-center h-14 font-semibold text-base border-b border-[var(--border-color)]"
            style={{
              background: 'linear-gradient(90deg, #2a2a2a, #1f1f1f)',
              color: 'var(--text-primary)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}
          >
            {title || 'CandiVoc'}
          </header>

          {/* 🧱 Contenu (avec padding top mobile pour ne pas passer sous le header) */}
          <div className="pt-16 md:pt-0 px-4 md:px-0">
            <header className="hidden md:flex mb-4 border-b border-[var(--border-color)] pb-2">
              <h1 className="text-xl font-semibold">{title}</h1>
            </header>

            <Outlet />

            <footer className="mt-10 text-xs text-[var(--text-secondary)] text-center">
              © {new Date().getFullYear()} CandiVoc — v{import.meta.env.VITE_APP_VERSION || 'dev'}
            </footer>
          </div>
        </main>
      </div>
    </>
  );
};