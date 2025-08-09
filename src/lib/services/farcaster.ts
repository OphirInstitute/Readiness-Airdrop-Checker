import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';

// Enhanced Farcaster profile interface with comprehensive airdrop metrics
export interface FarcasterProfile {
  fid: number;
  username: string;
  displayName: string;
  bio: string;
  followerCount: number;
  followingCount: number;
  pfpUrl: string;
  verifications: string[];
  isActive: boolean;
  castCount: number;
  engagementRate: number;
  // Enhanced airdrop-specific metrics
  hasPowerBadge: boolean;
  accountAge: number; // days since account creation
  channelFollowCount: number;
  recentCastCount: number; // casts in last 30 days
  averageLikesPerCast: number;
  averageRecastsPerCast: number;
  averageRepliesPerCast: number;
  uniqueChannelsPosted: number;
  hasStorageAllocation: boolean;
  storageUsed: number;
  isVerifiedAddress: boolean;
  // NEW: 2025 Quality Metrics
  neynarQualityScore: number | null; // 0-1 scale from Neynar
  openRankScore: number | null; // OpenRank reputation score
  frameInteractions: number; // Frame interaction count
  qualityTier: 'premium' | 'high' | 'standard' | 'low' | 'unverified';
}

export interface FarcasterChannelActivity {
  channelId: string;
  channelName: string;
  followedAt: string;
  castCount: number;
  lastCastAt: string | null;
  engagementScore: number;
}

export interface FarcasterCastMetrics {
  totalCasts: number;
  recentCasts: number; // last 30 days
  averageEngagement: number;
  topPerformingCast: {
    hash: string;
    text: string;
    likes: number;
    recasts: number;
    replies: number;
  } | null;
  castingStreak: number; // consecutive days with at least 1 cast
  qualityScore: number; // based on engagement vs follower ratio
}

export interface FarcasterAnalysis {
  hasProfile: boolean;
  profile: FarcasterProfile | null;
  channelActivity: FarcasterChannelActivity[];
  castMetrics: FarcasterCastMetrics | null;
  eligibilityScore: number;
  airdropTier: 'Premium' | 'High' | 'Medium' | 'Low' | 'Minimal';
  eligibilityFactors: {
    accountAge: { score: number; status: 'excellent' | 'good' | 'fair' | 'poor' };
    engagement: { score: number; status: 'excellent' | 'good' | 'fair' | 'poor' };
    verification: { score: number; status: 'excellent' | 'good' | 'fair' | 'poor' };
    activity: { score: number; status: 'excellent' | 'good' | 'fair' | 'poor' };
    socialSignals: { score: number; status: 'excellent' | 'good' | 'fair' | 'poor' };
  };
  recommendations: string[];
  riskFactors: string[];
}

class FarcasterService {
  private client: NeynarAPIClient;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private cache = new Map<string, { data: unknown; timestamp: number }>();

  constructor() {
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
      throw new Error('NEYNAR_API_KEY is required for Farcaster integration');
    }

    const config = new Configuration({
      apiKey: apiKey,
      baseOptions: {
        headers: {
          "x-neynar-experimental": true,
        },
      },
    });

    this.client = new NeynarAPIClient(config);
  }

  async analyzeUser(identifier: string): Promise<FarcasterAnalysis> {
    try {
      // Check cache first
      const cacheKey = `farcaster_analysis_${identifier}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return cached as FarcasterAnalysis;
      }

      // Try to get user data
      let userData = null;

      if (identifier.startsWith('0x')) {
        // Search by verified address
        userData = await this.getUserByAddress(identifier);
      } else {
        // Search by username (remove @ if present)
        const cleanUsername = identifier.replace('@', '');
        userData = await this.getUserByUsername(cleanUsername);
      }

      if (!userData) {
        return this.getDefaultAnalysis();
      }

      // Get comprehensive user data
      const [profile, channelActivity, castMetrics] = await Promise.allSettled([
        this.buildEnhancedProfile(userData as unknown as Record<string, unknown>),
        this.getChannelActivity(userData.fid),
        this.getCastMetrics(userData.fid)
      ]);

      const enhancedProfile = profile.status === 'fulfilled' ? profile.value : null;
      const channels = channelActivity.status === 'fulfilled' ? channelActivity.value : [];
      const metrics = castMetrics.status === 'fulfilled' ? castMetrics.value : null;

      if (!enhancedProfile) {
        return this.getDefaultAnalysis();
      }

      // Calculate comprehensive eligibility analysis
      const eligibilityFactors = this.calculateEligibilityFactors(enhancedProfile, channels, metrics);
      const eligibilityScore = this.calculateOverallScore(eligibilityFactors);
      const airdropTier = this.determineAirdropTier(eligibilityScore, eligibilityFactors);
      const recommendations = this.generateRecommendations(enhancedProfile, eligibilityFactors);
      const riskFactors = this.identifyRiskFactors(enhancedProfile, eligibilityFactors);

      const analysis: FarcasterAnalysis = {
        hasProfile: true,
        profile: enhancedProfile,
        channelActivity: channels,
        castMetrics: metrics,
        eligibilityScore,
        airdropTier,
        eligibilityFactors,
        recommendations,
        riskFactors
      };

      // Cache the result
      this.setCachedData(cacheKey, analysis);
      return analysis;

    } catch (error) {
      console.error('Farcaster analysis error:', error);
      return this.getDefaultAnalysis();
    }
  }

  private async getUserByUsername(username: string) {
    try {
      console.log(`[DEBUG] Looking up username: ${username}`);
      const response = await this.client.lookupUserByUsername({ username: username });
      console.log(`[DEBUG] Response:`, response);
      // The API returns the user directly, not under a result property
      return response.user || response || null;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return null;
    }
  }

  private async getUserByAddress(address: string) {
    try {
      console.log(`[DEBUG] Looking up address: ${address}`);
      const response = await this.client.fetchBulkUsersByEthOrSolAddress({ addresses: [address] });
      console.log(`[DEBUG] Address response:`, response);
      // The API returns users directly, not under a result property
      const users = (response as Record<string, unknown>)[address] || (response as { result?: Record<string, unknown> }).result?.[address];
      return users && Array.isArray(users) && users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error fetching user by address:', error);
      return null;
    }
  }

  private async buildEnhancedProfile(userData: Record<string, unknown>): Promise<FarcasterProfile> {
    const now = new Date();
    const accountCreated = new Date((userData.object_timestamp as string | number) || (userData.timestamp as string | number) || now);
    const accountAge = Math.floor((now.getTime() - accountCreated.getTime()) / (1000 * 60 * 60 * 24));

    // Get recent casts for engagement analysis
    let recentCastCount = 0;
    let averageLikesPerCast = 0;
    let averageRecastsPerCast = 0;
    let averageRepliesPerCast = 0;
    let uniqueChannelsPosted = 0;

    try {
      const castsResponse = await this.client.fetchCastsForUser({ fid: userData.fid as number, limit: 100 });
      const recentCasts = castsResponse.casts || (castsResponse as { result?: { casts?: unknown[] } }).result?.casts || [];

      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const recentCastsFiltered = recentCasts.filter(cast =>
        new Date(cast.timestamp) > thirtyDaysAgo
      );

      recentCastCount = recentCastsFiltered.length;

      if (recentCastsFiltered.length > 0) {
        const totalLikes = recentCastsFiltered.reduce((sum, cast) => sum + (cast.reactions?.likes_count || 0), 0);
        const totalRecasts = recentCastsFiltered.reduce((sum, cast) => sum + (cast.reactions?.recasts_count || 0), 0);
        const totalReplies = recentCastsFiltered.reduce((sum, cast) => sum + ((cast.reactions as { replies_count?: number })?.replies_count || 0), 0);

        averageLikesPerCast = totalLikes / recentCastsFiltered.length;
        averageRecastsPerCast = totalRecasts / recentCastsFiltered.length;
        averageRepliesPerCast = totalReplies / recentCastsFiltered.length;

        // Count unique channels
        const channels = new Set(recentCastsFiltered.map(cast => cast.parent_url).filter(Boolean));
        uniqueChannelsPosted = channels.size;
      }
    } catch (error) {
      console.error('Error fetching cast metrics:', error);
    }

    // Check for power badge and other premium features
    const hasPowerBadge = Boolean(userData.power_badge) || false;
    const hasStorageAllocation = Boolean(userData.storage_allocated) || false;
    const storageUsed = (userData.storage_used as number) || 0;

    // NEW: Get Neynar Quality Score from user data
    let neynarQualityScore = null;
    if (userData.score !== undefined) {
      neynarQualityScore = userData.score as number;
    } else if ((userData.experimental as { neynar_user_score?: number })?.neynar_user_score !== undefined) {
      neynarQualityScore = (userData.experimental as { neynar_user_score: number }).neynar_user_score;
    }

    // NEW: Determine quality tier based on multiple factors
    const qualityTier = this.determineQualityTier(
      neynarQualityScore,
      hasPowerBadge,
      (userData.verifications as unknown[] | undefined)?.length || 0,
      accountAge,
      recentCastCount
    );

    return {
      fid: userData.fid as number,
      username: userData.username as string,
      displayName: (userData.display_name as string) || (userData.username as string),
      bio: ((userData.profile as { bio?: { text?: string } })?.bio?.text) || '',
      followerCount: (userData.follower_count as number) || 0,
      followingCount: (userData.following_count as number) || 0,
      pfpUrl: (userData.pfp_url as string) || '',
      verifications: (userData.verifications as string[]) || [],
      isActive: (userData.active_status as string) === 'active',
      castCount: (userData.cast_count as number) || 0,
      engagementRate: this.calculateEngagementRate(userData),
      hasPowerBadge,
      accountAge,
      channelFollowCount: (userData.channel_follow_count as number) || 0,
      recentCastCount,
      averageLikesPerCast,
      averageRecastsPerCast,
      averageRepliesPerCast,
      uniqueChannelsPosted,
      hasStorageAllocation,
      storageUsed,
      isVerifiedAddress: ((userData.verifications as unknown[]) || []).length > 0,
      // NEW: 2025 Quality Metrics
      neynarQualityScore,
      openRankScore: null, // Will be implemented separately
      frameInteractions: 0, // Will be implemented with Frame analytics
      qualityTier
    };
  }

  private async getChannelActivity(fid: number): Promise<FarcasterChannelActivity[]> {
    try {
      // Get user's channel follows
      const channelsResponse = await this.client.fetchUserChannels({ fid: fid });
      const channels = channelsResponse.channels || (channelsResponse as { result?: { channels?: unknown[] } }).result?.channels || [];

      return (channels as unknown as Record<string, unknown>[]).slice(0, 10).map((channel: Record<string, unknown>) => ({
        channelId: channel.id as string,
        channelName: (channel.name as string) || 'Unknown',
        followedAt: (channel.created_at as string) || new Date().toISOString(),
        castCount: 0, // Would need additional API calls to get exact counts
        lastCastAt: null,
        engagementScore: 0
      }));
    } catch (error) {
      console.error('Error fetching channel activity:', error);
      return [];
    }
  }

  private async getCastMetrics(fid: number): Promise<FarcasterCastMetrics> {
    try {
      const castsResponse = await this.client.fetchCastsForUser({ fid: fid, limit: 100 });
      const casts = castsResponse.casts || (castsResponse as { result?: { casts?: unknown[] } }).result?.casts || [];

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const recentCasts = casts.filter(cast => new Date(cast.timestamp) > thirtyDaysAgo);

      let topPerformingCast = null;
      let maxEngagement = 0;

      for (const cast of casts) {
        const engagement = (cast.reactions?.likes_count || 0) +
          (cast.reactions?.recasts_count || 0) +
          ((cast.reactions as { replies_count?: number })?.replies_count || 0);

        if (engagement > maxEngagement) {
          maxEngagement = engagement;
          topPerformingCast = {
            hash: cast.hash,
            text: cast.text.substring(0, 100) + (cast.text.length > 100 ? '...' : ''),
            likes: cast.reactions?.likes_count || 0,
            recasts: cast.reactions?.recasts_count || 0,
            replies: ((cast.reactions as { replies_count?: number })?.replies_count || 0)
          };
        }
      }

      const totalEngagement = casts.reduce((sum, cast) =>
        sum + (cast.reactions?.likes_count || 0) +
        (cast.reactions?.recasts_count || 0) +
        ((cast.reactions as { replies_count?: number })?.replies_count || 0), 0
      );

      const averageEngagement = casts.length > 0 ? totalEngagement / casts.length : 0;

      // Calculate casting streak (simplified)
      let castingStreak = 0;
      const sortedCasts = casts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      for (let i = 0; i < Math.min(30, sortedCasts.length); i++) {
        const castDate = new Date(sortedCasts[i].timestamp);
        const daysDiff = Math.floor((now.getTime() - castDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === i) {
          castingStreak++;
        } else {
          break;
        }
      }

      const qualityScore = averageEngagement > 0 ? Math.min(averageEngagement * 10, 100) : 0;

      return {
        totalCasts: casts.length,
        recentCasts: recentCasts.length,
        averageEngagement,
        topPerformingCast,
        castingStreak,
        qualityScore
      };
    } catch (error) {
      console.error('Error fetching cast metrics:', error);
      return {
        totalCasts: 0,
        recentCasts: 0,
        averageEngagement: 0,
        topPerformingCast: null,
        castingStreak: 0,
        qualityScore: 0
      };
    }
  }

  private calculateEngagementRate(userData: Record<string, unknown>): number {
    const followers = Number(userData.follower_count) || 0;
    const casts = Number(userData.cast_count) || 0;

    if (followers === 0 || casts === 0) return 0;

    return Math.min((casts / Math.max(followers, 1)) * 100, 100);
  }

  private calculateEligibilityFactors(
    profile: FarcasterProfile,
    channels: FarcasterChannelActivity[],
    metrics: FarcasterCastMetrics | null
  ) {
    // Account Age Factor (0-20 points) - Reduced weight for quality score
    let accountAgeScore = 0;
    let accountAgeStatus: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';

    if (profile.accountAge >= 365) { accountAgeScore = 20; accountAgeStatus = 'excellent'; }
    else if (profile.accountAge >= 180) { accountAgeScore = 16; accountAgeStatus = 'good'; }
    else if (profile.accountAge >= 90) { accountAgeScore = 12; accountAgeStatus = 'fair'; }
    else if (profile.accountAge >= 30) { accountAgeScore = 8; accountAgeStatus = 'poor'; }

    // Engagement Factor (0-20 points) - Reduced weight for quality score
    let engagementScore = 0;
    let engagementStatus: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';

    const avgEngagement = profile.averageLikesPerCast + profile.averageRecastsPerCast + profile.averageRepliesPerCast;
    if (avgEngagement >= 10) { engagementScore = 20; engagementStatus = 'excellent'; }
    else if (avgEngagement >= 5) { engagementScore = 16; engagementStatus = 'good'; }
    else if (avgEngagement >= 2) { engagementScore = 12; engagementStatus = 'fair'; }
    else if (avgEngagement >= 1) { engagementScore = 8; engagementStatus = 'poor'; }

    // NEW: Quality Score Factor (0-30 points) - Highest weight
    let qualityScore = 0;
    let qualityStatus: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';

    if (profile.neynarQualityScore !== null) {
      const score = profile.neynarQualityScore;
      if (score >= 0.8) { qualityScore = 30; qualityStatus = 'excellent'; }
      else if (score >= 0.6) { qualityScore = 24; qualityStatus = 'good'; }
      else if (score >= 0.4) { qualityScore = 18; qualityStatus = 'fair'; }
      else if (score >= 0.2) { qualityScore = 12; qualityStatus = 'poor'; }
    } else {
      // Fallback scoring when quality score unavailable
      if (profile.qualityTier === 'premium') { qualityScore = 25; qualityStatus = 'excellent'; }
      else if (profile.qualityTier === 'high') { qualityScore = 20; qualityStatus = 'good'; }
      else if (profile.qualityTier === 'standard') { qualityScore = 15; qualityStatus = 'fair'; }
      else if (profile.qualityTier === 'low') { qualityScore = 10; qualityStatus = 'poor'; }
    }

    // Verification Factor (0-15 points) - Reduced weight
    let verificationScore = 0;
    let verificationStatus: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';

    if (profile.hasPowerBadge && profile.isVerifiedAddress) { verificationScore = 15; verificationStatus = 'excellent'; }
    else if (profile.hasPowerBadge || profile.isVerifiedAddress) { verificationScore = 12; verificationStatus = 'good'; }
    else if (profile.verifications.length > 0) { verificationScore = 8; verificationStatus = 'fair'; }

    // Activity Factor (0-15 points) - Reduced weight
    let activityScore = 0;
    let activityStatus: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';

    if (profile.recentCastCount >= 30 && profile.uniqueChannelsPosted >= 3) { activityScore = 15; activityStatus = 'excellent'; }
    else if (profile.recentCastCount >= 15 && profile.uniqueChannelsPosted >= 2) { activityScore = 12; activityStatus = 'good'; }
    else if (profile.recentCastCount >= 5) { activityScore = 8; activityStatus = 'fair'; }
    else if (profile.recentCastCount >= 1) { activityScore = 4; activityStatus = 'poor'; }

    return {
      accountAge: { score: accountAgeScore, status: accountAgeStatus },
      engagement: { score: engagementScore, status: engagementStatus },
      verification: { score: verificationScore, status: verificationStatus },
      activity: { score: activityScore, status: activityStatus },
      socialSignals: { score: qualityScore, status: qualityStatus } // Renamed to reflect quality score
    };
  }

  private calculateOverallScore(factors: Record<string, { score: number }>): number {
    return factors.accountAge.score +
      factors.engagement.score +
      factors.verification.score +
      factors.activity.score +
      factors.socialSignals.score;
  }

  private determineAirdropTier(score: number, factors: Record<string, unknown>): 'Premium' | 'High' | 'Medium' | 'Low' | 'Minimal' {
    if (score >= 80 && (factors.verification as { status: string })?.status === 'excellent') return 'Premium';
    if (score >= 65) return 'High';
    if (score >= 45) return 'Medium';
    if (score >= 25) return 'Low';
    return 'Minimal';
  }

  private generateRecommendations(profile: FarcasterProfile, factors: Record<string, { status: string }>): string[] {
    const recommendations: string[] = [];

    if (factors.accountAge.status === 'poor') {
      recommendations.push('Continue building account history - older accounts typically receive better airdrop allocations');
    }

    if (factors.engagement.status === 'poor' || factors.engagement.status === 'fair') {
      recommendations.push('Increase engagement by creating quality content that generates likes, recasts, and replies');
    }

    if (!profile.hasPowerBadge) {
      recommendations.push('Work towards earning a Power Badge by maintaining consistent, quality engagement');
    }

    if (!profile.isVerifiedAddress) {
      recommendations.push('Verify your Ethereum address on Farcaster to prove wallet ownership');
    }

    if (factors.activity.status === 'poor' || factors.activity.status === 'fair') {
      recommendations.push('Increase casting frequency and engage with multiple channels regularly');
    }

    if (profile.uniqueChannelsPosted < 3) {
      recommendations.push('Diversify your engagement across different Farcaster channels');
    }

    if (factors.socialSignals.status === 'poor') {
      recommendations.push('Build your social network by following and engaging with other users');
    }

    if (recommendations.length === 0) {
      recommendations.push('Excellent Farcaster profile! Continue your current engagement strategy');
    }

    return recommendations.slice(0, 5);
  }

  private identifyRiskFactors(profile: FarcasterProfile, factors: Record<string, unknown>): string[] {
    const riskFactors: string[] = [];

    if (profile.accountAge < 30) {
      riskFactors.push('Very new account - may not qualify for retroactive airdrops');
    }

    if (profile.recentCastCount === 0) {
      riskFactors.push('No recent activity - inactive accounts often excluded from airdrops');
    }

    if (!profile.isVerifiedAddress && !profile.hasPowerBadge) {
      riskFactors.push('Unverified account - verification typically required for airdrop eligibility');
    }

    if (profile.followerCount < 10) {
      riskFactors.push('Very low social engagement - may indicate bot or inactive account');
    }

    if (profile.castCount < 5) {
      riskFactors.push('Minimal content creation - low participation may reduce airdrop allocation');
    }

    return riskFactors;
  }

  private getDefaultAnalysis(): FarcasterAnalysis {
    return {
      hasProfile: false,
      profile: null,
      channelActivity: [],
      castMetrics: null,
      eligibilityScore: 0,
      airdropTier: 'Minimal',
      eligibilityFactors: {
        accountAge: { score: 0, status: 'poor' },
        engagement: { score: 0, status: 'poor' },
        verification: { score: 0, status: 'poor' },
        activity: { score: 0, status: 'poor' },
        socialSignals: { score: 0, status: 'poor' }
      },
      recommendations: [
        'Create a Farcaster profile to start building airdrop eligibility',
        'Connect your wallet address for verification',
        'Start casting regularly to build engagement',
        'Follow and interact with community channels',
        'Work towards earning a Power Badge through quality participation'
      ],
      riskFactors: [
        'No Farcaster presence detected - missing potential airdrop opportunities'
      ]
    };
  }

  private getCachedData(key: string): unknown | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private determineQualityTier(
    neynarScore: number | null,
    hasPowerBadge: boolean,
    verificationCount: number,
    accountAge: number,
    recentActivity: number
  ): 'premium' | 'high' | 'standard' | 'low' | 'unverified' {
    // Premium tier: High quality score + power badge + verified
    if (neynarScore && neynarScore >= 0.8 && hasPowerBadge && verificationCount > 0) {
      return 'premium';
    }

    // High tier: Good quality score or power badge with some verification
    if ((neynarScore && neynarScore >= 0.6) || (hasPowerBadge && verificationCount > 0)) {
      return 'high';
    }

    // Standard tier: Decent activity and some verification or quality score
    if ((neynarScore && neynarScore >= 0.4) ||
      (verificationCount > 0 && accountAge >= 90 && recentActivity > 0)) {
      return 'standard';
    }

    // Low tier: Some activity but limited verification
    if (accountAge >= 30 && recentActivity > 0) {
      return 'low';
    }

    // Unverified: New or inactive accounts
    return 'unverified';
  }
}

export const farcasterService = new FarcasterService();