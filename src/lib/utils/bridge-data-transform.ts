/**
 * Bridge Data Transformation Utilities
 * Utilities for validating and transforming bridge data interfaces
 */

import {
  OrbiterActivityResult,
  HopActivityResult,
  HistoricalComparisonResult,
  BridgeRecommendation,
  ComprehensiveBridgeAnalysis,
  BridgeAnalysisError
} from '../types';

// Type guards for runtime validation
export const isOrbiterActivityResult = (data: unknown): data is OrbiterActivityResult => {
  if (!data || typeof data !== 'object') return false;
  
  const obj = data as Record<string, unknown>;
  
  return (
    typeof obj.address === 'string' &&
    typeof obj.totalTransactions === 'number' &&
    typeof obj.totalVolume === 'string' &&
    typeof obj.totalFees === 'string' &&
    typeof obj.uniqueChains === 'number' &&
    typeof obj.uniqueTokens === 'number' &&
    typeof obj.firstTransaction === 'number' &&
    typeof obj.lastTransaction === 'number' &&
    typeof obj.averageTransactionSize === 'string' &&
    typeof obj.chainDistribution === 'object' &&
    typeof obj.tokenDistribution === 'object' &&
    Array.isArray(obj.routePatterns) &&
    Array.isArray(obj.monthlyActivity) &&
    typeof obj.eligibilityScore === 'number' &&
    typeof obj.tier === 'string' &&
    typeof obj.percentileRank === 'number' &&
    typeof obj.activityPatterns === 'object'
  );
};

export const isHopActivityResult = (data: unknown): data is HopActivityResult => {
  if (!data || typeof data !== 'object') return false;
  
  const obj = data as Record<string, unknown>;
  
  return (
    typeof obj.address === 'string' &&
    typeof obj.bridgeActivity === 'object' &&
    typeof obj.lpActivity === 'object' &&
    Array.isArray(obj.crossChainRoutes) &&
    typeof obj.eligibilityMetrics === 'object' &&
    Array.isArray(obj.activityTimeline)
  );
};

export const isHistoricalComparisonResult = (data: unknown): data is HistoricalComparisonResult => {
  if (!data || typeof data !== 'object') return false;
  
  const obj = data as Record<string, unknown>;
  
  return (
    typeof obj.address === 'string' &&
    typeof obj.historicalBenchmarks === 'object' &&
    typeof obj.overallPercentile === 'object' &&
    typeof obj.comparativeAnalysis === 'object' &&
    typeof obj.benchmarkInsights === 'object'
  );
};

export const isBridgeRecommendation = (data: unknown): data is BridgeRecommendation => {
  if (!data || typeof data !== 'object') return false;
  
  const obj = data as Record<string, unknown>;
  
  return (
    typeof obj.address === 'string' &&
    Array.isArray(obj.immediateActions) &&
    typeof obj.longTermStrategy === 'object' &&
    typeof obj.protocolRecommendations === 'object' &&
    Array.isArray(obj.riskConsiderations) &&
    typeof obj.costBenefitAnalysis === 'object' &&
    typeof obj.personalizedInsights === 'object'
  );
};

// Data transformation functions
export const transformOrbiterResponse = (rawData: unknown): OrbiterActivityResult => {
  if (!rawData || typeof rawData !== 'object') {
    throw new Error('Invalid Orbiter data: not an object');
  }

  const data = rawData as Record<string, unknown>;

  // Validate required fields
  if (!data.address || typeof data.address !== 'string') {
    throw new Error('Invalid Orbiter data: missing or invalid address');
  }

  // Transform and validate the data structure
  const transformed: OrbiterActivityResult = {
    address: data.address,
    totalTransactions: Number(data.totalTransactions) || 0,
    totalVolume: String(data.totalVolume || '0'),
    totalFees: String(data.totalFees || '0'),
    uniqueChains: Number(data.uniqueChains) || 0,
    uniqueTokens: Number(data.uniqueTokens) || 0,
    firstTransaction: Number(data.firstTransaction) || 0,
    lastTransaction: Number(data.lastTransaction) || 0,
    averageTransactionSize: String(data.averageTransactionSize || '0'),
    
    chainDistribution: transformChainDistribution(data.chainDistribution),
    tokenDistribution: transformTokenDistribution(data.tokenDistribution),
    routePatterns: transformRoutePatterns(data.routePatterns),
    monthlyActivity: transformMonthlyActivity(data.monthlyActivity),
    
    eligibilityScore: Math.max(0, Math.min(100, Number(data.eligibilityScore) || 0)),
    tier: validateTier(data.tier) || 'none',
    percentileRank: Math.max(0, Math.min(100, Number(data.percentileRank) || 0)),
    
    activityPatterns: transformActivityPatterns(data.activityPatterns)
  };

  return transformed;
};

export const transformHopResponse = (rawData: unknown): HopActivityResult => {
  if (!rawData || typeof rawData !== 'object') {
    throw new Error('Invalid Hop data: not an object');
  }

  const data = rawData as Record<string, unknown>;

  if (!data.address || typeof data.address !== 'string') {
    throw new Error('Invalid Hop data: missing or invalid address');
  }

  const transformed: HopActivityResult = {
    address: data.address,
    
    bridgeActivity: transformBridgeActivity(data.bridgeActivity),
    lpActivity: transformLPActivity(data.lpActivity),
    crossChainRoutes: transformCrossChainRoutes(data.crossChainRoutes),
    eligibilityMetrics: transformEligibilityMetrics(data.eligibilityMetrics),
    activityTimeline: transformActivityTimeline(data.activityTimeline)
  };

  return transformed;
};

export const calculateHistoricalComparison = (
  orbiterData: OrbiterActivityResult,
  hopData: HopActivityResult
): HistoricalComparisonResult => {
  const address = orbiterData.address || hopData.address;
  
  // Calculate historical benchmark scores
  const arbitrumScore = calculateArbitrumScore(orbiterData, hopData);
  const optimismScore = calculateOptimismScore(orbiterData, hopData);
  const polygonScore = calculatePolygonScore(orbiterData, hopData);
  const hopScore = calculateHopScore(hopData);

  // Calculate overall percentiles
  const overallPercentile = {
    bridgeActivity: Math.round((orbiterData.percentileRank + hopData.eligibilityMetrics.bridgeScore) / 2),
    lpActivity: hopData.eligibilityMetrics.lpScore,
    crossChainDiversity: calculateDiversityPercentile(orbiterData, hopData),
    volumeRanking: calculateVolumePercentile(orbiterData, hopData),
    combined: Math.round((orbiterData.eligibilityScore + hopData.eligibilityMetrics.combinedScore) / 2)
  };

  // Generate comparative analysis
  const comparativeAnalysis = {
    vsAverageUser: {
      volumeMultiplier: calculateVolumeMultiplier(orbiterData, hopData),
      frequencyMultiplier: calculateFrequencyMultiplier(orbiterData, hopData),
      diversityMultiplier: calculateDiversityMultiplier(orbiterData, hopData)
    },
    vsEligibleUsers: {
      volumePercentile: overallPercentile.volumeRanking,
      frequencyPercentile: Math.round((orbiterData.activityPatterns.averageFrequency / 5) * 100),
      diversityPercentile: overallPercentile.crossChainDiversity
    }
  };

  // Generate benchmark insights
  const benchmarkInsights = generateBenchmarkInsights(orbiterData, hopData, overallPercentile);

  return {
    address,
    historicalBenchmarks: {
      arbitrum: arbitrumScore,
      optimism: optimismScore,
      polygon: polygonScore,
      hop: hopScore
    },
    overallPercentile,
    comparativeAnalysis,
    benchmarkInsights
  };
};

export const generateRecommendations = (
  orbiterData: OrbiterActivityResult,
  hopData: HopActivityResult,
  historicalData: HistoricalComparisonResult
): BridgeRecommendation => {
  const address = orbiterData.address;
  
  // Generate immediate actions based on current gaps
  const immediateActions = generateImmediateActions(orbiterData, hopData, historicalData);
  
  // Create long-term strategy
  const longTermStrategy = generateLongTermStrategy(orbiterData, hopData, historicalData);
  
  // Protocol-specific recommendations
  const protocolRecommendations = {
    orbiter: generateOrbiterRecommendations(orbiterData),
    hop: generateHopRecommendations(hopData)
  };
  
  // Risk considerations
  const riskConsiderations = generateRiskConsiderations(orbiterData, hopData);
  
  // Cost-benefit analysis
  const costBenefitAnalysis = calculateCostBenefitAnalysis(orbiterData, hopData, historicalData);
  
  // Personalized insights
  const personalizedInsights = generatePersonalizedInsights(orbiterData, hopData, historicalData);

  return {
    address,
    immediateActions,
    longTermStrategy,
    protocolRecommendations,
    riskConsiderations,
    costBenefitAnalysis,
    personalizedInsights
  };
};

// Helper transformation functions
const transformChainDistribution = (data: unknown): Record<string, { transactionCount: number; volume: string; percentage: number }> => {
  if (!data || typeof data !== 'object') return {};
  
  const result: Record<string, { transactionCount: number; volume: string; percentage: number }> = {};
  const obj = data as Record<string, unknown>;
  
  Object.entries(obj).forEach(([chain, chainData]) => {
    if (chainData && typeof chainData === 'object') {
      const cd = chainData as Record<string, unknown>;
      result[chain] = {
        transactionCount: Number(cd.transactionCount) || 0,
        volume: String(cd.volume || '0'),
        percentage: Number(cd.percentage) || 0
      };
    }
  });
  
  return result;
};

const transformTokenDistribution = (data: unknown): Record<string, { transactionCount: number; volume: string; percentage: number }> => {
  if (!data || typeof data !== 'object') return {};
  
  const result: Record<string, { transactionCount: number; volume: string; percentage: number }> = {};
  const obj = data as Record<string, unknown>;
  
  Object.entries(obj).forEach(([token, tokenData]) => {
    if (tokenData && typeof tokenData === 'object') {
      const td = tokenData as Record<string, unknown>;
      result[token] = {
        transactionCount: Number(td.transactionCount) || 0,
        volume: String(td.volume || '0'),
        percentage: Number(td.percentage) || 0
      };
    }
  });
  
  return result;
};

const transformRoutePatterns = (data: unknown): Array<{ fromChain: string; toChain: string; transactionCount: number; volume: string; averageFee: string }> => {
  if (!Array.isArray(data)) return [];
  
  return data.map(route => {
    if (!route || typeof route !== 'object') return null;
    const r = route as Record<string, unknown>;
    return {
      fromChain: String(r.fromChain || ''),
      toChain: String(r.toChain || ''),
      transactionCount: Number(r.transactionCount) || 0,
      volume: String(r.volume || '0'),
      averageFee: String(r.averageFee || '0')
    };
  }).filter(Boolean) as Array<{ fromChain: string; toChain: string; transactionCount: number; volume: string; averageFee: string }>;
};

const transformMonthlyActivity = (data: unknown): Array<{ month: string; transactionCount: number; volume: string; uniqueChains: number }> => {
  if (!Array.isArray(data)) return [];
  
  return data.map(month => {
    if (!month || typeof month !== 'object') return null;
    const m = month as Record<string, unknown>;
    return {
      month: String(m.month || ''),
      transactionCount: Number(m.transactionCount) || 0,
      volume: String(m.volume || '0'),
      uniqueChains: Number(m.uniqueChains) || 0
    };
  }).filter(Boolean) as Array<{ month: string; transactionCount: number; volume: string; uniqueChains: number }>;
};

const transformActivityPatterns = (data: unknown): OrbiterActivityResult['activityPatterns'] => {
  if (!data || typeof data !== 'object') {
    return {
      isRegularUser: false,
      averageFrequency: 0,
      volumeConsistency: 0,
      chainDiversity: 0,
      recentActivity: false
    };
  }
  
  const ap = data as Record<string, unknown>;
  return {
    isRegularUser: Boolean(ap.isRegularUser),
    averageFrequency: Number(ap.averageFrequency) || 0,
    volumeConsistency: Math.max(0, Math.min(1, Number(ap.volumeConsistency) || 0)),
    chainDiversity: Math.max(0, Math.min(1, Number(ap.chainDiversity) || 0)),
    recentActivity: Boolean(ap.recentActivity)
  };
};

const transformBridgeActivity = (data: unknown): HopActivityResult['bridgeActivity'] => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid bridge activity data');
  }
  
  const ba = data as Record<string, unknown>;
  return {
    totalTransactions: Number(ba.totalTransactions) || 0,
    totalVolume: String(ba.totalVolume || '0'),
    totalFees: String(ba.totalFees || '0'),
    uniqueChains: Number(ba.uniqueChains) || 0,
    uniqueTokens: Number(ba.uniqueTokens) || 0,
    firstTransaction: Number(ba.firstTransaction) || 0,
    lastTransaction: Number(ba.lastTransaction) || 0,
    routeDistribution: transformRouteDistribution(ba.routeDistribution),
    tokenPreferences: transformTokenPreferences(ba.tokenPreferences)
  };
};

const transformLPActivity = (data: unknown): HopActivityResult['lpActivity'] => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid LP activity data');
  }
  
  const lp = data as Record<string, unknown>;
  return {
    totalPositions: Number(lp.totalPositions) || 0,
    activePositions: Number(lp.activePositions) || 0,
    totalLiquidityProvided: String(lp.totalLiquidityProvided || '0'),
    totalRewardsEarned: String(lp.totalRewardsEarned || '0'),
    averagePositionDuration: Number(lp.averagePositionDuration) || 0,
    poolDistribution: transformPoolDistribution(lp.poolDistribution),
    performanceMetrics: transformPerformanceMetrics(lp.performanceMetrics)
  };
};

const transformCrossChainRoutes = (data: unknown): HopActivityResult['crossChainRoutes'] => {
  if (!Array.isArray(data)) return [];
  
  return data.map(route => {
    if (!route || typeof route !== 'object') return null;
    const r = route as Record<string, unknown>;
    return {
      route: String(r.route || ''),
      frequency: Number(r.frequency) || 0,
      totalVolume: String(r.totalVolume || '0'),
      averageAmount: String(r.averageAmount || '0'),
      preferredTokens: Array.isArray(r.preferredTokens) ? r.preferredTokens.map(String) : []
    };
  }).filter(Boolean) as HopActivityResult['crossChainRoutes'];
};

const transformEligibilityMetrics = (data: unknown): HopActivityResult['eligibilityMetrics'] => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid eligibility metrics data');
  }
  
  const em = data as Record<string, unknown>;
  return {
    bridgeScore: Math.max(0, Math.min(100, Number(em.bridgeScore) || 0)),
    lpScore: Math.max(0, Math.min(100, Number(em.lpScore) || 0)),
    combinedScore: Math.max(0, Math.min(100, Number(em.combinedScore) || 0)),
    tier: validateTier(em.tier) || 'none',
    percentileRank: Math.max(0, Math.min(100, Number(em.percentileRank) || 0)),
    lpBonusMultiplier: Math.max(1, Number(em.lpBonusMultiplier) || 1)
  };
};

const transformActivityTimeline = (data: unknown): HopActivityResult['activityTimeline'] => {
  if (!Array.isArray(data)) return [];
  
  return data.map(activity => {
    if (!activity || typeof activity !== 'object') return null;
    const a = activity as Record<string, unknown>;
    return {
      timestamp: Number(a.timestamp) || 0,
      type: validateActivityType(a.type) || 'bridge',
      amount: String(a.amount || '0'),
      token: String(a.token || ''),
      chain: String(a.chain || ''),
      details: (a.details && typeof a.details === 'object') ? a.details as Record<string, unknown> : {}
    };
  }).filter(Boolean) as HopActivityResult['activityTimeline'];
};

// Additional helper functions
const transformRouteDistribution = (data: unknown): Record<string, { transactionCount: number; volume: string; averageFee: string }> => {
  if (!data || typeof data !== 'object') return {};
  
  const result: Record<string, { transactionCount: number; volume: string; averageFee: string }> = {};
  const obj = data as Record<string, unknown>;
  
  Object.entries(obj).forEach(([route, routeData]) => {
    if (routeData && typeof routeData === 'object') {
      const rd = routeData as Record<string, unknown>;
      result[route] = {
        transactionCount: Number(rd.transactionCount) || 0,
        volume: String(rd.volume || '0'),
        averageFee: String(rd.averageFee || '0')
      };
    }
  });
  
  return result;
};

const transformTokenPreferences = (data: unknown): Record<string, { transactionCount: number; volume: string; percentage: number }> => {
  if (!data || typeof data !== 'object') return {};
  
  const result: Record<string, { transactionCount: number; volume: string; percentage: number }> = {};
  const obj = data as Record<string, unknown>;
  
  Object.entries(obj).forEach(([token, tokenData]) => {
    if (tokenData && typeof tokenData === 'object') {
      const td = tokenData as Record<string, unknown>;
      result[token] = {
        transactionCount: Number(td.transactionCount) || 0,
        volume: String(td.volume || '0'),
        percentage: Number(td.percentage) || 0
      };
    }
  });
  
  return result;
};

const transformPoolDistribution = (data: unknown): Record<string, { liquidityProvided: string; duration: number; rewardsEarned: string; apr: number }> => {
  if (!data || typeof data !== 'object') return {};
  
  const result: Record<string, { liquidityProvided: string; duration: number; rewardsEarned: string; apr: number }> = {};
  const obj = data as Record<string, unknown>;
  
  Object.entries(obj).forEach(([pool, poolData]) => {
    if (poolData && typeof poolData === 'object') {
      const pd = poolData as Record<string, unknown>;
      result[pool] = {
        liquidityProvided: String(pd.liquidityProvided || '0'),
        duration: Number(pd.duration) || 0,
        rewardsEarned: String(pd.rewardsEarned || '0'),
        apr: Number(pd.apr) || 0
      };
    }
  });
  
  return result;
};

const transformPerformanceMetrics = (data: unknown): HopActivityResult['lpActivity']['performanceMetrics'] => {
  if (!data || typeof data !== 'object') {
    return {
      totalTimeProviding: 0,
      averagePositionSize: '0',
      bestPerformingPool: '',
      totalImpermanentLoss: '0',
      netProfitLoss: '0'
    };
  }
  
  const pm = data as Record<string, unknown>;
  return {
    totalTimeProviding: Number(pm.totalTimeProviding) || 0,
    averagePositionSize: String(pm.averagePositionSize || '0'),
    bestPerformingPool: String(pm.bestPerformingPool || ''),
    totalImpermanentLoss: String(pm.totalImpermanentLoss || '0'),
    netProfitLoss: String(pm.netProfitLoss || '0')
  };
};

// Validation helper functions
const validateTier = (tier: unknown): 'platinum' | 'gold' | 'silver' | 'bronze' | 'none' | null => {
  const validTiers = ['platinum', 'gold', 'silver', 'bronze', 'none'];
  return validTiers.includes(String(tier)) ? String(tier) as 'platinum' | 'gold' | 'silver' | 'bronze' | 'none' : null;
};

const validateActivityType = (type: unknown): 'bridge' | 'lp_deposit' | 'lp_withdraw' | 'rewards_claim' | null => {
  const validTypes = ['bridge', 'lp_deposit', 'lp_withdraw', 'rewards_claim'];
  return validTypes.includes(String(type)) ? String(type) as 'bridge' | 'lp_deposit' | 'lp_withdraw' | 'rewards_claim' : null;
};

// Calculation helper functions (simplified implementations)
const calculateArbitrumScore = (orbiterData: OrbiterActivityResult, hopData: HopActivityResult) => {
  const userScore = Math.round((orbiterData.eligibilityScore + hopData.eligibilityMetrics.bridgeScore) / 2);
  const requiredScore = 60; // Historical Arbitrum requirement
  
  return {
    userScore,
    requiredScore,
    eligible: userScore >= requiredScore,
    percentileRank: Math.round((orbiterData.percentileRank + hopData.eligibilityMetrics.percentileRank) / 2),
    missingCriteria: userScore < requiredScore ? ['Insufficient bridge activity'] : []
  };
};

const calculateOptimismScore = (orbiterData: OrbiterActivityResult, hopData: HopActivityResult) => {
  const userScore = Math.round((orbiterData.eligibilityScore + hopData.eligibilityMetrics.bridgeScore) / 2);
  const requiredScore = 70; // Historical Optimism requirement
  
  return {
    userScore,
    requiredScore,
    eligible: userScore >= requiredScore,
    percentileRank: Math.round((orbiterData.percentileRank + hopData.eligibilityMetrics.percentileRank) / 2),
    missingCriteria: userScore < requiredScore ? ['Higher volume needed', 'More frequent bridging'] : []
  };
};

const calculatePolygonScore = (orbiterData: OrbiterActivityResult, hopData: HopActivityResult) => {
  const userScore = Math.round((orbiterData.eligibilityScore + hopData.eligibilityMetrics.bridgeScore) / 2);
  const requiredScore = 50; // Historical Polygon requirement
  
  return {
    userScore,
    requiredScore,
    eligible: userScore >= requiredScore,
    percentileRank: Math.round((orbiterData.percentileRank + hopData.eligibilityMetrics.percentileRank) / 2),
    missingCriteria: userScore < requiredScore ? ['Basic bridge activity needed'] : []
  };
};

const calculateHopScore = (hopData: HopActivityResult) => {
  return {
    userScore: hopData.eligibilityMetrics.combinedScore,
    estimatedRequiredScore: 70,
    eligibilityLikelihood: Math.min(100, hopData.eligibilityMetrics.combinedScore * 1.2),
    percentileRank: hopData.eligibilityMetrics.percentileRank,
    strengthAreas: hopData.lpActivity.totalPositions > 0 ? ['LP participation'] : ['Bridge activity'],
    improvementAreas: hopData.eligibilityMetrics.combinedScore < 80 ? ['Increase frequency'] : []
  };
};

const calculateDiversityPercentile = (orbiterData: OrbiterActivityResult, hopData: HopActivityResult): number => {
  const totalChains = orbiterData.uniqueChains + hopData.bridgeActivity.uniqueChains;
  return Math.min(100, Math.round((totalChains / 8) * 100)); // Assuming 8 chains is top tier
};

const calculateVolumePercentile = (orbiterData: OrbiterActivityResult, hopData: HopActivityResult): number => {
  const totalVolume = parseFloat(orbiterData.totalVolume) + parseFloat(hopData.bridgeActivity.totalVolume);
  return Math.min(100, Math.round((totalVolume / 500000) * 100)); // Assuming $500K is top tier
};

const calculateVolumeMultiplier = (orbiterData: OrbiterActivityResult, hopData: HopActivityResult): number => {
  const totalVolume = parseFloat(orbiterData.totalVolume) + parseFloat(hopData.bridgeActivity.totalVolume);
  const averageVolume = 15000; // Assumed average user volume
  return Math.round((totalVolume / averageVolume) * 10) / 10;
};

const calculateFrequencyMultiplier = (orbiterData: OrbiterActivityResult, hopData: HopActivityResult): number => {
  const totalTransactions = orbiterData.totalTransactions + hopData.bridgeActivity.totalTransactions;
  const averageTransactions = 10; // Assumed average user transactions
  return Math.round((totalTransactions / averageTransactions) * 10) / 10;
};

const calculateDiversityMultiplier = (orbiterData: OrbiterActivityResult, hopData: HopActivityResult): number => {
  const totalChains = orbiterData.uniqueChains + hopData.bridgeActivity.uniqueChains;
  const averageChains = 2; // Assumed average user chains
  return Math.round((totalChains / averageChains) * 10) / 10;
};

const generateBenchmarkInsights = (
  orbiterData: OrbiterActivityResult,
  hopData: HopActivityResult,
  overallPercentile: HistoricalComparisonResult['overallPercentile']
): HistoricalComparisonResult['benchmarkInsights'] => {
  const metrics = [
    { name: 'Bridge Activity', score: overallPercentile.bridgeActivity },
    { name: 'LP Activity', score: overallPercentile.lpActivity },
    { name: 'Cross-chain Diversity', score: overallPercentile.crossChainDiversity },
    { name: 'Volume Ranking', score: overallPercentile.volumeRanking }
  ];
  
  const sortedMetrics = metrics.sort((a, b) => b.score - a.score);
  
  return {
    strongestMetrics: sortedMetrics.slice(0, 2).map(m => m.name),
    weakestMetrics: sortedMetrics.slice(-2).map(m => m.name),
    improvementPotential: Math.max(0, 100 - overallPercentile.combined),
    timeToImprove: Math.round((100 - overallPercentile.combined) * 2) // Rough estimate: 2 days per point
  };
};

// Simplified recommendation generation functions
const generateImmediateActions = (
  orbiterData: OrbiterActivityResult,
  hopData: HopActivityResult,
  historicalData: HistoricalComparisonResult
): BridgeRecommendation['immediateActions'] => {
  const actions: BridgeRecommendation['immediateActions'] = [];
  
  if (orbiterData.activityPatterns.averageFrequency < 2) {
    actions.push({
      priority: 'high',
      action: 'Increase bridge frequency',
      description: 'Bridge at least 2x per month to improve activity score',
      estimatedImpact: 15,
      estimatedCost: '100.00',
      timeframe: '1-2 months',
      difficulty: 'easy'
    });
  }
  
  if (orbiterData.uniqueChains < 4) {
    actions.push({
      priority: 'medium',
      action: 'Diversify chains',
      description: 'Use at least 4 different chains for better diversity score',
      estimatedImpact: 10,
      estimatedCost: '200.00',
      timeframe: '2-4 weeks',
      difficulty: 'medium'
    });
  }
  
  if (hopData.lpActivity.totalPositions === 0) {
    actions.push({
      priority: 'high',
      action: 'Start LP activity',
      description: 'Provide liquidity to earn LP bonus multiplier',
      estimatedImpact: 20,
      estimatedCost: '1000.00',
      timeframe: '1 week',
      difficulty: 'medium'
    });
  }
  
  return actions;
};

const generateLongTermStrategy = (
  orbiterData: OrbiterActivityResult,
  hopData: HopActivityResult,
  historicalData: HistoricalComparisonResult
): BridgeRecommendation['longTermStrategy'] => {
  const currentScore = Math.round((orbiterData.eligibilityScore + hopData.eligibilityMetrics.combinedScore) / 2);
  let targetTier: 'platinum' | 'gold' | 'silver' | 'bronze' = 'gold';
  
  if (currentScore >= 90) targetTier = 'platinum';
  else if (currentScore >= 75) targetTier = 'gold';
  else if (currentScore >= 60) targetTier = 'silver';
  else targetTier = 'bronze';
  
  const tierScores = { bronze: 40, silver: 60, gold: 80, platinum: 95 };
  const currentGap = Math.max(0, tierScores[targetTier] - currentScore);
  
  return {
    targetTier,
    currentGap,
    recommendedPath: [
      {
        milestone: `Reach ${targetTier} tier`,
        actions: [
          'Increase total volume',
          'Maintain regular activity',
          'Diversify chains and tokens'
        ],
        estimatedTimeframe: '3-6 months',
        estimatedCost: '2000.00'
      }
    ]
  };
};

const generateOrbiterRecommendations = (orbiterData: OrbiterActivityResult): BridgeRecommendation['protocolRecommendations']['orbiter'] => {
  return {
    recommendedChains: ['ethereum', 'arbitrum', 'optimism', 'polygon'],
    recommendedTokens: ['ETH', 'USDC', 'USDT'],
    targetVolume: String(Math.max(100000, parseFloat(orbiterData.totalVolume) * 1.5)),
    targetFrequency: Math.max(4, orbiterData.activityPatterns.averageFrequency * 1.5)
  };
};

const generateHopRecommendations = (hopData: HopActivityResult): BridgeRecommendation['protocolRecommendations']['hop'] => {
  return {
    bridgeRecommendations: {
      recommendedRoutes: ['ethereum-arbitrum', 'arbitrum-optimism', 'ethereum-polygon'],
      targetVolume: String(Math.max(75000, parseFloat(hopData.bridgeActivity.totalVolume) * 1.3)),
      targetFrequency: Math.max(3, Math.round(hopData.bridgeActivity.totalTransactions / 12))
    },
    lpRecommendations: {
      recommendedPools: [
        {
          pool: 'USDC-ethereum',
          chain: 'ethereum',
          token: 'USDC',
          estimatedApr: 12.5,
          riskLevel: 'low',
          minimumAmount: '1000.00'
        }
      ],
      targetDuration: Math.max(90, hopData.lpActivity.averagePositionDuration * 1.5),
      targetAmount: String(Math.max(10000, parseFloat(hopData.lpActivity.totalLiquidityProvided) * 1.2))
    }
  };
};

const generateRiskConsiderations = (
  orbiterData: OrbiterActivityResult,
  hopData: HopActivityResult
): BridgeRecommendation['riskConsiderations'] => {
  return [
    {
      type: 'financial',
      severity: 'medium',
      description: 'Bridge fees can be high during network congestion',
      mitigation: 'Monitor gas prices and bridge during off-peak hours'
    },
    {
      type: 'technical',
      severity: 'low',
      description: 'Smart contract risks in LP positions',
      mitigation: 'Only use audited protocols and start with small amounts'
    }
  ];
};

const calculateCostBenefitAnalysis = (
  orbiterData: OrbiterActivityResult,
  hopData: HopActivityResult,
  historicalData: HistoricalComparisonResult
): BridgeRecommendation['costBenefitAnalysis'] => {
  const estimatedTotalCost = '2000.00';
  const estimatedScoreImprovement = Math.max(10, 100 - historicalData.overallPercentile.combined);
  const estimatedPercentileImprovement = Math.round(estimatedScoreImprovement * 0.8);
  
  return {
    estimatedTotalCost,
    estimatedScoreImprovement,
    estimatedPercentileImprovement,
    roi: 5.0,
    breakEvenAirdropValue: String(parseFloat(estimatedTotalCost) * 2.5)
  };
};

const generatePersonalizedInsights = (
  orbiterData: OrbiterActivityResult,
  hopData: HopActivityResult,
  historicalData: HistoricalComparisonResult
): BridgeRecommendation['personalizedInsights'] => {
  const totalVolume = parseFloat(orbiterData.totalVolume) + parseFloat(hopData.bridgeActivity.totalVolume);
  
  let userType: 'whale' | 'regular' | 'casual' | 'new' = 'new';
  if (totalVolume > 100000) userType = 'whale';
  else if (totalVolume > 25000) userType = 'regular';
  else if (totalVolume > 5000) userType = 'casual';
  
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  if (orbiterData.activityPatterns.volumeConsistency > 0.7) strengths.push('Consistent volume');
  if (orbiterData.uniqueChains >= 4) strengths.push('Good chain diversity');
  if (hopData.lpActivity.totalPositions > 0) strengths.push('LP experience');
  
  if (orbiterData.activityPatterns.averageFrequency < 2) weaknesses.push('Low frequency');
  if (orbiterData.uniqueTokens < 3) weaknesses.push('Limited token diversity');
  if (!orbiterData.activityPatterns.recentActivity) weaknesses.push('Inactive recently');
  
  return {
    userType,
    strengths,
    weaknesses,
    opportunityScore: historicalData.overallPercentile.combined,
    competitiveAdvantage: strengths.length > weaknesses.length ? ['Early adopter'] : ['Room for improvement']
  };
};

// Export all transformation utilities
export const bridgeDataTransform = {
  validateOrbiterData: isOrbiterActivityResult,
  validateHopData: isHopActivityResult,
  validateHistoricalData: isHistoricalComparisonResult,
  validateRecommendationData: isBridgeRecommendation,
  transformOrbiterResponse,
  transformHopResponse,
  calculateHistoricalComparison,
  generateRecommendations
};