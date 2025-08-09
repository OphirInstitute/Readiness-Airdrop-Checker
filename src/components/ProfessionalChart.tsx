'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, unknown>;
}

interface ProfessionalChartProps {
  data: ChartDataPoint[];
  type: 'line' | 'bar' | 'area' | 'donut';
  theme: 'dark' | 'professional';
  height?: number;
  showLegend?: boolean;
  interactive?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const ProfessionalChart: React.FC<ProfessionalChartProps> = ({
  data,
  type,
  theme = 'professional',
  height = 200,
  showLegend = true,
  interactive = true,
  title,
  subtitle,
  className = ''
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const colors = theme === 'dark' 
    ? ['#2E5BFF', '#7C3AED', '#06FFA5', '#FFB800', '#FF4747']
    : ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

  const renderBarChart = () => (
    <div className="flex items-end justify-between space-x-2" style={{ height }}>
      {data.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ height: 0 }}
          animate={{ height: `${(item.value / maxValue) * 100}%` }}
          transition={{ duration: 0.8, delay: index * 0.1 }}
          className="flex-1 group relative"
        >
          <div
            className="w-full rounded-t-md transition-opacity hover:opacity-80 cursor-pointer"
            style={{ 
              backgroundColor: item.color || colors[index % colors.length],
              height: '100%'
            }}
          />
          
          {interactive && (
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-background-tertiary border border-white/10 dark:border-white/10 border-gray-200 rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
              <div className="text-xs text-text-primary font-medium">{item.label}</div>
              <div className="text-xs text-text-secondary">{item.value}</div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );

  const renderLineChart = () => {
    const points = data.map((item, index) => ({
      x: (index / (data.length - 1)) * 100,
      y: 100 - (item.value / maxValue) * 100
    }));

    const pathData = points.reduce((path, point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${path} ${command} ${point.x} ${point.y}`;
    }, '');

    return (
      <div className="relative" style={{ height }}>
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors[0]} stopOpacity="0.3" />
              <stop offset="100%" stopColor={colors[0]} stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Area fill */}
          <path
            d={`${pathData} L 100 100 L 0 100 Z`}
            fill="url(#lineGradient)"
          />
          
          {/* Line */}
          <motion.path
            d={pathData}
            fill="none"
            stroke={colors[0]}
            strokeWidth="0.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <motion.circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="1"
              fill={colors[0]}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="hover:r-2 transition-all cursor-pointer"
            />
          ))}
        </svg>
        
        {/* Data point labels */}
        {interactive && data.map((item, index) => (
          <div
            key={item.label}
            className="absolute transform -translate-x-1/2 group"
            style={{
              left: `${(index / (data.length - 1)) * 100}%`,
              top: `${100 - (item.value / maxValue) * 100}%`
            }}
          >
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background-tertiary border border-white/10 dark:border-white/10 border-gray-200 rounded-lg p-2 -mt-12 shadow-lg">
              <div className="text-xs text-text-primary font-medium">{item.label}</div>
              <div className="text-xs text-text-secondary">{item.value}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDonutChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;
    const radius = 40;
    const strokeWidth = 8;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;

    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="relative">
          <svg width={radius * 2} height={radius * 2} className="transform -rotate-90">
            <circle
              cx={radius}
              cy={radius}
              r={normalizedRadius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              className="text-text-tertiary"
            />
            
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -cumulativePercentage / 100 * circumference;
              cumulativePercentage += percentage;

              return (
                <motion.circle
                  key={item.label}
                  cx={radius}
                  cy={radius}
                  r={normalizedRadius}
                  stroke={item.color || colors[index % colors.length]}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  initial={{ strokeDasharray: `0 ${circumference}` }}
                  animate={{ strokeDasharray }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                  className="hover:stroke-opacity-80 transition-all cursor-pointer"
                />
              );
            })}
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-text-primary">{total}</div>
              <div className="text-xs text-text-secondary">Total</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'line':
      case 'area':
        return renderLineChart();
      case 'donut':
        return renderDonutChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="bg-background-secondary border-white/10 dark:border-white/10 border-gray-200">
        {(title || subtitle) && (
          <CardHeader className="pb-3">
            {title && (
              <CardTitle className="text-lg font-semibold text-text-primary">
                {title}
              </CardTitle>
            )}
            {subtitle && (
              <p className="text-sm text-text-secondary">{subtitle}</p>
            )}
          </CardHeader>
        )}
        
        <CardContent className="space-y-4">
          {renderChart()}
          
          {/* X-axis labels for bar and line charts */}
          {(type === 'bar' || type === 'line' || type === 'area') && (
            <div className="flex justify-between text-xs text-text-secondary">
              {data.map((item, index) => (
                <span key={index} className="truncate max-w-16">
                  {item.label}
                </span>
              ))}
            </div>
          )}
          
          {/* Legend */}
          {showLegend && type === 'donut' && (
            <div className="flex flex-wrap gap-2 justify-center">
              {data.map((item, index) => (
                <div key={item.label} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color || colors[index % colors.length] }}
                  />
                  <span className="text-xs text-text-secondary">{item.label}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.value}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};