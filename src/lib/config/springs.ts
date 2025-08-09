/**
 * Professional React Spring Configuration
 * Optimized for smooth transitions and loading states in DeFi applications
 */

import { SpringConfig } from "@react-spring/web";

// Professional spring presets
export const springPresets: Record<string, SpringConfig> = {
  // Gentle spring for subtle animations
  gentle: {
    tension: 120,
    friction: 14,
    mass: 1
  },
  
  // Default professional spring
  professional: {
    tension: 280,
    friction: 25,
    mass: 0.8
  },
  
  // Snappy spring for quick interactions
  snappy: {
    tension: 400,
    friction: 22,
    mass: 0.6
  },
  
  // Bouncy spring for playful elements
  bouncy: {
    tension: 300,
    friction: 10,
    mass: 0.8
  },
  
  // Slow spring for large elements
  slow: {
    tension: 180,
    friction: 30,
    mass: 1.2
  },
  
  // Fast spring for micro-interactions
  fast: {
    tension: 500,
    friction: 30,
    mass: 0.5
  },
  
  // Smooth spring for loading states
  smooth: {
    tension: 200,
    friction: 20,
    mass: 1
  }
} as const;

// Professional animation configurations
export const springAnimations = {
  // Fade animations
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: springPresets.professional
  },
  
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
    config: springPresets.fast
  },
  
  // Scale animations
  scaleIn: {
    from: { opacity: 0, transform: "scale(0.8)" },
    to: { opacity: 1, transform: "scale(1)" },
    config: springPresets.professional
  },
  
  scaleOut: {
    from: { opacity: 1, transform: "scale(1)" },
    to: { opacity: 0, transform: "scale(0.8)" },
    config: springPresets.fast
  },
  
  // Slide animations
  slideInUp: {
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
    config: springPresets.professional
  },
  
  slideInDown: {
    from: { opacity: 0, transform: "translateY(-20px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
    config: springPresets.professional
  },
  
  slideInLeft: {
    from: { opacity: 0, transform: "translateX(-20px)" },
    to: { opacity: 1, transform: "translateX(0px)" },
    config: springPresets.professional
  },
  
  slideInRight: {
    from: { opacity: 0, transform: "translateX(20px)" },
    to: { opacity: 1, transform: "translateX(0px)" },
    config: springPresets.professional
  },
  
  // Bounce animations
  bounceIn: {
    from: { opacity: 0, transform: "scale(0.3)" },
    to: { opacity: 1, transform: "scale(1)" },
    config: springPresets.bouncy
  },
  
  // Rotation animations
  rotateIn: {
    from: { opacity: 0, transform: "rotate(-180deg)" },
    to: { opacity: 1, transform: "rotate(0deg)" },
    config: springPresets.professional
  },
  
  // Loading animations
  pulse: {
    from: { opacity: 0.6, transform: "scale(1)" },
    to: { opacity: 1, transform: "scale(1.05)" },
    config: springPresets.smooth,
    loop: { reverse: true }
  },
  
  // Hover animations
  hoverLift: {
    from: { transform: "translateY(0px)" },
    to: { transform: "translateY(-2px)" },
    config: springPresets.fast
  },
  
  hoverScale: {
    from: { transform: "scale(1)" },
    to: { transform: "scale(1.02)" },
    config: springPresets.fast
  }
} as const;

// Professional loading state configurations
export const loadingStates = {
  // Skeleton loading
  skeleton: {
    from: { opacity: 0.4 },
    to: { opacity: 1 },
    config: springPresets.smooth,
    loop: { reverse: true }
  },
  
  // Shimmer loading
  shimmer: {
    from: { backgroundPosition: "-200% 0" },
    to: { backgroundPosition: "200% 0" },
    config: { duration: 1500 },
    loop: true
  },
  
  // Spinner loading
  spinner: {
    from: { transform: "rotate(0deg)" },
    to: { transform: "rotate(360deg)" },
    config: { duration: 1000 },
    loop: true
  },
  
  // Progress bar loading
  progressBar: (progress: number) => ({
    from: { width: "0%" },
    to: { width: `${progress}%` },
    config: springPresets.professional
  }),
  
  // Dots loading
  dots: (delay: number = 0) => ({
    from: { opacity: 0.3, transform: "scale(0.8)" },
    to: { opacity: 1, transform: "scale(1)" },
    config: springPresets.bouncy,
    delay,
    loop: { reverse: true }
  })
} as const;

// Professional transition configurations
export const transitions = {
  // Page transitions
  pageSlide: {
    from: { opacity: 0, transform: "translateX(20px)" },
    enter: { opacity: 1, transform: "translateX(0px)" },
    leave: { opacity: 0, transform: "translateX(-20px)" },
    config: springPresets.professional
  },
  
  // Modal transitions
  modal: {
    from: { opacity: 0, transform: "scale(0.9)" },
    enter: { opacity: 1, transform: "scale(1)" },
    leave: { opacity: 0, transform: "scale(0.9)" },
    config: springPresets.professional
  },
  
  // Dropdown transitions
  dropdown: {
    from: { opacity: 0, transform: "translateY(-10px)" },
    enter: { opacity: 1, transform: "translateY(0px)" },
    leave: { opacity: 0, transform: "translateY(-10px)" },
    config: springPresets.fast
  },
  
  // Tooltip transitions
  tooltip: {
    from: { opacity: 0, transform: "scale(0.8)" },
    enter: { opacity: 1, transform: "scale(1)" },
    leave: { opacity: 0, transform: "scale(0.8)" },
    config: springPresets.fast
  },
  
  // Notification transitions
  notification: {
    from: { opacity: 0, transform: "translateX(100%)" },
    enter: { opacity: 1, transform: "translateX(0%)" },
    leave: { opacity: 0, transform: "translateX(100%)" },
    config: springPresets.professional
  }
} as const;

// Professional stagger configurations
export const staggerConfigs = {
  // List items stagger
  list: {
    trail: 100,
    config: springPresets.professional
  },
  
  // Card grid stagger
  grid: {
    trail: 150,
    config: springPresets.professional
  },
  
  // Metric cards stagger
  metrics: {
    trail: 80,
    config: springPresets.snappy
  },
  
  // Chart elements stagger
  chart: {
    trail: 200,
    config: springPresets.smooth
  }
} as const;

// Professional gesture configurations
export const gestureConfigs = {
  // Drag configuration
  drag: {
    bounds: { left: -100, right: 100, top: -100, bottom: 100 },
    rubberband: true,
    config: springPresets.professional
  },
  
  // Swipe configuration
  swipe: {
    threshold: 50,
    config: springPresets.fast
  },
  
  // Pinch configuration
  pinch: {
    scaleBounds: { min: 0.5, max: 2 },
    config: springPresets.professional
  }
} as const;

// Utility functions for spring animations
export const createSpringAnimation = (
  type: keyof typeof springAnimations,
  customConfig?: Partial<SpringConfig>
) => {
  const animation = springAnimations[type];
  return {
    ...animation,
    config: customConfig ? { ...animation.config, ...customConfig } : animation.config
  };
};

export const createStaggeredAnimation = (
  items: unknown[],
  animation: keyof typeof springAnimations,
  stagger: keyof typeof staggerConfigs = "list"
) => {
  const { trail, config } = staggerConfigs[stagger];
  const baseAnimation = springAnimations[animation];
  
  return items.map((_, index) => ({
    ...baseAnimation,
    delay: index * trail,
    config
  }));
};

export const createLoadingAnimation = (
  type: keyof typeof loadingStates,
  ...args: unknown[]
) => {
  const loadingState = loadingStates[type];
  return typeof loadingState === "function" ? loadingState(...args) : loadingState;
};

// Export all spring configurations
export const professionalSprings = {
  presets: springPresets,
  animations: springAnimations,
  loading: loadingStates,
  transitions,
  stagger: staggerConfigs,
  gestures: gestureConfigs,
  utils: {
    createSpringAnimation,
    createStaggeredAnimation,
    createLoadingAnimation
  }
} as const;

export default professionalSprings;