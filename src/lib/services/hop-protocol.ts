/**
 * Hop Protocol Integration Service
 * Comprehensive service for analyzing bridge and LP activity using Hop SDK
 */

import { Hop } from '@hop-protocol/sdk';
import { 
  HopActivityResult, 
  HopBridgeTransaction, 
  HopLPPosition, 
  HopUserStats,
  BridgeAnalysisError 
} from '../types';
import { 
  hopConfig, 
  hopUtils, 
  hopThresholds, 
  hopScoringWeights,
  hopLPBonuses 
} from '../config/hop';

export class HopProtocolService {
  private hop: Hop;
  private requestConfig: typeof hopConfig.request;
  private cache: Map<string, { data: unknown; timestamp: number }>;

  constructor() {
    this.hop = new Hop(hopConfig.sdk.network);
    this.requestConfig = hopConfig.request;
    this.cache = new Map();
    
    // Configure providers if available
    if (hopConfig.sdk.providers.ethereum) {
      this.hop.setProvider('ethereum', hopConfig.sdk.providers.ethereum);
    }
    if (hopConfig.sdk.providers.arbitrum) {
      this.hop.setProvider('arbitrum', hopConfig.sdk.providers.arbitrum);
    }
    if (hopConfig.sdk.providers.optimism) {
      this.hop.setProvider('optimism', hopConfig.sdk.providers.optimism);
    }
    if (hopConfig.sdk.providers.polygon) {
      this.hop.setProvider('polygon', hopConfig.sdk.providers.polygon);
    }
  }

  /**
   * Get Hop bridge history for multi-token bridge analysis
   * Fetches bridge transactions across all supported tokens and chains
   */
  async getHopBridgeHistory(address: string): Promise<HopBridgeTransaction[]> {
    try {
      const cacheKey = `hop_bridge_history_${address}`;
      const cached = this.getCachedData(cacheKey, hopConfig.cache.bridgeHistory);
      
      if (cached) {
        return cached as HopBridgeTransaction[];
      }

      const allTransactions: HopBridgeTransaction[] = [];
      
      // Fetch transactions for each supported token
      for (const token of hopConfig.supportedTokens) {
        try {
          const hopToken = this.hop.bridge(token);
          
          // Get transactions for each supported chain
          for (const [chainName, chainId] of Object.entries(hopConfig.supportedChains)) {
            try {
              // Note: In a real implementation, you would use the actual Hop SDK methods
              // This is a simplified version showing the structure
              const transactions = await this.fetchTokenTransactions(
                hopToken, 
                address, 
                chainId, 
                token
              );
              
              allTransactions.push(...transactions);
            } catch (error) {
              console.warn(`Failed to fetch ${token} transactions on ${chainName}:`, error);
              // Continue with other chains
            }
          }
        } catch (error) {
          console.warn(`Failed to initialize ${token} bridge:`, error);
          // Continue with other tokens
        }
      }

      // Sort by timestamp (newest first)
      allTransactions.sort((a, b) => b.timestamp - a.timestamp);
      
      this.setCachedData(cacheKey, allTransactions);
      return allTransactions;
    } catch (error) {
      throw this.createError(
        'HOP_BRIDGE_HISTORY_FAILED',
        `Failed to fetch Hop bridge history for ${address}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'medium',
        true,
        { address }
      );
    }
  }

  /**
   * Get liquidity provision activity for LP detection
   * Analyzes LP positions across all Hop pools
   */
  async getLiquidityProvisionActivity(address: string): Promise<HopLPPosition[]> {
    try {
      const cacheKey = `hop_lp_positions_${address}`;
      const cached = this.getCachedData(cacheKey, hopConfig.cache.lpPositions);
      
      if (cached) {
        return cached as HopLPPosition[];
      }

      const allPositions: HopLPPosition[] = [];
      
      // Check LP positions for each token and chain combination
      for (const token of hopConfig.supportedTokens) {
        for (const [chainName, chainId] of Object.entries(hopConfig.supportedChains)) {
          try {
            const hopToken = this.hop.bridge(token);
            const ammWrapper = hopToken.getAmmWrapper(chainId);
            
            if (!ammWrapper) continue;
            
            // Get LP token balance
            const lpTokenBalance = await this.getLPTokenBalance(
              ammWrapper,
              address,
              chainId,
              token
            );
            
            if (parseFloat(lpTokenBalance) > 0) {
              const position = await this.buildLPPosition(
                ammWrapper,
                address,
                chainId,
                token,
                lpTokenBalance
              );
              
              if (position) {
                allPositions.push(position);
              }
            }
          } catch (error) {
            console.warn(`Failed to check LP position for ${token} on ${chainName}:`, error);
            // Continue with other combinations
          }
        }
      }

      this.setCachedData(cacheKey, allPositions);
      return allPositions;
    } catch (error) {
      throw this.createError(
        'HOP_LP_ACTIVITY_FAILED',
        `Failed to fetch Hop LP activity for ${address}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'medium',
        true,
        { address }
      );
    }
  }

  /**
   * Analyze cross-chain routes for route pattern analysis
   * Identifies preferred routes and usage patterns
   */
  async analyzeCrossChainRoutes(transactions: HopBridgeTransaction[]): Promise<Array<{
    route: string;
    frequency: number;
    totalVolume: string;
    averageAmount: string;
    preferredTokens: string[];
  }>> {
    try {
      const routeMap = new Map<string, {
        frequency: number;
        totalVolume: number;
        amounts: number[];
        tokens: Set<string>;
      }>();

      // Analyze each transaction
      transactions.forEach(tx => {
        const route = hopUtils.formatRoute(tx.sourceChainId, tx.destinationChainId);
        const amount = parseFloat(tx.amount);
        
        const existing = routeMap.get(route) || {
          frequency: 0,
          totalVolume: 0,
          amounts: [],
          tokens: new Set<string>()
        };
        
        existing.frequency += 1;
        existing.totalVolume += amount;
        existing.amounts.push(amount);
        existing.tokens.add(tx.token);
        
        routeMap.set(route, existing);
      });

      // Transform to result format
      const routes = Array.from(routeMap.entries()).map(([route, data]) => ({
        route,
        frequency: data.frequency,
        totalVolume: data.totalVolume.toFixed(2),
        averageAmount: (data.totalVolume / data.frequency).toFixed(2),
        preferredTokens: Array.from(data.tokens).sort()
      }));

      // Sort by frequency (most used routes first)
      return routes.sort((a, b) => b.frequency - a.frequency);
    } catch (error) {
      throw this.createError(
        'HOP_ROUTE_ANALYSIS_FAILED',
        `Failed to analyze cross-chain routes: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'low',
        false,
        { transactionCount: transactions.length }
      );
    }
  }

  /**
   * Calculate Hop eligibility score with LP bonus weighting
   * Comprehensive scoring that rewards both bridge and LP activity
   */
  calculateHopEligibilityScore(
    bridgeTransactions: HopBridgeTransaction[],
    lpPositions: HopLPPosition[],
    crossChainRoutes: Awaited<ReturnType<typeof this.analyzeCrossChainRoutes>>
  ): HopActivityResult['eligibilityMetrics'] {
    try {
      // Calculate bridge metrics
      const bridgeVolume = bridgeTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
      const bridgeFrequency = bridgeTransactions.length;
      const uniqueChains = new Set([
        ...bridgeTransactions.map(tx => tx.sourceChainId),
        ...bridgeTransactions.map(tx => tx.destinationChainId)
      ]).size;
      const uniqueTokens = new Set(bridgeTransactions.map(tx => tx.token)).size;

      // Calculate LP metrics
      const totalLiquidity = lpPositions.reduce((sum, pos) => sum + parseFloat(pos.underlyingTokenBalance), 0);
      const activeLPPositions = lpPositions.filter(pos => parseFloat(pos.lpTokenBalance) > 0).length;
      const avgLPDuration = lpPositions.length > 0 
        ? lpPositions.reduce((sum, pos) => {
            const duration = (Date.now() - pos.depositTimestamp) / (1000 * 60 * 60 * 24);
            return sum + duration;
          }, 0) / lpPositions.length
        : 0;

      // Calculate individual scores (0-100)
      
      // Bridge Score (weighted components)
      const bridgeVolumeScore = Math.min(100, (bridgeVolume / 500000) * 100); // $500K = 100 points
      const bridgeFrequencyScore = Math.min(100, (bridgeFrequency / 100) * 100); // 100 tx = 100 points
      const bridgeDiversityScore = Math.min(100, ((uniqueChains + uniqueTokens) / 10) * 100); // 10 total = 100 points
      
      const bridgeScore = Math.round(
        bridgeVolumeScore * 0.5 +
        bridgeFrequencyScore * 0.3 +
        bridgeDiversityScore * 0.2
      );

      // LP Score (weighted components)
      const lpVolumeScore = Math.min(100, (totalLiquidity / 250000) * 100); // $250K = 100 points
      const lpDurationScore = Math.min(100, (avgLPDuration / 180) * 100); // 180 days = 100 points
      const lpDiversityScore = Math.min(100, (activeLPPositions / 5) * 100); // 5 positions = 100 points
      
      const lpScore = lpPositions.length > 0 ? Math.round(
        lpVolumeScore * 0.5 +
        lpDurationScore * 0.3 +
        lpDiversityScore * 0.2
      ) : 0;

      // Calculate LP bonus multiplier
      let lpBonusMultiplier = 1.0;
      
      if (lpPositions.length > 0) {
        // Duration bonus
        if (avgLPDuration >= 180) lpBonusMultiplier *= hopLPBonuses.duration["180"];
        else if (avgLPDuration >= 90) lpBonusMultiplier *= hopLPBonuses.duration["90"];
        else if (avgLPDuration >= 30) lpBonusMultiplier *= hopLPBonuses.duration["30"];
        else if (avgLPDuration >= 7) lpBonusMultiplier *= hopLPBonuses.duration["7"];
        
        // Size bonus
        if (totalLiquidity >= 250000) lpBonusMultiplier *= hopLPBonuses.size["250000"];
        else if (totalLiquidity >= 50000) lpBonusMultiplier *= hopLPBonuses.size["50000"];
        else if (totalLiquidity >= 10000) lpBonusMultiplier *= hopLPBonuses.size["10000"];
        else if (totalLiquidity >= 1000) lpBonusMultiplier *= hopLPBonuses.size["1000"];
        
        // Diversity bonus
        if (activeLPPositions >= 5) lpBonusMultiplier *= hopLPBonuses.diversity["5"];
        else if (activeLPPositions >= 4) lpBonusMultiplier *= hopLPBonuses.diversity["4"];
        else if (activeLPPositions >= 3) lpBonusMultiplier *= hopLPBonuses.diversity["3"];
        else if (activeLPPositions >= 2) lpBonusMultiplier *= hopLPBonuses.diversity["2"];
      }

      // Combined score with LP bonus
      const baseScore = Math.round(
        bridgeScore * hopScoringWeights.bridgeVolume +
        bridgeScore * hopScoringWeights.bridgeFrequency +
        lpScore * hopScoringWeights.lpVolume +
        lpScore * hopScoringWeights.lpDuration +
        ((uniqueChains + uniqueTokens) / 10 * 100) * hopScoringWeights.diversity
      );
      
      const combinedScore = Math.min(100, Math.round(baseScore * lpBonusMultiplier));

      // Determine tier
      const tier = hopUtils.calculateTier({
        address: '',
        bridgeStats: {
          totalTransactions: bridgeFrequency,
          totalVolume: bridgeVolume.toString(),
          totalFees: '0',
          uniqueChains,
          uniqueTokens,
          firstTransaction: 0,
          lastTransaction: 0,
          chainDistribution: {},
          tokenDistribution: {},
          routeDistribution: {}
        },
        lpStats: {
          totalPositions: lpPositions.length,
          totalLiquidity: totalLiquidity.toString(),
          totalRewards: '0',
          activePositions: activeLPPositions,
          averagePositionSize: lpPositions.length > 0 ? (totalLiquidity / lpPositions.length).toString() : '0',
          totalTimeProviding: avgLPDuration * lpPositions.length,
          poolDistribution: {}
        },
        combinedScore
      });

      // Calculate percentile rank (simplified)
      const percentileRank = Math.min(100, Math.round(combinedScore * 0.9 + 10));

      return {
        bridgeScore,
        lpScore,
        combinedScore,
        tier,
        percentileRank,
        lpBonusMultiplier: Math.round(lpBonusMultiplier * 100) / 100
      };
    } catch (error) {
      throw this.createError(
        'HOP_ELIGIBILITY_CALCULATION_FAILED',
        `Failed to calculate Hop eligibility score: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'high',
        false,
        { 
          bridgeTransactions: bridgeTransactions.length,
          lpPositions: lpPositions.length 
        }
      );
    }
  }

  /**
   * Comprehensive Hop Protocol analysis
   * Main entry point for complete user analysis
   */
  async analyzeHopActivity(address: string): Promise<HopActivityResult> {
    try {
      // Fetch bridge history and LP positions in parallel
      const [bridgeTransactions, lpPositions] = await Promise.all([
        this.getHopBridgeHistory(address),
        this.getLiquidityProvisionActivity(address)
      ]);

      // Analyze cross-chain routes
      const crossChainRoutes = await this.analyzeCrossChainRoutes(bridgeTransactions);

      // Build bridge activity summary
      const bridgeActivity = this.buildBridgeActivitySummary(bridgeTransactions);

      // Build LP activity summary
      const lpActivity = this.buildLPActivitySummary(lpPositions);

      // Calculate eligibility metrics
      const eligibilityMetrics = this.calculateHopEligibilityScore(
        bridgeTransactions,
        lpPositions,
        crossChainRoutes
      );

      // Build activity timeline
      const activityTimeline = this.buildActivityTimeline(bridgeTransactions, lpPositions);

      const result: HopActivityResult = {
        address,
        bridgeActivity,
        lpActivity,
        crossChainRoutes,
        eligibilityMetrics,
        activityTimeline
      };

      return result;
    } catch (error) {
      if (error instanceof Error && error.message.includes('HOP_')) {
        throw error; // Re-throw Hop-specific errors
      }
      
      throw this.createError(
        'HOP_ANALYSIS_FAILED',
        `Failed to analyze Hop activity for ${address}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'high',
        true,
        { address }
      );
    }
  }

  // Private helper methods

  private async fetchTokenTransactions(
    hopToken: unknown,
    address: string,
    chainId: number,
    token: string
  ): Promise<HopBridgeTransaction[]> {
    // Simplified implementation - in reality, this would use Hop SDK methods
    // to fetch actual transaction data from the blockchain or Hop's indexer
    
    try {
      // Mock implementation for demonstration
      // In production, you would use actual Hop SDK methods like:
      // const events = await hopToken.getTransferSentEvents({ account: address, chainId });
      
      const mockTransactions: HopBridgeTransaction[] = [];
      
      // This is where you would process actual Hop events and transform them
      // into HopBridgeTransaction objects
      
      return mockTransactions;
    } catch (error) {
      console.warn(`Failed to fetch ${token} transactions on chain ${chainId}:`, error);
      return [];
    }
  }

  private async getLPTokenBalance(
    ammWrapper: unknown,
    address: string,
    chainId: number,
    token: string
  ): Promise<string> {
    try {
      // Mock implementation - in reality, this would query the LP token balance
      // const balance = await ammWrapper.getLpTokenBalance(address);
      // return balance.toString();
      
      return '0'; // Placeholder
    } catch (error) {
      console.warn(`Failed to get LP token balance for ${token} on chain ${chainId}:`, error);
      return '0';
    }
  }

  private async buildLPPosition(
    ammWrapper: unknown,
    address: string,
    chainId: number,
    token: string,
    lpTokenBalance: string
  ): Promise<HopLPPosition | null> {
    try {
      // Mock implementation - in reality, this would build a complete LP position
      // with all relevant data from the AMM wrapper
      
      const position: HopLPPosition = {
        chainId,
        token,
        poolAddress: '', // Would get from ammWrapper
        lpTokenBalance,
        underlyingTokenBalance: '0', // Would calculate from LP token balance
        hTokenBalance: '0', // Would get from ammWrapper
        totalSupply: '0', // Would get from ammWrapper
        poolShare: 0, // Would calculate
        apr: 0, // Would calculate or fetch
        rewards: {
          hop: '0' // Would calculate pending rewards
        },
        depositTimestamp: Date.now(), // Would get from transaction history
        lastUpdateTimestamp: Date.now()
      };

      return position;
    } catch (error) {
      console.warn(`Failed to build LP position for ${token} on chain ${chainId}:`, error);
      return null;
    }
  }

  private buildBridgeActivitySummary(transactions: HopBridgeTransaction[]): HopActivityResult['bridgeActivity'] {
    const totalVolume = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    const totalFees = transactions.reduce((sum, tx) => sum + parseFloat(tx.bonderFee), 0);
    const uniqueChains = new Set([
      ...transactions.map(tx => tx.sourceChainId),
      ...transactions.map(tx => tx.destinationChainId)
    ]).size;
    const uniqueTokens = new Set(transactions.map(tx => tx.token)).size;
    const firstTransaction = transactions.length > 0 ? Math.min(...transactions.map(tx => tx.timestamp)) : 0;
    const lastTransaction = transactions.length > 0 ? Math.max(...transactions.map(tx => tx.timestamp)) : 0;

    // Build route distribution
    const routeDistribution: Record<string, { transactionCount: number; volume: string; averageFee: string }> = {};
    const routeMap = new Map<string, { count: number; volume: number; totalFees: number }>();

    transactions.forEach(tx => {
      const route = hopUtils.formatRoute(tx.sourceChainId, tx.destinationChainId);
      const existing = routeMap.get(route) || { count: 0, volume: 0, totalFees: 0 };
      existing.count += 1;
      existing.volume += parseFloat(tx.amount);
      existing.totalFees += parseFloat(tx.bonderFee);
      routeMap.set(route, existing);
    });

    routeMap.forEach((data, route) => {
      routeDistribution[route] = {
        transactionCount: data.count,
        volume: data.volume.toFixed(2),
        averageFee: (data.totalFees / data.count).toFixed(2)
      };
    });

    // Build token preferences
    const tokenPreferences: Record<string, { transactionCount: number; volume: string; percentage: number }> = {};
    const tokenMap = new Map<string, { count: number; volume: number }>();

    transactions.forEach(tx => {
      const existing = tokenMap.get(tx.token) || { count: 0, volume: 0 };
      existing.count += 1;
      existing.volume += parseFloat(tx.amount);
      tokenMap.set(tx.token, existing);
    });

    tokenMap.forEach((data, token) => {
      tokenPreferences[token] = {
        transactionCount: data.count,
        volume: data.volume.toFixed(2),
        percentage: totalVolume > 0 ? Math.round((data.volume / totalVolume) * 100) : 0
      };
    });

    return {
      totalTransactions: transactions.length,
      totalVolume: totalVolume.toFixed(2),
      totalFees: totalFees.toFixed(2),
      uniqueChains,
      uniqueTokens,
      firstTransaction,
      lastTransaction,
      routeDistribution,
      tokenPreferences
    };
  }

  private buildLPActivitySummary(positions: HopLPPosition[]): HopActivityResult['lpActivity'] {
    const totalLiquidity = positions.reduce((sum, pos) => sum + parseFloat(pos.underlyingTokenBalance), 0);
    const totalRewards = positions.reduce((sum, pos) => sum + parseFloat(pos.rewards.hop), 0);
    const activePositions = positions.filter(pos => parseFloat(pos.lpTokenBalance) > 0).length;
    const averagePositionSize = positions.length > 0 ? totalLiquidity / positions.length : 0;

    // Build pool distribution
    const poolDistribution: Record<string, { liquidityProvided: string; duration: number; rewardsEarned: string; apr: number }> = {};
    
    positions.forEach(pos => {
      const poolKey = `${pos.token}-${hopUtils.getChainName(pos.chainId)}`;
      const duration = (Date.now() - pos.depositTimestamp) / (1000 * 60 * 60 * 24);
      
      poolDistribution[poolKey] = {
        liquidityProvided: pos.underlyingTokenBalance,
        duration: Math.round(duration),
        rewardsEarned: pos.rewards.hop,
        apr: pos.apr
      };
    });

    // Build performance metrics
    const totalTimeProviding = positions.reduce((sum, pos) => {
      const duration = (Date.now() - pos.depositTimestamp) / (1000 * 60 * 60 * 24);
      return sum + duration;
    }, 0);

    const bestPerformingPool = positions.length > 0 
      ? positions.reduce((best, pos) => pos.apr > best.apr ? pos : best).token
      : '';

    const performanceMetrics = {
      totalTimeProviding: Math.round(totalTimeProviding),
      averagePositionSize: averagePositionSize.toFixed(2),
      bestPerformingPool,
      totalImpermanentLoss: '0', // Would need to calculate based on price changes
      netProfitLoss: totalRewards.toFixed(2) // Simplified - rewards minus IL
    };

    return {
      totalPositions: positions.length,
      activePositions,
      totalLiquidityProvided: totalLiquidity.toFixed(2),
      totalRewardsEarned: totalRewards.toFixed(2),
      averagePositionDuration: positions.length > 0 ? Math.round(totalTimeProviding / positions.length) : 0,
      poolDistribution,
      performanceMetrics
    };
  }

  private buildActivityTimeline(
    bridgeTransactions: HopBridgeTransaction[],
    lpPositions: HopLPPosition[]
  ): HopActivityResult['activityTimeline'] {
    const timeline: HopActivityResult['activityTimeline'] = [];

    // Add bridge transactions
    bridgeTransactions.forEach(tx => {
      timeline.push({
        timestamp: tx.timestamp,
        type: 'bridge',
        amount: tx.amount,
        token: tx.token,
        chain: hopUtils.getChainName(tx.sourceChainId),
        details: {
          destinationChain: hopUtils.getChainName(tx.destinationChainId),
          transactionHash: tx.transactionHash,
          bonderFee: tx.bonderFee
        }
      });
    });

    // Add LP deposits (simplified - would need actual deposit events)
    lpPositions.forEach(pos => {
      if (parseFloat(pos.lpTokenBalance) > 0) {
        timeline.push({
          timestamp: pos.depositTimestamp,
          type: 'lp_deposit',
          amount: pos.underlyingTokenBalance,
          token: pos.token,
          chain: hopUtils.getChainName(pos.chainId),
          details: {
            poolAddress: pos.poolAddress,
            lpTokenBalance: pos.lpTokenBalance
          }
        });
      }
    });

    // Sort by timestamp (newest first)
    return timeline.sort((a, b) => b.timestamp - a.timestamp);
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
      service: 'hop',
      severity,
      retryable,
      timestamp: Date.now(),
      context
    };
  }
}