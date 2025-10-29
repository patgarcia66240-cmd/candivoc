import React from 'react';
import { Sidebar } from './Sidebar';
import { ThemeToggle } from './ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar />
      <main className="flex-1 overflow-auto" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        {/* Theme Toggle en haut à droite */}
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        {children}
      </main>
    </div>
  );
};
