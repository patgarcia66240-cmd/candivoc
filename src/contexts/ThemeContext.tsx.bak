import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // RÃ©cupÃ©rer le thÃ¨me depuis localStorage ou utiliser system
    const saved = localStorage.getItem('theme') as Theme;
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      return saved;
    }
    return 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Appliquer le thÃ¨me au document et dÃ©tecter le thÃ¨me systÃ¨me
  useEffect(() => {
    const updateTheme = () => {
      let actualTheme: 'light' | 'dark';

      if (theme === 'system') {
        actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        actualTheme = theme as 'light' | 'dark';
      }

      setResolvedTheme(actualTheme);

      // Appliquer les classes au document
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(actualTheme);

      // Mettre Ã  jour les meta tags pour le thÃ¨me
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute('content', actualTheme === 'dark' ? '#1f2937' : '#ffffff');
      } else {
        const newMeta = document.createElement('meta');
        newMeta.name = 'theme-color';
        newMeta.content = actualTheme === 'dark' ? '#1f2937' : '#ffffff';
        document.head.appendChild(newMeta);
      }

      console.log('ðŸŽ¨ Theme Update - Theme:', theme, 'â†’ Actual:', actualTheme, 'â†’ Classes:', root.className);
    };

    updateTheme();

    // Ã‰couter les changements de prÃ©fÃ©rence systÃ¨me
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => updateTheme();

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleTheme = () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
