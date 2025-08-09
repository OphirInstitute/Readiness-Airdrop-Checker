/**
 * Accessibility utilities for ensuring WCAG compliance
 */

/**
 * Calculate relative luminance of a color
 * @param r Red component (0-255)
 * @param g Green component (0-255)
 * @param b Blue component (0-255)
 * @returns Relative luminance value
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * @param color1 First color in hex format (#RRGGBB)
 * @param color2 Second color in hex format (#RRGGBB)
 * @returns Contrast ratio (1-21)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substr(0, 2), 16);
  const g1 = parseInt(hex1.substr(2, 2), 16);
  const b1 = parseInt(hex1.substr(4, 2), 16);
  
  const r2 = parseInt(hex2.substr(0, 2), 16);
  const g2 = parseInt(hex2.substr(2, 2), 16);
  const b2 = parseInt(hex2.substr(4, 2), 16);
  
  const l1 = getRelativeLuminance(r1, g1, b1);
  const l2 = getRelativeLuminance(r2, g2, b2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG standards
 * @param ratio Contrast ratio
 * @param level 'AA' or 'AAA'
 * @param isLargeText Whether the text is large (18pt+ or 14pt+ bold)
 * @returns Whether the ratio meets the standard
 */
export function meetsContrastStandard(
  ratio: number, 
  level: 'AA' | 'AAA' = 'AA', 
  isLargeText: boolean = false
): boolean {
  if (level === 'AAA') {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Generate accessible focus ring classes
 * @param color Theme color for the focus ring
 * @returns Tailwind classes for focus styling
 */
export function getFocusRingClasses(color: string = 'primary'): string {
  return `focus:outline-none focus:ring-2 focus:ring-${color} focus:ring-offset-2 focus:ring-offset-background`;
}

/**
 * Generate accessible button classes with proper contrast
 * @param variant Button variant
 * @param size Button size
 * @returns Tailwind classes for accessible buttons
 */
export function getAccessibleButtonClasses(
  variant: 'primary' | 'secondary' | 'outline' = 'primary',
  size: 'sm' | 'md' | 'lg' = 'md'
): string {
  const baseClasses = 'font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const focusClasses = getFocusRingClasses();
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2 text-sm min-h-[40px]',
    lg: 'px-6 py-3 text-base min-h-[48px]'
  };
  
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-border bg-background hover:bg-accent hover:text-accent-foreground'
  };
  
  return `${baseClasses} ${focusClasses} ${sizeClasses[size]} ${variantClasses[variant]}`;
}

/**
 * Check if an element meets minimum touch target size (44x44px)
 * @param width Element width in pixels
 * @param height Element height in pixels
 * @returns Whether the element meets touch target requirements
 */
export function meetsTouchTargetSize(width: number, height: number): boolean {
  return width >= 44 && height >= 44;
}

/**
 * Generate ARIA attributes for expandable sections
 * @param isExpanded Whether the section is expanded
 * @param controlsId ID of the controlled element
 * @returns Object with ARIA attributes
 */
export function getExpandableAriaAttributes(isExpanded: boolean, controlsId: string) {
  return {
    'aria-expanded': isExpanded,
    'aria-controls': controlsId,
    role: 'button',
    tabIndex: 0
  };
}

/**
 * Generate screen reader only text classes
 * @returns Tailwind classes for screen reader only content
 */
export function getScreenReaderOnlyClasses(): string {
  return 'sr-only';
}

/**
 * Generate live region attributes for dynamic content
 * @param politeness Level of politeness for announcements
 * @returns Object with live region attributes
 */
export function getLiveRegionAttributes(politeness: 'polite' | 'assertive' = 'polite') {
  return {
    'aria-live': politeness,
    'aria-atomic': 'true',
    role: 'status'
  };
}

/**
 * Validate and sanitize ARIA label text
 * @param text Raw text for ARIA label
 * @returns Sanitized text suitable for ARIA labels
 */
export function sanitizeAriaLabel(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Generate accessible loading state attributes
 * @param isLoading Whether content is loading
 * @param loadingText Text to announce when loading
 * @returns Object with loading state attributes
 */
export function getLoadingStateAttributes(isLoading: boolean, loadingText: string = 'Loading') {
  if (!isLoading) return {};
  
  return {
    'aria-busy': 'true',
    'aria-label': loadingText,
    role: 'status'
  };
}