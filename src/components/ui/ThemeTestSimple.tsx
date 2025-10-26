import React, { useEffect } from 'react';

export const ThemeTestSimple: React.FC = () => {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Détecter le thème système au montage
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setTheme(systemTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

    // Appliquer la classe au document
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);

    console.log('Theme changed to:', newTheme);
    console.log('Document classes:', root.className);
  };

  return (
    <div className="fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Test Mode Sombre</h3>

        <div className="text-xs space-y-1">
          <p>Thème actuel: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">{theme}</span></p>
          <p>Document: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">{document.documentElement.className}</span></p>
          <p>System: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">
            {window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'}
          </span></p>
        </div>

        <button
          onClick={toggleTheme}
          className="w-full text-xs bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded transition-colors"
        >
          Basculer vers {theme === 'light' ? 'Sombre 🌙' : 'Clair ☀️'}
        </button>

        {/* Test visuel du thème */}
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-4 h-4 rounded ${theme === 'dark' ? 'bg-gray-900' : 'bg-yellow-300'}`}></div>
          <span className="text-gray-900 dark:text-white">
            {theme === 'dark' ? 'Sombre' : 'Clair'}
          </span>
        </div>
      </div>
    </div>
  );
};