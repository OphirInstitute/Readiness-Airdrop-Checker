/**
 * Orbiter Finance Integration Service
 * Comprehensive service for analyzing bridge activity and eligibility scoring
 */

import { 
  OrbiterActivityResult, 
  OrbiterTransaction, 
  OrbiterUserStats, 
  BridgeAnalysisError 
} from '../types';
import { 
  orbiterConfig, 
  orbiterUtils, 
  orbiterThresholds, 
  orbiterScoringWeights 
} from '../config/orbiter';

export class OrbiterFinanceService {
  private baseUrl: string;
  private requestConfig: typeof orbiterConfig.request;
  private cache: Map<string, { data: unknown; timestamp: number }>;

  constructor() {
    this.baseUrl = orbiterConfig.baseUrl;
    this.requestConfig = orbiterConfig.request;
    this.cache = new Map();
  }

  /**
   * Get bridge history for a specific address
   * Fetches all bridge transactions for comprehensive analysis
   */
  async getBridgeHistory(address: string): Promise<OrbiterTransaction[]> {
    try {
      const cacheKey = `bridge_history_${address}`;
      const cached = this.getCachedData(cacheKey, orbiterConfig.cache.bridgeHistory);
      
      if (cached) {
        return cached as OrbiterTransaction[];
      }

      const url = `${this.baseUrl}${orbiterConfig.endpoints.bridgeHistory}`;
      const response = await this.makeRequest(url, {
        address,
        limit: 1000,
        offset: 0
      });

      if (!response.success || !response.data) {
        throw new Error(`Failed to fetch bridge history: ${response.error?.message || 'Unknown error'}`);
      }

      const transactions = this.transformBridgeTransactions(response.data);
      this.setCachedData(cacheKey, transactions);
      
      return transactions;
    } catch (error) {
      throw this.createError(
        'BRIDGE_HISTORY_FETCH_FAILED',
        `Failed to fetch bridge history for ${address}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'medium',
        true,
        { address }
      );
    }
  }

  /**
   * Analyze bridge patterns for transaction behavior insights
   * Identifies user patterns, preferences, and activity consistency
   */
  async analyzeBridgePatterns(transactions: OrbiterTransaction[]): Promise<{
    routePatterns: Array<{
      fromChain: string;
      toChain: string;
      transactionCount: number;
      volume: string;
      averageFee: string;
    }>;
    chainDistribution: Record<string, {
      transactionCount: number;
      volume: string;
      percentage: number;
    }>;
    tokenDistribution: Record<string, {
      transactionCount: number;
      volume: string;
      percentage: number;
    }>;
    monthlyActivity: Array<{
      month: string;
      transactionCount: number;
      volume: string;
      uniqueChains: number;
    }>;
  }> {
    try {
      // Analyze route patterns
      const routeMap = new Map<string, {
        count: number;
        volume: number;
        totalFees: number;
      }>();

      // Analyze chain distribution
      const chainMap = new Map<string, {
        count: number;
        volume: number;
      }>();

      // Analyze token distribution
      const tokenMap = new Map<string, {
        count: number;
        volume: number;
      }>();

      // Analyze monthly activity
      const monthlyMap = new Map<string, {
        count: number;
        volume: number;
        chains: Set<number>;
      }>();

      let totalVolume = 0;

      // Process each transaction
      transactions.forEach(tx => {
        const volume = parseFloat(tx.fromAmount);
        const fee = parseFloat(tx.fee);
        totalVolume += volume;

        // Route patterns
        const fromChainName = orbiterUtils.getChainName(tx.fromChain);
        const toChainName = orbiterUtils.getChainName(tx.toChain);
        const routeKey = `${fromChainName}-${toChainName}`;
        
        const existingRoute = routeMap.get(routeKey) || { count: 0, volume: 0, totalFees: 0 };
        routeMap.set(routeKey, {
          count: existingRoute.count + 1,
          volume: existingRoute.volume + volume,
          totalFees: existingRoute.totalFees + fee
        });

        // Chain distribution (from chain)
        const existingChain = chainMap.get(fromChainName) || { count: 0, volume: 0 };
        chainMap.set(fromChainName, {
          count: existingChain.count + 1,
          volume: existingChain.volume + volume
        });

        // Token distribution
        const existingToken = tokenMap.get(tx.fromToken) || { count: 0, volume: 0 };
        tokenMap.set(tx.fromToken, {
          count: existingToken.count + 1,
          volume: existingToken.volume + volume
        });

        // Monthly activity
        const date = new Date(tx.timestamp);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const existingMonth = monthlyMap.get(monthKey) || { 
          count: 0, 
          volume: 0, 
          chains: new Set<number>() 
        };
        existingMonth.chains.add(tx.fromChain);
        monthlyMap.set(monthKey, {
          count: existingMonth.count + 1,
          volume: existingMonth.volume + volume,
          chains: existingMonth.chains
        });
      });

      // Transform route patterns
      const routePatterns = Array.from(routeMap.entries()).map(([route, data]) => {
        const [fromChain, toChain] = route.split('-');
        return {
          fromChain,
          toChain,
          transactionCount: data.count,
          volume: data.volume.toFixed(2),
          averageFee: (data.totalFees / data.count).toFixed(2)
        };
      }).sort((a, b) => b.transactionCount - a.transactionCount);

      // Transform chain distribution
      const chainDistribution: Record<string, {
        transactionCount: number;
        volume: string;
        percentage: number;
      }> = {};
      
      chainMap.forEach((data, chain) => {
        chainDistribution[chain] = {
          transactionCount: data.count,
          volume: data.volume.toFixed(2),
          percentage: Math.round((data.volume / totalVolume) * 100)
        };
      });

      // Transform token distribution
      const tokenDistribution: Record<string, {
        transactionCount: number;
        volume: string;
        percentage: number;
      }> = {};
      
      tokenMap.forEach((data, token) => {
        tokenDistribution[token] = {
          transactionCount: data.count,
          volume: data.volume.toFixed(2),
          percentage: Math.round((data.volume / totalVolume) * 100)
        };
      });

      // Transform monthly activity
      const monthlyActivity = Array.from(monthlyMap.entries()).map(([month, data]) => ({
        month,
        transactionCount: data.count,
        volume: data.volume.toFixed(2),
        uniqueChains: data.chains.size
      })).sort((a, b) => a.month.localeCompare(b.month));

      return {
        routePatterns,
        chainDistribution,
        tokenDistribution,
        monthlyActivity
      };
    } catch (error) {
      throw this.createError(
        'PATTERN_ANALYSIS_FAILED',
        `Failed to analyze bridge patterns: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'medium',
        false,
        { transactionCount: transactions.length }
      );
    }
  }

  /**
   * Calculate Orbiter eligibility score based on comprehensive metrics
   * Uses weighted scoring algorithm considering volume, frequency, diversity, and recency
   */
  calculateOrbiterEligibilityScore(
    transactions: OrbiterTransaction[],
    patterns: Awaited<ReturnType<typeof this.analyzeBridgePatterns>>
  ): {
    eligibilityScore: number;
    tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'none';
    percentileRank: number;
    activityPatterns: {
      isRegularUser: boolean;
      averageFrequency: number;
      volumeConsistency: number;
      chainDiversity: number;
      recentActivity: boolean;
    };
  } {
    try {
      if (transactions.length === 0) {
        return {
          eligibilityScore: 0,
          tier: 'none',
          percentileRank: 0,
          activityPatterns: {
            isRegularUser: false,
            averageFrequency: 0,
            volumeConsistency: 0,
            chainDiversity: 0,
            recentActivity: false
          }
        };
      }

      // Calculate basic metrics
      const totalVolume = transactions.reduce((sum, tx) => sum + parseFloat(tx.fromAmount), 0);
      const totalTransactions = transactions.length;
      const uniqueChains = new Set(transactions.map(tx => tx.fromChain)).size;
      const uniqueTokens = new Set(transactions.map(tx => tx.fromToken)).size;
      
      const firstTx = Math.min(...transactions.map(tx => tx.timestamp));
      const lastTx = Math.max(...transactions.map(tx => tx.timestamp));
      const daysSinceFirst = (Date.now() - firstTx) / (1000 * 60 * 60 * 24);
      const daysSinceLast = (Date.now() - lastTx) / (1000 * 60 * 60 * 24);

      // Calculate weighted scores (0-100 each)
      
      // Volume Score (40% weight)
      const volumeScore = Math.min(100, (totalVolume / 100000) * 100); // $100K = 100 points
      
      // Frequency Score (25% weight)
      const averageFrequency = totalTransactions / Math.max(daysSinceFirst / 30, 1); // tx per month
      const frequencyScore = Math.min(100, (averageFrequency / 5) * 100); // 5 tx/month = 100 points
      
      // Diversity Score (20% weight)
      const chainDiversityScore = Math.min(100, (uniqueChains / 8) * 100); // 8 chains = 100 points
      const tokenDiversityScore = Math.min(100, (uniqueTokens / 5) * 100); // 5 tokens = 100 points
      const diversityScore = (chainDiversityScore + tokenDiversityScore) / 2;
      
      // Recency Score (15% weight)
      const recencyScore = daysSinceLast <= 30 ? 100 : Math.max(0, 100 - (daysSinceLast - 30) * 2);

      // Calculate weighted final score
      const eligibilityScore = Math.round(
        volumeScore * orbiterScoringWeights.volume +
        frequencyScore * orbiterScoringWeights.frequency +
        diversityScore * orbiterScoringWeights.diversity +
        recencyScore * orbiterScoringWeights.recency
      );

      // Determine tier
      const tier = orbiterUtils.calculateTier({
        address: '',
        totalTransactions,
        totalVolume: totalVolume.toString(),
        totalFees: '0',
        uniqueChains,
        uniqueTokens,
        firstTransaction: firstTx,
        lastTransaction: lastTx,
        averageTransactionSize: (totalVolume / totalTransactions).toString(),
        chainDistribution: {},
        tokenDistribution: {},
        monthlyActivity: []
      });

      // Calculate percentile rank (simplified)
      const percentileRank = Math.min(100, Math.round(eligibilityScore * 0.9 + 10));

      // Calculate activity patterns
      const volumeConsistency = this.calculateVolumeConsistency(transactions);
      const chainDiversity = uniqueChains / 8; // Normalized to 0-1
      const isRegularUser = averageFrequency >= 1 && totalVolume >= 5000;
      const recentActivity = daysSinceLast <= 30;

      return {
        eligibilityScore,
        tier,
        percentileRank,
        activityPatterns: {
          isRegularUser,
          averageFrequency,
          volumeConsistency,
          chainDiversity,
          recentActivity
        }
      };
    } catch (error) {
      throw this.createError(
        'ELIGIBILITY_CALCULATION_FAILED',
        `Failed to calculate eligibility score: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'high',
        false,
        { transactionCount: transactions.length }
      );
    }
  }

  /**
   * Get historical percentile ranking compared to other users
   * Provides context for user's performance relative to the broader ecosystem
   */
  async getHistoricalPercentile(
    eligibilityScore: number,
    totalVolume: number,
    totalTransactions: number
  ): Promise<{
    volumePercentile: number;
    frequencyPercentile: number;
    overallPercentile: number;
    comparisonMetrics: {
      averageVolume: number;
      averageTransactions: number;
      topTierThreshold: number;
    };
  }> {
    try {
      // Simulated historical data (in production, this would come from a database)
      const historicalMetrics = {
        averageVolume: 15000,
        averageTransactions: 12,
        topTierThreshold: 80,
        volumeDistribution: {
          p10: 1000,
          p25: 3000,
          p50: 8000,
          p75: 25000,
          p90: 75000,
          p95: 150000
        },
        transactionDistribution: {
          p10: 2,
          p25: 5,
          p50: 10,
          p75: 20,
          p90: 40,
          p95: 80
        }
      };

      // Calculate volume percentile
      let volumePercentile = 0;
      if (totalVolume >= historicalMetrics.volumeDistribution.p95) volumePercentile = 95;
      else if (totalVolume >= historicalMetrics.volumeDistribution.p90) volumePercentile = 90;
      else if (totalVolume >= historicalMetrics.volumeDistribution.p75) volumePercentile = 75;
      else if (totalVolume >= historicalMetrics.volumeDistribution.p50) volumePercentile = 50;
      else if (totalVolume >= historicalMetrics.volumeDistribution.p25) volumePercentile = 25;
      else if (totalVolume >= historicalMetrics.volumeDistribution.p10) volumePercentile = 10;
      else volumePercentile = Math.round((totalVolume / historicalMetrics.volumeDistribution.p10) * 10);

      // Calculate frequency percentile
      let frequencyPercentile = 0;
      if (totalTransactions >= historicalMetrics.transactionDistribution.p95) frequencyPercentile = 95;
      else if (totalTransactions >= historicalMetrics.transactionDistribution.p90) frequencyPercentile = 90;
      else if (totalTransactions >= historicalMetrics.transactionDistribution.p75) frequencyPercentile = 75;
      else if (totalTransactions >= historicalMetrics.transactionDistribution.p50) frequencyPercentile = 50;
      else if (totalTransactions >= historicalMetrics.transactionDistribution.p25) frequencyPercentile = 25;
      else if (totalTransactions >= historicalMetrics.transactionDistribution.p10) frequencyPercentile = 10;
      else frequencyPercentile = Math.round((totalTransactions / historicalMetrics.transactionDistribution.p10) * 10);

      // Calculate overall percentile based on eligibility score
      const overallPercentile = Math.min(100, Math.round(eligibilityScore * 0.85 + 15));

      return {
        volumePercentile,
        frequencyPercentile,
        overallPercentile,
        comparisonMetrics: {
          averageVolume: historicalMetrics.averageVolume,
          averageTransactions: historicalMetrics.averageTransactions,
          topTierThreshold: historicalMetrics.topTierThreshold
        }
      };
    } catch (error) {
      throw this.createError(
        'PERCENTILE_CALCULATION_FAILED',
        `Failed to calculate historical percentile: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'low',
        true,
        { eligibilityScore, totalVolume, totalTransactions }
      );
    }
  }

  /**
   * Comprehensive analysis method that combines all Orbiter Finance metrics
   * Main entry point for getting complete user analysis
   */
  async analyzeOrbiterActivity(address: string): Promise<OrbiterActivityResult> {
    try {
      // Fetch bridge history
      const transactions = await this.getBridgeHistory(address);
      
      if (transactions.length === 0) {
        return this.createEmptyResult(address);
      }

      // Analyze patterns
      const patterns = await this.analyzeBridgePatterns(transactions);
      
      // Calculate eligibility metrics
      const eligibilityMetrics = this.calculateOrbiterEligibilityScore(transactions, patterns);
      
      // Get historical percentile
      const totalVolume = transactions.reduce((sum, tx) => sum + parseFloat(tx.fromAmount), 0);
      const historicalData = await this.getHistoricalPercentile(
        eligibilityMetrics.eligibilityScore,
        totalVolume,
        transactions.length
      );

      // Calculate additional metrics
      const totalFees = transactions.reduce((sum, tx) => sum + parseFloat(tx.fee), 0);
      const uniqueChains = new Set(transactions.map(tx => tx.fromChain)).size;
      const uniqueTokens = new Set(transactions.map(tx => tx.fromToken)).size;
      const firstTransaction = Math.min(...transactions.map(tx => tx.timestamp));
      const lastTransaction = Math.max(...transactions.map(tx => tx.timestamp));
      const averageTransactionSize = totalVolume / transactions.length;

      // Build comprehensive result
      const result: OrbiterActivityResult = {
        address,
        totalTransactions: transactions.length,
        totalVolume: totalVolume.toFixed(2),
        totalFees: totalFees.toFixed(2),
        uniqueChains,
        uniqueTokens,
        firstTransaction,
        lastTransaction,
        averageTransactionSize: averageTransactionSize.toFixed(2),
        chainDistribution: patterns.chainDistribution,
        tokenDistribution: patterns.tokenDistribution,
        routePatterns: patterns.routePatterns,
        monthlyActivity: patterns.monthlyActivity,
        eligibilityScore: eligibilityMetrics.eligibilityScore,
        tier: eligibilityMetrics.tier,
        percentileRank: historicalData.overallPercentile,
        activityPatterns: eligibilityMetrics.activityPatterns
      };

      return result;
    } catch (error) {
      if (error instanceof Error && error.message.includes('ORBITER_')) {
        throw error; // Re-throw Orbiter-specific errors
      }
      
      throw this.createError(
        'ANALYSIS_FAILED',
        `Failed to analyze Orbiter activity for ${address}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'high',
        true,
        { address }
      );
    }
  }

  // Private helper methods

  private async makeRequest(url: string, params: Record<string, unknown>): Promise<{
    success: boolean;
    data?: unknown;
    error?: { message: string; code: string };
  }> {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    const fullUrl = `${url}?${queryString}`;
    
    let attempt = 0;
    while (attempt < this.requestConfig.retries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.requestConfig.timeout);

        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Airdrop-Eligibility-Checker/1.0'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        attempt++;
        
        if (attempt >= this.requestConfig.retries) {
          return {
            success: false,
            error: {
              message: error instanceof Error ? error.message : 'Unknown error',
              code: 'REQUEST_FAILED'
            }
          };
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.requestConfig.retryDelay * attempt));
      }
    }

    return {
      success: false,
      error: {
        message: 'Max retries exceeded',
        code: 'MAX_RETRIES_EXCEEDED'
      }
    };
  }

  private transformBridgeTransactions(rawData: unknown): OrbiterTransaction[] {
    if (!Array.isArray(rawData)) {
      throw new Error('Invalid bridge transactions data: expected array');
    }

    return rawData.map((item, index) => {
      if (!item || typeof item !== 'object') {
        throw new Error(`Invalid transaction at index ${index}: not an object`);
      }

      const tx = item as Record<string, unknown>;
      
      return {
        id: String(tx.id || `tx_${index}`),
        hash: String(tx.hash || ''),
        fromChain: Number(tx.fromChain) || 1,
        toChain: Number(tx.toChain) || 1,
        fromToken: String(tx.fromToken || 'ETH'),
        toToken: String(tx.toToken || 'ETH'),
        fromAmount: String(tx.fromAmount || '0'),
        toAmount: String(tx.toAmount || '0'),
        sender: String(tx.sender || ''),
        receiver: String(tx.receiver || ''),
        timestamp: Number(tx.timestamp) || Date.now(),
        status: this.validateStatus(tx.status) || 'completed',
        fee: String(tx.fee || '0'),
        gasUsed: tx.gasUsed ? String(tx.gasUsed) : undefined,
        blockNumber: tx.blockNumber ? Number(tx.blockNumber) : undefined
      };
    });
  }

  private validateStatus(status: unknown): 'pending' | 'completed' | 'failed' | null {
    const validStatuses = ['pending', 'completed', 'failed'];
    return validStatuses.includes(String(status)) ? String(status) as 'pending' | 'completed' | 'failed' : null;
  }

  private calculateVolumeConsistency(transactions: OrbiterTransaction[]): number {
    if (transactions.length < 2) return 0;

    const volumes = transactions.map(tx => parseFloat(tx.fromAmount));
    const mean = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
    const variance = volumes.reduce((sum, vol) => sum + Math.pow(vol - mean, 2), 0) / volumes.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Coefficient of variation (lower = more consistent)
    const coefficientOfVariation = standardDeviation / mean;
    
    // Convert to consistency score (0-1, higher = more consistent)
    return Math.max(0, Math.min(1, 1 - (coefficientOfVariation / 2)));
  }

  private createEmptyResult(address: string): OrbiterActivityResult {
    return {
      address,
      totalTransactions: 0,
      totalVolume: '0',
      totalFees: '0',
      uniqueChains: 0,
      uniqueTokens: 0,
      firstTransaction: 0,
      lastTransaction: 0,
      averageTransactionSize: '0',
      chainDistribution: {},
      tokenDistribution: {},
      routePatterns: [],
      monthlyActivity: [],
      eligibilityScore: 0,
      tier: 'none',
      percentileRank: 0,
      activityPatterns: {
        isRegularUser: false,
        averageFrequency: 0,
        volumeConsistency: 0,
        chainDiversity: 0,
        recentActivity: false
      }
    };
  }

  private getCachedData(key: string, maxAge: number): unknown | null {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < maxAge) {
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

  private createError(
    code: string,
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    retryable: boolean,
    context?: Record<string, unknown>
  ): BridgeAnalysisError {
    return {
      code,
      message,
      service: 'orbiter',
      severity,
      retryable,
      timestamp: Date.now(),
      context
    };
  }
}