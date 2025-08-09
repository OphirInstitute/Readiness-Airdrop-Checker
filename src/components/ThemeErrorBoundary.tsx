'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary specifically for theme-related errors
 * Provides fallback styling when theme system fails
 */
export class ThemeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error for debugging
    console.error('Theme Error Boundary caught an error:', error, errorInfo);
    
    // Apply fallback theme classes to document
    this.applyFallbackTheme();
  }

  private applyFallbackTheme() {
    try {
      const root = document.documentElement;
      
      // Remove any existing theme classes
      root.classList.remove('dark', 'light', 'reduce-motion');
      
      // Apply basic fallback styles
      root.style.setProperty('--fallback-bg', '#ffffff');
      root.style.setProperty('--fallback-text', '#000000');
      root.style.setProperty('--fallback-border', '#e5e7eb');
      root.style.setProperty('--fallback-accent', '#3b82f6');
      
      // Add fallback theme class
      root.classList.add('theme-fallback');
      
      // Inject fallback CSS if not already present
      if (!document.getElementById('theme-fallback-styles')) {
        const style = document.createElement('style');
        style.id = 'theme-fallback-styles';
        style.textContent = `
          .theme-fallback {
            background-color: var(--fallback-bg) !important;
            color: var(--fallback-text) !important;
          }
          .theme-fallback * {
            border-color: var(--fallback-border) !important;
          }
          .theme-fallback button {
            background-color: var(--fallback-accent) !important;
            color: white !important;
          }
          .theme-fallback .bg-card {
            background-color: white !important;
            border: 1px solid var(--fallback-border) !important;
          }
          .theme-fallback .text-foreground {
            color: var(--fallback-text) !important;
          }
          .theme-fallback .text-muted-foreground {
            color: #6b7280 !important;
          }
        `;
        document.head.appendChild(style);
      }
    } catch (fallbackError) {
      console.error('Failed to apply fallback theme:', fallbackError);
    }
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-white text-black p-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg 
                    className="w-8 h-8 text-red-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Theme System Error
                </h1>
                <p className="text-gray-600 mb-6">
                  There was an error loading the theme system. The application is running in fallback mode with basic styling.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h2 className="font-semibold text-gray-900 mb-2">What happened?</h2>
                <p className="text-sm text-gray-600 mb-2">
                  The theme system encountered an error and couldn't load properly. This might be due to:
                </p>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>Browser compatibility issues</li>
                  <li>Local storage access problems</li>
                  <li>CSS custom property support issues</li>
                  <li>JavaScript execution errors</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reload Page
                </button>
                <p className="text-sm text-gray-500">
                  Reloading the page may resolve the issue.
                </p>
              </div>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                    Error Details (Development)
                  </summary>
                  <pre className="bg-red-50 border border-red-200 rounded p-3 text-xs text-red-800 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

/**
 * Hook to detect theme system errors and provide recovery mechanisms
 */
export function useThemeErrorRecovery() {
  const [hasThemeError, setHasThemeError] = React.useState(false);

  React.useEffect(() => {
    // Check if CSS custom properties are supported
    const testElement = document.createElement('div');
    testElement.style.setProperty('--test-prop', 'test');
    const supportsCustomProperties = testElement.style.getPropertyValue('--test-prop') === 'test';

    if (!supportsCustomProperties) {
      console.warn('CSS custom properties not supported, applying fallback theme');
      setHasThemeError(true);
      applyLegacyFallback();
    }

    // Check if localStorage is available
    try {
      localStorage.setItem('theme-test', 'test');
      localStorage.removeItem('theme-test');
    } catch (error) {
      console.warn('localStorage not available, theme preferences will not persist');
    }

    // Monitor for theme-related errors
    const handleError = (event: ErrorEvent) => {
      if (event.error && event.error.message && 
          (event.error.message.includes('theme') || 
           event.error.message.includes('CSS') ||
           event.error.message.includes('getComputedStyle'))) {
        console.error('Theme-related error detected:', event.error);
        setHasThemeError(true);
        applyLegacyFallback();
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const applyLegacyFallback = () => {
    try {
      // Apply inline styles for browsers that don't support CSS custom properties
      const style = document.createElement('style');
      style.id = 'legacy-theme-fallback';
      style.textContent = `
        body { background-color: #ffffff; color: #000000; }
        .bg-card { background-color: #ffffff; border: 1px solid #e5e7eb; }
        .text-foreground { color: #000000; }
        .text-muted-foreground { color: #6b7280; }
        .bg-primary { background-color: #3b82f6; }
        .text-primary-foreground { color: #ffffff; }
        .border-border { border-color: #e5e7eb; }
        button { background-color: #3b82f6; color: #ffffff; border: none; padding: 0.5rem 1rem; border-radius: 0.375rem; }
        button:hover { background-color: #2563eb; }
      `;
      
      if (!document.getElementById('legacy-theme-fallback')) {
        document.head.appendChild(style);
      }
    } catch (error) {
      console.error('Failed to apply legacy fallback:', error);
    }
  };

  const recoverTheme = () => {
    try {
      // Clear any error states
      setHasThemeError(false);
      
      // Remove fallback styles
      const fallbackStyle = document.getElementById('legacy-theme-fallback');
      if (fallbackStyle) {
        fallbackStyle.remove();
      }
      
      // Clear localStorage theme data and reload
      localStorage.removeItem('theme');
      window.location.reload();
    } catch (error) {
      console.error('Failed to recover theme:', error);
    }
  };

  return {
    hasThemeError,
    recoverTheme
  };
}