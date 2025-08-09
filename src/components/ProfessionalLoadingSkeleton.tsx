'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from './ui/card';

interface ProfessionalLoadingSkeletonProps {
  type: 'bridge' | 'kaito' | 'dashboard' | 'chart';
  className?: string;
}

export const ProfessionalLoadingSkeleton: React.FC<ProfessionalLoadingSkeletonProps> = ({
  type,
  className = ''
}) => {
  const shimmer = {
    initial: { x: '-100%' },
    animate: { x: '100%' },
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: [0.4, 0, 0.6, 1] as const
    }
  };

  const SkeletonBox: React.FC<{ width?: string; height?: string; className?: string }> = ({ 
    width = 'w-full', 
    height = 'h-4', 
    className: boxClassName = '' 
  }) => (
    <div className={`${width} ${height} bg-gray-700 rounded-md overflow-hidden relative ${boxClassName}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/20 to-transparent"
        {...shimmer}
      />
    </div>
  );

  const renderBridgeSkeleton = () => (
    <Card className="bg-background-secondary border-gray-800 rounded-xl overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <SkeletonBox width="w-12" height="h-12" className="rounded-xl" />
            <div className="space-y-2">
              <SkeletonBox width="w-32" height="h-5" />
              <SkeletonBox width="w-48" height="h-3" />
            </div>
          </div>
          <div className="text-right space-y-2">
            <SkeletonBox width="w-20" height="h-6" />
            <SkeletonBox width="w-16" height="h-3" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Metrics grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className="bg-background-tertiary rounded-lg p-4 space-y-2"
            >
              <SkeletonBox width="w-20" height="h-4" />
              <SkeletonBox width="w-16" height="h-6" />
              <SkeletonBox width="w-12" height="h-3" />
            </motion.div>
          ))}
        </div>

        {/* Progress bar skeleton */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <SkeletonBox width="w-32" height="h-4" />
            <SkeletonBox width="w-12" height="h-4" />
          </div>
          <SkeletonBox width="w-full" height="h-2" className="rounded-full" />
        </div>

        {/* Timeline skeleton */}
        <div className="space-y-3">
          <SkeletonBox width="w-40" height="h-5" />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="bg-background-tertiary rounded-lg p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <SkeletonBox width="w-8" height="h-8" className="rounded-full" />
                    <div className="space-y-1">
                      <SkeletonBox width="w-24" height="h-4" />
                      <SkeletonBox width="w-32" height="h-3" />
                    </div>
                  </div>
                  <SkeletonBox width="w-16" height="h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderKaitoSkeleton = () => (
    <div className="space-y-6">
      {/* Main Kaito card skeleton */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <SkeletonBox width="w-12" height="h-12" className="rounded-xl" />
            <div className="space-y-2">
              <SkeletonBox width="w-48" height="h-5" />
              <SkeletonBox width="w-64" height="h-3" />
            </div>
          </div>
          
          <div className="text-right space-y-2">
            <SkeletonBox width="w-16" height="h-8" />
            <SkeletonBox width="w-20" height="h-3" />
            <SkeletonBox width="w-24" height="h-4" />
          </div>
        </div>
        
        {/* Metrics grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className="bg-purple-500/5 border-purple-500/20 rounded-lg p-4 space-y-2"
            >
              <SkeletonBox width="w-20" height="h-3" />
              <SkeletonBox width="w-16" height="h-6" />
              <SkeletonBox width="w-12" height="h-3" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Additional cards */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: (i + 1) * 0.1 }}
        >
          <Card className="bg-background-secondary border-gray-800">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <SkeletonBox width="w-5" height="h-5" />
                <SkeletonBox width="w-32" height="h-5" />
              </div>
            </CardHeader>
            <CardContent>
              <SkeletonBox width="w-full" height="h-32" />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderDashboardSkeleton = () => (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonBox width="w-64" height="h-8" />
          <SkeletonBox width="w-48" height="h-4" />
        </div>
        <SkeletonBox width="w-32" height="h-10" className="rounded-lg" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            <Card className="bg-background-secondary border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <SkeletonBox width="w-6" height="h-6" />
                  <SkeletonBox width="w-16" height="h-4" />
                </div>
                <SkeletonBox width="w-20" height="h-8" />
                <SkeletonBox width="w-24" height="h-3" className="mt-2" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Chart skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="bg-background-secondary border-gray-800">
          <CardHeader>
            <SkeletonBox width="w-48" height="h-6" />
          </CardHeader>
          <CardContent>
            <SkeletonBox width="w-full" height="h-64" />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  const renderChartSkeleton = () => (
    <Card className="bg-background-secondary border-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <SkeletonBox width="w-48" height="h-6" />
            <SkeletonBox width="w-64" height="h-4" />
          </div>
          <div className="text-right space-y-2">
            <SkeletonBox width="w-20" height="h-8" />
            <SkeletonBox width="w-16" height="h-3" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Chart area */}
        <div className="relative h-48">
          <SkeletonBox width="w-full" height="h-full" />
          {/* Animated bars */}
          <div className="absolute inset-0 flex items-end justify-between space-x-1 p-4">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="flex-1 bg-accent-primary/20 rounded-t-sm"
                initial={{ height: 0 }}
                animate={{ height: `${Math.random() * 80 + 20}%` }}
                transition={{ duration: 1, delay: i * 0.1 }}
              />
            ))}
          </div>
        </div>

        {/* Legend skeleton */}
        <div className="flex justify-center space-x-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <SkeletonBox width="w-3" height="h-3" className="rounded-full" />
              <SkeletonBox width="w-16" height="h-3" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'bridge':
        return renderBridgeSkeleton();
      case 'kaito':
        return renderKaitoSkeleton();
      case 'dashboard':
        return renderDashboardSkeleton();
      case 'chart':
        return renderChartSkeleton();
      default:
        return renderDashboardSkeleton();
    }
  };

  return (
    <div className={className}>
      {renderSkeleton()}
    </div>
  );
};