'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, CheckCircle, Shield, User } from 'lucide-react';
import type { FarcasterProfile } from '@/lib/types';
import {
  formatNumber,
  formatBioText,
  formatPowerBadgeStatus,
  getVerificationStatus,
  getQualityTierColor,
  formatTierDisplayName,
  formatVerificationCount
} from '@/lib/utils/farcaster-display';

interface FarcasterProfileOverviewProps {
  profile: FarcasterProfile;
}

export default function FarcasterProfileOverview({ profile }: FarcasterProfileOverviewProps) {
  const powerBadgeStatus = formatPowerBadgeStatus(profile.hasPowerBadge);
  const verificationStatus = getVerificationStatus(profile.verifications);
  const qualityTierColor = getQualityTierColor(profile.qualityTier);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Farcaster Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Profile Picture and Basic Info */}
          <div className="flex items-start gap-3 sm:gap-4">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0" role="img" aria-label={`Profile picture for ${profile.username}`}>
              <AvatarImage src={profile.pfpUrl} alt={`${profile.username} profile picture`} />
              <AvatarFallback aria-label={`${profile.username} initials`}>
                {profile.displayName?.charAt(0) || profile.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold text-lg sm:text-xl truncate">
                  {profile.displayName || `@${profile.username}`}
                </h3>
                {verificationStatus.hasVerification && (
                  <CheckCircle 
                    className="h-4 w-4 flex-shrink-0" 
                    style={{ color: verificationStatus.color }}
                    aria-label="Verified account"
                  />
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">@{profile.username}</p>
              
              {profile.bio && (
                <p className="text-sm text-foreground mb-4 leading-relaxed">
                  {formatBioText(profile.bio, 120)}
                </p>
              )}
              
              {/* Key Metrics - Mobile Optimized */}
              <div className="flex flex-wrap gap-3 sm:gap-4 text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
                  <span className="font-semibold text-base sm:text-sm text-foreground">{formatNumber(profile.followerCount)}</span>
                  <span className="text-muted-foreground text-xs sm:text-sm">followers</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
                  <span className="font-semibold text-base sm:text-sm text-foreground">{formatNumber(profile.followingCount)}</span>
                  <span className="text-muted-foreground text-xs sm:text-sm">following</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
                  <span className="font-semibold text-base sm:text-sm text-foreground">{formatNumber(profile.castCount)}</span>
                  <span className="text-muted-foreground text-xs sm:text-sm">casts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Indicators - Mobile Optimized */}
          <div className="flex flex-wrap gap-2 sm:justify-end">
            {/* Power Badge */}
            {profile.hasPowerBadge && (
              <Badge 
                variant="outline" 
                className="flex items-center gap-1 px-3 py-1.5 touch-manipulation"
                style={{ 
                  borderColor: powerBadgeStatus.color,
                  color: powerBadgeStatus.color 
                }}
              >
                <Crown className="h-3 w-3" aria-hidden="true" />
                <span className="text-xs font-medium">Power Badge</span>
              </Badge>
            )}

            {/* Quality Tier */}
            <Badge 
              variant="outline"
              className="flex items-center gap-1 px-3 py-1.5 touch-manipulation"
              style={{ 
                borderColor: qualityTierColor,
                color: qualityTierColor 
              }}
            >
              <Shield className="h-3 w-3" aria-hidden="true" />
              <span className="text-xs font-medium">
                {formatTierDisplayName(profile.qualityTier)}
              </span>
            </Badge>

            {/* Verification Status */}
            <Badge 
              variant="outline"
              className="flex items-center gap-1 px-3 py-1.5 touch-manipulation"
              style={{ 
                borderColor: verificationStatus.color,
                color: verificationStatus.color 
              }}
            >
              <CheckCircle className="h-3 w-3" aria-hidden="true" />
              <span className="text-xs font-medium">
                {formatVerificationCount(profile.verifications)}
              </span>
            </Badge>

            {/* Active Status */}
            {profile.isActive && (
              <Badge variant="outline" className="flex items-center gap-1 px-3 py-1.5 border-green-500 text-green-500 dark:border-green-400 dark:text-green-400 touch-manipulation">
                <div className="h-2 w-2 bg-green-500 dark:bg-green-400 rounded-full" aria-hidden="true"></div>
                <span className="text-xs font-medium">Active</span>
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}