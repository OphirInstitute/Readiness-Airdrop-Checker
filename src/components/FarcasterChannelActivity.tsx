'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Hash, BarChart3, Calendar, MessageCircle } from 'lucide-react';
import type { FarcasterChannelActivity, FarcasterCastMetrics } from '@/lib/types';
import {
  formatNumber,
  formatEngagementRate
} from '@/lib/utils/farcaster-display';

interface FarcasterChannelActivityProps {
  channelActivity: FarcasterChannelActivity[];
  castMetrics: FarcasterCastMetrics | null;
}

export default function FarcasterChannelActivity({ channelActivity, castMetrics }: FarcasterChannelActivityProps) {
  // Sort channels by engagement score (descending)
  const sortedChannels = [...channelActivity].sort((a, b) => b.engagementScore - a.engagementScore);
  const topChannels = sortedChannels.slice(0, 5);

  const getEngagementColor = (score: number) => {
    if (score >= 0.8) return '#10B981'; // Green
    if (score >= 0.6) return '#3B82F6'; // Blue  
    if (score >= 0.4) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getEngagementLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Fair';
    return 'Poor';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Unknown';
    }
  };

  const getActivityPattern = () => {
    if (!castMetrics) return null;

    const { totalCasts, recentCasts, castingStreak } = castMetrics;
    const activityRate = totalCasts > 0 ? (recentCasts / 30) : 0; // casts per day

    let pattern = 'Irregular';
    let color = '#EF4444';

    if (castingStreak >= 7 && activityRate >= 1) {
      pattern = 'Highly Consistent';
      color = '#10B981';
    } else if (castingStreak >= 3 && activityRate >= 0.5) {
      pattern = 'Consistent';
      color = '#3B82F6';
    } else if (activityRate >= 0.3) {
      pattern = 'Moderate';
      color = '#F59E0B';
    }

    return { pattern, color, rate: activityRate };
  };

  const activityPattern = getActivityPattern();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Channel Activity & Cast Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Channel Activity List */}
        {channelActivity.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Top Channels
              </h4>
              <Badge variant="outline" className="text-xs">
                {channelActivity.length} channels
              </Badge>
            </div>

            <div className="space-y-3">
              {topChannels.map((channel) => {
                const engagementColor = getEngagementColor(channel.engagementScore);
                const engagementLabel = getEngagementLabel(channel.engagementScore);

                return (
                  <div 
                    key={channel.channelId}
                    className="border border-white/10 bg-background-secondary rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-accent-secondary/10 rounded flex items-center justify-center">
                          <Hash className="h-3 w-3 text-accent-secondary" />
                        </div>
                        <div>
                          <h5 className="font-medium text-text-primary">{channel.channelName}</h5>
                          <p className="text-xs text-text-tertiary">
                            Followed {formatDate(channel.followedAt)}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline"
                        style={{ 
                          borderColor: engagementColor,
                          color: engagementColor,
                          backgroundColor: `${engagementColor}10`
                        }}
                      >
                        {engagementLabel}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-accent-primary">
                          {formatNumber(channel.castCount)}
                        </div>
                        <div className="text-text-secondary">Casts</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold" style={{ color: engagementColor }}>
                          {(channel.engagementScore * 100).toFixed(0)}%
                        </div>
                        <div className="text-text-secondary">Engagement</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-text-primary">
                          {channel.lastCastAt ? formatDate(channel.lastCastAt) : 'Never'}
                        </div>
                        <div className="text-text-secondary">Last Cast</div>
                      </div>
                    </div>

                    {/* Engagement Progress Bar */}
                    <div className="relative w-full max-w-full overflow-hidden">
                      <div className="w-full bg-background-tertiary rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min(channel.engagementScore * 100, 100)}%`,
                            maxWidth: '100%',
                            backgroundColor: engagementColor 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {channelActivity.length > 5 && (
              <div className="text-center">
                <Badge variant="outline" className="text-xs">
                  +{channelActivity.length - 5} more channels
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <Hash className="h-12 w-12 text-text-tertiary mx-auto mb-3" />
            <p className="text-text-secondary">No channel activity data available</p>
          </div>
        )}

        {/* Cast Performance Metrics */}
        {castMetrics && (
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Cast Performance
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center p-4 bg-background-secondary border border-white/10 rounded-lg touch-manipulation">
                <div className="text-lg sm:text-xl font-bold text-accent-primary">
                  {formatNumber(castMetrics.totalCasts)}
                </div>
                <div className="text-sm text-text-secondary">Total Casts</div>
              </div>

              <div className="text-center p-4 bg-background-secondary border border-white/10 rounded-lg touch-manipulation">
                <div className="text-lg sm:text-xl font-bold text-status-success">
                  {formatNumber(castMetrics.recentCasts)}
                </div>
                <div className="text-sm text-text-secondary">Recent (30d)</div>
              </div>

              <div className="text-center p-4 bg-background-secondary border border-white/10 rounded-lg touch-manipulation">
                <div className="text-lg sm:text-xl font-bold text-accent-secondary">
                  {formatEngagementRate(castMetrics.averageEngagement)}
                </div>
                <div className="text-sm text-text-secondary">Avg Engagement</div>
              </div>

              <div className="text-center p-4 bg-background-secondary border border-white/10 rounded-lg touch-manipulation">
                <div className="text-lg sm:text-xl font-bold text-status-warning">
                  {castMetrics.castingStreak}
                </div>
                <div className="text-sm text-text-secondary">Day Streak</div>
              </div>
            </div>

            {/* Quality Score */}
            <div className="border border-white/10 bg-background-secondary rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-text-primary">Content Quality Score</span>
                <Badge variant="outline" className="border-accent-primary/20 text-accent-primary">
                  {castMetrics.qualityScore ? `${(castMetrics.qualityScore * 100).toFixed(0)}%` : 'N/A'}
                </Badge>
              </div>
              {castMetrics.qualityScore && (
                <div className="relative w-full max-w-full overflow-hidden">
                  <div className="w-full bg-background-tertiary rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary transition-all duration-300"
                      style={{ 
                        width: `${Math.min(castMetrics.qualityScore * 100, 100)}%`,
                        maxWidth: '100%'
                      }}
                    />
                  </div>
                </div>
              )}
              <p className="text-xs text-text-tertiary mt-2">
                Based on engagement rate relative to follower count
              </p>
            </div>
          </div>
        )}

        {/* Activity Pattern Visualization */}
        {activityPattern && (
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Activity Pattern
            </h4>

            <div className="border border-white/10 bg-background-secondary rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-text-primary">Posting Consistency</span>
                <Badge 
                  variant="outline"
                  style={{ 
                    borderColor: activityPattern.color,
                    color: activityPattern.color,
                    backgroundColor: `${activityPattern.color}10`
                  }}
                >
                  {activityPattern.pattern}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-text-secondary">Daily Rate:</span>
                  <span className="ml-2 font-semibold text-text-primary">
                    {activityPattern.rate.toFixed(1)} casts/day
                  </span>
                </div>
                <div>
                  <span className="text-text-secondary">Current Streak:</span>
                  <span className="ml-2 font-semibold text-text-primary">
                    {castMetrics?.castingStreak || 0} days
                  </span>
                </div>
              </div>

              {/* Activity visualization */}
              <div className="mt-3">
                <div className="flex items-center gap-1 mb-1">
                  <MessageCircle className="h-3 w-3 text-text-tertiary" />
                  <span className="text-xs text-text-secondary">Activity Level</span>
                </div>
                <div className="relative w-full max-w-full overflow-hidden">
                  <div className="w-full bg-background-tertiary rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(activityPattern.rate * 50, 100)}%`,
                        maxWidth: '100%',
                        backgroundColor: activityPattern.color 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="bg-background-secondary border border-white/10 rounded-lg p-4">
          <h5 className="font-medium text-text-primary mb-3">Channel Engagement Summary</h5>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-text-secondary">Active Channels:</span>
              <span className="ml-2 font-semibold text-text-primary">
                {channelActivity.filter(c => c.castCount > 0).length}
              </span>
            </div>
            <div>
              <span className="text-text-secondary">Avg Engagement:</span>
              <span className="ml-2 font-semibold text-text-primary">
                {channelActivity.length > 0 
                  ? `${((channelActivity.reduce((sum, c) => sum + c.engagementScore, 0) / channelActivity.length) * 100).toFixed(0)}%`
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}