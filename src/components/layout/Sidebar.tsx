import React from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import {
  Home,
  List,
  MessageSquare,
  User,
  Settings,
  LogOut,
  CreditCard,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../services/auth/useAuth';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sidebarItems: SidebarItem[] = [
  { label: 'Dashboard', href: '/app/dashboard', icon: Home },
  { label: 'Scénarios', href: '/app/scenarios', icon: List },
  { label: 'Sessions', href: '/app/sessions', icon: MessageSquare },
  { label: 'Tarifs', href: '/app/pricing', icon: CreditCard },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { location } = useRouterState();
  const [isOpen, setIsOpen] = React.useState(false);
  const currentPath = location.pathname;

  const isActive = (href: string) => currentPath === href;

  // 🎯 Ferme le menu auto après navigation sur mobile
  React.useEffect(() => {
    if (isOpen) setIsOpen(false);
  }, [currentPath]);

  return (
    <>
      {/* Bouton hamburger visible seulement sur mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-orange-500 text-white p-2 rounded-lg shadow-md"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay semi-transparent sur mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 z-50 h-full w-64 flex flex-col transform bg-[var(--bg-primary)] border-r border-[var(--border-color)] transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div
          className="h-16 flex items-center justify-center border-b"
          style={{
            borderColor: 'var(--border-color)',
            background: 'var(--bg-secondary)',
          }}
        >
          <img src="/images/logo.png" alt="CandiVoc" className="h-10" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          <ul className="space-y-1">
            {sidebarItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-orange-100/20 text-orange-600 border border-orange-300 shadow-sm scale-[1.02]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--hover-color)]'
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 mr-3 ${
                      isActive(item.href)
                        ? 'text-orange-500'
                        : 'text-[var(--text-secondary)]'
                    }`}
                  />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User info + actions */}
        <div
          className="px-3 py-4 border-t"
          style={{
            borderColor: 'var(--border-color)',
            background: 'var(--bg-secondary)',
          }}
        >
          {/* Profil utilisateur */}
          <div
            className="flex items-center p-3 rounded-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #fb923c, #f97316)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            >
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-[var(--text-primary)]">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs truncate text-[var(--text-secondary)]">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 space-y-2">
            <Link
              to="/app/settings"
              className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--hover-color)] transition-all duration-200"
            >
              <Settings className="w-4 h-4 mr-3" />
              Paramètres
            </Link>

            <button
              onClick={logout}
              className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-[var(--text-secondary)] hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};