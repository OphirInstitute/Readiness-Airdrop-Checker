'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  ArrowRightLeft, 
  DollarSign, 
  Activity, 
  Network, 
  TrendingUp,
  Clock
} from 'lucide-react';
import type { OrbiterActivityResult, HopActivityResult } from '../lib/types';

interface ProtocolBreakdownProps {
  protocol: 'Orbiter Finance' | 'Hop Protocol';
  data: OrbiterActivityResult | HopActivityResult;
  color: 'blue' | 'purple';
}

export const ProtocolBreakdown: React.FC<ProtocolBreakdownProps> = ({
  protocol,
  data,
  color
}) => {
  const isOrbiter = protocol === 'Orbiter Finance';
  const orbiterData = isOrbiter ? data as OrbiterActivityResult : null;
  const hopData = !isOrbiter ? data as HopActivityResult : null;

  const colorClasses = {
    blue: {
      bg: 'bg-blue-500/5',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
      accent: 'bg-blue-500/10',
      progress: 'bg-blue-500'
    },
    purple: {
      bg: 'bg-purple-500/5',
      border: 'border-purple-500/20',
      text: 'text-purple-400',
      accent: 'bg-purple-500/10',
      progress: 'bg-purple-500'
    }
  };

  const colors = colorClasses[color];

  // Extract metrics based on protocol
  const metrics = isOrbiter && orbiterData ? {
    totalTransactions: orbiterData.totalTransactions,
    totalVolume: parseFloat(orbiterData.totalVolume),
    uniqueChains: orbiterData.uniqueChains,
    eligibilityScore: orbiterData.eligibilityScore,
    tier: orbiterData.tier,
    lastActivity: orbiterData.lastTransaction,
    averageSize: parseFloat(orbiterData.averageTransactionSize),
    isRegular: orbiterData.activityPatterns.isRegularUser
  } : hopData ? {
    totalTransactions: hopData.bridgeActivity.totalTransactions,
    totalVolume: parseFloat(hopData.bridgeActivity.totalVolume),
    uniqueChains: hopData.bridgeActivity.uniqueChains,
    eligibilityScore: hopData.eligibilityMetrics.combinedScore,
    tier: hopData.eligibilityMetrics.tier,
    lastActivity: hopData.bridgeActivity.lastTransaction,
    averageSize: hopData.bridgeActivity.totalTransactions > 0 
      ? parseFloat(hopData.bridgeActivity.totalVolume) / hopData.bridgeActivity.totalTransactions 
      : 0,
    isRegular: hopData.bridgeActivity.totalTransactions > 5,
    lpPositions: hopData.lpActivity.totalPositions,
    lpBonus: hopData.eligibilityMetrics.lpBonusMultiplier
  } : null;

  if (!metrics) {
    return (
      <Card className={`${colors.bg} ${colors.border}`}>
        <CardContent className="py-8 text-center">
          <div className={`w-12 h-12 ${colors.accent} rounded-full flex items-center justify-center mx-auto mb-3`}>
            <ArrowRightLeft className={`w-6 h-6 ${colors.text}`} />
          </div>
          <p className="text-text-secondary">No {protocol.toLowerCase()} activity found</p>
        </CardContent>
      </Card>
    );
  }

  const formatLastActivity = (timestamp: number) => {
    if (!timestamp) return 'Never';
    const days = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-gray-300 text-gray-900';
      case 'gold': return 'bg-yellow-500 text-yellow-900';
      case 'silver': return 'bg-gray-400 text-gray-900';
      case 'bronze': return 'bg-orange-600 text-orange-100';
      default: return 'bg-gray-600 text-gray-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={`${colors.bg} ${colors.border} hover:border-opacity-40 transition-colors`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-text-primary flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-8 h-8 ${colors.accent} rounded-lg flex items-center justify-center mr-3`}>
                <ArrowRightLeft className={`w-4 h-4 ${colors.text}`} />
              </div>
              {protocol}
            </div>
            <Badge className={`${getTierColor(metrics.tier)} text-xs font-medium`}>
              {metrics.tier.charAt(0).toUpperCase() + metrics.tier.slice(1)}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <Activity className="w-3 h-3 text-text-secondary" />
                <span className="text-xs text-text-secondary">Transactions</span>
              </div>
              <div className="text-lg font-bold text-text-primary">
                {metrics.totalTransactions}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <DollarSign className="w-3 h-3 text-text-secondary" />
                <span className="text-xs text-text-secondary">Volume</span>
              </div>
              <div className="text-lg font-bold text-text-primary">
                ${formatNumber(metrics.totalVolume)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <Network className="w-3 h-3 text-text-secondary" />
                <span className="text-xs text-text-secondary">Chains</span>
              </div>
              <div className="text-lg font-bold text-text-primary">
                {metrics.uniqueChains}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3 text-text-secondary" />
                <span className="text-xs text-text-secondary">Avg Size</span>
              </div>
              <div className="text-lg font-bold text-text-primary">
                ${formatNumber(metrics.averageSize)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-text-secondary">
                Eligibility Score
              </span>
              <span className="text-xs text-text-primary font-medium">
                {metrics.eligibilityScore}/100
              </span>
            </div>
            <Progress 
              value={metrics.eligibilityScore} 
              className="h-2"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3 text-text-secondary" />
              <span className="text-xs text-text-secondary">
                Last activity: {formatLastActivity(metrics.lastActivity)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`
                w-2 h-2 rounded-full
                ${metrics.isRegular ? 'bg-status-success' : 'bg-status-warning'}
              `} />
              <span className="text-xs text-text-secondary">
                {metrics.isRegular ? 'Regular User' : 'Casual User'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}