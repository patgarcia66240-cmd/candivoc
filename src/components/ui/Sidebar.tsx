import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  List,
  MessageSquare,
  User,
  Settings,
  LogOut,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../services/auth/useAuth';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

const sidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    label: 'Scénarios',
    href: '/scenarios',
    icon: List,
  },
  {
    label: 'Sessions',
    href: '/sessions',
    icon: MessageSquare,
  },
  {
    label: 'Tarifs',
    href: '/pricing',
    icon: CreditCard,
  },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div
      className="h-full w-64 transition-all duration-300 flex flex-col"
      style={{
        background: 'var(--bg-primary)',
        borderRight: `1px solid var(--border-color)`
      }}
    >
      {/* Logo/Brand */}
      <div
        className="h-16 flex items-center justify-center border-b transition-all duration-300"
        style={{
          borderColor: 'var(--border-color)',
          background: 'var(--bg-secondary)'
        }}
      >
        <img
          src="/images/logo.png"
          alt="CandiVoc"
          className="h-10"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6">
        <ul className="space-y-1">
          {sidebarItems.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className="flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-300 group"
                style={{
                  background: isActive(item.href)
                    ? 'linear-gradient(135deg, rgba(251, 146, 60, 0.1), rgba(249, 115, 22, 0.2))'
                    : 'transparent',
                  color: isActive(item.href)
                    ? 'var(--text-primary)'
                    : 'var(--text-secondary)',
                  border: isActive(item.href)
                    ? '1px solid rgba(251, 146, 60, 0.3)'
                    : '1px solid transparent',
                  borderLeft: isActive(item.href)
                    ? '3px solid rgba(251, 146, 60, 0.8)'
                    : '3px solid transparent',
                  boxShadow: isActive(item.href)
                    ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    : 'none',
                  transform: isActive(item.href) ? 'scale(1.02)' : 'scale(1)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.href)) {
                    e.currentTarget.style.background = 'var(--hover-bg)';
                    e.currentTarget.style.borderColor = 'var(--hover-border)';
                    e.currentTarget.style.color = 'var(--hover-color)';
                    e.currentTarget.style.transform = 'scale(1.01)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.href)) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                <item.icon
                  className="w-5 h-5 mr-3 transition-all duration-300"
                  style={{
                    color: isActive(item.href)
                      ? '#ff8c00'
                      : 'var(--text-secondary)'
                  }}
                />
                <span className="transition-all duration-300">
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Section */}
      <div
        className="px-3 py-4 border-t"
        style={{
          borderColor: 'var(--border-color)',
          background: 'var(--bg-secondary)'
        }}
      >
        <div
          className="flex items-center p-3 rounded-xl transition-all duration-300"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="shrink-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #fb923c, #f97316)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p
              className="text-sm font-semibold truncate transition-all duration-300"
              style={{
                color: 'var(--text-primary)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
              }}
            >
              {user?.first_name} {user?.last_name}
            </p>
            <p
              className="text-xs truncate transition-all duration-300"
              style={{
                color: 'var(--text-secondary)'
              }}
            >
              {user?.email}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 space-y-2">
          <Link
            to="/settings"
            className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 group"
            style={{
              color: 'var(--text-secondary)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--hover-bg)';
              e.currentTarget.style.borderColor = 'var(--hover-border)';
              e.currentTarget.style.color = 'var(--hover-color)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <Settings className="w-4 h-4 mr-3 transition-all duration-300" />
            Paramètres
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 group"
            style={{
              color: 'var(--text-secondary)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <LogOut className="w-4 h-4 mr-3 transition-all duration-300" />
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
};
