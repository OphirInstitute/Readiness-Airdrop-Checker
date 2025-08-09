/**
 * Professional Framer Motion Configuration
 * Optimized for DeFi applications with smooth, professional animations
 */

import { Variants, Transition } from "framer-motion";

// Professional animation durations
export const motionDurations = {
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
  slower: 0.6
} as const;

// Professional easing curves
export const motionEasing = {
  easeOut: [0.0, 0.0, 0.2, 1],
  easeIn: [0.4, 0.0, 1, 1],
  easeInOut: [0.4, 0.0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  professional: [0.25, 0.46, 0.45, 0.94]
} as const;

// Professional transition presets
export const transitions: Record<string, Transition> = {
  fast: {
    duration: motionDurations.fast,
    ease: motionEasing.easeOut
  },
  normal: {
    duration: motionDurations.normal,
    ease: motionEasing.professional
  },
  slow: {
    duration: motionDurations.slow,
    ease: motionEasing.easeInOut
  },
  bounce: {
    duration: motionDurations.normal,
    ease: motionEasing.bounce
  },
  spring: {
    type: "spring",
    stiffness: 300,
    damping: 30
  },
  professionalSpring: {
    type: "spring",
    stiffness: 400,
    damping: 25,
    mass: 0.8
  }
};

// Professional animation variants
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.normal
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: transitions.fast
  }
};

export const fadeIn: Variants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: transitions.normal
  },
  exit: {
    opacity: 0,
    transition: transitions.fast
  }
};

export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: transitions.professionalSpring
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: transitions.fast
  }
};

export const slideInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -30
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.normal
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: transitions.fast
  }
};

export const slideInRight: Variants = {
  initial: {
    opacity: 0,
    x: 30
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.normal
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: transitions.fast
  }
};

// Professional stagger animations for lists
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.normal
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: transitions.fast
  }
};

// Professional loading animations
export const pulseAnimation: Variants = {
  initial: {
    opacity: 0.6
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut"
    }
  }
};

export const shimmerAnimation: Variants = {
  initial: {
    backgroundPosition: "-200% 0"
  },
  animate: {
    backgroundPosition: "200% 0",
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Professional hover animations
export const hoverLift: Variants = {
  initial: {
    y: 0,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
  },
  hover: {
    y: -2,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
    transition: transitions.fast
  }
};

export const hoverScale: Variants = {
  initial: {
    scale: 1
  },
  hover: {
    scale: 1.02,
    transition: transitions.fast
  },
  tap: {
    scale: 0.98,
    transition: transitions.fast
  }
};

// Professional chart animations
export const chartFadeIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: motionEasing.easeOut
    }
  }
};

export const chartBarGrow: Variants = {
  initial: {
    scaleY: 0,
    originY: 1
  },
  animate: {
    scaleY: 1,
    transition: {
      duration: 0.8,
      ease: motionEasing.easeOut
    }
  }
};

// Professional modal animations
export const modalBackdrop: Variants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: transitions.normal
  },
  exit: {
    opacity: 0,
    transition: transitions.fast
  }
};

export const modalContent: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.professionalSpring
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: transitions.fast
  }
};

// Professional page transition animations
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    x: 20
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: motionEasing.professional
    }
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.3,
      ease: motionEasing.easeIn
    }
  }
};

// Professional metric counter animation
export const counterAnimation = {
  initial: { opacity: 0, scale: 0.5 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

// Professional notification animations
export const notificationSlideIn: Variants = {
  initial: {
    opacity: 0,
    x: 300,
    scale: 0.8
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: transitions.professionalSpring
  },
  exit: {
    opacity: 0,
    x: 300,
    scale: 0.8,
    transition: transitions.normal
  }
};

// Professional loading spinner
export const spinnerAnimation = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Professional progress bar animation
export const progressBarAnimation: Variants = {
  initial: {
    scaleX: 0,
    originX: 0
  },
  animate: (progress: number) => ({
    scaleX: progress / 100,
    transition: {
      duration: 0.8,
      ease: motionEasing.easeOut
    }
  })
};

// Export all animations for easy access
export const professionalAnimations = {
  fadeInUp,
  fadeIn,
  scaleIn,
  slideInLeft,
  slideInRight,
  staggerContainer,
  staggerItem,
  pulseAnimation,
  shimmerAnimation,
  hoverLift,
  hoverScale,
  chartFadeIn,
  chartBarGrow,
  modalBackdrop,
  modalContent,
  pageTransition,
  counterAnimation,
  notificationSlideIn,
  spinnerAnimation,
  progressBarAnimation
} as const;