import { useState, useEffect } from 'react';

/**
 * Hook to detect user's reduced motion preference
 * Respects the prefers-reduced-motion media query
 * @returns boolean indicating if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Add listener
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to get motion-safe animation variants for framer-motion
 * @returns Object with animation variants that respect reduced motion
 */
export function useMotionSafeVariants() {
  const prefersReducedMotion = useReducedMotion();

  return {
    // Fade in animation
    fadeIn: {
      initial: { opacity: prefersReducedMotion ? 1 : 0 },
      animate: { opacity: 1 },
      transition: { duration: prefersReducedMotion ? 0 : 0.3 }
    },
    
    // Slide up animation
    slideUp: {
      initial: { 
        opacity: prefersReducedMotion ? 1 : 0, 
        y: prefersReducedMotion ? 0 : 20 
      },
      animate: { opacity: 1, y: 0 },
      transition: { duration: prefersReducedMotion ? 0 : 0.5 }
    },
    
    // Scale animation
    scale: {
      initial: { 
        opacity: prefersReducedMotion ? 1 : 0, 
        scale: prefersReducedMotion ? 1 : 0.95 
      },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: prefersReducedMotion ? 0 : 0.3 }
    },
    
    // Stagger children animation
    staggerChildren: {
      animate: {
        transition: {
          staggerChildren: prefersReducedMotion ? 0 : 0.1
        }
      }
    }
  };
}