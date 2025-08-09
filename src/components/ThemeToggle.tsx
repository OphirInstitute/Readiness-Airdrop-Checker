'use client';

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils/theme';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ThemeToggle({ className, size = 'md', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className={cn('transition-transform', getSizeClasses())} />;
      case 'dark':
        return <Moon className={cn('transition-transform', getSizeClasses())} />;
      case 'system':
        return <Monitor className={cn('transition-transform', getSizeClasses())} />;
      default:
        return <Sun className={cn('transition-transform', getSizeClasses())} />;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-3 w-3';
      case 'md':
        return 'h-4 w-4';
      case 'lg':
        return 'h-5 w-5';
      default:
        return 'h-4 w-4';
    }
  };

  const getButtonClasses = () => {
    const baseClasses = cn(
      'inline-flex items-center justify-center rounded-lg border transition-all duration-200',
      'bg-background-secondary hover:bg-background-tertiary',
      'border-white/10 hover:border-white/20',
      'text-text-secondary hover:text-text-primary',
      'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-background-primary'
    );

    const sizeClasses = {
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base'
    };

    return cn(baseClasses, sizeClasses[size]);
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light mode';
      case 'dark':
        return 'Dark mode';
      case 'system':
        return 'System theme';
      default:
        return 'Toggle theme';
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        onClick={toggleTheme}
        className={getButtonClasses()}
        aria-label={getLabel()}
        title={getLabel()}
      >
        {getIcon()}
      </button>
      {showLabel && (
        <span className="text-sm text-text-secondary font-medium">
          {getLabel()}
        </span>
      )}
    </div>
  );
}