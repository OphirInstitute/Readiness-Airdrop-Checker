'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, MessageCircle, Repeat, Heart, Hash, Zap, Calendar } from 'lucide-react';
import type { FarcasterProfile, FarcasterCastMetrics } from '@/lib/types';
import {
  formatNumber,
  formatEngagementRate,
  formatCastingStreak,
  getCastingStreakStatus,
  formatChannelParticipation,
  getChannelParticipationStatus,
  formatActivityLevel,
  getEngagementQuality,
  formatTopCastDisplay
} from '@/lib/utils/farcaster-display';

interface FarcasterActivityMetricsProps {
  profile: FarcasterProfile;
  castMetrics: FarcasterCastMetrics | null;
}

export default function FarcasterActivityMetrics({ profile, castMetrics }: FarcasterActivityMetricsProps) {
  const activityLevel = formatActivityLevel(profile.recentCastCount);
  const castingStreakStatus = getCastingStreakStatus(castMetrics?.castingStreak || 0);
  const channelParticipationStatus = getChannelParticipationStatus(profile.uniqueChannelsPosted);
  const engagementQuality = getEngagementQuality(
    profile.averageLikesPerCast,
    profile.averageRecastsPerCast,
    profile.averageRepliesPerCast,
    profile.followerCount
  );
  const topCastDisplay = formatTopCastDisplay(castMetrics?.topPerformingCast || null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity & Engagement Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recent Activity Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center p-4 bg-muted rounded-lg touch-manipulation">
            <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {formatNumber(profile.recentCastCount)}
            </div>
            <div className="text-sm text-muted-foreground">Recent Casts</div>
            <div className="text-xs text-muted-foreground">(30 days)</div>
          </div>
          
          <div className="text-center p-4 bg-muted rounded-lg touch-manipulation">
            <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              {formatNumber(castMetrics?.totalCasts || profile.castCount)}
            </div>
            <div className="text-sm text-muted-foreground">Total Casts</div>
            <div className="text-xs text-muted-foreground">(all time)</div>
          </div>
          
          <div className="text-center p-4 bg-muted rounded-lg touch-manipulation">
            <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {formatEngagementRate(profile.engagementRate)}
            </div>
            <div className="text-sm text-muted-foreground">Engagement Rate</div>
            <div className="text-xs text-muted-foreground">(avg per cast)</div>
          </div>
          
          <div className="text-center p-4 bg-muted rounded-lg touch-manipulation">
            <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
              {formatNumber(profile.uniqueChannelsPosted)}
            </div>
            <div className="text-sm text-muted-foreground">Channels</div>
            <div className="text-xs text-muted-foreground">(posted to)</div>
          </div>
        </div>

        {/* Activity Level and Streak */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4" style={{ color: activityLevel.color }} />
              <span className="font-medium">Activity Level</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold" style={{ color: activityLevel.color }}>
                {activityLevel.label}
              </span>
              <Badge 
                variant="outline"
                style={{ 
                  borderColor: activityLevel.color,
                  color: activityLevel.color,
                  backgroundColor: `${activityLevel.color}10`
                }}
              >
                {profile.recentCastCount} casts
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Based on recent 30-day activity</p>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4" style={{ color: castingStreakStatus.color }} />
              <span className="font-medium">Casting Streak</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold" style={{ color: castingStreakStatus.color }}>
                {formatCastingStreak(castMetrics?.castingStreak || 0)}
              </span>
              <Badge 
                variant="outline"
                style={{ 
                  borderColor: castingStreakStatus.color,
                  color: castingStreakStatus.color,
                  backgroundColor: `${castingStreakStatus.color}10`
                }}
              >
                {castingStreakStatus.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Consecutive days with at least 1 cast</p>
          </div>
        </div>

        {/* Engagement Averages */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Engagement Averages per Cast
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center p-4 border border-border rounded-lg touch-manipulation">
              <Heart className="h-6 w-6 text-red-500 dark:text-red-400 mx-auto mb-2" />
              <div className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">
                {formatNumber(profile.averageLikesPerCast)}
              </div>
              <div className="text-sm text-muted-foreground">Likes</div>
            </div>
            
            <div className="text-center p-4 border border-border rounded-lg touch-manipulation">
              <Repeat className="h-6 w-6 text-green-500 dark:text-green-400 mx-auto mb-2" />
              <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                {formatNumber(profile.averageRecastsPerCast)}
              </div>
              <div className="text-sm text-muted-foreground">Recasts</div>
            </div>
            
            <div className="text-center p-4 border border-border rounded-lg touch-manipulation">
              <MessageCircle className="h-6 w-6 text-blue-500 dark:text-blue-400 mx-auto mb-2" />
              <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatNumber(profile.averageRepliesPerCast)}
              </div>
              <div className="text-sm text-muted-foreground">Replies</div>
            </div>
          </div>
          
          {/* Engagement Quality Summary */}
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">Engagement Quality</span>
              <Badge 
                variant="outline"
                style={{ 
                  borderColor: engagementQuality.color,
                  color: engagementQuality.color,
                  backgroundColor: `${engagementQuality.color}10`
                }}
              >
                {engagementQuality.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {formatEngagementRate(engagementQuality.rate)} average engagement rate
            </p>
          </div>
        </div>

        {/* Channel Participation */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Channel Participation
          </h4>
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold" style={{ color: channelParticipationStatus.color }}>
                {formatChannelParticipation(profile.uniqueChannelsPosted)}
              </span>
              <Badge 
                variant="outline"
                style={{ 
                  borderColor: channelParticipationStatus.color,
                  color: channelParticipationStatus.color,
                  backgroundColor: `${channelParticipationStatus.color}10`
                }}
              >
                {channelParticipationStatus.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Active participation across {profile.uniqueChannelsPosted} unique channels
            </p>
            {profile.channelFollowCount > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Following {formatNumber(profile.channelFollowCount)} channels total
              </p>
            )}
          </div>
        </div>

        {/* Top Performing Cast */}
        {topCastDisplay && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top Performing Cast
            </h4>
            <div className="border border-border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
              <div className="mb-3">
                <p className="text-sm font-medium text-foreground leading-relaxed">
                  &ldquo;{topCastDisplay.text}&rdquo;
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {topCastDisplay.engagement}
                </div>
                <Badge variant="outline" className="bg-card">
                  {formatNumber(topCastDisplay.totalEngagement)} total
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Consistency Indicators */}
        {castMetrics && (
          <div className="bg-muted rounded-lg p-4">
            <h5 className="font-medium mb-3 text-foreground">Consistency Metrics</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Quality Score:</span>
                <span className="ml-2 font-semibold text-foreground">
                  {castMetrics.qualityScore ? `${(castMetrics.qualityScore * 100).toFixed(0)}%` : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Average Engagement:</span>
                <span className="ml-2 font-semibold text-foreground">
                  {formatNumber(castMetrics.averageEngagement)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}