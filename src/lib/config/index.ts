/**
 * Enhanced Dependencies Configuration Index
 * Centralized exports for all professional configurations
 */

// Theme and design system
export { professionalTheme, getThemeColor, cssVar, gradients } from "./theme";

// Animation configurations
export { 
  professionalAnimations,
  transitions,
  motionDurations,
  motionEasing,
  fadeInUp,
  fadeIn,
  scaleIn,
  staggerContainer,
  staggerItem
} from "./motion";

// Chart configurations
export {
  professionalChartTheme,
  chartColors,
  chartStyles,
  chartDimensions,
  chartFormatters,
  createGradientDefs,
  getResponsiveChartSize,
  getChartColor
} from "./charts";

// Spring animation configurations
export {
  professionalSprings,
  springPresets,
  springAnimations,
  loadingStates,
  createSpringAnimation,
  createStaggeredAnimation
} from "./springs";

// Bridge protocol configurations
export {
  orbiterConfig,
  orbiterUtils,
  orbiterThresholds,
  orbiterScoringWeights
} from "./orbiter";

export {
  hopConfig,
  hopUtils,
  hopThresholds,
  hopScoringWeights,
  hopLPBonuses
} from "./hop";

// Type exports
export type { 
  ProfessionalTheme,
  ThemeColors,
  ThemeTypography
} from "./theme";

export type {
  OrbiterTransaction,
  OrbiterUserStats,
  OrbiterBridgeRoute
} from "./orbiter";

export type {
  HopBridgeTransaction,
  HopLPPosition,
  HopUserStats,
  HopPoolInfo
} from "./hop";