'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
type EffectiveTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: EffectiveTheme;
  prefersReducedMotion: boolean;
  hasError: boolean;
  isSupported: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>('dark');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  // Check browser support for theme features
  useEffect(() => {
    try {
      // Check CSS custom properties support
      const testElement = document.createElement('div');
      testElement.style.setProperty('--test-prop', 'test');
      const supportsCustomProperties = testElement.style.getPropertyValue('--test-prop') === 'test';
      
      // Check localStorage support
      let supportsLocalStorage = false;
      try {
        localStorage.setItem('theme-support-test', 'test');
        localStorage.removeItem('theme-support-test');
        supportsLocalStorage = true;
      } catch {
        supportsLocalStorage = false;
      }

      // Check matchMedia support
      const supportsMatchMedia = typeof window.matchMedia === 'function';

      const fullSupport = supportsCustomProperties && supportsMatchMedia;
      setIsSupported(fullSupport);

      if (!fullSupport) {
        console.warn('Limited theme support detected:', {
          customProperties: supportsCustomProperties,
          localStorage: supportsLocalStorage,
          matchMedia: supportsMatchMedia
        });
        applyFallbackTheme();
      }
    } catch (error) {
      console.error('Error checking theme support:', error);
      setHasError(true);
      setIsSupported(false);
      applyFallbackTheme();
    }
  }, []);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    if (!isSupported) return;
    
    try {
      const stored = localStorage.getItem('theme') as Theme;
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        setTheme(stored);
      } else {
        // Default to system preference
        setTheme('system');
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
      setTheme('system');
      setHasError(true);
    }
  }, [isSupported]);

  // Update effective theme based on theme setting and system preference
  useEffect(() => {
    if (!isSupported) return;

    try {
      const updateEffectiveTheme = () => {
        if (theme === 'system') {
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setEffectiveTheme(systemPrefersDark ? 'dark' : 'light');
        } else {
          setEffectiveTheme(theme as EffectiveTheme);
        }
      };

      updateEffectiveTheme();

      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        if (theme === 'system') {
          updateEffectiveTheme();
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch (error) {
      console.error('Error updating theme:', error);
      setHasError(true);
      // Fallback to light theme
      setEffectiveTheme('light');
    }
  }, [theme, isSupported]);

  // Monitor reduced motion preference
  useEffect(() => {
    try {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      // Set initial value
      setPrefersReducedMotion(mediaQuery.matches);

      // Listen for changes
      const handleChange = (event: MediaQueryListEvent) => {
        setPrefersReducedMotion(event.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch (error) {
      console.warn('Failed to monitor reduced motion preference:', error);
      // Default to false (no reduced motion)
      setPrefersReducedMotion(false);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    try {
      const root = document.documentElement;
      
      if (effectiveTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      // Apply reduced motion class
      if (prefersReducedMotion) {
        root.classList.add('reduce-motion');
      } else {
        root.classList.remove('reduce-motion');
      }

      // Clear any error states if theme application succeeds
      if (hasError) {
        setHasError(false);
      }
    } catch (error) {
      console.error('Failed to apply theme to document:', error);
      setHasError(true);
      applyFallbackTheme();
    }
  }, [effectiveTheme, prefersReducedMotion, hasError]);

  // Apply fallback theme for unsupported browsers
  const applyFallbackTheme = () => {
    try {
      const root = document.documentElement;
      root.classList.add('theme-fallback');
      
      // Inject fallback CSS if not already present
      if (!document.getElementById('theme-fallback-styles')) {
        const style = document.createElement('style');
        style.id = 'theme-fallback-styles';
        style.textContent = `
          .theme-fallback {
            --fallback-bg: #ffffff;
            --fallback-text: #000000;
            --fallback-border: #e5e7eb;
            --fallback-accent: #3b82f6;
            --fallback-muted: #f3f4f6;
            --fallback-muted-text: #6b7280;
          }
          .theme-fallback body {
            background-color: var(--fallback-bg);
            color: var(--fallback-text);
          }
          .theme-fallback .bg-card {
            background-color: var(--fallback-bg);
            border: 1px solid var(--fallback-border);
          }
          .theme-fallback .bg-muted {
            background-color: var(--fallback-muted);
          }
          .theme-fallback .text-foreground {
            color: var(--fallback-text);
          }
          .theme-fallback .text-muted-foreground {
            color: var(--fallback-muted-text);
          }
          .theme-fallback .border-border {
            border-color: var(--fallback-border);
          }
        `;
        document.head.appendChild(style);
      }
    } catch (error) {
      console.error('Failed to apply fallback theme:', error);
    }
  };

  // Persist theme preference
  const handleSetTheme = (newTheme: Theme) => {
    if (!isSupported) {
      console.warn('Theme changes not supported in this browser');
      return;
    }

    setTheme(newTheme);
    try {
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.warn('Failed to persist theme preference:', error);
      setHasError(true);
    }
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      handleSetTheme('dark');
    } else if (theme === 'dark') {
      handleSetTheme('system');
    } else {
      handleSetTheme('light');
    }
  };

  const resetTheme = () => {
    try {
      // Clear localStorage
      localStorage.removeItem('theme');
      
      // Reset to system preference
      setTheme('system');
      setHasError(false);
      
      // Remove fallback classes
      const root = document.documentElement;
      root.classList.remove('theme-fallback');
      
      // Remove fallback styles
      const fallbackStyles = document.getElementById('theme-fallback-styles');
      if (fallbackStyles) {
        fallbackStyles.remove();
      }
    } catch (error) {
      console.error('Failed to reset theme:', error);
    }
  };

  const value: ThemeContextType = {
    theme,
    effectiveTheme,
    prefersReducedMotion,
    hasError,
    isSupported,
    setTheme: handleSetTheme,
    toggleTheme,
    resetTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}