'use client';

import React from 'react';

interface SkipNavigationProps {
  /**
   * ID of the main content area to skip to
   */
  mainContentId?: string;
  /**
   * Additional skip links
   */
  skipLinks?: Array<{
    href: string;
    label: string;
  }>;
}

/**
 * Skip navigation component for keyboard users
 * Provides quick access to main content and other important sections
 */
export function SkipNavigation({ 
  mainContentId = 'main-content', 
  skipLinks = [] 
}: SkipNavigationProps) {
  const defaultSkipLinks = [
    { href: `#${mainContentId}`, label: 'Skip to main content' },
    ...skipLinks
  ];

  return (
    <div className="sr-only focus-within:not-sr-only">
      <div className="fixed top-0 left-0 z-50 bg-primary text-primary-foreground p-2 rounded-br-md">
        {defaultSkipLinks.map((link, index) => (
          <a
            key={index}
            href={link.href}
            className="
              block px-4 py-2 text-sm font-medium
              focus:outline-none focus:ring-2 focus:ring-primary-foreground focus:ring-offset-2
              hover:bg-primary/90 transition-colors duration-200
              rounded-md mb-1 last:mb-0
            "
            onFocus={(e) => {
              // Ensure the skip link is visible when focused
              e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}

/**
 * Main content wrapper that provides the skip target
 */
interface MainContentProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export function MainContent({ 
  children, 
  id = 'main-content', 
  className = '' 
}: MainContentProps) {
  return (
    <main 
      id={id}
      className={`focus:outline-none ${className}`}
      tabIndex={-1}
      role="main"
      aria-label="Main content"
    >
      {children}
    </main>
  );
}