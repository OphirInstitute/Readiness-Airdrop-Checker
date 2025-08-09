'use client';

import React, { forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { getAccessibleButtonClasses, getFocusRingClasses } from '@/lib/utils/accessibility';
import { useTheme } from '@/contexts/ThemeContext';

type ButtonProps = React.ComponentProps<typeof Button>;

interface AccessibleButtonProps extends ButtonProps {
  /**
   * Screen reader only text for additional context
   */
  srOnlyText?: string;
  /**
   * Whether the button controls an expanded/collapsed state
   */
  isExpanded?: boolean;
  /**
   * ID of the element this button controls
   */
  controls?: string;
  /**
   * Whether to respect reduced motion preferences
   */
  respectReducedMotion?: boolean;
}

/**
 * Enhanced button component with built-in accessibility features
 */
export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    children, 
    srOnlyText, 
    isExpanded, 
    controls, 
    respectReducedMotion = true,
    className = '',
    ...props 
  }, ref) => {
    const { prefersReducedMotion } = useTheme();
    
    const shouldReduceMotion = respectReducedMotion && prefersReducedMotion;
    
    const accessibilityProps = {
      ...(isExpanded !== undefined && { 'aria-expanded': isExpanded }),
      ...(controls && { 'aria-controls': controls }),
      ...(srOnlyText && { 'aria-label': srOnlyText }),
    };

    const enhancedClassName = `
      ${className}
      ${getFocusRingClasses()}
      ${shouldReduceMotion ? 'transition-none' : 'transition-all duration-200'}
      min-h-[44px] min-w-[44px]
    `.trim();

    return (
      <Button
        ref={ref}
        className={enhancedClassName}
        {...accessibilityProps}
        {...props}
      >
        {children}
        {srOnlyText && (
          <span className="sr-only">{srOnlyText}</span>
        )}
      </Button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';