/**
 * Unit tests for enhanced bridge data interfaces
 * Tests interface validation and data transformation utilities
 */

import {
  OrbiterActivityResult,
  HopActivityResult,
  HistoricalComparisonResult,
  BridgeRecommendation,
  ComprehensiveBridgeAnalysis,
  BridgeAnalysisError
} from '../index';

describe('Bridge Data Interfaces', () => {
  describe('OrbiterActivityResult Interface', () => {
    const mockOrbiterData: OrbiterActivityResult = {
      address: '0x1234567890123456789012345678901234567890',
      totalTransactions: 25,
      totalVolume: '50000.00',
      totalFees: '125.50',
      uniqueChains: 4,
      uniqueTokens: 3,
      firstTransaction: 1640995200000, // 2022-01-01
      lastTransaction: 1704067200000,  // 2024-01-01
      averageTransactionSize: '2000.00',
      
      chainDistribution: {
        'ethereum': {
          transactionCount: 10,
          volume: '25000.00',
          percentage: 50
        },
        'arbitrum': {
          transactionCount: 15,
          volume: '25000.00',
          percentage: 50
        }
      },
      
      tokenDistribution: {
        'ETH': {
          transactionCount: 15,
          volume: '30000.00',
          percentage: 60
        },
        'USDC': {
          transactionCount: 10,
          volume: '20000.00',
          percentage: 40
        }
      },
      
      routePatterns: [
        {
          fromChain: 'ethereum',
          toChain: 'arbitrum',
          transactionCount: 15,
          volume: '30000.00',
          averageFee: '8.50'
        }
      ],
      
      monthlyActivity: [
        {
          month: '2024-01',
          transactionCount: 5,
          volume: '10000.00',
          uniqueChains: 2
        }
      ],
      
      eligibilityScore: 75,
      tier: 'gold',
      percentileRank: 85,
      
      activityPatterns: {
        isRegularUser: true,
        averageFrequency: 2.5,
        volumeConsistency: 0.8,
        chainDiversity: 0.7,
        recentActivity: true
      }
    };

    it('should have all required properties', () => {
      expect(mockOrbiterData).toHaveProperty('address');
      expect(mockOrbiterData).toHaveProperty('totalTransactions');
      expect(mockOrbiterData).toHaveProperty('totalVolume');
      expect(mockOrbiterData).toHaveProperty('eligibilityScore');
      expect(mockOrbiterData).toHaveProperty('tier');
      expect(mockOrbiterData).toHaveProperty('activityPatterns');
    });

    it('should have correct data types', () => {
      expect(typeof mockOrbiterData.address).toBe('string');
      expect(typeof mockOrbiterData.totalTransactions).toBe('number');
      expect(typeof mockOrbiterData.totalVolume).toBe('string');
      expect(typeof mockOrbiterData.eligibilityScore).toBe('number');
      expect(['platinum', 'gold', 'silver', 'bronze', 'none']).toContain(mockOrbiterData.tier);
    });

    it('should validate chain distribution structure', () => {
      expect(mockOrbiterData.chainDistribution).toBeDefined();
      Object.values(mockOrbiterData.chainDistribution).forEach(chain => {
        expect(chain).toHaveProperty('transactionCount');
        expect(chain).toHaveProperty('volume');
        expect(chain).toHaveProperty('percentage');
        expect(typeof chain.transactionCount).toBe('number');
        expect(typeof chain.volume).toBe('string');
        expect(typeof chain.percentage).toBe('number');
      });
    });
  });

  describe('HopActivityResult Interface', () => {
    const mockHopData: HopActivityResult = {
      address: '0x1234567890123456789012345678901234567890',
      
      bridgeActivity: {
        totalTransactions: 30,
        totalVolume: '75000.00',
        totalFees: '200.00',
        uniqueChains: 5,
        uniqueTokens: 4,
        firstTransaction: 1640995200000,
        lastTransaction: 1704067200000,
        
        routeDistribution: {
          'ethereum-arbitrum': {
            transactionCount: 15,
            volume: '40000.00',
            averageFee: '10.00'
          }
        },
        
        tokenPreferences: {
          'USDC': {
            transactionCount: 20,
            volume: '50000.00',
            percentage: 66.7
          }
        }
      },
      
      lpActivity: {
        totalPositions: 3,
        activePositions: 2,
        totalLiquidityProvided: '25000.00',
        totalRewardsEarned: '500.00',
        averagePositionDuration: 45,
        
        poolDistribution: {
          'USDC-ethereum': {
            liquidityProvided: '15000.00',
            duration: 60,
            rewardsEarned: '300.00',
            apr: 12.5
          }
        },
        
        performanceMetrics: {
          totalTimeProviding: 120,
          averagePositionSize: '8333.33',
          bestPerformingPool: 'USDC-ethereum',
          totalImpermanentLoss: '50.00',
          netProfitLoss: '450.00'
        }
      },
      
      crossChainRoutes: [
        {
          route: 'ethereum-arbitrum',
          frequency: 15,
          totalVolume: '40000.00',
          averageAmount: '2666.67',
          preferredTokens: ['USDC', 'ETH']
        }
      ],
      
      eligibilityMetrics: {
        bridgeScore: 80,
        lpScore: 70,
        combinedScore: 85,
        tier: 'gold',
        percentileRank: 88,
        lpBonusMultiplier: 1.3
      },
      
      activityTimeline: [
        {
          timestamp: 1704067200000,
          type: 'bridge',
          amount: '1000.00',
          token: 'USDC',
          chain: 'ethereum',
          details: { destination: 'arbitrum' }
        }
      ]
    };

    it('should have all required properties', () => {
      expect(mockHopData).toHaveProperty('address');
      expect(mockHopData).toHaveProperty('bridgeActivity');
      expect(mockHopData).toHaveProperty('lpActivity');
      expect(mockHopData).toHaveProperty('eligibilityMetrics');
    });

    it('should validate bridge activity structure', () => {
      const { bridgeActivity } = mockHopData;
      expect(bridgeActivity).toHaveProperty('totalTransactions');
      expect(bridgeActivity).toHaveProperty('totalVolume');
      expect(bridgeActivity).toHaveProperty('routeDistribution');
      expect(bridgeActivity).toHaveProperty('tokenPreferences');
    });

    it('should validate LP activity structure', () => {
      const { lpActivity } = mockHopData;
      expect(lpActivity).toHaveProperty('totalPositions');
      expect(lpActivity).toHaveProperty('totalLiquidityProvided');
      expect(lpActivity).toHaveProperty('poolDistribution');
      expect(lpActivity).toHaveProperty('performanceMetrics');
    });

    it('should validate eligibility metrics', () => {
      const { eligibilityMetrics } = mockHopData;
      expect(eligibilityMetrics.bridgeScore).toBeGreaterThanOrEqual(0);
      expect(eligibilityMetrics.bridgeScore).toBeLessThanOrEqual(100);
      expect(eligibilityMetrics.lpScore).toBeGreaterThanOrEqual(0);
      expect(eligibilityMetrics.lpScore).toBeLessThanOrEqual(100);
      expect(eligibilityMetrics.combinedScore).toBeGreaterThanOrEqual(0);
      expect(eligibilityMetrics.combinedScore).toBeLessThanOrEqual(100);
    });
  });

  describe('HistoricalComparisonResult Interface', () => {
    const mockHistoricalData: HistoricalComparisonResult = {
      address: '0x1234567890123456789012345678901234567890',
      
      historicalBenchmarks: {
        arbitrum: {
          userScore: 75,
          requiredScore: 60,
          eligible: true,
          percentileRank: 85,
          missingCriteria: []
        },
        optimism: {
          userScore: 65,
          requiredScore: 70,
          eligible: false,
          percentileRank: 75,
          missingCriteria: ['Insufficient volume', 'Low frequency']
        },
        polygon: {
          userScore: 80,
          requiredScore: 50,
          eligible: true,
          percentileRank: 90,
          missingCriteria: []
        },
        hop: {
          userScore: 85,
          estimatedRequiredScore: 70,
          eligibilityLikelihood: 95,
          percentileRank: 92,
          strengthAreas: ['High LP activity', 'Diverse routes'],
          improvementAreas: ['Increase frequency']
        }
      },
      
      overallPercentile: {
        bridgeActivity: 85,
        lpActivity: 78,
        crossChainDiversity: 90,
        volumeRanking: 82,
        combined: 84
      },
      
      comparativeAnalysis: {
        vsAverageUser: {
          volumeMultiplier: 3.2,
          frequencyMultiplier: 2.8,
          diversityMultiplier: 4.1
        },
        vsEligibleUsers: {
          volumePercentile: 75,
          frequencyPercentile: 70,
          diversityPercentile: 85
        }
      },
      
      benchmarkInsights: {
        strongestMetrics: ['Cross-chain diversity', 'LP participation'],
        weakestMetrics: ['Transaction frequency'],
        improvementPotential: 15,
        timeToImprove: 60
      }
    };

    it('should have all required benchmark properties', () => {
      expect(mockHistoricalData.historicalBenchmarks).toHaveProperty('arbitrum');
      expect(mockHistoricalData.historicalBenchmarks).toHaveProperty('optimism');
      expect(mockHistoricalData.historicalBenchmarks).toHaveProperty('polygon');
      expect(mockHistoricalData.historicalBenchmarks).toHaveProperty('hop');
    });

    it('should validate benchmark structure', () => {
      const { arbitrum } = mockHistoricalData.historicalBenchmarks;
      expect(arbitrum).toHaveProperty('userScore');
      expect(arbitrum).toHaveProperty('requiredScore');
      expect(arbitrum).toHaveProperty('eligible');
      expect(arbitrum).toHaveProperty('percentileRank');
      expect(arbitrum).toHaveProperty('missingCriteria');
      expect(Array.isArray(arbitrum.missingCriteria)).toBe(true);
    });

    it('should validate percentile rankings', () => {
      Object.values(mockHistoricalData.overallPercentile).forEach(percentile => {
        expect(percentile).toBeGreaterThanOrEqual(0);
        expect(percentile).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('BridgeRecommendation Interface', () => {
    const mockRecommendation: BridgeRecommendation = {
      address: '0x1234567890123456789012345678901234567890',
      
      immediateActions: [
        {
          priority: 'high',
          action: 'Increase bridge frequency',
          description: 'Bridge at least 2x per month to improve activity score',
          estimatedImpact: 15,
          estimatedCost: '100.00',
          timeframe: '1-2 months',
          difficulty: 'easy'
        }
      ],
      
      longTermStrategy: {
        targetTier: 'platinum',
        currentGap: 25,
        recommendedPath: [
          {
            milestone: 'Reach gold tier',
            actions: ['Increase volume to $100K', 'Add 2 more chains'],
            estimatedTimeframe: '3-6 months',
            estimatedCost: '500.00'
          }
        ]
      },
      
      protocolRecommendations: {
        orbiter: {
          recommendedChains: ['ethereum', 'arbitrum', 'optimism'],
          recommendedTokens: ['ETH', 'USDC'],
          targetVolume: '100000.00',
          targetFrequency: 4
        },
        hop: {
          bridgeRecommendations: {
            recommendedRoutes: ['ethereum-arbitrum', 'arbitrum-optimism'],
            targetVolume: '75000.00',
            targetFrequency: 3
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
            targetDuration: 90,
            targetAmount: '10000.00'
          }
        }
      },
      
      riskConsiderations: [
        {
          type: 'financial',
          severity: 'medium',
          description: 'Bridge fees can be high during network congestion',
          mitigation: 'Monitor gas prices and bridge during off-peak hours'
        }
      ],
      
      costBenefitAnalysis: {
        estimatedTotalCost: '1000.00',
        estimatedScoreImprovement: 25,
        estimatedPercentileImprovement: 15,
        roi: 5.0,
        breakEvenAirdropValue: '5000.00'
      },
      
      personalizedInsights: {
        userType: 'regular',
        strengths: ['Consistent activity', 'Good volume'],
        weaknesses: ['Limited chain diversity'],
        opportunityScore: 75,
        competitiveAdvantage: ['Early adopter', 'LP experience']
      }
    };

    it('should have all required recommendation properties', () => {
      expect(mockRecommendation).toHaveProperty('immediateActions');
      expect(mockRecommendation).toHaveProperty('longTermStrategy');
      expect(mockRecommendation).toHaveProperty('protocolRecommendations');
      expect(mockRecommendation).toHaveProperty('costBenefitAnalysis');
    });

    it('should validate immediate actions structure', () => {
      expect(Array.isArray(mockRecommendation.immediateActions)).toBe(true);
      mockRecommendation.immediateActions.forEach(action => {
        expect(['high', 'medium', 'low']).toContain(action.priority);
        expect(['easy', 'medium', 'hard']).toContain(action.difficulty);
        expect(typeof action.estimatedImpact).toBe('number');
      });
    });

    it('should validate protocol recommendations', () => {
      const { protocolRecommendations } = mockRecommendation;
      expect(protocolRecommendations).toHaveProperty('orbiter');
      expect(protocolRecommendations).toHaveProperty('hop');
      
      expect(Array.isArray(protocolRecommendations.orbiter.recommendedChains)).toBe(true);
      expect(Array.isArray(protocolRecommendations.orbiter.recommendedTokens)).toBe(true);
      
      expect(protocolRecommendations.hop).toHaveProperty('bridgeRecommendations');
      expect(protocolRecommendations.hop).toHaveProperty('lpRecommendations');
    });
  });

  describe('ComprehensiveBridgeAnalysis Interface', () => {
    const mockComprehensiveAnalysis: ComprehensiveBridgeAnalysis = {
      address: '0x1234567890123456789012345678901234567890',
      timestamp: '2024-01-01T00:00:00Z',
      
      orbiterAnalysis: null, // Would contain OrbiterActivityResult
      hopAnalysis: null,     // Would contain HopActivityResult
      historicalComparison: null, // Would contain HistoricalComparisonResult
      recommendations: null, // Would contain BridgeRecommendation
      
      overallMetrics: {
        totalBridgeVolume: '125000.00',
        totalBridgeTransactions: 55,
        totalLPVolume: '25000.00',
        totalLPDuration: 120,
        combinedEligibilityScore: 82,
        overallTier: 'gold',
        percentileRank: 87
      },
      
      metadata: {
        analysisVersion: '1.0.0',
        dataFreshness: 5,
        completeness: 95,
        reliability: 90,
        processingTime: 2500,
        errors: [],
        warnings: ['Some historical data unavailable']
      }
    };

    it('should have all required comprehensive analysis properties', () => {
      expect(mockComprehensiveAnalysis).toHaveProperty('address');
      expect(mockComprehensiveAnalysis).toHaveProperty('timestamp');
      expect(mockComprehensiveAnalysis).toHaveProperty('overallMetrics');
      expect(mockComprehensiveAnalysis).toHaveProperty('metadata');
    });

    it('should validate overall metrics', () => {
      const { overallMetrics } = mockComprehensiveAnalysis;
      expect(overallMetrics.combinedEligibilityScore).toBeGreaterThanOrEqual(0);
      expect(overallMetrics.combinedEligibilityScore).toBeLessThanOrEqual(100);
      expect(['platinum', 'gold', 'silver', 'bronze', 'none']).toContain(overallMetrics.overallTier);
    });

    it('should validate metadata structure', () => {
      const { metadata } = mockComprehensiveAnalysis;
      expect(metadata).toHaveProperty('analysisVersion');
      expect(metadata).toHaveProperty('completeness');
      expect(metadata).toHaveProperty('reliability');
      expect(Array.isArray(metadata.errors)).toBe(true);
      expect(Array.isArray(metadata.warnings)).toBe(true);
    });
  });

  describe('BridgeAnalysisError Interface', () => {
    const mockError: BridgeAnalysisError = {
      code: 'ORBITER_API_TIMEOUT',
      message: 'Orbiter Finance API request timed out',
      service: 'orbiter',
      severity: 'medium',
      retryable: true,
      timestamp: Date.now(),
      context: {
        endpoint: '/bridge/history',
        timeout: 30000
      }
    };

    it('should have all required error properties', () => {
      expect(mockError).toHaveProperty('code');
      expect(mockError).toHaveProperty('message');
      expect(mockError).toHaveProperty('service');
      expect(mockError).toHaveProperty('severity');
      expect(mockError).toHaveProperty('retryable');
      expect(mockError).toHaveProperty('timestamp');
    });

    it('should validate error enums', () => {
      expect(['orbiter', 'hop', 'historical', 'recommendations']).toContain(mockError.service);
      expect(['low', 'medium', 'high', 'critical']).toContain(mockError.severity);
      expect(typeof mockError.retryable).toBe('boolean');
    });
  });
});