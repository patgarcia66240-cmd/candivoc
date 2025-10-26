import React from 'react';
import { Sidebar } from './Sidebar';
import { ThemeToggle } from './ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {/* Theme Toggle en haut à droite */}
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle variant="dropdown" />
        </div>
        {children}
      </main>
    </div>
  );
};
