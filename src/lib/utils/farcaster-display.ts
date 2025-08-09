/**
 * Utility functions for Farcaster data formatting and display
 * Provides consistent formatting for metrics, colors, and status indicators
 */

// Color constants for tier and status indicators
export const TIER_COLORS = {
  Premium: '#F59E0B', // Gold/Yellow
  High: '#10B981',    // Green
  Medium: '#3B82F6',  // Blue
  Low: '#F97316',     // Orange
  Minimal: '#EF4444', // Red
} as const;

export const STATUS_COLORS = {
  excellent: '#10B981', // Green
  good: '#3B82F6',      // Blue
  fair: '#F59E0B',      // Yellow
  poor: '#EF4444',      // Red
} as const;

export const QUALITY_TIER_COLORS = {
  premium: '#F59E0B',    // Gold
  high: '#10B981',       // Green
  standard: '#3B82F6',   // Blue
  low: '#F97316',        // Orange
  unverified: '#6B7280', // Gray
} as const;

/**
 * Get color for airdrop tier
 */
export function getAirdropTierColor(tier: string): string {
  return TIER_COLORS[tier as keyof typeof TIER_COLORS] || '#6B7280';
}

/**
 * Get color for status indicator
 */
export function getStatusIndicatorColor(status: string): string {
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#6B7280';
}

/**
 * Get color for quality tier
 */
export function getQualityTierColor(tier: string): string {
  return QUALITY_TIER_COLORS[tier as keyof typeof QUALITY_TIER_COLORS] || '#6B7280';
}

/**
 * Format account age in a human-readable way
 */
export function formatAccountAge(days: number): string {
  if (days < 1) return 'Less than 1 day';
  if (days === 1) return '1 day';
  if (days < 30) return `${days} days`;
  if (days < 365) {
    const months = Math.floor(days / 30);
    return months === 1 ? '1 month' : `${months} months`;
  }
  const years = Math.floor(days / 365);
  const remainingMonths = Math.floor((days % 365) / 30);
  if (remainingMonths === 0) {
    return years === 1 ? '1 year' : `${years} years`;
  }
  return `${years}y ${remainingMonths}m`;
}

/**
 * Get account maturity indicator based on age
 */
export function getAccountMaturityIndicator(days: number): {
  label: string;
  color: string;
  status: 'excellent' | 'good' | 'fair' | 'poor';
} {
  if (days >= 365) {
    return { label: 'Mature', color: STATUS_COLORS.excellent, status: 'excellent' };
  }
  if (days >= 180) {
    return { label: 'Established', color: STATUS_COLORS.good, status: 'good' };
  }
  if (days >= 90) {
    return { label: 'Growing', color: STATUS_COLORS.fair, status: 'fair' };
  }
  return { label: 'New', color: STATUS_COLORS.poor, status: 'poor' };
}

/**
 * Format engagement rate as percentage
 */
export function formatEngagementRate(rate: number): string {
  if (rate === 0) return '0%';
  if (rate < 0.01) return '<1%';
  return `${(rate * 100).toFixed(1)}%`;
}

/**
 * Format large numbers with appropriate suffixes
 */
export function formatNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
  return `${(num / 1000000000).toFixed(1)}B`;
}

/**
 * Truncate Ethereum address for display
 */
export function truncateAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address || address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Format storage usage display
 */
export function formatStorageUsage(used: number, hasAllocation: boolean): string {
  if (!hasAllocation) return 'No allocation';
  if (used === 0) return 'Unused';
  return `${formatNumber(used)} units`;
}

/**
 * Get storage status indicator
 */
export function getStorageStatusIndicator(used: number, hasAllocation: boolean): {
  label: string;
  color: string;
  status: 'excellent' | 'good' | 'fair' | 'poor';
} {
  if (!hasAllocation) {
    return { label: 'No Storage', color: STATUS_COLORS.poor, status: 'poor' };
  }
  if (used > 0) {
    return { label: 'Active', color: STATUS_COLORS.excellent, status: 'excellent' };
  }
  return { label: 'Allocated', color: STATUS_COLORS.good, status: 'good' };
}

/**
 * Format Neynar quality score
 */
export function formatQualityScore(score: number | null): string {
  if (score === null) return 'N/A';
  return (score * 100).toFixed(0);
}

/**
 * Get quality score status
 */
export function getQualityScoreStatus(score: number | null): {
  label: string;
  color: string;
  status: 'excellent' | 'good' | 'fair' | 'poor';
} {
  if (score === null) {
    return { label: 'Unknown', color: '#6B7280', status: 'poor' };
  }
  if (score >= 0.8) {
    return { label: 'Excellent', color: STATUS_COLORS.excellent, status: 'excellent' };
  }
  if (score >= 0.6) {
    return { label: 'Good', color: STATUS_COLORS.good, status: 'good' };
  }
  if (score >= 0.4) {
    return { label: 'Fair', color: STATUS_COLORS.fair, status: 'fair' };
  }
  return { label: 'Poor', color: STATUS_COLORS.poor, status: 'poor' };
}/**

 * Format casting streak display
 */
export function formatCastingStreak(streak: number): string {
  if (streak === 0) return 'No streak';
  if (streak === 1) return '1 day';
  return `${streak} days`;
}

/**
 * Get casting streak status
 */
export function getCastingStreakStatus(streak: number): {
  label: string;
  color: string;
  status: 'excellent' | 'good' | 'fair' | 'poor';
} {
  if (streak >= 30) {
    return { label: 'Excellent', color: STATUS_COLORS.excellent, status: 'excellent' };
  }
  if (streak >= 14) {
    return { label: 'Good', color: STATUS_COLORS.good, status: 'good' };
  }
  if (streak >= 7) {
    return { label: 'Fair', color: STATUS_COLORS.fair, status: 'fair' };
  }
  return { label: 'Poor', color: STATUS_COLORS.poor, status: 'poor' };
}

/**
 * Format verification count display
 */
export function formatVerificationCount(verifications: string[]): string {
  const count = verifications.length;
  if (count === 0) return 'Unverified';
  if (count === 1) return '1 address';
  return `${count} addresses`;
}

/**
 * Get verification status indicator
 */
export function getVerificationStatus(verifications: string[]): {
  label: string;
  color: string;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  hasVerification: boolean;
} {
  const count = verifications.length;
  if (count === 0) {
    return { 
      label: 'Unverified', 
      color: STATUS_COLORS.poor, 
      status: 'poor',
      hasVerification: false 
    };
  }
  if (count >= 3) {
    return { 
      label: 'Multi-verified', 
      color: STATUS_COLORS.excellent, 
      status: 'excellent',
      hasVerification: true 
    };
  }
  if (count === 2) {
    return { 
      label: 'Dual-verified', 
      color: STATUS_COLORS.good, 
      status: 'good',
      hasVerification: true 
    };
  }
  return { 
    label: 'Verified', 
    color: STATUS_COLORS.fair, 
    status: 'fair',
    hasVerification: true 
  };
}

/**
 * Format channel participation display
 */
export function formatChannelParticipation(uniqueChannels: number): string {
  if (uniqueChannels === 0) return 'No channels';
  if (uniqueChannels === 1) return '1 channel';
  return `${uniqueChannels} channels`;
}

/**
 * Get channel participation status
 */
export function getChannelParticipationStatus(uniqueChannels: number): {
  label: string;
  color: string;
  status: 'excellent' | 'good' | 'fair' | 'poor';
} {
  if (uniqueChannels >= 10) {
    return { label: 'Highly Active', color: STATUS_COLORS.excellent, status: 'excellent' };
  }
  if (uniqueChannels >= 5) {
    return { label: 'Active', color: STATUS_COLORS.good, status: 'good' };
  }
  if (uniqueChannels >= 2) {
    return { label: 'Moderate', color: STATUS_COLORS.fair, status: 'fair' };
  }
  if (uniqueChannels === 1) {
    return { label: 'Limited', color: STATUS_COLORS.fair, status: 'fair' };
  }
  return { label: 'Inactive', color: STATUS_COLORS.poor, status: 'poor' };
}

/**
 * Format Power Badge status
 */
export function formatPowerBadgeStatus(hasPowerBadge: boolean): {
  label: string;
  color: string;
  icon: string;
  status: 'excellent' | 'poor';
} {
  if (hasPowerBadge) {
    return {
      label: 'Power Badge Holder',
      color: TIER_COLORS.Premium,
      icon: '👑',
      status: 'excellent'
    };
  }
  return {
    label: 'No Power Badge',
    color: '#6B7280',
    icon: '',
    status: 'poor'
  };
}

/**
 * Format activity level based on recent casts
 */
export function formatActivityLevel(recentCasts: number): {
  label: string;
  color: string;
  status: 'excellent' | 'good' | 'fair' | 'poor';
} {
  if (recentCasts >= 30) {
    return { label: 'Very Active', color: STATUS_COLORS.excellent, status: 'excellent' };
  }
  if (recentCasts >= 15) {
    return { label: 'Active', color: STATUS_COLORS.good, status: 'good' };
  }
  if (recentCasts >= 5) {
    return { label: 'Moderate', color: STATUS_COLORS.fair, status: 'fair' };
  }
  if (recentCasts > 0) {
    return { label: 'Low Activity', color: STATUS_COLORS.fair, status: 'fair' };
  }
  return { label: 'Inactive', color: STATUS_COLORS.poor, status: 'poor' };
}

/**
 * Format tier display name with proper casing
 */
export function formatTierDisplayName(tier: string): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
}

/**
 * Get tier description for tooltips
 */
export function getTierDescription(tier: string): string {
  const descriptions = {
    Premium: 'Top-tier users with exceptional engagement and verification',
    High: 'Highly engaged users with strong social presence',
    Medium: 'Active users with moderate engagement levels',
    Low: 'Users with basic activity and limited engagement',
    Minimal: 'New or inactive users with minimal social presence'
  };
  return descriptions[tier as keyof typeof descriptions] || 'Unknown tier';
}

/**
 * Format bio text with truncation
 */
export function formatBioText(bio: string, maxLength = 100): string {
  if (!bio) return 'No bio available';
  if (bio.length <= maxLength) return bio;
  return `${bio.slice(0, maxLength)}...`;
}

/**
 * Get engagement quality indicator
 */
export function getEngagementQuality(
  averageLikes: number, 
  averageRecasts: number, 
  averageReplies: number,
  followerCount: number
): {
  label: string;
  color: string;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  rate: number;
} {
  const totalEngagement = averageLikes + averageRecasts + averageReplies;
  const rate = followerCount > 0 ? totalEngagement / followerCount : 0;
  
  if (rate >= 0.1) {
    return { label: 'Excellent', color: STATUS_COLORS.excellent, status: 'excellent', rate };
  }
  if (rate >= 0.05) {
    return { label: 'Good', color: STATUS_COLORS.good, status: 'good', rate };
  }
  if (rate >= 0.02) {
    return { label: 'Fair', color: STATUS_COLORS.fair, status: 'fair', rate };
  }
  return { label: 'Poor', color: STATUS_COLORS.poor, status: 'poor', rate };
}

/**
 * Format top performing cast display
 */
export function formatTopCastDisplay(cast: {
  text: string;
  likes: number;
  recasts: number;
  replies: number;
} | null): {
  text: string;
  engagement: string;
  totalEngagement: number;
} | null {
  if (!cast) return null;
  
  const totalEngagement = cast.likes + cast.recasts + cast.replies;
  const truncatedText = cast.text.length > 80 ? `${cast.text.slice(0, 80)}...` : cast.text;
  
  return {
    text: truncatedText,
    engagement: `${formatNumber(cast.likes)} ❤️ ${formatNumber(cast.recasts)} 🔄 ${formatNumber(cast.replies)} 💬`,
    totalEngagement
  };
}