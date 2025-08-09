'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Award, 
  Target,
  Activity,
  BarChart3,
  Zap,
  Star,
  Hash
} from 'lucide-react';
import type { 
  EnhancedKaitoResult, 
  ProjectEngagementResult, 
  SocialInfluenceResult 
} from '../lib/types';
import { KaitoMetricCard } from './KaitoMetricCard';
import { ProjectEngagementChart } from './ProjectEngagementChart';
import { SocialActivityTrends } from './SocialActivityTrends';

interface KaitoMetricsDashboardProps {
  address: string;
  kaitoData: EnhancedKaitoResult | null;
  projectEngagement: ProjectEngagementResult | null;
  socialInfluence: SocialInfluenceResult | null;
  isLoading?: boolean;
}

export const KaitoMetricsDashboard: React.FC<KaitoMetricsDashboardProps> = ({
  address,
  kaitoData,
  projectEngagement,
  socialInfluence,
  isLoading = false
}) => {
  if (isLoading) {
    return <KaitoMetricsSkeleton />;
  }

  if (!kaitoData) {
    return <NoKaitoActivity />;
  }

  const getInfluenceLevel = (score: number) => {
    if (score >= 80) return { level: 'High Influence', color: 'text-status-success', bg: 'bg-status-success/10' };
    if (score >= 60) return { level: 'Moderate Influence', color: 'text-accent-primary', bg: 'bg-accent-primary/10' };
    if (score >= 40) return { level: 'Growing Influence', color: 'text-status-warning', bg: 'bg-status-warning/10' };
    return { level: 'Building Influence', color: 'text-text-secondary', bg: 'bg-gray-500/10' };
  };

  const influenceLevel = getInfluenceLevel(kaitoData.engagementMetrics.influenceScore);

  return (
    <div className="space-y-6">
      {/* Professional Kaito overview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-500/20 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Kaito Social Metrics</h3>
              <p className="text-muted-foreground">AI-powered crypto social intelligence</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-400">
              {kaitoData.basicMetrics.yapScore}
            </div>
            <div className="text-sm text-text-secondary">Yap Score</div>
            <Badge className={`${influenceLevel.bg} ${influenceLevel.color} border-0 mt-1`}>
              {influenceLevel.level}
            </Badge>
          </div>
        </div>
        
        {/* Enhanced metrics grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KaitoMetricCard
            label="Weekly Yaps"
            value={kaitoData.basicMetrics.weeklyYaps.toString()}
            trend={kaitoData.activityTrends.weeklyGrowth > 0 ? 'up' : kaitoData.activityTrends.weeklyGrowth < 0 ? 'down' : 'stable'}
            trendValue={`${kaitoData.activityTrends.weeklyGrowth > 0 ? '+' : ''}${kaitoData.activityTrends.weeklyGrowth.toFixed(1)}%`}
            icon={<TrendingUp className="w-4 h-4" />}
          />
          <KaitoMetricCard
            label="Alignment Score"
            value={kaitoData.basicMetrics.alignmentScore.toString()}
            subtitle="/100"
            icon={<Target className="w-4 h-4" />}
          />
          <KaitoMetricCard
            label="Leaderboard Rank"
            value={kaitoData.basicMetrics.leaderboardRank ? `#${kaitoData.basicMetrics.leaderboardRank}` : 'N/A'}
            subtitle="Global"
            icon={<Award className="w-4 h-4" />}
          />
          <KaitoMetricCard
            label="Influence Score"
            value={kaitoData.engagementMetrics.influenceScore.toString()}
            subtitle="/100"
            icon={<Users className="w-4 h-4" />}
          />
        </div>
      </motion.div>

      {/* Engagement Quality Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-secondary" />
              Engagement Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Engagement Rate</span>
                  <span className="text-sm font-medium text-foreground">
                    {(kaitoData.engagementMetrics.averageEngagementRate * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={kaitoData.engagementMetrics.averageEngagementRate * 100} 
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Reply Rate</span>
                  <span className="text-sm font-medium text-text-primary">
                    {(kaitoData.engagementMetrics.replyRate * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={kaitoData.engagementMetrics.replyRate * 100} 
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Retweet Ratio</span>
                  <span className="text-sm font-medium text-text-primary">
                    {kaitoData.engagementMetrics.retweetRatio.toFixed(2)}x
                  </span>
                </div>
                <Progress 
                  value={Math.min(kaitoData.engagementMetrics.retweetRatio * 20, 100)} 
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Community Score</span>
                  <span className="text-sm font-medium text-text-primary">
                    {kaitoData.engagementMetrics.communityInteraction}/100
                  </span>
                </div>
                <Progress 
                  value={kaitoData.engagementMetrics.communityInteraction} 
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Activity Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center">
              <Activity className="w-5 h-5 mr-2 text-primary" />
              Activity Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Weekly Growth</span>
                  <div className="flex items-center space-x-1">
                    {kaitoData.activityTrends.weeklyGrowth > 0 ? (
                      <TrendingUp className="w-3 h-3 text-status-success" />
                    ) : (
                      <TrendingUp className="w-3 h-3 text-status-error rotate-180" />
                    )}
                    <span className={`text-sm font-medium ${
                      kaitoData.activityTrends.weeklyGrowth > 0 ? 'text-status-success' : 'text-status-error'
                    }`}>
                      {kaitoData.activityTrends.weeklyGrowth > 0 ? '+' : ''}{kaitoData.activityTrends.weeklyGrowth.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Monthly Growth</span>
                  <div className="flex items-center space-x-1">
                    {kaitoData.activityTrends.monthlyGrowth > 0 ? (
                      <TrendingUp className="w-3 h-3 text-status-success" />
                    ) : (
                      <TrendingUp className="w-3 h-3 text-status-error rotate-180" />
                    )}
                    <span className={`text-sm font-medium ${
                      kaitoData.activityTrends.monthlyGrowth > 0 ? 'text-status-success' : 'text-status-error'
                    }`}>
                      {kaitoData.activityTrends.monthlyGrowth > 0 ? '+' : ''}{kaitoData.activityTrends.monthlyGrowth.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Consistency Score</span>
                  <span className="text-sm font-medium text-text-primary">
                    {kaitoData.activityTrends.consistencyScore}/100
                  </span>
                </div>
                <Progress 
                  value={kaitoData.activityTrends.consistencyScore} 
                  className="h-2"
                />
                <p className="text-xs text-text-secondary">
                  {getConsistencyDescription(kaitoData.activityTrends.consistencyScore)}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Total Yaps</span>
                  <span className="text-lg font-bold text-text-primary">
                    {formatNumber(kaitoData.basicMetrics.totalYaps)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Hash className="w-3 h-3 text-text-secondary" />
                  <span className="text-xs text-text-secondary">
                    Lifetime contributions to crypto discourse
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Project engagement visualization */}
      {projectEngagement && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <ProjectEngagementChart
            projects={projectEngagement.topProjects}
            trendingOpportunities={projectEngagement.trendingOpportunities}
          />
        </motion.div>
      )}

      {/* Social activity trends */}
      {kaitoData.activityTrends.dailyActivity.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <SocialActivityTrends
            dailyActivity={kaitoData.activityTrends.dailyActivity}
            engagementMetrics={kaitoData.engagementMetrics}
          />
        </motion.div>
      )}

      {/* Airdrop Eligibility Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center">
              <Zap className="w-5 h-5 mr-2 text-primary" />
              Airdrop Eligibility Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Overall Eligibility Score</span>
                <span className="text-2xl font-bold text-primary">
                  {kaitoData.airdropEligibility.eligibilityScore}/100
                </span>
              </div>
              
              <Progress 
                value={kaitoData.airdropEligibility.eligibilityScore} 
                className="h-3"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <Star className="w-4 h-4 mr-1 text-green-500 dark:text-green-400" />
                    Strengths
                  </h4>
                  <ul className="space-y-1">
                    {kaitoData.airdropEligibility.eligibilityFactors
                      .filter(factor => factor.score >= 70)
                      .slice(0, 3)
                      .map((factor, index) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-center">
                          <div className="w-1 h-1 bg-green-500 dark:bg-green-400 rounded-full mr-2" />
                          {factor.factor}: {factor.score}/100
                        </li>
                      ))
                    }
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1 text-yellow-500 dark:text-yellow-400" />
                    Improvement Areas
                  </h4>
                  <ul className="space-y-1">
                    {kaitoData.airdropEligibility.eligibilityFactors
                      .filter(factor => factor.score < 70)
                      .slice(0, 3)
                      .map((factor, index) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-center">
                          <div className="w-1 h-1 bg-yellow-500 dark:bg-yellow-400 rounded-full mr-2" />
                          {factor.factor}: {factor.score}/100
                        </li>
                      ))
                    }
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

// Helper component for loading state
const KaitoMetricsSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-700 rounded-xl animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-48 bg-gray-700 rounded animate-pulse" />
            <div className="h-3 w-64 bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
        <div className="text-right space-y-2">
          <div className="h-8 w-16 bg-gray-700 rounded animate-pulse" />
          <div className="h-3 w-20 bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-background-tertiary rounded-lg p-4 space-y-2">
            <div className="h-4 w-20 bg-gray-700 rounded animate-pulse" />
            <div className="h-6 w-16 bg-gray-700 rounded animate-pulse" />
            <div className="h-3 w-12 bg-gray-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
    
    {[...Array(3)].map((_, i) => (
      <div key={i} className="h-64 bg-background-secondary border-gray-800 rounded-xl animate-pulse" />
    ))}
  </div>
);

// Helper component for no Kaito activity state
const NoKaitoActivity: React.FC = () => (
  <Card className="bg-card border-border rounded-xl">
    <CardContent className="py-12 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <MessageSquare className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">No Kaito Activity Found</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        We could not find any Kaito social activity for this address. Connect your Twitter account to Kaito to start building your crypto social presence.
      </p>
      <div className="space-y-2">
        <Badge variant="outline" className="mr-2">Connect Twitter</Badge>
        <Badge variant="outline">Start Yapping</Badge>
      </div>
    </CardContent>
  </Card>
);

// Helper functions
function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

function getConsistencyDescription(score: number): string {
  if (score >= 80) return 'Highly consistent posting schedule';
  if (score >= 60) return 'Good posting consistency';
  if (score >= 40) return 'Moderate posting consistency';
  return 'Irregular posting pattern';
}