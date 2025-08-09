// Core address types
export type EthereumAddress = `0x${string}`;
export type ENSName = `${string}.eth`;
export type AddressInput = EthereumAddress | ENSName;

// Blockchain analysis types
export interface OnChainAnalysis {
  transactionCount: number;
  totalVolume: string;
  firstTransaction: string | null;
  contractInteractions: number;
  uniqueProtocols: number;
  eligibleAirdrops: string[];
  isActive: boolean;
  lastActivity: string | null;
}

// Enhanced Farcaster types for comprehensive airdrop analysis
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

// Enhanced Kaito interfaces for project engagement metrics
export interface EnhancedKaitoResult {
  basicMetrics: {
    yapScore: number;
    weeklyYaps: number;
    totalYaps: number;
    alignmentScore: number;
    leaderboardRank: number | null;
  };
  engagementMetrics: {
    averageEngagementRate: number;
    replyRate: number;
    retweetRatio: number;
    communityInteraction: number;
    influenceScore: number;
  };
  activityTrends: {
    dailyActivity: DailyActivity[];
    weeklyGrowth: number;
    monthlyGrowth: number;
    consistencyScore: number;
  };
  airdropEligibility: {
    eligibilityScore: number;
    eligibilityFactors: EligibilityFactor[];
    recommendations: SocialRecommendation[];
  };
}

export interface ProjectEngagementResult {
  topProjects: ProjectEngagement[];
  trendingOpportunities: TrendingProject[];
  alignmentAnalysis: ProjectAlignment[];
  recommendedProjects: RecommendedProject[];
}

export interface SocialInfluenceResult {
  influenceScore: number;
  reachEstimate: number;
  engagementRate: number;
  communityStanding: 'influencer' | 'active' | 'casual' | 'lurker';
  growthTrend: 'growing' | 'stable' | 'declining';
  recommendedStrategy: SocialStrategy;
}

export interface ProjectEngagement {
  projectName: string;
  projectSymbol: string;
  projectLogo: string;
  engagementScore: number;
  discussionCount: number;
  lastEngagement: Date;
  alignmentScore: number;
  airdropPotential: number;
  communityRank: number;
  engagementTypes: {
    mentions: number;
    replies: number;
    retweets: number;
    originalPosts: number;
  };
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
    overall: 'bullish' | 'neutral' | 'bearish';
  };
}

export interface TrendingProject {
  projectName: string;
  projectSymbol: string;
  trendingScore: number;
  airdropLikelihood: number;
  recommendedActions: string[];
  timeToAct: 'urgent' | 'soon' | 'monitor';
  eligibilityCriteria: string[];
}

export interface ProjectAlignment {
  projectName: string;
  alignmentScore: number;
  engagementQuality: number;
  communityFit: number;
  airdropReadiness: number;
}

export interface RecommendedProject {
  projectName: string;
  projectSymbol: string;
  recommendationScore: number;
  reasonsToEngage: string[];
  expectedBenefit: string;
  engagementStrategy: string[];
}

export interface DailyActivity {
  date: string;
  yaps: number;
  engagement: number;
  reach: number;
}

export interface EligibilityFactor {
  factor: string;
  score: number;
  weight: number;
  description: string;
  improvement: string;
}

export interface SocialRecommendation {
  type: 'engagement' | 'content' | 'timing' | 'projects';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
  expectedImpact: number;
}

export interface SocialStrategy {
  primaryFocus: string;
  contentTypes: string[];
  engagementTargets: string[];
  timingRecommendations: string[];
  projectPriorities: string[];
}

// Comprehensive analysis result
export interface ComprehensiveAnalysis {
  address: string;
  timestamp: string;
  inputType: 'address' | 'username';
  onchainAnalysis: OnChainAnalysis | null;
  socialAnalysis: {
    farcasterProfile: FarcasterAnalysis | null;
    kaitoEngagement: KaitoAnalysis | null;
  };
  eligibilityScore: number;
  recommendations: string[];
  riskFactors: string[];
  metadata: {
    duration: number;
    successfulServices: string[];
    failedServices: string[];
  };
}

// API response types
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}

// Legacy interface for backward compatibility with frontend
export interface AnalysisResults {
  address: string;
  timestamp: string;
  onchainAnalysis?: {
    transactionCount: number;
    totalVolume: string;
    firstTransaction: string;
    eligibleAirdrops: string[];
    contractInteractions: number;
    uniqueProtocols: number;
  };
  socialAnalysis?: {
    farcasterProfile?: {
      username: string;
      followerCount: number;
      castCount: number;
      engagementRate: string;
    };
    kaitoEngagement?: {
      score: number;
      interactions: number;
      contentQuality: number;
      communityInfluence: number;
    };
  };
  eligibilityScore: number;
  recommendations: string[];
  riskFactors?: string[];
}

// Enhanced Bridge Integration Types

// Orbiter Finance Activity Result Interface
export interface OrbiterActivityResult {
  address: string;
  totalTransactions: number;
  totalVolume: string; // USD value as string for precision
  totalFees: string;
  uniqueChains: number;
  uniqueTokens: number;
  firstTransaction: number; // timestamp
  lastTransaction: number; // timestamp
  averageTransactionSize: string;
  
  // Chain distribution analysis
  chainDistribution: Record<string, {
    transactionCount: number;
    volume: string;
    percentage: number;
  }>;
  
  // Token distribution analysis
  tokenDistribution: Record<string, {
    transactionCount: number;
    volume: string;
    percentage: number;
  }>;
  
  // Route pattern analysis
  routePatterns: Array<{
    fromChain: string;
    toChain: string;
    transactionCount: number;
    volume: string;
    averageFee: string;
  }>;
  
  // Monthly activity breakdown
  monthlyActivity: Array<{
    month: string; // YYYY-MM format
    transactionCount: number;
    volume: string;
    uniqueChains: number;
  }>;
  
  // Eligibility metrics
  eligibilityScore: number; // 0-100
  tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'none';
  percentileRank: number; // 0-100, user's rank among all users
  
  // Activity patterns
  activityPatterns: {
    isRegularUser: boolean;
    averageFrequency: number; // transactions per month
    volumeConsistency: number; // 0-1, how consistent volume is
    chainDiversity: number; // 0-1, how diverse chain usage is
    recentActivity: boolean; // active in last 30 days
  };
}

// Hop Protocol Activity Result Interface
export interface HopActivityResult {
  address: string;
  
  // Bridge activity metrics
  bridgeActivity: {
    totalTransactions: number;
    totalVolume: string;
    totalFees: string;
    uniqueChains: number;
    uniqueTokens: number;
    firstTransaction: number;
    lastTransaction: number;
    
    // Route analysis
    routeDistribution: Record<string, {
      transactionCount: number;
      volume: string;
      averageFee: string;
    }>;
    
    // Token preferences
    tokenPreferences: Record<string, {
      transactionCount: number;
      volume: string;
      percentage: number;
    }>;
  };
  
  // Liquidity Provider activity
  lpActivity: {
    totalPositions: number;
    activePositions: number;
    totalLiquidityProvided: string;
    totalRewardsEarned: string;
    averagePositionDuration: number; // days
    
    // Pool distribution
    poolDistribution: Record<string, {
      liquidityProvided: string;
      duration: number; // days
      rewardsEarned: string;
      apr: number;
    }>;
    
    // LP performance metrics
    performanceMetrics: {
      totalTimeProviding: number; // total days as LP
      averagePositionSize: string;
      bestPerformingPool: string;
      totalImpermanentLoss: string;
      netProfitLoss: string;
    };
  };
  
  // Cross-chain route analysis
  crossChainRoutes: Array<{
    route: string; // "ethereum-arbitrum"
    frequency: number;
    totalVolume: string;
    averageAmount: string;
    preferredTokens: string[];
  }>;
  
  // Combined eligibility scoring
  eligibilityMetrics: {
    bridgeScore: number; // 0-100
    lpScore: number; // 0-100
    combinedScore: number; // 0-100 with LP bonus
    tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'none';
    percentileRank: number;
    lpBonusMultiplier: number; // 1.0-2.0 based on LP activity
  };
  
  // Activity timeline
  activityTimeline: Array<{
    timestamp: number;
    type: 'bridge' | 'lp_deposit' | 'lp_withdraw' | 'rewards_claim';
    amount: string;
    token: string;
    chain: string;
    details: Record<string, unknown>;
  }>;
}

// Historical Airdrop Comparison Result Interface
export interface HistoricalComparisonResult {
  address: string;
  
  // Historical airdrop benchmarks
  historicalBenchmarks: {
    arbitrum: {
      userScore: number;
      requiredScore: number;
      eligible: boolean;
      percentileRank: number;
      missingCriteria: string[];
    };
    optimism: {
      userScore: number;
      requiredScore: number;
      eligible: boolean;
      percentileRank: number;
      missingCriteria: string[];
    };
    polygon: {
      userScore: number;
      requiredScore: number;
      eligible: boolean;
      percentileRank: number;
      missingCriteria: string[];
    };
    hop: {
      userScore: number;
      estimatedRequiredScore: number;
      eligibilityLikelihood: number; // 0-100
      percentileRank: number;
      strengthAreas: string[];
      improvementAreas: string[];
    };
  };
  
  // Overall percentile ranking
  overallPercentile: {
    bridgeActivity: number; // 0-100
    lpActivity: number; // 0-100
    crossChainDiversity: number; // 0-100
    volumeRanking: number; // 0-100
    combined: number; // 0-100
  };
  
  // Comparative analysis
  comparativeAnalysis: {
    vsAverageUser: {
      volumeMultiplier: number; // how many times above average
      frequencyMultiplier: number;
      diversityMultiplier: number;
    };
    vsEligibleUsers: {
      volumePercentile: number;
      frequencyPercentile: number;
      diversityPercentile: number;
    };
  };
  
  // Benchmark insights
  benchmarkInsights: {
    strongestMetrics: string[];
    weakestMetrics: string[];
    improvementPotential: number; // 0-100
    timeToImprove: number; // estimated days
  };
}

// Bridge Recommendation Interface
export interface BridgeRecommendation {
  address: string;
  
  // Immediate action recommendations
  immediateActions: Array<{
    priority: 'high' | 'medium' | 'low';
    action: string;
    description: string;
    estimatedImpact: number; // score improvement 0-100
    estimatedCost: string; // USD
    timeframe: string; // "1-2 weeks"
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
  
  // Long-term strategy recommendations
  longTermStrategy: {
    targetTier: 'platinum' | 'gold' | 'silver' | 'bronze';
    currentGap: number; // points needed
    recommendedPath: Array<{
      milestone: string;
      actions: string[];
      estimatedTimeframe: string;
      estimatedCost: string;
    }>;
  };
  
  // Protocol-specific recommendations
  protocolRecommendations: {
    orbiter: {
      recommendedChains: string[];
      recommendedTokens: string[];
      targetVolume: string;
      targetFrequency: number; // transactions per month
    };
    hop: {
      bridgeRecommendations: {
        recommendedRoutes: string[];
        targetVolume: string;
        targetFrequency: number;
      };
      lpRecommendations: {
        recommendedPools: Array<{
          pool: string;
          chain: string;
          token: string;
          estimatedApr: number;
          riskLevel: 'low' | 'medium' | 'high';
          minimumAmount: string;
        }>;
        targetDuration: number; // days
        targetAmount: string;
      };
    };
  };
  
  // Risk warnings and considerations
  riskConsiderations: Array<{
    type: 'financial' | 'technical' | 'regulatory';
    severity: 'low' | 'medium' | 'high';
    description: string;
    mitigation: string;
  }>;
  
  // Cost-benefit analysis
  costBenefitAnalysis: {
    estimatedTotalCost: string;
    estimatedScoreImprovement: number;
    estimatedPercentileImprovement: number;
    roi: number; // return on investment if airdrop happens
    breakEvenAirdropValue: string; // minimum airdrop value to break even
  };
  
  // Personalized insights
  personalizedInsights: {
    userType: 'whale' | 'regular' | 'casual' | 'new';
    strengths: string[];
    weaknesses: string[];
    opportunityScore: number; // 0-100
    competitiveAdvantage: string[];
  };
}

// Enhanced Metrics Dashboard Interfaces
export interface EnhancedMetricsDashboardProps {
  address: string;
  analysisData: ComprehensiveAnalysis;
  bridgeData?: ComprehensiveBridgeAnalysis;
  enhancedKaitoData?: EnhancedKaitoResult;
  isLoading?: boolean;
}

export interface MetricComponentProps {
  data: unknown;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export interface DataTransformationUtils {
  formatCurrency: (value: number) => string;
  formatPercentage: (value: number) => string;
  formatDate: (date: Date | string) => string;
  calculatePercentile: (value: number, dataset: number[]) => number;
  getTierColor: (tier: string) => string;
  getScoreColor: (score: number) => string;
}

// Enhanced bridge analysis interfaces for data transformation and validation
export interface BridgeDataTransformation {
  // Raw data validation
  validateOrbiterData: (data: unknown) => data is OrbiterActivityResult;
  validateHopData: (data: unknown) => data is HopActivityResult;
  validateHistoricalData: (data: unknown) => data is HistoricalComparisonResult;
  validateRecommendationData: (data: unknown) => data is BridgeRecommendation;
  
  // Data transformation utilities
  transformOrbiterResponse: (rawData: unknown) => OrbiterActivityResult;
  transformHopResponse: (rawData: unknown) => HopActivityResult;
  calculateHistoricalComparison: (
    orbiterData: OrbiterActivityResult,
    hopData: HopActivityResult
  ) => HistoricalComparisonResult;
  generateRecommendations: (
    orbiterData: OrbiterActivityResult,
    hopData: HopActivityResult,
    historicalData: HistoricalComparisonResult
  ) => BridgeRecommendation;
}

// Combined bridge analysis result
export interface ComprehensiveBridgeAnalysis {
  address: string;
  timestamp: string;
  
  // Individual protocol results
  orbiterAnalysis: OrbiterActivityResult | null;
  hopAnalysis: HopActivityResult | null;
  
  // Comparative analysis
  historicalComparison: HistoricalComparisonResult | null;
  
  // Actionable recommendations
  recommendations: BridgeRecommendation | null;
  
  // Overall metrics
  overallMetrics: {
    totalBridgeVolume: string;
    totalBridgeTransactions: number;
    totalLPVolume: string;
    totalLPDuration: number; // days
    combinedEligibilityScore: number; // 0-100
    overallTier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'none';
    percentileRank: number; // 0-100
  };
  
  // Analysis metadata
  metadata: {
    analysisVersion: string;
    dataFreshness: number; // minutes since last update
    completeness: number; // 0-100, percentage of data successfully retrieved
    reliability: number; // 0-100, confidence in the analysis
    processingTime: number; // milliseconds
    errors: string[];
    warnings: string[];
  };
}

// Error handling interfaces for bridge analysis
export interface BridgeAnalysisError {
  code: string;
  message: string;
  service: 'orbiter' | 'hop' | 'historical' | 'recommendations' | 'api';
  severity: 'low' | 'medium' | 'high' | 'critical';
  retryable: boolean;
  timestamp: number;
  context?: Record<string, unknown>;
}

// API response wrapper for bridge analysis
export interface BridgeAnalysisResponse {
  success: boolean;
  data?: ComprehensiveBridgeAnalysis;
  errors?: BridgeAnalysisError[];
  warnings?: string[];
  metadata: {
    requestId: string;
    timestamp: number;
    processingTime: number;
    version: string;
  };
}

// Missing bridge transaction interfaces
export interface OrbiterTransaction {
  id: string;
  hash: string;
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  sender: string;
  receiver: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  fee: string;
  gasUsed?: string;
  blockNumber?: number;
}

export interface HopBridgeTransaction {
  transactionHash: string;
  timestamp: number;
  sourceChainId: number;
  destinationChainId: number;
  token: string;
  amount: string;
  bonderFee: string;
  destinationTxHash?: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface HopLPPosition {
  chainId: number;
  token: string;
  poolAddress: string;
  lpTokenBalance: string;
  underlyingTokenBalance: string;
  hTokenBalance: string;
  totalSupply: string;
  poolShare: number;
  apr: number;
  rewards: {
    hop: string;
  };
  depositTimestamp: number;
  lastUpdateTimestamp: number;
}