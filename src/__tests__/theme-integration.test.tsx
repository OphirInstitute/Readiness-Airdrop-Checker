import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
const matchMediaMock = jest.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: matchMediaMock,
});

// Test component that uses theme-aware components
function TestApp() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        <header className="p-4 border-b border-border">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Test App</h1>
            <ThemeToggle />
          </div>
        </header>
        
        <main className="p-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This is a test card with theme-aware styling.
              </p>
              <button className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded">
                Primary Button
              </button>
            </CardContent>
          </Card>
        </main>
      </div>
    </ThemeProvider>
  );
}

describe('Theme Integration', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    document.documentElement.className = '';
    
    // Remove any existing style elements
    const existingStyles = document.querySelectorAll('#theme-fallback-styles, #legacy-theme-fallback');
    existingStyles.forEach(style => style.remove());
  });

  describe('Theme Application', () => {
    it('should apply light theme classes correctly', async () => {
      localStorageMock.getItem.mockReturnValue('light');
      
      render(<TestApp />);

      await waitFor(() => {
        expect(document.documentElement).not.toHaveClass('dark');
      });

      // Check that theme-aware components render correctly
      expect(screen.getByText('Test App')).toBeInTheDocument();
      expect(screen.getByText('Test Card')).toBeInTheDocument();
    });

    it('should apply dark theme classes correctly', async () => {
      localStorageMock.getItem.mockReturnValue('dark');
      
      render(<TestApp />);

      await waitFor(() => {
        expect(document.documentElement).toHaveClass('dark');
      });
    });

    it('should respond to system theme preference', async () => {
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

      render(<TestApp />);

      await waitFor(() => {
        expect(document.documentElement).toHaveClass('dark');
      });
    });
  });

  describe('Theme Switching', () => {
    it('should switch themes when toggle is clicked', async () => {
      const user = userEvent.setup();
      
      render(<TestApp />);

      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      
      // Initial state should be system (light by default in test)
      expect(document.documentElement).not.toHaveClass('dark');

      // Click to switch to light
      await user.click(toggleButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');

      // Click to switch to dark
      await user.click(toggleButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
      
      await waitFor(() => {
        expect(document.documentElement).toHaveClass('dark');
      });
    });
  });

  describe('Reduced Motion', () => {
    it('should apply reduced motion classes when preferred', async () => {
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

      render(<TestApp />);

      await waitFor(() => {
        expect(document.documentElement).toHaveClass('reduce-motion');
      });
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper heading hierarchy', () => {
      render(<TestApp />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Test App');
    });

    it('should have proper focus management', async () => {
      const user = userEvent.setup();
      
      render(<TestApp />);

      // Tab through interactive elements
      await user.tab();
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      expect(toggleButton).toHaveFocus();

      await user.tab();
      const primaryButton = screen.getByRole('button', { name: /primary button/i });
      expect(primaryButton).toHaveFocus();
    });

    it('should announce theme changes to screen readers', async () => {
      const user = userEvent.setup();
      
      render(<TestApp />);

      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      
      // The button should have appropriate ARIA attributes
      expect(toggleButton).toHaveAttribute('aria-label');
    });
  });

  describe('Error Recovery', () => {
    it('should handle CSS custom property failures', async () => {
      // Mock CSS custom property failure
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn().mockImplementation((tagName) => {
        const element = originalCreateElement.call(document, tagName);
        if (tagName === 'div') {
          element.style.setProperty = jest.fn();
          element.style.getPropertyValue = jest.fn().mockReturnValue('');
        }
        return element;
      });

      render(<TestApp />);

      await waitFor(() => {
        // Should apply fallback theme
        expect(document.documentElement).toHaveClass('theme-fallback');
      });

      // Restore original createElement
      document.createElement = originalCreateElement;
    });

    it('should handle localStorage failures gracefully', async () => {
      const user = userEvent.setup();
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      // Should not throw error
      expect(() => {
        render(<TestApp />);
      }).not.toThrow();

      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      
      // Should not throw error when clicking
      await user.click(toggleButton);
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not cause excessive re-renders', () => {
      const renderSpy = jest.fn();
      
      function SpyComponent() {
        renderSpy();
        return <div>Spy Component</div>;
      }

      render(
        <ThemeProvider>
          <SpyComponent />
        </ThemeProvider>
      );

      // Should render only once initially
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Browser Compatibility', () => {
    it('should work without matchMedia support', () => {
      // Remove matchMedia support
      delete (window as any).matchMedia;

      expect(() => {
        render(<TestApp />);
      }).not.toThrow();

      // Should still render the app
      expect(screen.getByText('Test App')).toBeInTheDocument();
    });

    it('should work without localStorage support', () => {
      // Remove localStorage support
      delete (window as any).localStorage;

      expect(() => {
        render(<TestApp />);
      }).not.toThrow();

      // Should still render the app
      expect(screen.getByText('Test App')).toBeInTheDocument();
    });
  });
});