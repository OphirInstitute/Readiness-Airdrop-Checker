/**
 * Orbiter Finance API Configuration
 * Configuration for integrating with Orbiter Finance bridge data
 */

// Orbiter Finance API endpoints
export const orbiterConfig = {
  // Base API URL
  baseUrl: "https://api.orbiter.finance",
  
  // API endpoints
  endpoints: {
    bridgeHistory: "/bridge/history",
    bridgeStats: "/bridge/stats", 
    supportedChains: "/chains",
    supportedTokens: "/tokens",
    bridgeRoutes: "/routes",
    userStats: "/user/stats"
  },
  
  // Supported chain IDs
  supportedChains: {
    ethereum: 1,
    arbitrum: 42161,
    optimism: 10,
    polygon: 137,
    bsc: 56,
    avalanche: 43114,
    fantom: 250,
    metis: 1088,
    boba: 288,
    zkSync: 324,
    starknet: "SN_MAIN",
    loopring: 1101,
    immutableX: 1002,
    dydx: 1003,
    zkSpace: 1004
  } as const,
  
  // Request configuration
  request: {
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
    rateLimit: {
      requests: 100,
      window: 60000 // 1 minute
    }
  },
  
  // Cache configuration
  cache: {
    bridgeHistory: 300000, // 5 minutes
    userStats: 600000,     // 10 minutes
    chainData: 3600000     // 1 hour
  }
} as const;

// Orbiter Finance bridge transaction interface
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
  status: "pending" | "completed" | "failed";
  fee: string;
  gasUsed?: string;
  blockNumber?: number;
}

// Orbiter Finance user statistics interface
export interface OrbiterUserStats {
  address: string;
  totalTransactions: number;
  totalVolume: string;
  totalFees: string;
  uniqueChains: number;
  uniqueTokens: number;
  firstTransaction: number;
  lastTransaction: number;
  averageTransactionSize: string;
  chainDistribution: Record<string, number>;
  tokenDistribution: Record<string, number>;
  monthlyActivity: Array<{
    month: string;
    transactions: number;
    volume: string;
  }>;
}

// Orbiter Finance bridge route interface
export interface OrbiterBridgeRoute {
  fromChain: number;
  toChain: number;
  token: string;
  minAmount: string;
  maxAmount: string;
  fee: string;
  estimatedTime: number;
  available: boolean;
}

// Orbiter Finance eligibility scoring weights
export const orbiterScoringWeights = {
  volume: 0.4,        // Total bridge volume weight
  frequency: 0.25,    // Transaction frequency weight
  diversity: 0.2,     // Chain/token diversity weight
  recency: 0.15       // Recent activity weight
} as const;

// Orbiter Finance eligibility thresholds
export const orbiterThresholds = {
  volume: {
    bronze: "1000",      // $1K
    silver: "10000",     // $10K
    gold: "50000",       // $50K
    platinum: "100000"   // $100K
  },
  transactions: {
    bronze: 5,
    silver: 20,
    gold: 50,
    platinum: 100
  },
  chains: {
    bronze: 2,
    silver: 4,
    gold: 6,
    platinum: 8
  },
  timespan: {
    bronze: 30,    // 30 days
    silver: 90,    // 3 months
    gold: 180,     // 6 months
    platinum: 365  // 1 year
  }
} as const;

// Orbiter Finance API error codes
export const orbiterErrorCodes = {
  INVALID_ADDRESS: "INVALID_ADDRESS",
  CHAIN_NOT_SUPPORTED: "CHAIN_NOT_SUPPORTED",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  API_UNAVAILABLE: "API_UNAVAILABLE",
  INVALID_PARAMETERS: "INVALID_PARAMETERS",
  NO_DATA_FOUND: "NO_DATA_FOUND"
} as const;

// Utility functions for Orbiter Finance integration
export const orbiterUtils = {
  // Format chain ID to chain name
  getChainName: (chainId: number | string): string => {
    const chainEntry = Object.entries(orbiterConfig.supportedChains)
      .find(([name, id]) => id === chainId);
    return chainEntry ? chainEntry[0] : "Unknown";
  },
  
  // Calculate eligibility tier based on stats
  calculateTier: (stats: OrbiterUserStats): "bronze" | "silver" | "gold" | "platinum" | "none" => {
    const volume = parseFloat(stats.totalVolume);
    const transactions = stats.totalTransactions;
    const chains = stats.uniqueChains;
    
    if (volume >= parseFloat(orbiterThresholds.volume.platinum) &&
        transactions >= orbiterThresholds.transactions.platinum &&
        chains >= orbiterThresholds.chains.platinum) {
      return "platinum";
    }
    
    if (volume >= parseFloat(orbiterThresholds.volume.gold) &&
        transactions >= orbiterThresholds.transactions.gold &&
        chains >= orbiterThresholds.chains.gold) {
      return "gold";
    }
    
    if (volume >= parseFloat(orbiterThresholds.volume.silver) &&
        transactions >= orbiterThresholds.transactions.silver &&
        chains >= orbiterThresholds.chains.silver) {
      return "silver";
    }
    
    if (volume >= parseFloat(orbiterThresholds.volume.bronze) &&
        transactions >= orbiterThresholds.transactions.bronze &&
        chains >= orbiterThresholds.chains.bronze) {
      return "bronze";
    }
    
    return "none";
  },
  
  // Format volume for display
  formatVolume: (volume: string): string => {
    const num = parseFloat(volume);
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  },
  
  // Calculate activity score
  calculateActivityScore: (stats: OrbiterUserStats): number => {
    const volume = parseFloat(stats.totalVolume);
    const transactions = stats.totalTransactions;
    const chains = stats.uniqueChains;
    const daysSinceFirst = (Date.now() - stats.firstTransaction) / (1000 * 60 * 60 * 24);
    const frequency = transactions / Math.max(daysSinceFirst, 1);
    
    // Normalize scores (0-100)
    const volumeScore = Math.min(volume / 100000, 1) * 100;
    const frequencyScore = Math.min(frequency * 30, 1) * 100;
    const diversityScore = Math.min(chains / 8, 1) * 100;
    const recencyScore = stats.lastTransaction > (Date.now() - 30 * 24 * 60 * 60 * 1000) ? 100 : 50;
    
    // Weighted average
    return Math.round(
      volumeScore * orbiterScoringWeights.volume +
      frequencyScore * orbiterScoringWeights.frequency +
      diversityScore * orbiterScoringWeights.diversity +
      recencyScore * orbiterScoringWeights.recency
    );
  }
} as const;

export default orbiterConfig;