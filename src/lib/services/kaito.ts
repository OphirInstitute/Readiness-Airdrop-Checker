// Kaito service for Yaps API integration
import type {
  EnhancedKaitoResult,
  ProjectEngagementResult,
  SocialInfluenceResult,
  ProjectEngagement,
  TrendingProject,
  ProjectAlignment,
  RecommendedProject,
  DailyActivity,
  EligibilityFactor,
  SocialRecommendation,
  SocialStrategy
} from '../types';

export interface KaitoProfile {
  username: string;
  yapScore: number;
  weeklyYaps: number;
  alignmentScore: number;
  leaderboardRank?: number;
  totalEngagement: number;
  isVerified: boolean;
}

export interface KaitoAnalysis {
  hasProfile: boolean;
  profile: KaitoProfile | null;
  eligibilityScore: number;
  recommendations: string[];
}

class KaitoService {
  private readonly KAITO_API_BASE = 'https://api.kaito.ai/api/v1';
  private readonly PROJECT_ENGAGEMENT_API = 'https://api.kaito.ai/v1/engagement';
  private readonly TRENDING_PROJECTS_API = 'https://api.kaito.ai/v1/trending';

  async analyzeUser(identifier: string): Promise<KaitoAnalysis> {
    try {
      // Clean the identifier - remove @ if present
      const cleanIdentifier = identifier.replace('@', '');
      
      // Skip Kaito lookup for Ethereum addresses
      if (cleanIdentifier.startsWith('0x')) {
        return {
          hasProfile: false,
          profile: null,
          eligibilityScore: 0,
          recommendations: [
            'Create a Kaito account and start yapping to increase eligibility',
            'Connect your Twitter account to Kaito for verification',
            'Engage with crypto content to build your Yap score',
            'Participate in Kaito community discussions'
          ]
        };
      }
      
      // Try to get Kaito profile using the correct API
      const profile = await this.getKaitoProfile(cleanIdentifier);

      if (!profile) {
        return {
          hasProfile: false,
          profile: null,
          eligibilityScore: 0,
          recommendations: [
            'Create a Kaito account and start yapping to increase eligibility',
            'Connect your Twitter account to Kaito for verification',
            'Engage with crypto content to build your Yap score',
            'Participate in Kaito community discussions'
          ]
        };
      }

      const eligibilityScore = this.calculateEligibilityScore(profile);
      const recommendations = this.generateRecommendations(profile);

      return {
        hasProfile: true,
        profile,
        eligibilityScore,
        recommendations
      };

    } catch (error) {
      console.error('Kaito analysis error:', error);
      throw new Error('Failed to analyze Kaito profile');
    }
  }

  private async getKaitoProfile(identifier: string): Promise<KaitoProfile | null> {
    try {
      // Use the correct Kaito API endpoint for Yaps data
      const response = await fetch(`${this.KAITO_API_BASE}/yaps?username=${identifier}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'AirdropEligibilityChecker/1.0'
        }
      });

      if (!response.ok) {
        console.log(`Kaito API response not ok: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      console.log('Kaito API response:', data);

      if (data && data.user_id && data.username) {
        return this.transformKaitoData(data);
      }

      return null;

    } catch (error) {
      console.error('Error fetching Kaito profile:', error);
      return null;
    }
  }

  // Remove the leaderboard search method as we're using the direct API endpoint

  private transformKaitoData(data: {
    user_id?: string;
    username?: string;
    yaps_all?: number;
    yaps_l24h?: number;
    yaps_l48h?: number;
    yaps_l7d?: number;
    yaps_l30d?: number;
    yaps_l3m?: number;
    yaps_l6m?: number;
    yaps_l12m?: number;
  }): KaitoProfile {
    return {
      username: data.username || 'Unknown',
      yapScore: data.yaps_all || 0,
      weeklyYaps: data.yaps_l7d || 0, // Use 7-day yaps as weekly
      alignmentScore: 0, // Not available in this endpoint
      leaderboardRank: undefined, // Not available in this endpoint
      totalEngagement: data.yaps_all || 0,
      isVerified: false // Not available in this endpoint
    };
  }

  private calculateEligibilityScore(profile: KaitoProfile): number {
    let score = 0;

    // Base score for having a profile
    score += 15;

    // Yap score scoring (assuming max yap score is around 1000)
    if (profile.yapScore >= 500) score += 30;
    else if (profile.yapScore >= 200) score += 25;
    else if (profile.yapScore >= 100) score += 20;
    else if (profile.yapScore >= 50) score += 15;
    else if (profile.yapScore >= 10) score += 10;
    else if (profile.yapScore > 0) score += 5;

    // Weekly activity scoring
    if (profile.weeklyYaps >= 20) score += 20;
    else if (profile.weeklyYaps >= 10) score += 15;
    else if (profile.weeklyYaps >= 5) score += 10;
    else if (profile.weeklyYaps > 0) score += 5;

    // Alignment score (assuming 0-100 scale)
    if (profile.alignmentScore >= 80) score += 15;
    else if (profile.alignmentScore >= 60) score += 10;
    else if (profile.alignmentScore >= 40) score += 5;

    // Leaderboard ranking bonus
    if (profile.leaderboardRank) {
      if (profile.leaderboardRank <= 10) score += 20;
      else if (profile.leaderboardRank <= 50) score += 15;
      else if (profile.leaderboardRank <= 100) score += 10;
      else if (profile.leaderboardRank <= 500) score += 5;
    }

    // Verification bonus
    if (profile.isVerified) score += 10;

    return Math.min(score, 100);
  }

  private generateRecommendations(profile: KaitoProfile): string[] {
    const recommendations: string[] = [];

    if (profile.yapScore < 50) {
      recommendations.push('Increase your Yap score by engaging more with crypto content');
    }

    if (profile.weeklyYaps < 5) {
      recommendations.push('Maintain consistent weekly activity on Kaito');
    }

    if (profile.alignmentScore < 60) {
      recommendations.push('Improve content alignment by focusing on quality crypto discussions');
    }

    if (!profile.isVerified) {
      recommendations.push('Verify your account to increase credibility and eligibility');
    }

    if (!profile.leaderboardRank || profile.leaderboardRank > 100) {
      recommendations.push('Aim for higher leaderboard ranking through consistent engagement');
    }

    if (profile.totalEngagement < 100) {
      recommendations.push('Increase total engagement by interacting with other users');
    }

    if (recommendations.length === 0) {
      recommendations.push('Excellent Kaito engagement! Keep up the great work!');
    }

    return recommendations;
  }

  // Enhanced Kaito service methods for project engagement metrics
  async analyzeEnhancedKaitoActivity(address: string): Promise<EnhancedKaitoResult> {
    try {
      const twitterUsername = await this.findLinkedTwitterAccount(address);
      
      if (!twitterUsername) {
        return this.getDefaultEnhancedResult();
      }

      // Get basic Yap metrics
      const basicMetrics = await this.getBasicYapMetrics(twitterUsername);
      
      // Get enhanced engagement metrics
      const engagementMetrics = await this.getEngagementMetrics(twitterUsername);
      
      // Get activity trends
      const activityTrends = await this.getActivityTrends(twitterUsername);
      
      // Calculate airdrop eligibility
      const airdropEligibility = this.calculateAirdropEligibility({
        basicMetrics,
        engagementMetrics,
        activityTrends
      });

      return {
        basicMetrics,
        engagementMetrics,
        activityTrends,
        airdropEligibility
      };
    } catch (error) {
      console.error('Enhanced Kaito analysis error:', error);
      return this.getDefaultEnhancedResult();
    }
  }

  async analyzeProjectEngagement(twitterUsername: string): Promise<ProjectEngagementResult> {
    try {
      // Get project-specific engagement data
      const projectEngagement = await this.getProjectEngagementData(twitterUsername);
      
      // Get trending opportunities
      const trendingOpportunities = await this.getTrendingAirdropOpportunities();
      
      // Analyze alignment with projects
      const alignmentAnalysis = this.analyzeProjectAlignment(projectEngagement);
      
      // Generate project recommendations
      const recommendedProjects = this.generateProjectRecommendations({
        projectEngagement,
        trendingOpportunities,
        alignmentAnalysis
      });

      return {
        topProjects: projectEngagement.slice(0, 10),
        trendingOpportunities,
        alignmentAnalysis,
        recommendedProjects
      };
    } catch (error) {
      console.error('Project engagement analysis error:', error);
      return this.getDefaultProjectEngagementResult();
    }
  }

  async analyzeSocialInfluence(twitterUsername: string): Promise<SocialInfluenceResult> {
    try {
      const profile = await this.getKaitoProfile(twitterUsername);
      if (!profile) {
        return this.getDefaultSocialInfluenceResult();
      }

      const engagementMetrics = await this.getEngagementMetrics(twitterUsername);
      const activityTrends = await this.getActivityTrends(twitterUsername);

      const influenceScore = this.calculateInfluenceScore(profile, engagementMetrics);
      const reachEstimate = this.estimateReach(profile, engagementMetrics);
      const communityStanding = this.determineCommunityStanding(profile, engagementMetrics);
      const growthTrend = this.analyzeGrowthTrend(activityTrends);
      const recommendedStrategy = this.generateSocialStrategy(profile, engagementMetrics);

      return {
        influenceScore,
        reachEstimate,
        engagementRate: engagementMetrics.averageEngagementRate,
        communityStanding,
        growthTrend,
        recommendedStrategy
      };
    } catch (error) {
      console.error('Social influence analysis error:', error);
      return this.getDefaultSocialInfluenceResult();
    }
  }

  private async findLinkedTwitterAccount(address: string): Promise<string | null> {
    // For now, return null for Ethereum addresses since we don't have a reliable way
    // to link addresses to Twitter accounts without additional user input
    if (address.startsWith('0x')) {
      return null;
    }
    return address.replace('@', '');
  }

  private async getBasicYapMetrics(username: string): Promise<EnhancedKaitoResult['basicMetrics']> {
    try {
      const profile = await this.getKaitoProfile(username);
      if (!profile) {
        return {
          yapScore: 0,
          weeklyYaps: 0,
          totalYaps: 0,
          alignmentScore: 0,
          leaderboardRank: null
        };
      }

      return {
        yapScore: profile.yapScore,
        weeklyYaps: profile.weeklyYaps,
        totalYaps: profile.totalEngagement,
        alignmentScore: profile.alignmentScore,
        leaderboardRank: profile.leaderboardRank || null
      };
    } catch (error) {
      console.error('Error getting basic Yap metrics:', error);
      return {
        yapScore: 0,
        weeklyYaps: 0,
        totalYaps: 0,
        alignmentScore: 0,
        leaderboardRank: null
      };
    }
  }

  private async getEngagementMetrics(username: string): Promise<EnhancedKaitoResult['engagementMetrics']> {
    try {
      // Mock implementation - in a real scenario, this would call Kaito's engagement API
      const profile = await this.getKaitoProfile(username);
      if (!profile) {
        return {
          averageEngagementRate: 0,
          replyRate: 0,
          retweetRatio: 0,
          communityInteraction: 0,
          influenceScore: 0
        };
      }

      // Calculate engagement metrics based on available data
      const baseEngagement = Math.min(profile.yapScore / 10, 10);
      
      return {
        averageEngagementRate: baseEngagement,
        replyRate: Math.min(profile.weeklyYaps / 20, 1),
        retweetRatio: Math.min(profile.totalEngagement / 100, 1),
        communityInteraction: Math.min(profile.alignmentScore / 10, 10),
        influenceScore: Math.min((profile.yapScore + profile.alignmentScore) / 20, 10)
      };
    } catch (error) {
      console.error('Error getting engagement metrics:', error);
      return {
        averageEngagementRate: 0,
        replyRate: 0,
        retweetRatio: 0,
        communityInteraction: 0,
        influenceScore: 0
      };
    }
  }

  private async getActivityTrends(username: string): Promise<EnhancedKaitoResult['activityTrends']> {
    try {
      // Mock implementation - generate sample daily activity data
      const dailyActivity: DailyActivity[] = [];
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        dailyActivity.push({
          date: date.toISOString().split('T')[0],
          yaps: Math.floor(Math.random() * 10),
          engagement: Math.floor(Math.random() * 50),
          reach: Math.floor(Math.random() * 1000)
        });
      }

      const weeklyGrowth = Math.random() * 20 - 10; // -10% to +10%
      const monthlyGrowth = Math.random() * 40 - 20; // -20% to +20%
      const consistencyScore = Math.random() * 100;

      return {
        dailyActivity,
        weeklyGrowth,
        monthlyGrowth,
        consistencyScore
      };
    } catch (error) {
      console.error('Error getting activity trends:', error);
      return {
        dailyActivity: [],
        weeklyGrowth: 0,
        monthlyGrowth: 0,
        consistencyScore: 0
      };
    }
  }

  private calculateAirdropEligibility(data: {
    basicMetrics: EnhancedKaitoResult['basicMetrics'];
    engagementMetrics: EnhancedKaitoResult['engagementMetrics'];
    activityTrends: EnhancedKaitoResult['activityTrends'];
  }): EnhancedKaitoResult['airdropEligibility'] {
    const factors: EligibilityFactor[] = [
      {
        factor: 'Yap Score',
        score: Math.min(data.basicMetrics.yapScore / 10, 10),
        weight: 0.3,
        description: 'Overall content quality and engagement',
        improvement: data.basicMetrics.yapScore < 100 ? 'Post more high-quality crypto content' : 'Maintain excellent content quality'
      },
      {
        factor: 'Activity Consistency',
        score: data.activityTrends.consistencyScore / 10,
        weight: 0.2,
        description: 'Regular posting and engagement patterns',
        improvement: data.activityTrends.consistencyScore < 70 ? 'Maintain more consistent daily activity' : 'Great consistency!'
      },
      {
        factor: 'Community Influence',
        score: data.engagementMetrics.influenceScore,
        weight: 0.25,
        description: 'Impact on crypto community discussions',
        improvement: data.engagementMetrics.influenceScore < 7 ? 'Engage more with community leaders' : 'Strong community influence'
      },
      {
        factor: 'Engagement Quality',
        score: data.engagementMetrics.averageEngagementRate,
        weight: 0.25,
        description: 'Quality of interactions and responses',
        improvement: data.engagementMetrics.averageEngagementRate < 5 ? 'Focus on meaningful replies and discussions' : 'Excellent engagement quality'
      }
    ];

    const eligibilityScore = factors.reduce((total, factor) => 
      total + (factor.score * factor.weight), 0
    ) * 10; // Scale to 0-100

    const recommendations: SocialRecommendation[] = [
      {
        type: 'engagement',
        priority: eligibilityScore < 50 ? 'high' : 'medium',
        title: 'Increase Community Engagement',
        description: 'Actively participate in crypto discussions and reply to trending topics',
        actionItems: [
          'Reply to at least 5 crypto tweets daily',
          'Share insights on trending crypto topics',
          'Engage with crypto influencers and projects'
        ],
        expectedImpact: 15
      },
      {
        type: 'content',
        priority: data.basicMetrics.yapScore < 100 ? 'high' : 'low',
        title: 'Improve Content Quality',
        description: 'Focus on creating valuable, original crypto content',
        actionItems: [
          'Share market analysis and insights',
          'Post about DeFi protocols and strategies',
          'Create educational crypto content'
        ],
        expectedImpact: 20
      },
      {
        type: 'timing',
        priority: 'medium',
        title: 'Optimize Posting Schedule',
        description: 'Post during peak crypto community activity hours',
        actionItems: [
          'Post during US market hours (9 AM - 4 PM EST)',
          'Share content during high volatility periods',
          'Engage during major crypto events and announcements'
        ],
        expectedImpact: 10
      }
    ];

    return {
      eligibilityScore: Math.round(eligibilityScore),
      eligibilityFactors: factors,
      recommendations
    };
  }

  private async getProjectEngagementData(username: string): Promise<ProjectEngagement[]> {
    try {
      // Mock implementation - in production, this would call Kaito's project engagement API
      const mockProjects: ProjectEngagement[] = [
        {
          projectName: 'Base',
          projectSymbol: 'BASE',
          projectLogo: '/logos/base.png',
          engagementScore: 85,
          discussionCount: 45,
          lastEngagement: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          alignmentScore: 92,
          airdropPotential: 88,
          communityRank: 156,
          engagementTypes: {
            mentions: 12,
            replies: 18,
            retweets: 8,
            originalPosts: 7
          },
          sentimentAnalysis: {
            positive: 78,
            neutral: 18,
            negative: 4,
            overall: 'bullish'
          }
        },
        {
          projectName: 'Arbitrum',
          projectSymbol: 'ARB',
          projectLogo: '/logos/arbitrum.png',
          engagementScore: 72,
          discussionCount: 32,
          lastEngagement: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          alignmentScore: 68,
          airdropPotential: 45,
          communityRank: 289,
          engagementTypes: {
            mentions: 8,
            replies: 15,
            retweets: 6,
            originalPosts: 3
          },
          sentimentAnalysis: {
            positive: 65,
            neutral: 25,
            negative: 10,
            overall: 'bullish'
          }
        }
      ];

      return mockProjects;
    } catch (error) {
      console.error('Error getting project engagement data:', error);
      return [];
    }
  }

  protected async getTrendingAirdropOpportunities(): Promise<TrendingProject[]> {
    try {
      // Mock implementation - in production, this would call Kaito's trending API
      const mockTrending: TrendingProject[] = [
        {
          projectName: 'LayerZero',
          projectSymbol: 'ZRO',
          trendingScore: 95,
          airdropLikelihood: 85,
          recommendedActions: [
            'Bridge assets using LayerZero protocols',
            'Use Stargate Finance for cross-chain swaps',
            'Interact with LayerZero-powered dApps'
          ],
          timeToAct: 'urgent',
          eligibilityCriteria: [
            'Cross-chain transaction volume > $1000',
            'Use multiple LayerZero protocols',
            'Maintain activity for 3+ months'
          ]
        },
        {
          projectName: 'zkSync Era',
          projectSymbol: 'ZK',
          trendingScore: 88,
          airdropLikelihood: 75,
          recommendedActions: [
            'Bridge ETH to zkSync Era',
            'Use native DEXs and protocols',
            'Provide liquidity on zkSync'
          ],
          timeToAct: 'soon',
          eligibilityCriteria: [
            'Bridge to zkSync Era',
            'Transaction count > 10',
            'Use multiple protocols'
          ]
        }
      ];

      return mockTrending;
    } catch (error) {
      console.error('Error getting trending opportunities:', error);
      return [];
    }
  }

  private analyzeProjectAlignment(projectEngagement: ProjectEngagement[]): ProjectAlignment[] {
    return projectEngagement.map(project => ({
      projectName: project.projectName,
      alignmentScore: project.alignmentScore,
      engagementQuality: (project.engagementTypes.replies + project.engagementTypes.originalPosts) / 
                        (project.engagementTypes.mentions + project.engagementTypes.retweets + 1) * 100,
      communityFit: project.sentimentAnalysis.positive,
      airdropReadiness: project.airdropPotential
    }));
  }

  private generateProjectRecommendations(data: {
    projectEngagement: ProjectEngagement[];
    trendingOpportunities: TrendingProject[];
    alignmentAnalysis: ProjectAlignment[];
  }): RecommendedProject[] {
    const recommendations: RecommendedProject[] = [];

    // Recommend trending projects with high airdrop potential
    data.trendingOpportunities.forEach(trending => {
      if (trending.airdropLikelihood > 70) {
        recommendations.push({
          projectName: trending.projectName,
          projectSymbol: trending.projectSymbol,
          recommendationScore: trending.airdropLikelihood,
          reasonsToEngage: [
            `High airdrop likelihood (${trending.airdropLikelihood}%)`,
            'Currently trending in crypto community',
            'Clear eligibility criteria available'
          ],
          expectedBenefit: 'Potential airdrop eligibility',
          engagementStrategy: trending.recommendedActions
        });
      }
    });

    // Recommend projects where user has low engagement but high potential
    data.projectEngagement.forEach(project => {
      if (project.engagementScore < 50 && project.airdropPotential > 60) {
        recommendations.push({
          projectName: project.projectName,
          projectSymbol: project.projectSymbol,
          recommendationScore: project.airdropPotential,
          reasonsToEngage: [
            'High airdrop potential with low current engagement',
            'Opportunity to improve community standing',
            'Strong project fundamentals'
          ],
          expectedBenefit: 'Improved airdrop eligibility and community standing',
          engagementStrategy: [
            'Increase discussion participation',
            'Share positive insights about the project',
            'Engage with project announcements'
          ]
        });
      }
    });

    return recommendations.slice(0, 5); // Return top 5 recommendations
  }

  private calculateInfluenceScore(profile: KaitoProfile, engagement: EnhancedKaitoResult['engagementMetrics']): number {
    const yapWeight = 0.4;
    const engagementWeight = 0.3;
    const alignmentWeight = 0.2;
    const rankWeight = 0.1;

    let score = 0;
    score += (profile.yapScore / 1000) * yapWeight * 100;
    score += engagement.influenceScore * engagementWeight * 10;
    score += (profile.alignmentScore / 100) * alignmentWeight * 100;
    
    if (profile.leaderboardRank) {
      const rankScore = Math.max(0, (1000 - profile.leaderboardRank) / 1000);
      score += rankScore * rankWeight * 100;
    }

    return Math.min(Math.round(score), 100);
  }

  private estimateReach(profile: KaitoProfile, engagement: EnhancedKaitoResult['engagementMetrics']): number {
    // Estimate reach based on yap score and engagement
    const baseReach = profile.yapScore * 10;
    const engagementMultiplier = 1 + (engagement.averageEngagementRate / 10);
    return Math.round(baseReach * engagementMultiplier);
  }

  private determineCommunityStanding(profile: KaitoProfile, engagement: EnhancedKaitoResult['engagementMetrics']): 'influencer' | 'active' | 'casual' | 'lurker' {
    const influenceScore = this.calculateInfluenceScore(profile, engagement);
    
    if (influenceScore >= 80) return 'influencer';
    if (influenceScore >= 60) return 'active';
    if (influenceScore >= 30) return 'casual';
    return 'lurker';
  }

  private analyzeGrowthTrend(trends: EnhancedKaitoResult['activityTrends']): 'growing' | 'stable' | 'declining' {
    if (trends.monthlyGrowth > 10) return 'growing';
    if (trends.monthlyGrowth < -10) return 'declining';
    return 'stable';
  }

  private generateSocialStrategy(profile: KaitoProfile, engagement: EnhancedKaitoResult['engagementMetrics']): SocialStrategy {
    const influenceScore = this.calculateInfluenceScore(profile, engagement);
    
    if (influenceScore >= 70) {
      return {
        primaryFocus: 'Thought Leadership',
        contentTypes: ['Market Analysis', 'Project Reviews', 'Educational Content'],
        engagementTargets: ['Crypto Influencers', 'Project Teams', 'Community Leaders'],
        timingRecommendations: ['Peak market hours', 'During major announcements', 'Weekly market summaries'],
        projectPriorities: ['Emerging L2s', 'DeFi Innovations', 'Infrastructure Projects']
      };
    } else if (influenceScore >= 40) {
      return {
        primaryFocus: 'Community Building',
        contentTypes: ['Discussion Starters', 'News Commentary', 'Personal Insights'],
        engagementTargets: ['Active Community Members', 'Project Communities', 'Fellow Traders'],
        timingRecommendations: ['Daily market updates', 'Event reactions', 'Weekend summaries'],
        projectPriorities: ['Established Projects', 'Trending Protocols', 'Airdrop Opportunities']
      };
    } else {
      return {
        primaryFocus: 'Engagement Building',
        contentTypes: ['Questions', 'Reactions', 'Learning Journey'],
        engagementTargets: ['Beginners', 'Educational Accounts', 'Helpful Community Members'],
        timingRecommendations: ['Ask questions during active hours', 'React to trending topics', 'Share learning experiences'],
        projectPriorities: ['Blue Chip Projects', 'Educational Resources', 'Beginner-Friendly Protocols']
      };
    }
  }

  protected getDefaultEnhancedResult(): EnhancedKaitoResult {
    return {
      basicMetrics: {
        yapScore: 0,
        weeklyYaps: 0,
        totalYaps: 0,
        alignmentScore: 0,
        leaderboardRank: null
      },
      engagementMetrics: {
        averageEngagementRate: 0,
        replyRate: 0,
        retweetRatio: 0,
        communityInteraction: 0,
        influenceScore: 0
      },
      activityTrends: {
        dailyActivity: [],
        weeklyGrowth: 0,
        monthlyGrowth: 0,
        consistencyScore: 0
      },
      airdropEligibility: {
        eligibilityScore: 0,
        eligibilityFactors: [],
        recommendations: [
          {
            type: 'engagement',
            priority: 'high',
            title: 'Create Kaito Account',
            description: 'Start building your crypto social presence on Kaito',
            actionItems: [
              'Sign up for Kaito account',
              'Connect your Twitter account',
              'Start engaging with crypto content'
            ],
            expectedImpact: 25
          }
        ]
      }
    };
  }

  protected getDefaultProjectEngagementResult(): ProjectEngagementResult {
    return {
      topProjects: [],
      trendingOpportunities: [],
      alignmentAnalysis: [],
      recommendedProjects: []
    };
  }

  protected getDefaultSocialInfluenceResult(): SocialInfluenceResult {
    return {
      influenceScore: 0,
      reachEstimate: 0,
      engagementRate: 0,
      communityStanding: 'lurker',
      growthTrend: 'stable',
      recommendedStrategy: {
        primaryFocus: 'Getting Started',
        contentTypes: ['Basic Questions', 'Learning Content'],
        engagementTargets: ['Educational Accounts', 'Beginner Communities'],
        timingRecommendations: ['Start with daily engagement', 'Ask questions during active hours'],
        projectPriorities: ['Established Projects', 'Educational Resources']
      }
    };
  }
}

// Enhanced Kaito Service class extending the base functionality
class EnhancedKaitoService extends KaitoService {
  async getComprehensiveAnalysis(identifier: string): Promise<{
    basicAnalysis: KaitoAnalysis;
    enhancedAnalysis: EnhancedKaitoResult;
    projectEngagement: ProjectEngagementResult;
    socialInfluence: SocialInfluenceResult;
  }> {
    try {
      // Get basic analysis (existing functionality)
      const basicAnalysis = await this.analyzeUser(identifier);
      
      // Get enhanced analysis
      const enhancedAnalysis = await this.analyzeEnhancedKaitoActivity(identifier);
      
      // Get project engagement (only if we have a valid username)
      let projectEngagement: ProjectEngagementResult;
      let socialInfluence: SocialInfluenceResult;
      
      if (basicAnalysis.hasProfile && basicAnalysis.profile) {
        projectEngagement = await this.analyzeProjectEngagement(basicAnalysis.profile.username);
        socialInfluence = await this.analyzeSocialInfluence(basicAnalysis.profile.username);
      } else {
        projectEngagement = this.getDefaultProjectEngagementResult();
        socialInfluence = this.getDefaultSocialInfluenceResult();
      }

      return {
        basicAnalysis,
        enhancedAnalysis,
        projectEngagement,
        socialInfluence
      };
    } catch (error) {
      console.error('Comprehensive Kaito analysis error:', error);
      throw new Error('Failed to perform comprehensive Kaito analysis');
    }
  }

  async getProjectRecommendations(username: string): Promise<RecommendedProject[]> {
    try {
      const projectEngagement = await this.analyzeProjectEngagement(username);
      return projectEngagement.recommendedProjects;
    } catch (error) {
      console.error('Error getting project recommendations:', error);
      return [];
    }
  }

  async getTrendingOpportunities(): Promise<TrendingProject[]> {
    try {
      return await this.getTrendingAirdropOpportunities();
    } catch (error) {
      console.error('Error getting trending opportunities:', error);
      return [];
    }
  }
}

export const kaitoService = new KaitoService();
export const enhancedKaitoService = new EnhancedKaitoService();