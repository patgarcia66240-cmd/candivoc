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
import { cn } from '../../utils/cn';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
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
    href: '/tarifs',
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
    <div className="bg-gradient-to-r from-slate-400/40 via-slate-200/70 to-slate-400/30 dark:from-gray-800/90 dark:via-gray-900/90 dark:to-gray-800/90 h-full w-64 shadow-2xl border-r border-slate-400/50 dark:border-gray-700 backdrop-blur-sm transition-colors">
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center h-16 border-b border-slate-400/30 dark:border-gray-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white [text-shadow:_0_1px_2px_rgb(255_255_255_/_0.5)] dark:[text-shadow:_0_1px_2px_rgb(0_0_0_/_0.5)]">CandiVoc</h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 group',
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-slate-500/40 to-slate-300/40 dark:from-blue-600/40 dark:to-blue-800/40 text-slate-700 dark:text-white border-r-4 border-slate-800 dark:border-blue-400 shadow-xl [text-shadow:_0_2px_4px_rgb(255_255_255_/_0.9)] dark:[text-shadow:_0_2px_4px_rgb(0_0_0_/_0.9)] backdrop-blur-sm'
                      : 'text-slate-800 dark:text-gray-300 hover:bg-gradient-to-r hover:from-slate-500/30 hover:to-slate-600/30 dark:hover:from-blue-600/30 dark:hover:to-blue-700/30 hover:text-slate-900 dark:hover:text-white [text-shadow:_0_2px_4px_rgb(255_255_255_/_0.7)] dark:[text-shadow:_0_2px_4px_rgb(0_0_0_/_0.7)] hover:shadow-lg'
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Section */}
        <div className="px-4 py-4 border-t border-slate-500/30 dark:border-gray-600 bg-gradient-to-r from-slate-400/20 to-slate-500/20 dark:from-gray-700/30 dark:to-gray-800/30 backdrop-blur-sm">
          <div className="flex items-center p-3 bg-white/20 dark:bg-gray-800/50 rounded-xl shadow-lg">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 dark:from-blue-600 dark:to-blue-700 rounded-full flex items-center justify-center shadow-xl">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate [text-shadow:_0_1px_2px_rgb(255_255_255_/_0.9)] dark:[text-shadow:_0_1px_2px_rgb(0_0_0_/_0.9)]">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-slate-700 dark:text-gray-300 truncate [text-shadow:_0_1px_1px(rgb(255_255_255_/_0.7)] dark:[text-shadow:_0_1px_1px(rgb(0_0_0_/_0.7)]">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 space-y-3">
            <Link
              to="/settings"
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-slate-800 dark:text-gray-200 bg-white/30 dark:bg-gray-700/50 hover:bg-white/50 dark:hover:bg-gray-600/50 rounded-xl transition-all duration-300 [text-shadow:_0_1px_2px(rgb(255_255_255_/_0.8)] dark:[text-shadow:_0_1px_2px(rgb(0_0_0_/_0.8)] shadow-lg hover:shadow-xl border border-slate-400/30 dark:border-gray-600/30"
            >
              <Settings className="w-4 h-4 mr-3" />
              Paramètres
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50/80 dark:bg-red-900/50 hover:bg-gray-100/80 dark:hover:bg-red-800/50 rounded-xl transition-all duration-300 [text-shadow:_0_1px_2px(rgb(255_255_255_/_0.9)] dark:[text-shadow:_0_1px_2px(rgb(0_0_0_/_0.9)] shadow-lg hover:shadow-xl border border-red-200/50 dark:border-red-600/50"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
