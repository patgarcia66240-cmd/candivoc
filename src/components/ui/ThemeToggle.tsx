import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  variant?: 'toggle' | 'dropdown';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  variant = 'toggle'
}) => {
  const { theme, resolvedTheme, setTheme } = useTheme();

  if (variant === 'dropdown') {
    return (
      <div className={`relative group ${className}`}>
        <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          {resolvedTheme === 'dark' ? (
            <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          ) : (
            <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          )}
        </button>

        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="p-2">
            <button
              onClick={() => setTheme('light')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                theme === 'light'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>Clair</span>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                theme === 'dark'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>Sombre</span>
            </button>

            <button
              onClick={() => setTheme('system')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                theme === 'system'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Système</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Version toggle simple
  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${className}`}
      aria-label={`Basculer vers le mode ${resolvedTheme === 'dark' ? 'clair' : 'sombre'}`}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-gray-700" />
      )}
    </button>
  );
};

export default ThemeToggle;