/**
 * Unit tests for Orbiter Finance Integration Service
 * Tests all methods with mocked API responses and edge cases
 */

import { OrbiterFinanceService } from '../orbiter-finance';
import { OrbiterTransaction } from '../../types';

// Mock fetch globally
global.fetch = jest.fn();

describe('OrbiterFinanceService', () => {
  let service: OrbiterFinanceService;
  const mockAddress = '0x1234567890123456789012345678901234567890';

  beforeEach(() => {
    service = new OrbiterFinanceService();
    jest.clearAllMocks();
  });

  describe('getBridgeHistory', () => {
    const mockTransactions = [
      {
        id: 'tx1',
        hash: '0xabc123',
        fromChain: 1,
        toChain: 42161,
        fromToken: 'ETH',
        toToken: 'ETH',
        fromAmount: '1000',
        toAmount: '995',
        sender: mockAddress,
        receiver: mockAddress,
        timestamp: 1640995200000,
        status: 'completed',
        fee: '5'
      },
      {
        id: 'tx2',
        hash: '0xdef456',
        fromChain: 42161,
        toChain: 10,
        fromToken: 'USDC',
        toToken: 'USDC',
        fromAmount: '2000',
        toAmount: '1990',
        sender: mockAddress,
        receiver: mockAddress,
        timestamp: 1641081600000,
        status: 'completed',
        fee: '10'
      }
    ];

    it('should fetch bridge history successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockTransactions
        })
      });

      const result = await service.getBridgeHistory(mockAddress);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'tx1',
        fromChain: 1,
        toChain: 42161,
        fromToken: 'ETH',
        status: 'completed'
      });
    });

    it('should handle API errors gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(service.getBridgeHistory(mockAddress))
        .rejects
        .toThrow('Failed to fetch bridge history');
    });

    it('should handle network timeouts', async () => {
      (fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      await expect(service.getBridgeHistory(mockAddress))
        .rejects
        .toThrow('Failed to fetch bridge history');
    });

    it('should transform invalid transaction data', async () => {
      const invalidData = [
        { id: 'tx1' }, // Missing required fields
        null, // Null transaction
        { id: 'tx2', fromChain: 'invalid', timestamp: 'invalid' } // Invalid types
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: invalidData
        })
      });

      const result = await service.getBridgeHistory(mockAddress);

      expect(result).toHaveLength(3);
      expect(result[0]).toMatchObject({
        id: 'tx1',
        fromChain: 1, // Default value
        toChain: 1, // Default value
        fromToken: 'ETH', // Default value
        status: 'completed' // Default value
      });
    });
  });

  describe('analyzeBridgePatterns', () => {
    const mockTransactions: OrbiterTransaction[] = [
      {
        id: 'tx1',
        hash: '0xabc123',
        fromChain: 1,
        toChain: 42161,
        fromToken: 'ETH',
        toToken: 'ETH',
        fromAmount: '1000',
        toAmount: '995',
        sender: mockAddress,
        receiver: mockAddress,
        timestamp: 1640995200000, // 2022-01-01
        status: 'completed',
        fee: '5'
      },
      {
        id: 'tx2',
        hash: '0xdef456',
        fromChain: 42161,
        toChain: 10,
        fromToken: 'USDC',
        toToken: 'USDC',
        fromAmount: '2000',
        toAmount: '1990',
        sender: mockAddress,
        receiver: mockAddress,
        timestamp: 1643673600000, // 2022-02-01
        status: 'completed',
        fee: '10'
      },
      {
        id: 'tx3',
        hash: '0xghi789',
        fromChain: 1,
        toChain: 42161,
        fromToken: 'ETH',
        toToken: 'ETH',
        fromAmount: '1500',
        toAmount: '1490',
        sender: mockAddress,
        receiver: mockAddress,
        timestamp: 1646092800000, // 2022-03-01
        status: 'completed',
        fee: '10'
      }
    ];

    it('should analyze route patterns correctly', async () => {
      const result = await service.analyzeBridgePatterns(mockTransactions);

      expect(result.routePatterns).toHaveLength(2);
      
      const ethereumToArbitrum = result.routePatterns.find(
        r => r.fromChain === 'ethereum' && r.toChain === 'arbitrum'
      );
      expect(ethereumToArbitrum).toMatchObject({
        transactionCount: 2,
        volume: '2500.00',
        averageFee: '7.50'
      });
    });

    it('should calculate chain distribution', async () => {
      const result = await service.analyzeBridgePatterns(mockTransactions);

      expect(result.chainDistribution).toHaveProperty('ethereum');
      expect(result.chainDistribution.ethereum).toMatchObject({
        transactionCount: 2,
        volume: '2500.00',
        percentage: 56 // Rounded percentage
      });

      expect(result.chainDistribution).toHaveProperty('arbitrum');
      expect(result.chainDistribution.arbitrum).toMatchObject({
        transactionCount: 1,
        volume: '2000.00',
        percentage: 44
      });
    });

    it('should calculate token distribution', async () => {
      const result = await service.analyzeBridgePatterns(mockTransactions);

      expect(result.tokenDistribution).toHaveProperty('ETH');
      expect(result.tokenDistribution.ETH).toMatchObject({
        transactionCount: 2,
        volume: '2500.00',
        percentage: 56
      });

      expect(result.tokenDistribution).toHaveProperty('USDC');
      expect(result.tokenDistribution.USDC).toMatchObject({
        transactionCount: 1,
        volume: '2000.00',
        percentage: 44
      });
    });

    it('should generate monthly activity breakdown', async () => {
      const result = await service.analyzeBridgePatterns(mockTransactions);

      expect(result.monthlyActivity).toHaveLength(3);
      expect(result.monthlyActivity[0]).toMatchObject({
        month: '2022-01',
        transactionCount: 1,
        volume: '1000.00',
        uniqueChains: 1
      });
    });

    it('should handle empty transaction array', async () => {
      const result = await service.analyzeBridgePatterns([]);

      expect(result.routePatterns).toHaveLength(0);
      expect(result.chainDistribution).toEqual({});
      expect(result.tokenDistribution).toEqual({});
      expect(result.monthlyActivity).toHaveLength(0);
    });
  });

  describe('calculateOrbiterEligibilityScore', () => {
    const mockTransactions: OrbiterTransaction[] = [
      {
        id: 'tx1',
        hash: '0xabc123',
        fromChain: 1,
        toChain: 42161,
        fromToken: 'ETH',
        toToken: 'ETH',
        fromAmount: '10000', // High volume
        toAmount: '9950',
        sender: mockAddress,
        receiver: mockAddress,
        timestamp: Date.now() - (30 * 24 * 60 * 60 * 1000), // 30 days ago
        status: 'completed',
        fee: '50'
      },
      {
        id: 'tx2',
        hash: '0xdef456',
        fromChain: 42161,
        toChain: 10,
        fromToken: 'USDC',
        toToken: 'USDC',
        fromAmount: '15000',
        toAmount: '14900',
        sender: mockAddress,
        receiver: mockAddress,
        timestamp: Date.now() - (15 * 24 * 60 * 60 * 1000), // 15 days ago
        status: 'completed',
        fee: '100'
      }
    ];

    const mockPatterns = {
      routePatterns: [],
      chainDistribution: {},
      tokenDistribution: {},
      monthlyActivity: []
    };

    it('should calculate eligibility score correctly', () => {
      const result = service.calculateOrbiterEligibilityScore(mockTransactions, mockPatterns);

      expect(result.eligibilityScore).toBeGreaterThan(0);
      expect(result.eligibilityScore).toBeLessThanOrEqual(100);
      expect(['platinum', 'gold', 'silver', 'bronze', 'none']).toContain(result.tier);
      expect(result.percentileRank).toBeGreaterThanOrEqual(0);
      expect(result.percentileRank).toBeLessThanOrEqual(100);
    });

    it('should identify regular users correctly', () => {
      const result = service.calculateOrbiterEligibilityScore(mockTransactions, mockPatterns);

      expect(result.activityPatterns.isRegularUser).toBe(true);
      expect(result.activityPatterns.recentActivity).toBe(true);
      expect(result.activityPatterns.averageFrequency).toBeGreaterThan(0);
    });

    it('should handle single transaction', () => {
      const singleTx = [mockTransactions[0]];
      const result = service.calculateOrbiterEligibilityScore(singleTx, mockPatterns);

      expect(result.eligibilityScore).toBeGreaterThan(0);
      expect(result.activityPatterns.volumeConsistency).toBe(0); // Can't calculate consistency with 1 tx
    });

    it('should return zero score for empty transactions', () => {
      const result = service.calculateOrbiterEligibilityScore([], mockPatterns);

      expect(result.eligibilityScore).toBe(0);
      expect(result.tier).toBe('none');
      expect(result.percentileRank).toBe(0);
      expect(result.activityPatterns.isRegularUser).toBe(false);
    });

    it('should calculate volume consistency correctly', () => {
      // Transactions with consistent volumes
      const consistentTxs: OrbiterTransaction[] = [
        { ...mockTransactions[0], fromAmount: '1000' },
        { ...mockTransactions[1], fromAmount: '1000' }
      ];

      const consistentResult = service.calculateOrbiterEligibilityScore(consistentTxs, mockPatterns);

      // Transactions with inconsistent volumes
      const inconsistentTxs: OrbiterTransaction[] = [
        { ...mockTransactions[0], fromAmount: '100' },
        { ...mockTransactions[1], fromAmount: '10000' }
      ];

      const inconsistentResult = service.calculateOrbiterEligibilityScore(inconsistentTxs, mockPatterns);

      expect(consistentResult.activityPatterns.volumeConsistency)
        .toBeGreaterThan(inconsistentResult.activityPatterns.volumeConsistency);
    });
  });

  describe('getHistoricalPercentile', () => {
    it('should calculate percentiles correctly', async () => {
      const result = await service.getHistoricalPercentile(75, 50000, 25);

      expect(result.volumePercentile).toBeGreaterThanOrEqual(0);
      expect(result.volumePercentile).toBeLessThanOrEqual(100);
      expect(result.frequencyPercentile).toBeGreaterThanOrEqual(0);
      expect(result.frequencyPercentile).toBeLessThanOrEqual(100);
      expect(result.overallPercentile).toBeGreaterThanOrEqual(0);
      expect(result.overallPercentile).toBeLessThanOrEqual(100);
    });

    it('should provide comparison metrics', async () => {
      const result = await service.getHistoricalPercentile(75, 50000, 25);

      expect(result.comparisonMetrics).toHaveProperty('averageVolume');
      expect(result.comparisonMetrics).toHaveProperty('averageTransactions');
      expect(result.comparisonMetrics).toHaveProperty('topTierThreshold');
      expect(typeof result.comparisonMetrics.averageVolume).toBe('number');
    });

    it('should handle high-volume users', async () => {
      const result = await service.getHistoricalPercentile(95, 200000, 100);

      expect(result.volumePercentile).toBeGreaterThanOrEqual(90);
      expect(result.frequencyPercentile).toBeGreaterThanOrEqual(90);
    });

    it('should handle low-activity users', async () => {
      const result = await service.getHistoricalPercentile(20, 500, 2);

      expect(result.volumePercentile).toBeLessThanOrEqual(25);
      expect(result.frequencyPercentile).toBeLessThanOrEqual(25);
    });
  });

  describe('analyzeOrbiterActivity', () => {
    it('should perform comprehensive analysis', async () => {
      const mockTransactions = [
        {
          id: 'tx1',
          hash: '0xabc123',
          fromChain: 1,
          toChain: 42161,
          fromToken: 'ETH',
          toToken: 'ETH',
          fromAmount: '1000',
          toAmount: '995',
          sender: mockAddress,
          receiver: mockAddress,
          timestamp: 1640995200000,
          status: 'completed',
          fee: '5'
        }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockTransactions
        })
      });

      const result = await service.analyzeOrbiterActivity(mockAddress);

      expect(result).toHaveProperty('address', mockAddress);
      expect(result).toHaveProperty('totalTransactions', 1);
      expect(result).toHaveProperty('totalVolume');
      expect(result).toHaveProperty('eligibilityScore');
      expect(result).toHaveProperty('tier');
      expect(result).toHaveProperty('chainDistribution');
      expect(result).toHaveProperty('activityPatterns');
    });

    it('should handle users with no transactions', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: []
        })
      });

      const result = await service.analyzeOrbiterActivity(mockAddress);

      expect(result.totalTransactions).toBe(0);
      expect(result.totalVolume).toBe('0');
      expect(result.eligibilityScore).toBe(0);
      expect(result.tier).toBe('none');
    });

    it('should handle API failures gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(service.analyzeOrbiterActivity(mockAddress))
        .rejects
        .toThrow('Failed to analyze Orbiter activity');
    });
  });

  describe('Error Handling', () => {
    it('should create proper error objects', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      try {
        await service.getBridgeHistory(mockAddress);
      } catch (error) {
        expect(error).toHaveProperty('code');
        expect(error).toHaveProperty('message');
        expect(error).toHaveProperty('service', 'orbiter');
        expect(error).toHaveProperty('severity');
        expect(error).toHaveProperty('retryable');
        expect(error).toHaveProperty('timestamp');
      }
    });

    it('should handle malformed API responses', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: 'invalid data format'
        })
      });

      await expect(service.getBridgeHistory(mockAddress))
        .rejects
        .toThrow('Invalid bridge transactions data');
    });
  });

  describe('Caching', () => {
    it('should cache successful responses', async () => {
      const mockTransactions = [
        {
          id: 'tx1',
          hash: '0xabc123',
          fromChain: 1,
          toChain: 42161,
          fromToken: 'ETH',
          toToken: 'ETH',
          fromAmount: '1000',
          toAmount: '995',
          sender: mockAddress,
          receiver: mockAddress,
          timestamp: 1640995200000,
          status: 'completed',
          fee: '5'
        }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockTransactions
        })
      });

      // First call
      await service.getBridgeHistory(mockAddress);
      
      // Second call should use cache
      await service.getBridgeHistory(mockAddress);

      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
});