'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Users, TrendingUp, Zap, Target } from 'lucide-react';

interface SocialInfluenceGaugeProps {
  influenceScore: number;
  reachEstimate: number;
  engagementRate: number;
  communityStanding: 'influencer' | 'active' | 'casual' | 'lurker';
  growthTrend: 'growing' | 'stable' | 'declining';
  className?: string;
}

export const SocialInfluenceGauge: React.FC<SocialInfluenceGaugeProps> = ({
  influenceScore,
  reachEstimate,
  engagementRate,
  communityStanding,
  growthTrend,
  className = ''
}) => {
  const gaugeSize = 160;
  const center = gaugeSize / 2;
  const radius = 60;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (influenceScore / 100) * circumference;

  const getStandingColor = (standing: string) => {
    switch (standing) {
      case 'influencer': return 'bg-status-success/10 text-status-success border-status-success/20';
      case 'active': return 'bg-accent-primary/10 text-accent-primary border-accent-primary/20';
      case 'casual': return 'bg-status-warning/10 text-status-warning border-status-warning/20';
      case 'lurker': return 'bg-gray-500/10 text-text-secondary border-gray-500/20';
      default: return 'bg-gray-500/10 text-text-secondary border-gray-500/20';
    }
  };

  const getTrendIcon = () => {
    switch (growthTrend) {
      case 'growing':
        return <TrendingUp className="w-3 h-3 text-status-success" />;
      case 'declining':
        return <TrendingUp className="w-3 h-3 text-status-error rotate-180" />;
      case 'stable':
        return <Target className="w-3 h-3 text-status-warning" />;
      default:
        return <Target className="w-3 h-3 text-text-secondary" />;
    }
  };

  const formatReach = (reach: number) => {
    if (reach >= 1000000) return `${(reach / 1000000).toFixed(1)}M`;
    if (reach >= 1000) return `${(reach / 1000).toFixed(1)}K`;
    return reach.toString();
  };

  const getInfluenceLevel = (score: number) => {
    if (score >= 80) return { level: 'High Influence', color: 'text-status-success' };
    if (score >= 60) return { level: 'Moderate Influence', color: 'text-accent-primary' };
    if (score >= 40) return { level: 'Growing Influence', color: 'text-status-warning' };
    return { level: 'Building Influence', color: 'text-text-secondary' };
  };

  const influenceLevel = getInfluenceLevel(influenceScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="bg-gradient-to-br from-purple-900/10 to-blue-900/10 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center">
            <Zap className="w-5 h-5 mr-2 text-purple-400" />
            Social Influence Score
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Your impact and reach in the crypto community
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Influence Gauge */}
          <div className="flex justify-center">
            <div className="relative">
              <svg width={gaugeSize} height={gaugeSize} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  className="text-gray-700/30"
                />
                
                {/* Progress circle */}
                <motion.circle
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke="url(#influenceGradient)"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                
                {/* Gradient definition */}
                <defs>
                  <linearGradient id="influenceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="50%" stopColor="#2E5BFF" />
                    <stop offset="100%" stopColor="#06FFA5" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Center content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    className="text-3xl font-bold text-foreground"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 1 }}
                  >
                    {influenceScore}
                  </motion.div>
                  <div className="text-xs text-muted-foreground">Influence</div>
                  <Badge className={`text-xs mt-1 ${getStandingColor(communityStanding)}`}>
                    {communityStanding.charAt(0).toUpperCase() + communityStanding.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Influence Level */}
          <div className="text-center">
            <div className={`text-lg font-semibold ${influenceLevel.color}`}>
              {influenceLevel.level}
            </div>
            <div className="flex items-center justify-center space-x-2 mt-2">
              {getTrendIcon()}
              <span className="text-sm text-muted-foreground capitalize">
                {growthTrend} trend
              </span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-muted rounded-lg p-3 border border-border"
            >
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Estimated Reach</span>
              </div>
              <div className="text-xl font-bold text-foreground">
                {formatReach(reachEstimate)}
              </div>
              <div className="text-xs text-muted-foreground">People reached</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-muted rounded-lg p-3 border border-border"
            >
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-secondary" />
                <span className="text-xs font-medium text-muted-foreground">Engagement Rate</span>
              </div>
              <div className="text-xl font-bold text-foreground">
                {(engagementRate * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Avg engagement</div>
            </motion.div>
          </div>

          {/* Influence Breakdown */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Influence Factors</h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Content Quality</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(influenceScore + 10, 100)}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    {Math.min(influenceScore + 10, 100)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Community Engagement</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-secondary"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(influenceScore - 5, 0)}%` }}
                      transition={{ duration: 1, delay: 0.7 }}
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    {Math.max(influenceScore - 5, 0)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Network Growth</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-accent"
                      initial={{ width: 0 }}
                      animate={{ width: `${influenceScore}%` }}
                      transition={{ duration: 1, delay: 0.9 }}
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    {influenceScore}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gradient-to-r from-purple-500/5 to-blue-500/5 dark:from-purple-500/10 dark:to-blue-500/10 rounded-lg p-3 border border-purple-500/20">
            <h4 className="text-sm font-medium text-foreground mb-2">Growth Recommendations</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              {influenceScore < 40 && (
                <div>• Focus on consistent, high-quality content creation</div>
              )}
              {influenceScore < 60 && (
                <div>• Engage more actively with community discussions</div>
              )}
              {influenceScore < 80 && (
                <div>• Build relationships with other crypto influencers</div>
              )}
              {growthTrend === 'declining' && (
                <div>• Analyze recent content performance and adjust strategy</div>
              )}
              <div>• Participate in trending crypto conversations</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};