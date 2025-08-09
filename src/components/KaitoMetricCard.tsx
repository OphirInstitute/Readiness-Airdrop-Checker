'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KaitoMetricCardProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  subtitle?: string;
  className?: string;
}

export const KaitoMetricCard: React.FC<KaitoMetricCardProps> = ({
  label,
  value,
  icon,
  trend,
  trendValue,
  subtitle,
  className = ''
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-status-success" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-status-error" />;
      case 'stable':
        return <Minus className="w-3 h-3 text-status-warning" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-status-success';
      case 'down':
        return 'text-status-error';
      case 'stable':
        return 'text-status-warning';
      default:
        return 'text-text-secondary';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="bg-purple-500/5 border-purple-500/20 hover:border-purple-500/30 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
              {label}
            </span>
            {icon && (
              <div className="text-purple-400">
                {icon}
              </div>
            )}
          </div>
          
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-bold text-text-primary">
              {value}
            </span>
            {subtitle && (
              <span className="text-sm text-text-secondary">
                {subtitle}
              </span>
            )}
          </div>
          
          {(trend && trendValue) && (
            <div className="flex items-center space-x-1 mt-2">
              {getTrendIcon()}
              <span className={`text-xs font-medium ${getTrendColor()}`}>
                {trendValue}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};