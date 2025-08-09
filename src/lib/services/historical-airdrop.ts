import type { HistoricalComparisonResult } from '../types';

interface UserMetrics {
  totalBridgeVolume: string;
  totalBridgeTransactions: number;
  totalLPVolume: string;
  totalLPDuration: number;
  uniqueChains: number;
  uniqueTokens: number;
}



interface CachedData {
  data: unknown;
  timestamp: number;
}

/**
 * Historical Airdrop Comparison Service
 * Compares user activity against historical airdrop criteria for comprehensive analysis
 */
export class HistoricalAirdropService {
  private cache: Map<string, CachedData> = new Map();
  private cacheTimeout = 3600000; // 1 hour

  // Historical airdrop criteria database
  private readonly HISTORICAL_AIRDROP_CRITERIA = {
    arbitrum: {
      name: 'Arbitrum (ARB)',
      date: '2023-03-23',
      totalSupply: '10,000,000,000 ARB',
      eligibleUsers: 625143,
      criteria: {
        bridgeVolume: { min: 1000, median: 5000, top10: 50000 },
        bridgeCount: { min: 5, median: 15, top10: 100 },
        uniqueChains: { min: 2, median: 3, top10: 5 },
        minAmount: 0.005, // ETH
        description: 'Bridge funds to Arbitrum',
        weight: 0.4
      },
      estimatedMaxPoints: 15,
      minPointsForEligibility: 3
    },
    optimism: {
      name: 'Optimism (OP)',
      date: '2022-05-31',
      totalSupply: '4,294,967,296 OP',
      eligibleUsers: 248699,
      criteria: {
        bridgeVolume: { min: 500, median: 2500, top10: 25000 },
        bridgeCount: { min: 3, median: 10, top10: 50 },
        socialActivity: { min: 10, median: 50, top10: 500 },
        minAmount: 0.005, // ETH
        description: 'Bridge funds to Optimism',
        weight: 0.35
      },
      estimatedMaxPoints: 20,
      minPointsForEligibility: 1
    },
    polygon: {
      name: 'Polygon (MATIC)',
      date: '2021-06-01',
      totalSupply: '10,000,000,000 MATIC',
      eligibleUsers: 500000,
      criteria: {
        bridgeVolume: { min: 100, median: 1000, top10: 10000 },
        dappUsage: { min: 5, median: 20, top10: 100 },
        nftActivity: { min: 1, median: 5, top10: 50 },
        minAmount: 0.01, // ETH equivalent
        description: 'Bridge funds to Polygon',
        weight: 0.3
      },
      estimatedMaxPoints: 4,
      minPointsForEligibility: 1
    },
    hop: {
      name: 'Hop Protocol (HOP) - Estimated',
      date: '2024-Q2-Estimated',
      totalSupply: '1,000,000,000 HOP',
      eligibleUsers: 25000,
      criteria: {
        bridgeVolume: { min: 2500, median: 10000, top10: 100000 },
        bridgeCount: { min: 10, median: 25, top10: 200 },
        lpActivity: { min: 5000, median: 25000, top10: 250000 },
        uniqueChains: { min: 3, median: 4, top10: 6 },
        description: 'Bridge and provide liquidity',
        weight: 0.25
      },
      estimatedMaxPoints: 20,
      minPointsForEligibility: 5
    }
  };

  /**
   * Main method for comprehensive historical comparison
   */
  async compareToHistoricalAirdrops(userMetrics: UserMetrics): Promise<HistoricalComparisonResult> {
    const cacheKey = `historical_comparison_${userMetrics.totalBridgeVolume}_${userMetrics.totalBridgeTransactions}`;
    
    // Check cache
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached as HistoricalComparisonResult;
    }

    try {
      const address = 'user_address'; // Would be passed in real implementation

      // Calculate scores for each historical airdrop
      const historicalBenchmarks = {
        arbitrum: this.calculateArbitrumScore(userMetrics),
        optimism: this.calculateOptimismScore(userMetrics),
        polygon: this.calculatePolygonScore(userMetrics),
        hop: this.calculateHopScore(userMetrics)
      };

      // Calculate overall percentile
      const overallPercentile = this.calculateOverallPercentile(userMetrics, historicalBenchmarks);

      // Generate comparative analysis
      const comparativeAnalysis = this.generateComparativeAnalysis(userMetrics, overallPercentile);

      // Generate benchmark insights
      const benchmarkInsights = this.generateBenchmarkMetrics(userMetrics, overallPercentile);

      const result: HistoricalComparisonResult = {
        address,
        historicalBenchmarks,
        overallPercentile,
        comparativeAnalysis,
        benchmarkInsights
      };

      // Cache the result
      this.setCachedData(cacheKey, result);

      return result;

    } catch (error) {
      throw this.createError(
        'HISTORICAL_ANALYSIS_FAILED',
        `Failed to perform historical comparison for ${userMetrics.totalBridgeVolume}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'historical-service',
        'medium',
        true,
        { userMetrics }
      );
    }
  }

  /**
   * Calculate Arbitrum airdrop score
   */
  private calculateArbitrumScore(userMetrics: UserMetrics) {
    const criteria = this.HISTORICAL_AIRDROP_CRITERIA.arbitrum;
    let userScore = 0;
    const missingCriteria: string[] = [];

    const bridgeVolume = parseFloat(userMetrics.totalBridgeVolume);
    const bridgeCount = userMetrics.totalBridgeTransactions;

    // Bridge volume scoring
    if (bridgeVolume >= criteria.criteria.bridgeVolume.top10) {
      userScore += criteria.criteria.weight * 10;
    } else if (bridgeVolume >= criteria.criteria.bridgeVolume.median) {
      userScore += criteria.criteria.weight * 6;
    } else if (bridgeVolume >= criteria.criteria.bridgeVolume.min) {
      userScore += criteria.criteria.weight * 3;
    } else {
      missingCriteria.push('Insufficient bridge volume');
    }

    // Transaction count scoring
    if (bridgeCount >= criteria.criteria.bridgeCount.top10) {
      userScore += 4;
    } else if (bridgeCount >= criteria.criteria.bridgeCount.median) {
      userScore += 2;
    } else if (bridgeCount >= criteria.criteria.bridgeCount.min) {
      userScore += 1;
    } else {
      missingCriteria.push('Insufficient transaction count');
    }

    // Chain diversity scoring
    if (userMetrics.uniqueChains >= criteria.criteria.uniqueChains.top10) {
      userScore += 3;
    } else if (userMetrics.uniqueChains >= criteria.criteria.uniqueChains.median) {
      userScore += 2;
    } else if (userMetrics.uniqueChains >= criteria.criteria.uniqueChains.min) {
      userScore += 1;
    } else {
      missingCriteria.push('Use more chains');
    }

    const requiredScore = criteria.minPointsForEligibility;
    const eligible = userScore >= requiredScore;
    const percentileRank = Math.min(100, Math.round((userScore / criteria.estimatedMaxPoints) * 100));

    return {
      userScore: Math.round(userScore),
      requiredScore,
      eligible,
      percentileRank,
      missingCriteria
    };
  }
  /*
*
   * Calculate Optimism airdrop score
   */
  private calculateOptimismScore(userMetrics: UserMetrics) {
    const criteria = this.HISTORICAL_AIRDROP_CRITERIA.optimism;
    let userScore = 0;
    const missingCriteria: string[] = [];

    const bridgeVolume = parseFloat(userMetrics.totalBridgeVolume);
    const bridgeTransactions = userMetrics.totalBridgeTransactions;

    // Bridge volume scoring
    if (bridgeVolume >= criteria.criteria.bridgeVolume.top10) {
      userScore += criteria.criteria.weight * 10;
    } else if (bridgeVolume >= criteria.criteria.bridgeVolume.median) {
      userScore += criteria.criteria.weight * 6;
    } else if (bridgeVolume >= criteria.criteria.bridgeVolume.min) {
      userScore += criteria.criteria.weight * 3;
    } else {
      missingCriteria.push('Insufficient bridge volume');
    }

    // Transaction count scoring
    if (bridgeTransactions >= criteria.criteria.bridgeCount.top10) {
      userScore += 4;
    } else if (bridgeTransactions >= criteria.criteria.bridgeCount.median) {
      userScore += 2;
    } else if (bridgeTransactions >= criteria.criteria.bridgeCount.min) {
      userScore += 1;
    } else {
      missingCriteria.push('Insufficient transaction count');
    }

    const requiredScore = criteria.minPointsForEligibility;
    const eligible = userScore >= requiredScore;
    const percentileRank = Math.min(100, Math.round((userScore / criteria.estimatedMaxPoints) * 100));

    return {
      userScore: Math.round(userScore),
      requiredScore,
      eligible,
      percentileRank,
      missingCriteria
    };
  }

  /**
   * Calculate Polygon airdrop score
   */
  private calculatePolygonScore(userMetrics: UserMetrics) {
    const criteria = this.HISTORICAL_AIRDROP_CRITERIA.polygon;
    let userScore = 0;
    const missingCriteria: string[] = [];

    const bridgeVolume = parseFloat(userMetrics.totalBridgeVolume);

    // Bridge volume scoring
    if (bridgeVolume >= criteria.criteria.bridgeVolume.top10) {
      userScore += criteria.criteria.weight * 10;
    } else if (bridgeVolume >= criteria.criteria.bridgeVolume.median) {
      userScore += criteria.criteria.weight * 6;
    } else if (bridgeVolume >= criteria.criteria.bridgeVolume.min) {
      userScore += criteria.criteria.weight * 3;
    } else {
      missingCriteria.push('Insufficient bridge volume');
    }

    const requiredScore = criteria.minPointsForEligibility;
    const eligible = userScore >= requiredScore;
    const percentileRank = Math.min(100, Math.round((userScore / criteria.estimatedMaxPoints) * 100));

    return {
      userScore: Math.round(userScore),
      requiredScore,
      eligible,
      percentileRank,
      missingCriteria
    };
  }

  /**
   * Calculate Hop Protocol airdrop score
   */
  private calculateHopScore(userMetrics: UserMetrics) {
    const criteria = this.HISTORICAL_AIRDROP_CRITERIA.hop;
    let userScore = 0;
    const strengthAreas: string[] = [];
    const improvementAreas: string[] = [];

    const bridgeVolume = parseFloat(userMetrics.totalBridgeVolume);
    const bridgeCount = userMetrics.totalBridgeTransactions;
    const lpVolume = parseFloat(userMetrics.totalLPVolume);

    // Bridge volume scoring
    if (bridgeVolume >= criteria.criteria.bridgeVolume.top10) {
      userScore += 8;
      strengthAreas.push('High bridge volume');
    } else if (bridgeVolume >= criteria.criteria.bridgeVolume.median) {
      userScore += 5;
      strengthAreas.push('Good bridge volume');
    } else if (bridgeVolume >= criteria.criteria.bridgeVolume.min) {
      userScore += 2;
    } else {
      improvementAreas.push('Increase bridge volume');
    }

    // LP activity scoring
    if (lpVolume >= criteria.criteria.lpActivity.top10) {
      userScore += 8;
      strengthAreas.push('Strong LP participation');
    } else if (lpVolume >= criteria.criteria.lpActivity.median) {
      userScore += 5;
      strengthAreas.push('Good LP participation');
    } else if (lpVolume >= criteria.criteria.lpActivity.min) {
      userScore += 2;
    } else {
      improvementAreas.push('Start LP activity');
    }

    const estimatedRequiredScore = criteria.minPointsForEligibility;
    const eligibilityLikelihood = Math.min(100, Math.round((userScore / estimatedRequiredScore) * 100));
    const percentileRank = Math.min(100, Math.round((userScore / criteria.estimatedMaxPoints) * 100));

    return {
      userScore: Math.round(userScore),
      estimatedRequiredScore,
      eligibilityLikelihood,
      percentileRank,
      strengthAreas,
      improvementAreas
    };
  }

  /**
   * Calculate overall percentile across all metrics
   */
  private calculateOverallPercentile(userMetrics: UserMetrics, _historicalBenchmarks: Record<string, unknown>) {
    // Estimated benchmarks (would be based on real data)
    const averageVolume = 15000;
    const averageTransactions = 12;

    const totalBridgeVolume = parseFloat(userMetrics.totalBridgeVolume);
    const totalBridgeTransactions = userMetrics.totalBridgeTransactions;
    const totalChains = userMetrics.uniqueChains;

    // Bridge activity percentile (based on volume and frequency)
    const bridgeActivity = Math.min(100, Math.round(
      ((totalBridgeVolume / averageVolume) * 0.4 + 
       (totalBridgeTransactions / averageTransactions) * 0.4) * 50
    ));

    // LP activity percentile
    const lpActivity = Math.min(100, Math.round(
      (parseFloat(userMetrics.totalLPVolume) / 500000) * 100
    ));

    // Cross-chain diversity percentile
    const crossChainDiversity = Math.min(100, Math.round(
      (totalChains / 6) * 100
    ));

    // Volume ranking percentile
    const volumeRanking = Math.min(100, Math.round(
      (totalBridgeVolume / 50000) * 100
    ));

    // Combined weighted average
    const combined = Math.round(
      bridgeActivity * 0.4 + 
      crossChainDiversity * 0.25 + 
      lpActivity * 0.25 + 
      volumeRanking * 0.15
    );

    return {
      bridgeActivity,
      lpActivity,
      crossChainDiversity,
      volumeRanking,
      combined
    };
  }

  /**
   * Generate comparative analysis
   */
  private generateComparativeAnalysis(userMetrics: UserMetrics, overallPercentile: Record<string, number>) {
    // Estimated averages (would be based on real data)
    const averageVolume = 15000;
    const averageTransactions = 12;
    const averageChains = 3;

    const totalVolume = parseFloat(userMetrics.totalBridgeVolume);
    const totalTransactions = userMetrics.totalBridgeTransactions;
    const totalChains = userMetrics.uniqueChains;

    return {
      vsAverageUser: {
        volumeMultiplier: Math.round((totalVolume / averageVolume) * 10) / 10,
        frequencyMultiplier: Math.round((totalTransactions / averageTransactions) * 10) / 10,
        diversityMultiplier: Math.round((totalChains / averageChains) * 10) / 10
      },
      vsEligibleUsers: {
        volumePercentile: overallPercentile.volumeRanking,
        frequencyPercentile: overallPercentile.bridgeActivity,
        diversityPercentile: overallPercentile.crossChainDiversity
      }
    };
  }

  /**
   * Generate benchmark metrics and insights
   */
  private generateBenchmarkMetrics(userMetrics: UserMetrics, overallPercentile: Record<string, number>) {
    const metrics = [
      { name: 'Bridge Activity', score: overallPercentile.bridgeActivity },
      { name: 'LP Activity', score: overallPercentile.lpActivity },
      { name: 'Cross-chain Diversity', score: overallPercentile.crossChainDiversity },
      { name: 'Volume Ranking', score: overallPercentile.volumeRanking }
    ];

    const sortedMetrics = metrics.sort((a, b) => b.score - a.score);
    const strongestMetrics = sortedMetrics.slice(0, 2).map(m => m.name);
    const weakestMetrics = sortedMetrics.slice(-2).map(m => m.name);

    // Calculate improvement potential
    const improvementPotential = Math.max(0, 100 - overallPercentile.combined);
    
    // Estimate time to improve (simplified calculation)
    const timeToImprove = Math.round(improvementPotential * 1.5); // 1.5 days per point

    return {
      strongestMetrics,
      weakestMetrics,
      improvementPotential,
      timeToImprove
    };
  }

  /**
   * Cache management methods
   */
  private getCachedData(key: string): unknown | null {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: unknown): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Error creation helper
   */
  private createError(
    code: string,
    message: string,
    service: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    retryable: boolean,
    context?: Record<string, unknown>
  ): Error {
    const error = new Error(message) as Error & {
      code: string;
      service: string;
      severity: string;
      retryable: boolean;
      timestamp: number;
      context?: Record<string, unknown>;
    };
    error.code = code;
    error.service = service;
    error.severity = severity;
    error.retryable = retryable;
    error.timestamp = Date.now();
    error.context = context;
    return error;
  }
}