import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Professional utility function for combining Tailwind classes
 * Enhanced version of the standard cn utility with theme-aware features
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Professional theme utilities for consistent styling
 */
export const themeUtils = {
  // Professional card styles
  card: {
    base: "bg-background-secondary border border-white/10 rounded-xl p-6",
    elevated: "card-elevated",
    glass: "glass-card rounded-xl p-6",
    interactive: "card-professional cursor-pointer"
  },
  
  // Professional button styles
  button: {
    primary: "btn-primary",
    secondary: "btn-secondary", 
    ghost: "btn-ghost",
    danger: "bg-status-error hover:bg-status-error/80 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
  },
  
  // Professional text styles
  text: {
    heading: "text-text-primary font-semibold tracking-tight",
    body: "text-text-secondary",
    muted: "text-text-tertiary",
    gradient: "text-gradient-primary font-semibold"
  },
  
  // Professional metric styles
  metric: {
    positive: "text-status-success font-semibold",
    negative: "text-status-error font-semibold",
    neutral: "text-status-warning font-semibold",
    value: "text-text-primary font-bold text-2xl",
    label: "text-text-secondary text-sm font-medium"
  },
  
  // Professional badge styles
  badge: {
    success: "badge-success",
    warning: "badge-warning",
    error: "badge-error",
    info: "badge-info"
  },
  
  // Professional input styles
  input: {
    base: "input-professional",
    error: "input-professional border-status-error focus:ring-status-error/50 focus:border-status-error"
  }
};

/**
 * Professional animation utilities
 */
export const animations = {
  fadeIn: "animate-fade-in",
  slideUp: "animate-slide-up", 
  scaleIn: "animate-scale-in",
  pulse: "animate-pulse-slow"
};

/**
 * Professional layout utilities
 */
export const layouts = {
  container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  grid: {
    responsive: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    metrics: "grid grid-cols-2 md:grid-cols-4 gap-4",
    dashboard: "grid grid-cols-1 lg:grid-cols-3 gap-6"
  },
  flex: {
    center: "flex items-center justify-center",
    between: "flex items-center justify-between",
    start: "flex items-center justify-start",
    column: "flex flex-col"
  }
};

/**
 * Professional responsive utilities
 */
export const responsive = {
  hide: {
    mobile: "hidden md:block",
    desktop: "block md:hidden"
  },
  show: {
    mobile: "block md:hidden",
    desktop: "hidden md:block"
  }
};

/**
 * Professional status utilities for crypto metrics
 */
export const statusUtils = {
  getStatusColor: (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return "status-success";
    if (value >= thresholds.warning) return "status-warning";
    return "status-error";
  },
  
  getStatusBadge: (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return themeUtils.badge.success;
    if (value >= thresholds.warning) return themeUtils.badge.warning;
    return themeUtils.badge.error;
  },
  
  getTrendIcon: (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up": return "↗";
      case "down": return "↘";
      default: return "→";
    }
  },
  
  getTrendColor: (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up": return "text-status-success";
      case "down": return "text-status-error";
      default: return "text-status-warning";
    }
  }
};

/**
 * Professional formatting utilities
 */
export const formatUtils = {
  currency: (value: number | string, decimals: number = 2) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(decimals)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(decimals)}K`;
    return `$${num.toFixed(decimals)}`;
  },
  
  number: (value: number | string, decimals: number = 0) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
    return num.toFixed(decimals);
  },
  
  percentage: (value: number, decimals: number = 1) => {
    return `${value.toFixed(decimals)}%`;
  },
  
  address: (address: string, start: number = 6, end: number = 4) => {
    if (!address) return "";
    return `${address.slice(0, start)}...${address.slice(-end)}`;
  }
};

/**
 * Professional theme class generator
 */
export const createThemeClasses = (baseClasses: string, variants?: Record<string, string>) => {
  return {
    base: baseClasses,
    ...variants
  };
};