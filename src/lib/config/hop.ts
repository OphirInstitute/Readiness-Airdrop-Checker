/**
 * Hop Protocol Configuration
 * Configuration for integrating with Hop Protocol bridge and LP data
 */

// Hop Protocol configuration
export const hopConfig = {
  // Hop SDK configuration
  sdk: {
    network: "mainnet" as const,
    providers: {
      ethereum: process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL,
      arbitrum: process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL,
      optimism: process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL,
      polygon: process.env.NEXT_PUBLIC_POLYGON_RPC_URL,
      gnosis: process.env.NEXT_PUBLIC_GNOSIS_RPC_URL,
      nova: process.env.NEXT_PUBLIC_NOVA_RPC_URL
    }
  },
  
  // Supported chains
  supportedChains: {
    ethereum: 1,
    arbitrum: 42161,
    optimism: 10,
    polygon: 137,
    gnosis: 100,
    nova: 42170
  } as const,
  
  // Supported tokens
  supportedTokens: [
    "USDC",
    "USDT", 
    "DAI",
    "ETH",
    "WBTC",
    "MATIC",
    "HOP"
  ] as const,
  
  // Request configuration
  request: {
    timeout: 45000,
    retries: 3,
    retryDelay: 2000,
    batchSize: 10
  },
  
  // Cache configuration
  cache: {
    bridgeHistory: 300000,    // 5 minutes
    lpPositions: 600000,      // 10 minutes
    poolData: 1800000,        // 30 minutes
    rewards: 300000           // 5 minutes
  }
} as const;

// Hop Protocol bridge transaction interface
export interface HopBridgeTransaction {
  id: string;
  transactionHash: string;
  sourceChainId: number;
  destinationChainId: number;
  token: string;
  amount: string;
  amountOutMin: string;
  recipient: string;
  deadline: number;
  timestamp: number;
  status: "pending" | "completed" | "failed";
  bonderFee: string;
  relayerFee?: string;
  transferId?: string;
}

// Hop Protocol LP position interface
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
    other?: Record<string, string>;
  };
  depositTimestamp: number;
  lastUpdateTimestamp: number;
}

// Hop Protocol user statistics interface
export interface HopUserStats {
  address: string;
  bridgeStats: {
    totalTransactions: number;
    totalVolume: string;
    totalFees: string;
    uniqueChains: number;
    uniqueTokens: number;
    firstTransaction: number;
    lastTransaction: number;
    chainDistribution: Record<string, number>;
    tokenDistribution: Record<string, number>;
    routeDistribution: Record<string, number>;
  };
  lpStats: {
    totalPositions: number;
    totalLiquidity: string;
    totalRewards: string;
    activePositions: number;
    averagePositionSize: string;
    totalTimeProviding: number;
    poolDistribution: Record<string, number>;
  };
  combinedScore: number;
}

// Hop Protocol pool information interface
export interface HopPoolInfo {
  chainId: number;
  token: string;
  poolAddress: string;
  lpTokenAddress: string;
  totalLiquidity: string;
  volume24h: string;
  fees24h: string;
  apr: number;
  utilization: number;
  reserves: {
    canonical: string;
    hToken: string;
  };
}

// Hop Protocol eligibility scoring weights
export const hopScoringWeights = {
  bridgeVolume: 0.3,      // Bridge volume weight
  bridgeFrequency: 0.2,   // Bridge frequency weight
  lpVolume: 0.25,         // LP volume weight
  lpDuration: 0.15,       // LP duration weight
  diversity: 0.1          // Chain/token diversity weight
} as const;

// Hop Protocol eligibility thresholds
export const hopThresholds = {
  bridge: {
    volume: {
      bronze: "5000",      // $5K
      silver: "25000",     // $25K
      gold: "100000",      // $100K
      platinum: "500000"   // $500K
    },
    transactions: {
      bronze: 10,
      silver: 50,
      gold: 150,
      platinum: 500
    }
  },
  lp: {
    liquidity: {
      bronze: "1000",      // $1K
      silver: "10000",     // $10K
      gold: "50000",       // $50K
      platinum: "250000"   // $250K
    },
    duration: {
      bronze: 7,           // 7 days
      silver: 30,          // 30 days
      gold: 90,            // 90 days
      platinum: 180        // 180 days
    }
  },
  combined: {
    bronze: 40,
    silver: 60,
    gold: 80,
    platinum: 95
  }
} as const;

// Hop Protocol route patterns
export const hopRoutes = {
  popular: [
    "ethereum-arbitrum",
    "ethereum-optimism", 
    "ethereum-polygon",
    "arbitrum-optimism",
    "optimism-polygon",
    "polygon-gnosis"
  ],
  expensive: [
    "ethereum-arbitrum",
    "ethereum-optimism",
    "ethereum-polygon"
  ],
  cheap: [
    "arbitrum-optimism",
    "optimism-polygon",
    "polygon-gnosis",
    "arbitrum-nova"
  ]
} as const;

// Hop Protocol LP bonus multipliers
export const hopLPBonuses = {
  duration: {
    "7": 1.1,      // 7+ days: 10% bonus
    "30": 1.25,    // 30+ days: 25% bonus
    "90": 1.5,     // 90+ days: 50% bonus
    "180": 2.0     // 180+ days: 100% bonus
  },
  size: {
    "1000": 1.05,    // $1K+: 5% bonus
    "10000": 1.15,   // $10K+: 15% bonus
    "50000": 1.3,    // $50K+: 30% bonus
    "250000": 1.5    // $250K+: 50% bonus
  },
  diversity: {
    "2": 1.1,      // 2+ pools: 10% bonus
    "3": 1.2,      // 3+ pools: 20% bonus
    "4": 1.35,     // 4+ pools: 35% bonus
    "5": 1.5       // 5+ pools: 50% bonus
  }
} as const;

// Utility functions for Hop Protocol integration
export const hopUtils = {
  // Get chain name from chain ID
  getChainName: (chainId: number): string => {
    const chainEntry = Object.entries(hopConfig.supportedChains)
      .find(([name, id]) => id === chainId);
    return chainEntry ? chainEntry[0] : "Unknown";
  },
  
  // Format route string
  formatRoute: (sourceChain: number, destChain: number): string => {
    const source = hopUtils.getChainName(sourceChain);
    const dest = hopUtils.getChainName(destChain);
    return `${source}-${dest}`;
  },
  
  // Calculate LP bonus multiplier
  calculateLPBonus: (position: HopLPPosition): number => {
    const durationDays = (Date.now() - position.depositTimestamp) / (1000 * 60 * 60 * 24);
    const liquidityValue = parseFloat(position.underlyingTokenBalance);
    
    let bonus = 1.0;
    
    // Duration bonus
    if (durationDays >= 180) bonus *= hopLPBonuses.duration["180"];
    else if (durationDays >= 90) bonus *= hopLPBonuses.duration["90"];
    else if (durationDays >= 30) bonus *= hopLPBonuses.duration["30"];
    else if (durationDays >= 7) bonus *= hopLPBonuses.duration["7"];
    
    // Size bonus
    if (liquidityValue >= 250000) bonus *= hopLPBonuses.size["250000"];
    else if (liquidityValue >= 50000) bonus *= hopLPBonuses.size["50000"];
    else if (liquidityValue >= 10000) bonus *= hopLPBonuses.size["10000"];
    else if (liquidityValue >= 1000) bonus *= hopLPBonuses.size["1000"];
    
    return bonus;
  },
  
  // Calculate eligibility tier
  calculateTier: (stats: HopUserStats): "bronze" | "silver" | "gold" | "platinum" | "none" => {
    const bridgeVolume = parseFloat(stats.bridgeStats.totalVolume);
    const bridgeTransactions = stats.bridgeStats.totalTransactions;
    const lpLiquidity = parseFloat(stats.lpStats.totalLiquidity);
    const lpDuration = stats.lpStats.totalTimeProviding / (1000 * 60 * 60 * 24); // days
    
    // Calculate combined score
    let score = 0;
    
    // Bridge scoring
    if (bridgeVolume >= parseFloat(hopThresholds.bridge.volume.platinum)) score += 30;
    else if (bridgeVolume >= parseFloat(hopThresholds.bridge.volume.gold)) score += 25;
    else if (bridgeVolume >= parseFloat(hopThresholds.bridge.volume.silver)) score += 20;
    else if (bridgeVolume >= parseFloat(hopThresholds.bridge.volume.bronze)) score += 15;
    
    if (bridgeTransactions >= hopThresholds.bridge.transactions.platinum) score += 20;
    else if (bridgeTransactions >= hopThresholds.bridge.transactions.gold) score += 15;
    else if (bridgeTransactions >= hopThresholds.bridge.transactions.silver) score += 10;
    else if (bridgeTransactions >= hopThresholds.bridge.transactions.bronze) score += 5;
    
    // LP scoring
    if (lpLiquidity >= parseFloat(hopThresholds.lp.liquidity.platinum)) score += 30;
    else if (lpLiquidity >= parseFloat(hopThresholds.lp.liquidity.gold)) score += 25;
    else if (lpLiquidity >= parseFloat(hopThresholds.lp.liquidity.silver)) score += 20;
    else if (lpLiquidity >= parseFloat(hopThresholds.lp.liquidity.bronze)) score += 15;
    
    if (lpDuration >= hopThresholds.lp.duration.platinum) score += 20;
    else if (lpDuration >= hopThresholds.lp.duration.gold) score += 15;
    else if (lpDuration >= hopThresholds.lp.duration.silver) score += 10;
    else if (lpDuration >= hopThresholds.lp.duration.bronze) score += 5;
    
    // Determine tier based on score
    if (score >= hopThresholds.combined.platinum) return "platinum";
    if (score >= hopThresholds.combined.gold) return "gold";
    if (score >= hopThresholds.combined.silver) return "silver";
    if (score >= hopThresholds.combined.bronze) return "bronze";
    
    return "none";
  },
  
  // Calculate activity score
  calculateActivityScore: (stats: HopUserStats): number => {
    const bridgeVolume = parseFloat(stats.bridgeStats.totalVolume);
    const bridgeFrequency = stats.bridgeStats.totalTransactions;
    const lpVolume = parseFloat(stats.lpStats.totalLiquidity);
    const lpDuration = stats.lpStats.totalTimeProviding / (1000 * 60 * 60 * 24);
    const diversity = stats.bridgeStats.uniqueChains + stats.bridgeStats.uniqueTokens;
    
    // Normalize scores (0-100)
    const bridgeVolumeScore = Math.min(bridgeVolume / 500000, 1) * 100;
    const bridgeFrequencyScore = Math.min(bridgeFrequency / 500, 1) * 100;
    const lpVolumeScore = Math.min(lpVolume / 250000, 1) * 100;
    const lpDurationScore = Math.min(lpDuration / 180, 1) * 100;
    const diversityScore = Math.min(diversity / 10, 1) * 100;
    
    // Weighted average
    return Math.round(
      bridgeVolumeScore * hopScoringWeights.bridgeVolume +
      bridgeFrequencyScore * hopScoringWeights.bridgeFrequency +
      lpVolumeScore * hopScoringWeights.lpVolume +
      lpDurationScore * hopScoringWeights.lpDuration +
      diversityScore * hopScoringWeights.diversity
    );
  },
  
  // Format liquidity amount
  formatLiquidity: (amount: string): string => {
    const num = parseFloat(amount);
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  }
} as const;

export default hopConfig;