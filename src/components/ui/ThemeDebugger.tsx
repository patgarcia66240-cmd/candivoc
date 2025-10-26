import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeDebugger: React.FC = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [htmlClasses, setHtmlClasses] = useState<string>('');
  const [bodyClasses, setBodyClasses] = useState<string>('');

  useEffect(() => {
    const updateClasses = () => {
      setHtmlClasses(document.documentElement.className);
      setBodyClasses(document.body.className);
    };

    updateClasses();

    // Écouter les changements de thème
    window.addEventListener('themechange', updateClasses);

    return () => {
      window.removeEventListener('themechange', updateClasses);
    };
  }, [theme]);

  const getContrastColor = (theme: string) => {
    return theme === 'dark' ? 'text-green-400' : 'text-blue-600';
  };

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-w-xs ${getContrastColor(resolvedTheme)}`}>
      <h3 className="font-bold mb-2">🎨 Theme Debugger</h3>
      <div className="text-sm space-y-1 font-mono">
        <div>Theme: <span className="font-bold">{theme}</span></div>
        <div>Resolved: <span className="font-bold">{resolvedTheme}</span></div>
        <div>HTML: <span className="text-xs">{htmlClasses || '(empty)'}</span></div>
        <div>Body: <span className="text-xs">{bodyClasses || '(empty)'}</span></div>
      </div>
      <div className="mt-3 space-y-2">
        <button
          onClick={() => setTheme('light')}
          className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Set Light
        </button>
        <button
          onClick={() => setTheme('dark')}
          className="w-full px-2 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-900"
        >
          Set Dark
        </button>
        <button
          onClick={() => setTheme('system')}
          className="w-full px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Set System
        </button>
      </div>
    </div>
  );
};

export default ThemeDebugger;