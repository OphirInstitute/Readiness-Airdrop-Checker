/**
 * Professional Recharts Configuration
 * Optimized for DeFi data visualization with dark theme support
 */

// Professional chart colors for DeFi data
export const chartColors = {
  primary: "#2E5BFF",
  secondary: "#7C3AED", 
  tertiary: "#06FFA5",
  success: "#06FFA5",
  warning: "#FFB800",
  error: "#FF4747",
  info: "#2E5BFF",
  
  // Gradient definitions for professional charts
  gradients: {
    primary: ["#2E5BFF", "#7C3AED"],
    success: ["#06FFA5", "#2E5BFF"],
    warning: ["#FFB800", "#FF4747"],
    volume: ["#2E5BFF", "#06FFA5"],
    activity: ["#7C3AED", "#2E5BFF"]
  },
  
  // Multi-series chart colors
  series: [
    "#2E5BFF", // Primary blue
    "#7C3AED", // Purple
    "#06FFA5", // Green
    "#FFB800", // Orange
    "#FF4747", // Red
    "#00D4FF", // Cyan
    "#FF6B9D", // Pink
    "#9333EA"  // Violet
  ]
} as const;

// Professional chart styling
export const chartStyles = {
  // Grid styling
  grid: {
    stroke: "rgba(240, 246, 255, 0.1)",
    strokeDasharray: "3 3",
    strokeWidth: 1
  },
  
  // Axis styling
  axis: {
    tick: {
      fill: "#8B949E",
      fontSize: 12,
      fontFamily: "var(--font-inter), Inter, sans-serif"
    },
    line: {
      stroke: "rgba(240, 246, 255, 0.2)",
      strokeWidth: 1
    },
    label: {
      fill: "#F0F6FF",
      fontSize: 14,
      fontWeight: 500,
      fontFamily: "var(--font-inter), Inter, sans-serif"
    }
  },
  
  // Legend styling
  legend: {
    wrapperStyle: {
      color: "#F0F6FF",
      fontSize: "14px",
      fontFamily: "var(--font-inter), Inter, sans-serif",
      fontWeight: 500
    }
  },
  
  // Tooltip styling
  tooltip: {
    contentStyle: {
      backgroundColor: "#161B22",
      border: "1px solid rgba(240, 246, 255, 0.1)",
      borderRadius: "12px",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
      color: "#F0F6FF",
      fontSize: "14px",
      fontFamily: "var(--font-inter), Inter, sans-serif",
      padding: "12px 16px"
    },
    labelStyle: {
      color: "#F0F6FF",
      fontWeight: 600,
      marginBottom: "8px"
    },
    itemStyle: {
      color: "#8B949E",
      padding: "2px 0"
    }
  }
} as const;

// Professional chart dimensions and responsive breakpoints
export const chartDimensions = {
  // Standard chart sizes
  small: {
    width: 300,
    height: 200
  },
  medium: {
    width: 400,
    height: 250
  },
  large: {
    width: 600,
    height: 350
  },
  
  // Responsive breakpoints
  responsive: {
    mobile: {
      width: "100%",
      height: 200
    },
    tablet: {
      width: "100%", 
      height: 250
    },
    desktop: {
      width: "100%",
      height: 350
    }
  },
  
  // Margins for different chart types
  margins: {
    default: { top: 20, right: 30, left: 20, bottom: 20 },
    withLegend: { top: 20, right: 30, left: 20, bottom: 60 },
    compact: { top: 10, right: 15, left: 10, bottom: 10 }
  }
} as const;

// Professional animation configurations for charts
export const chartAnimations = {
  // Entry animations
  entry: {
    animationBegin: 0,
    animationDuration: 800,
    animationEasing: "ease-out"
  },
  
  // Hover animations
  hover: {
    animationDuration: 200,
    animationEasing: "ease-in-out"
  },
  
  // Update animations
  update: {
    animationDuration: 400,
    animationEasing: "ease-out"
  }
} as const;

// Professional chart type configurations
export const chartConfigs = {
  // Line chart configuration for time series data
  lineChart: {
    strokeWidth: 3,
    dot: {
      r: 4,
      strokeWidth: 2,
      fill: "#161B22"
    },
    activeDot: {
      r: 6,
      strokeWidth: 2,
      fill: "#2E5BFF"
    }
  },
  
  // Area chart configuration for volume data
  areaChart: {
    strokeWidth: 2,
    fillOpacity: 0.3,
    gradient: true
  },
  
  // Bar chart configuration for categorical data
  barChart: {
    radius: [4, 4, 0, 0],
    maxBarSize: 60
  },
  
  // Pie chart configuration for composition data
  pieChart: {
    innerRadius: 60,
    outerRadius: 120,
    paddingAngle: 2,
    cornerRadius: 4
  },
  
  // Radar chart configuration for multi-dimensional data
  radarChart: {
    outerRadius: 120,
    strokeWidth: 2,
    fillOpacity: 0.2
  }
} as const;

// Professional data formatting utilities
export const chartFormatters = {
  // Currency formatter
  currency: (value: number, decimals: number = 2): string => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(decimals)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(decimals)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(decimals)}K`;
    return `$${value.toFixed(decimals)}`;
  },
  
  // Number formatter
  number: (value: number, decimals: number = 0): string => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(decimals)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(decimals)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(decimals)}K`;
    return value.toFixed(decimals);
  },
  
  // Percentage formatter
  percentage: (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
  },
  
  // Date formatter
  date: (value: string | number | Date): string => {
    const date = new Date(value);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
  },
  
  // Time formatter
  time: (value: string | number | Date): string => {
    const date = new Date(value);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  },
  
  // Address formatter
  address: (address: string): string => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
} as const;

// Professional chart theme configuration
export const professionalChartTheme = {
  colors: chartColors,
  styles: chartStyles,
  dimensions: chartDimensions,
  animations: chartAnimations,
  configs: chartConfigs,
  formatters: chartFormatters
} as const;

// Utility function to create gradient definitions for SVG
export const createGradientDefs = (id: string, colors: string[]) => {
  return {
    id,
    colors,
    definition: `
      <defs>
        <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="${colors[0]}" stopOpacity={0.8} />
          <stop offset="100%" stopColor="${colors[1]}" stopOpacity={0.2} />
        </linearGradient>
      </defs>
    `
  };
};

// Utility function to get responsive chart dimensions
export const getResponsiveChartSize = (breakpoint: "mobile" | "tablet" | "desktop") => {
  return chartDimensions.responsive[breakpoint];
};

// Utility function to get chart color by index
export const getChartColor = (index: number): string => {
  return chartColors.series[index % chartColors.series.length];
};

// Export the complete chart configuration
export default professionalChartTheme;