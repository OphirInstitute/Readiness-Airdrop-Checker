import { useEffect, useRef } from 'react';

/**
 * Hook to trap focus within a container element
 * Useful for modals, dropdowns, and other overlay components
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    
    // Store the previously focused element
    previousActiveElement.current = document.activeElement;

    // Get all focusable elements within the container
    const getFocusableElements = (): HTMLElement[] => {
      const focusableSelectors = [
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        'a[href]',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]'
      ].join(', ');

      return Array.from(container.querySelectorAll(focusableSelectors))
        .filter((element): element is HTMLElement => {
          return element instanceof HTMLElement && 
                 element.offsetParent !== null && // Element is visible
                 !element.hasAttribute('aria-hidden');
        });
    };

    // Focus the first focusable element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Handle tab key navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab: move to previous element
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: move to next element
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Handle escape key
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Return focus to the previously focused element
        if (previousActiveElement.current instanceof HTMLElement) {
          previousActiveElement.current.focus();
        }
      }
    };

    // Add event listeners
    container.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleEscapeKey);

    // Cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleEscapeKey);
      
      // Return focus to the previously focused element
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Hook to manage focus restoration when a component unmounts
 */
export function useFocusRestore() {
  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    // Store the currently focused element
    previousActiveElement.current = document.activeElement;

    // Return focus on unmount
    return () => {
      if (previousActiveElement.current instanceof HTMLElement) {
        // Use setTimeout to ensure the element is still in the DOM
        setTimeout(() => {
          if (previousActiveElement.current instanceof HTMLElement) {
            previousActiveElement.current.focus();
          }
        }, 0);
      }
    };
  }, []);

  return {
    restoreFocus: () => {
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    }
  };
}

/**
 * Hook to announce content changes to screen readers
 */
export function useScreenReaderAnnouncement() {
  const announcementRef = useRef<HTMLDivElement>(null);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcementRef.current) {
      // Create announcement element if it doesn't exist
      const element = document.createElement('div');
      element.setAttribute('aria-live', priority);
      element.setAttribute('aria-atomic', 'true');
      element.className = 'sr-only';
      element.id = 'screen-reader-announcements';
      document.body.appendChild(element);
      announcementRef.current = element;
    }

    const element = announcementRef.current;
    element.setAttribute('aria-live', priority);
    
    // Clear previous message
    element.textContent = '';
    
    // Add new message with a slight delay to ensure screen readers pick it up
    setTimeout(() => {
      element.textContent = message;
    }, 100);

    // Clear the message after a delay to avoid repetition
    setTimeout(() => {
      element.textContent = '';
    }, 5000);
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (announcementRef.current && announcementRef.current.parentNode) {
        announcementRef.current.parentNode.removeChild(announcementRef.current);
      }
    };
  }, []);

  return { announce };
}