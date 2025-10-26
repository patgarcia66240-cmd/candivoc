import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gray' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    primary: 'cursor-pointer bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'cursor-pointer bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
    outline: 'cursor-pointer border border-secondary-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-secondary-700 dark:text-gray-300 hover:bg-secondary-50 dark:hover:bg-gray-700 focus:ring-primary-500 hover:bg-gray-500 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white',
    ghost: 'cursor-pointer text-secondary-700 dark:text-gray-300 hover:bg-secondary-100 dark:hover:bg-gray-800 focus:ring-secondary-500',
    gray: 'cursor-pointer bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    gradient: 'cursor-pointer bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700 dark:from-blue-600 dark:via-blue-700 dark:to-blue-800 text-white hover:from-slate-600 hover:via-slate-700 hover:to-slate-800 dark:hover:from-blue-700 dark:hover:via-blue-800 dark:hover:to-blue-900 focus:ring-slate-500 dark:focus:ring-blue-500 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 [text-shadow:_0_2px_4px_rgb(0_0_0_/_0.6)] border border-slate-400/20 dark:border-blue-400/20'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
