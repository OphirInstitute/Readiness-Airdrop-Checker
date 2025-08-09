import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '../ThemeContext';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
const matchMediaMock = jest.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: matchMediaMock,
});

// Test component that uses the theme context
function TestComponent() {
  const { theme, effectiveTheme, prefersReducedMotion, hasError, isSupported, setTheme, toggleTheme, resetTheme } = useTheme();
  
  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <div data-testid="effective-theme">{effectiveTheme}</div>
      <div data-testid="reduced-motion">{prefersReducedMotion.toString()}</div>
      <div data-testid="has-error">{hasError.toString()}</div>
      <div data-testid="is-supported">{isSupported.toString()}</div>
      <button onClick={() => setTheme('light')} data-testid="set-light">Set Light</button>
      <button onClick={() => setTheme('dark')} data-testid="set-dark">Set Dark</button>
      <button onClick={() => setTheme('system')} data-testid="set-system">Set System</button>
      <button onClick={toggleTheme} data-testid="toggle">Toggle</button>
      <button onClick={resetTheme} data-testid="reset">Reset</button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    // Reset mocks
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    matchMediaMock.mockClear();
    
    // Default matchMedia mock
    matchMediaMock.mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    // Clear document classes
    document.documentElement.className = '';
  });

  describe('Theme Initialization', () => {
    it('should initialize with system theme when no stored preference', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme')).toHaveTextContent('system');
    });

    it('should initialize with stored theme preference', () => {
      localStorageMock.getItem.mockReturnValue('light');
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme')).toHaveTextContent('light');
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme')).toHaveTextContent('system');
    });
  });

  describe('Effective Theme Calculation', () => {
    it('should set effective theme to dark when system preference is dark', async () => {
      matchMediaMock.mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('effective-theme')).toHaveTextContent('dark');
      });
    });

    it('should set effective theme to light when system preference is light', async () => {
      matchMediaMock.mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('effective-theme')).toHaveTextContent('light');
      });
    });

    it('should use explicit theme when not system', async () => {
      localStorageMock.getItem.mockReturnValue('light');
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('effective-theme')).toHaveTextContent('light');
      });
    });
  });

  describe('Theme Setting', () => {
    it('should update theme and persist to localStorage', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await user.click(screen.getByTestId('set-light'));

      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
    });

    it('should handle localStorage errors when setting theme', async () => {
      const user = userEvent.setup();
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await user.click(screen.getByTestId('set-dark'));

      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      // Should not throw error
    });
  });

  describe('Theme Toggle', () => {
    it('should cycle through themes correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Start with system, should go to light
      await user.click(screen.getByTestId('toggle'));
      expect(screen.getByTestId('theme')).toHaveTextContent('light');

      // Light should go to dark
      await user.click(screen.getByTestId('toggle'));
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');

      // Dark should go to system
      await user.click(screen.getByTestId('toggle'));
      expect(screen.getByTestId('theme')).toHaveTextContent('system');
    });
  });

  describe('Reduced Motion', () => {
    it('should detect reduced motion preference', async () => {
      matchMediaMock.mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('reduced-motion')).toHaveTextContent('true');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle matchMedia errors gracefully', async () => {
      matchMediaMock.mockImplementation(() => {
        throw new Error('matchMedia not supported');
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('has-error')).toHaveTextContent('true');
      });
    });

    it('should detect unsupported browsers', async () => {
      // Mock unsupported CSS custom properties
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn().mockImplementation((tagName) => {
        const element = originalCreateElement.call(document, tagName);
        if (tagName === 'div') {
          element.style.setProperty = jest.fn();
          element.style.getPropertyValue = jest.fn().mockReturnValue('');
        }
        return element;
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-supported')).toHaveTextContent('false');
      });

      // Restore original createElement
      document.createElement = originalCreateElement;
    });
  });

  describe('Theme Reset', () => {
    it('should reset theme to system and clear localStorage', async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValue('dark');
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await user.click(screen.getByTestId('reset'));

      expect(screen.getByTestId('theme')).toHaveTextContent('system');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('theme');
    });
  });

  describe('Document Class Application', () => {
    it('should apply dark class when effective theme is dark', async () => {
      matchMediaMock.mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });
    });

    it('should apply reduce-motion class when user prefers reduced motion', async () => {
      matchMediaMock.mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(document.documentElement.classList.contains('reduce-motion')).toBe(true);
      });
    });
  });

  describe('useTheme Hook', () => {
    it('should throw error when used outside ThemeProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useTheme must be used within a ThemeProvider');

      console.error = originalError;
    });
  });
});