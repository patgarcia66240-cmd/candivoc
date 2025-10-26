import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggleSimple: React.FC = () => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value as 'light' | 'dark' | 'system');
  };

  return (
    <div className="fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Test Thème</h3>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 dark:text-gray-400">Thème:</span>
          <select
            value={theme}
            onChange={handleThemeChange}
            className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded px-2 py-1"
          >
            <option value="light">Clair</option>
            <option value="dark">Sombre</option>
            <option value="system">Système</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 dark:text-gray-400">Résolu:</span>
          <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {resolvedTheme}
          </span>
        </div>

        <button
          onClick={toggleTheme}
          className="text-xs bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded transition-colors"
        >
          Toggle
        </button>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          Classes: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{`html.${resolvedTheme}`}</code>
        </div>
      </div>
    </div>
  );
};