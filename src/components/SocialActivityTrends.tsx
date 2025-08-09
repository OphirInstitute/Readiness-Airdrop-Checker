'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  BarChart3, 
  Calendar,
  Activity,
  Users
} from 'lucide-react';
import type { DailyActivity } from '../lib/types';

interface EngagementMetrics {
  averageEngagementRate: number;
  replyRate: number;
  retweetRatio: number;
  communityInteraction: number;
  influenceScore: number;
}

interface SocialActivityTrendsProps {
  dailyActivity: DailyActivity[];
  engagementMetrics: EngagementMetrics;
}

export const SocialActivityTrends: React.FC<SocialActivityTrendsProps> = ({
  dailyActivity,
  engagementMetrics
}) => {
  // Get last 30 days of activity
  const recentActivity = dailyActivity.slice(-30);
  const maxYaps = Math.max(...recentActivity.map(day => day.yaps));
  const maxEngagement = Math.max(...recentActivity.map(day => day.engagement));
  const maxReach = Math.max(...recentActivity.map(day => day.reach));

  // Calculate weekly averages
  const weeklyAverages = calculateWeeklyAverages(recentActivity);

  return (
    <Card className="bg-background-secondary border-gray-800">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-text-primary flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-accent-primary" />
          Social Activity Trends
          <Badge variant="outline" className="ml-2 text-xs">
            Last 30 Days
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Activity Chart */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-text-primary">Daily Activity</h4>
            <div className="flex items-center space-x-4 text-xs text-text-secondary">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-accent-primary rounded-full" />
                <span>Yaps</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-accent-secondary rounded-full" />
                <span>Engagement</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-accent-tertiary rounded-full" />
                <span>Reach</span>
              </div>
            </div>
          </div>
          
          <div className="h-32 flex items-end space-x-1 overflow-x-auto">
            {recentActivity.map((day, index) => (
              <motion.div
                key={day.date}
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                transition={{ duration: 0.5, delay: index * 0.02 }}
                className="flex-shrink-0 flex flex-col items-center space-y-1 group relative"
              >
                {/* Bars */}
                <div className="flex items-end space-x-0.5 h-24">
                  <div
                    className="w-2 bg-accent-primary rounded-t-sm transition-opacity group-hover:opacity-80"
                    style={{ height: `${(day.yaps / maxYaps) * 100}%` }}
                  />
                  <div
                    className="w-2 bg-accent-secondary rounded-t-sm transition-opacity group-hover:opacity-80"
                    style={{ height: `${(day.engagement / maxEngagement) * 100}%` }}
                  />
                  <div
                    className="w-2 bg-accent-tertiary rounded-t-sm transition-opacity group-hover:opacity-80"
                    style={{ height: `${(day.reach / maxReach) * 100}%` }}
                  />
                </div>
                
                {/* Date label */}
                <div className="text-xs text-text-secondary transform -rotate-45 origin-left">
                  {formatDateShort(day.date)}
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-background-tertiary border border-gray-700 rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="text-xs space-y-1 whitespace-nowrap">
                    <div className="font-medium text-text-primary">{formatDateFull(day.date)}</div>
                    <div className="text-accent-primary">Yaps: {day.yaps}</div>
                    <div className="text-accent-secondary">Engagement: {day.engagement}</div>
                    <div className="text-accent-tertiary">Reach: {formatNumber(day.reach)}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Weekly Averages */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {weeklyAverages.map((week, index) => (
            <motion.div
              key={week.week}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-background-tertiary rounded-lg p-3 border border-gray-700/50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-secondary">Week {week.week}</span>
                <Calendar className="w-3 h-3 text-text-secondary" />
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">Avg Yaps</span>
                  <span className="text-xs font-medium text-text-primary">
                    {week.avgYaps.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">Avg Engagement</span>
                  <span className="text-xs font-medium text-text-primary">
                    {week.avgEngagement.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">Avg Reach</span>
                  <span className="text-xs font-medium text-text-primary">
                    {formatNumber(week.avgReach)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Engagement Summary */}
        <div className="bg-gradient-to-r from-accent-primary/5 to-accent-secondary/5 rounded-lg p-4 border border-accent-primary/20">
          <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Engagement Summary
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-accent-primary">
                {(engagementMetrics.averageEngagementRate * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-text-secondary">Avg Engagement</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-accent-secondary">
                {(engagementMetrics.replyRate * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-text-secondary">Reply Rate</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-accent-tertiary">
                {engagementMetrics.retweetRatio.toFixed(1)}x
              </div>
              <div className="text-xs text-text-secondary">Retweet Ratio</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-status-success">
                {engagementMetrics.communityInteraction}/100
              </div>
              <div className="text-xs text-text-secondary">Community Score</div>
            </div>
          </div>
        </div>

        {/* Activity Insights */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-text-primary flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Activity Insights
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">Most Active Day</span>
                <span className="text-xs font-medium text-text-primary">
                  {getMostActiveDay(recentActivity)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">Peak Engagement</span>
                <span className="text-xs font-medium text-text-primary">
                  {maxEngagement}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">Total Yaps (30d)</span>
                <span className="text-xs font-medium text-text-primary">
                  {recentActivity.reduce((sum, day) => sum + day.yaps, 0)}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">Activity Streak</span>
                <span className="text-xs font-medium text-text-primary">
                  {calculateStreak(recentActivity)} days
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">Avg Daily Reach</span>
                <span className="text-xs font-medium text-text-primary">
                  {formatNumber(recentActivity.reduce((sum, day) => sum + day.reach, 0) / recentActivity.length)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">Consistency</span>
                <Badge 
                  className={`text-xs ${getConsistencyBadge(calculateConsistency(recentActivity))}`}
                >
                  {getConsistencyLabel(calculateConsistency(recentActivity))}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper functions
function calculateWeeklyAverages(activity: DailyActivity[]) {
  const weeks: Array<{
    week: number;
    avgYaps: number;
    avgEngagement: number;
    avgReach: number;
  }> = [];

  for (let i = 0; i < 4; i++) {
    const weekStart = i * 7;
    const weekEnd = Math.min((i + 1) * 7, activity.length);
    const weekData = activity.slice(weekStart, weekEnd);
    
    if (weekData.length > 0) {
      weeks.push({
        week: i + 1,
        avgYaps: weekData.reduce((sum, day) => sum + day.yaps, 0) / weekData.length,
        avgEngagement: weekData.reduce((sum, day) => sum + day.engagement, 0) / weekData.length,
        avgReach: weekData.reduce((sum, day) => sum + day.reach, 0) / weekData.length
      });
    }
  }

  return weeks;
}

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatDateFull(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return Math.round(value).toString();
}

function getMostActiveDay(activity: DailyActivity[]): string {
  const mostActive = activity.reduce((max, day) => 
    day.yaps > max.yaps ? day : max
  );
  return formatDateShort(mostActive.date);
}

function calculateStreak(activity: DailyActivity[]): number {
  let streak = 0;
  for (let i = activity.length - 1; i >= 0; i--) {
    if (activity[i].yaps > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function calculateConsistency(activity: DailyActivity[]): number {
  const activeDays = activity.filter(day => day.yaps > 0).length;
  return (activeDays / activity.length) * 100;
}

function getConsistencyLabel(consistency: number): string {
  if (consistency >= 80) return 'Excellent';
  if (consistency >= 60) return 'Good';
  if (consistency >= 40) return 'Fair';
  return 'Poor';
}

function getConsistencyBadge(consistency: number): string {
  if (consistency >= 80) return 'bg-status-success/10 text-status-success border-status-success/20';
  if (consistency >= 60) return 'bg-accent-primary/10 text-accent-primary border-accent-primary/20';
  if (consistency >= 40) return 'bg-status-warning/10 text-status-warning border-status-warning/20';
  return 'bg-status-error/10 text-status-error border-status-error/20';
}