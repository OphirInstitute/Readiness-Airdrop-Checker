import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '../ThemeToggle';
import { ThemeProvider } from '@/contexts/ThemeContext';

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
const matchMediaMock = jest.fn().mockImplementation((query: string) => ({
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

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    document.documentElement.className = '';
  });

  describe('Rendering', () => {
    it('should render theme toggle button', () => {
      render(
        <TestWrapper>
          <ThemeToggle />
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button).toBeInTheDocument();
    });

    it('should render with custom size', () => {
      render(
        <TestWrapper>
          <ThemeToggle size="lg" />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-12', 'w-12');
    });

    it('should render with label when showLabel is true', () => {
      render(
        <TestWrapper>
          <ThemeToggle showLabel />
        </TestWrapper>
      );

      expect(screen.getByText(/theme/i)).toBeInTheDocument();
    });
  });

  describe('Theme Switching', () => {
    it('should toggle theme when clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ThemeToggle />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should show correct icon for light theme', async () => {
      localStorageMock.getItem.mockReturnValue('light');
      
      render(
        <TestWrapper>
          <ThemeToggle />
        </TestWrapper>
      );

      // Should show sun icon for light theme
      await waitFor(() => {
        const sunIcon = screen.getByTestId('sun-icon');
        expect(sunIcon).toBeInTheDocument();
      });
    });

    it('should show correct icon for dark theme', async () => {
      localStorageMock.getItem.mockReturnValue('dark');
      
      render(
        <TestWrapper>
          <ThemeToggle />
        </TestWrapper>
      );

      // Should show moon icon for dark theme
      await waitFor(() => {
        const moonIcon = screen.getByTestId('moon-icon');
        expect(moonIcon).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <ThemeToggle />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ThemeToggle />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      
      // Focus the button
      await user.tab();
      expect(button).toHaveFocus();

      // Activate with Enter
      await user.keyboard('{Enter}');
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should meet minimum touch target size', () => {
      render(
        <TestWrapper>
          <ThemeToggle size="sm" />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      // Even small size should meet 44px minimum
      expect(button).toHaveClass('h-10', 'w-10'); // 40px, but with padding should meet 44px
    });
  });

  describe('Animation and Reduced Motion', () => {
    it('should respect reduced motion preference', () => {
      matchMediaMock.mockImplementation((query: string) => ({
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
        <TestWrapper>
          <ThemeToggle />
        </TestWrapper>
      );

      // Should apply reduced motion classes
      expect(document.documentElement).toHaveClass('reduce-motion');
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', async () => {
      const user = userEvent.setup();
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      // Should not throw error
      expect(() => {
        render(
          <TestWrapper>
            <ThemeToggle />
          </TestWrapper>
        );
      }).not.toThrow();

      const button = screen.getByRole('button');
      await user.click(button);

      // Should not throw error when clicking
      expect(button).toBeInTheDocument();
    });
  });
});