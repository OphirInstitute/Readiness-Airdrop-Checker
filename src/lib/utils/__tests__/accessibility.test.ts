import {
  getContrastRatio,
  meetsContrastStandard,
  getFocusRingClasses,
  getAccessibleButtonClasses,
  meetsTouchTargetSize,
  getExpandableAriaAttributes,
  getScreenReaderOnlyClasses,
  getLiveRegionAttributes,
  sanitizeAriaLabel,
  getLoadingStateAttributes
} from '../accessibility';

describe('Accessibility Utils', () => {
  describe('getContrastRatio', () => {
    it('should calculate correct contrast ratio for black and white', () => {
      const ratio = getContrastRatio('#000000', '#ffffff');
      expect(ratio).toBeCloseTo(21, 1);
    });

    it('should calculate correct contrast ratio for same colors', () => {
      const ratio = getContrastRatio('#ffffff', '#ffffff');
      expect(ratio).toBeCloseTo(1, 1);
    });

    it('should handle colors without # prefix', () => {
      const ratio = getContrastRatio('000000', 'ffffff');
      expect(ratio).toBeCloseTo(21, 1);
    });

    it('should calculate ratio for typical UI colors', () => {
      // Dark text on light background
      const ratio1 = getContrastRatio('#333333', '#ffffff');
      expect(ratio1).toBeGreaterThan(4.5);

      // Light text on dark background
      const ratio2 = getContrastRatio('#ffffff', '#333333');
      expect(ratio2).toBeGreaterThan(4.5);
    });
  });

  describe('meetsContrastStandard', () => {
    it('should pass AA standard for normal text with 4.5:1 ratio', () => {
      expect(meetsContrastStandard(4.5, 'AA', false)).toBe(true);
      expect(meetsContrastStandard(4.4, 'AA', false)).toBe(false);
    });

    it('should pass AA standard for large text with 3:1 ratio', () => {
      expect(meetsContrastStandard(3, 'AA', true)).toBe(true);
      expect(meetsContrastStandard(2.9, 'AA', true)).toBe(false);
    });

    it('should pass AAA standard for normal text with 7:1 ratio', () => {
      expect(meetsContrastStandard(7, 'AAA', false)).toBe(true);
      expect(meetsContrastStandard(6.9, 'AAA', false)).toBe(false);
    });

    it('should pass AAA standard for large text with 4.5:1 ratio', () => {
      expect(meetsContrastStandard(4.5, 'AAA', true)).toBe(true);
      expect(meetsContrastStandard(4.4, 'AAA', true)).toBe(false);
    });
  });

  describe('getFocusRingClasses', () => {
    it('should return default focus ring classes', () => {
      const classes = getFocusRingClasses();
      expect(classes).toContain('focus:outline-none');
      expect(classes).toContain('focus:ring-2');
      expect(classes).toContain('focus:ring-primary');
    });

    it('should return custom color focus ring classes', () => {
      const classes = getFocusRingClasses('secondary');
      expect(classes).toContain('focus:ring-secondary');
    });
  });

  describe('getAccessibleButtonClasses', () => {
    it('should return primary button classes with medium size', () => {
      const classes = getAccessibleButtonClasses('primary', 'md');
      expect(classes).toContain('bg-primary');
      expect(classes).toContain('text-primary-foreground');
      expect(classes).toContain('min-h-[40px]');
      expect(classes).toContain('focus:outline-none');
    });

    it('should return secondary button classes', () => {
      const classes = getAccessibleButtonClasses('secondary');
      expect(classes).toContain('bg-secondary');
      expect(classes).toContain('text-secondary-foreground');
    });

    it('should return outline button classes', () => {
      const classes = getAccessibleButtonClasses('outline');
      expect(classes).toContain('border');
      expect(classes).toContain('bg-background');
    });

    it('should return small button classes', () => {
      const classes = getAccessibleButtonClasses('primary', 'sm');
      expect(classes).toContain('min-h-[32px]');
      expect(classes).toContain('px-3');
    });

    it('should return large button classes', () => {
      const classes = getAccessibleButtonClasses('primary', 'lg');
      expect(classes).toContain('min-h-[48px]');
      expect(classes).toContain('px-6');
    });
  });

  describe('meetsTouchTargetSize', () => {
    it('should return true for 44x44 minimum size', () => {
      expect(meetsTouchTargetSize(44, 44)).toBe(true);
    });

    it('should return true for larger sizes', () => {
      expect(meetsTouchTargetSize(48, 48)).toBe(true);
      expect(meetsTouchTargetSize(50, 44)).toBe(true);
    });

    it('should return false for smaller sizes', () => {
      expect(meetsTouchTargetSize(43, 44)).toBe(false);
      expect(meetsTouchTargetSize(44, 43)).toBe(false);
      expect(meetsTouchTargetSize(32, 32)).toBe(false);
    });
  });

  describe('getExpandableAriaAttributes', () => {
    it('should return correct attributes for expanded state', () => {
      const attrs = getExpandableAriaAttributes(true, 'content-1');
      expect(attrs['aria-expanded']).toBe(true);
      expect(attrs['aria-controls']).toBe('content-1');
      expect(attrs.role).toBe('button');
      expect(attrs.tabIndex).toBe(0);
    });

    it('should return correct attributes for collapsed state', () => {
      const attrs = getExpandableAriaAttributes(false, 'content-2');
      expect(attrs['aria-expanded']).toBe(false);
      expect(attrs['aria-controls']).toBe('content-2');
    });
  });

  describe('getScreenReaderOnlyClasses', () => {
    it('should return screen reader only classes', () => {
      const classes = getScreenReaderOnlyClasses();
      expect(classes).toBe('sr-only');
    });
  });

  describe('getLiveRegionAttributes', () => {
    it('should return polite live region attributes by default', () => {
      const attrs = getLiveRegionAttributes();
      expect(attrs['aria-live']).toBe('polite');
      expect(attrs['aria-atomic']).toBe('true');
      expect(attrs.role).toBe('status');
    });

    it('should return assertive live region attributes', () => {
      const attrs = getLiveRegionAttributes('assertive');
      expect(attrs['aria-live']).toBe('assertive');
    });
  });

  describe('sanitizeAriaLabel', () => {
    it('should remove HTML brackets', () => {
      const sanitized = sanitizeAriaLabel('Click <button> to continue');
      expect(sanitized).toBe('Click button to continue');
    });

    it('should normalize whitespace', () => {
      const sanitized = sanitizeAriaLabel('Multiple   spaces    here');
      expect(sanitized).toBe('Multiple spaces here');
    });

    it('should trim whitespace', () => {
      const sanitized = sanitizeAriaLabel('  Trimmed text  ');
      expect(sanitized).toBe('Trimmed text');
    });

    it('should handle complex text', () => {
      const sanitized = sanitizeAriaLabel('  <div>Complex   text</div>  with   issues  ');
      expect(sanitized).toBe('divComplex text/div with issues');
    });
  });

  describe('getLoadingStateAttributes', () => {
    it('should return empty object when not loading', () => {
      const attrs = getLoadingStateAttributes(false);
      expect(attrs).toEqual({});
    });

    it('should return loading attributes when loading', () => {
      const attrs = getLoadingStateAttributes(true);
      expect(attrs['aria-busy']).toBe('true');
      expect(attrs['aria-label']).toBe('Loading');
      expect(attrs.role).toBe('status');
    });

    it('should return custom loading text', () => {
      const attrs = getLoadingStateAttributes(true, 'Analyzing data');
      expect(attrs['aria-label']).toBe('Analyzing data');
    });
  });
});