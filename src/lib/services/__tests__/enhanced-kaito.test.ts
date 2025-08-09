import { enhancedKaitoService } from '../kaito';
import type {
  EnhancedKaitoResult,
  ProjectEngagementResult,
  SocialInfluenceResult,
  ProjectEngagement,
  TrendingProject
} from '../../types';

// Mock fetch globally
global.fetch = jest.fn();

describe('EnhancedKaitoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeEnhancedKaitoActivity', () => {
    it('should return default result for Ethereum addresses', async () => {
      const result = await enhancedKaitoService.analyzeEnhancedKaitoActivity('0x1234567890123456789012345678901234567890');
      
      expect(result.basicMetrics.yapScore).toBe(0);
      expect(result.basicMetrics.weeklyYaps).toBe(0);
      expect(result.basicMetrics.totalYaps).toBe(0);
      expect(result.basicMetrics.alignmentScore).toBe(0);
      expect(result.basicMetrics.leaderboardRank).toBeNull();
      
      expect(result.engagementMetrics.averageEngagementRate).toBe(0);
      expect(result.engagementMetrics.replyRate).toBe(0);
      expect(result.engagementMetrics.retweetRatio).toBe(0);
      expect(result.engagementMetrics.communityInteraction).toBe(0);
      expect(result.engagementMetrics.influenceScore).toBe(0);
      
      expect(result.activityTrends.dailyActivity).toEqual([]);
      expect(result.activityTrends.weeklyGrowth).toBe(0);
      expect(result.activityTrends.monthlyGrowth).toBe(0);
      expect(result.activityTrends.consistencyScore).toBe(0);
      
      expect(result.airdropEligibility.eligibilityScore).toBe(0);
      expect(result.airdropEligibility.eligibilityFactors).toEqual([]);
      expect(result.airdropEligibility.recommendations).toHaveLength(1);
      expect(result.airdropEligibility.recommendations[0].title).toBe('Create Kaito Account');
    });

    it('should handle valid username with mocked Kaito profile', async () => {
      const mockKaitoResponse = {
        user_id: 'test123',
        username: 'testuser',
        yaps_all: 150,
        yaps_l7d: 12,
        yaps_l24h: 2,
        yaps_l48h: 4,
        yaps_l30d: 45,
        yaps_l3m: 120,
        yaps_l6m: 140,
        yaps_l12m: 150
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockKaitoResponse
      });

      const result = await enhancedKaitoService.analyzeEnhancedKaitoActivity('testuser');
      
      expect(result.basicMetrics.yapScore).toBe(150);
      expect(result.basicMetrics.weeklyYaps).toBe(12);
      expect(result.basicMetrics.totalYaps).toBe(150);
      expect(result.basicMetrics.alignmentScore).toBe(0); // Not available in mock endpoint
      expect(result.basicMetrics.leaderboardRank).toBeNull();
      
      expect(result.engagementMetrics.averageEngagementRate).toBeGreaterThan(0);
      expect(result.engagementMetrics.replyRate).toBeGreaterThanOrEqual(0);
      expect(result.engagementMetrics.retweetRatio).toBeGreaterThanOrEqual(0);
      expect(result.engagementMetrics.communityInteraction).toBeGreaterThanOrEqual(0);
      expect(result.engagementMetrics.influenceScore).toBeGreaterThan(0);
      
      expect(result.activityTrends.dailyActivity).toHaveLength(30);
      expect(typeof result.activityTrends.weeklyGrowth).toBe('number');
      expect(typeof result.activityTrends.monthlyGrowth).toBe('number');
      expect(typeof result.activityTrends.consistencyScore).toBe('number');
      
      expect(result.airdropEligibility.eligibilityScore).toBeGreaterThan(0);
      expect(result.airdropEligibility.eligibilityFactors).toHaveLength(4);
      expect(result.airdropEligibility.recommendations).toHaveLength(3);
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      const result = await enhancedKaitoService.analyzeEnhancedKaitoActivity('testuser');
      
      expect(result.basicMetrics.yapScore).toBe(0);
      expect(result.airdropEligibility.eligibilityScore).toBe(0);
      expect(result.airdropEligibility.recommendations).toHaveLength(1);
    });
  });

  describe('analyzeProjectEngagement', () => {
    it('should return mock project engagement data', async () => {
      const result = await enhancedKaitoService.analyzeProjectEngagement('testuser');
      
      expect(result.topProjects).toHaveLength(2);
      expect(result.topProjects[0].projectName).toBe('Base');
      expect(result.topProjects[0].projectSymbol).toBe('BASE');
      expect(result.topProjects[0].engagementScore).toBe(85);
      expect(result.topProjects[0].airdropPotential).toBe(88);
      
      expect(result.topProjects[1].projectName).toBe('Arbitrum');
      expect(result.topProjects[1].projectSymbol).toBe('ARB');
      expect(result.topProjects[1].engagementScore).toBe(72);
      
      expect(result.trendingOpportunities).toHaveLength(2);
      expect(result.trendingOpportunities[0].projectName).toBe('LayerZero');
      expect(result.trendingOpportunities[0].airdropLikelihood).toBe(85);
      expect(result.trendingOpportunities[0].timeToAct).toBe('urgent');
      
      expect(result.alignmentAnalysis).toHaveLength(2);
      expect(result.alignmentAnalysis[0].projectName).toBe('Base');
      expect(result.alignmentAnalysis[0].alignmentScore).toBe(92);
      
      expect(result.recommendedProjects).toHaveLength(2);
    });

    it('should handle errors and return default result', async () => {
      // Force an error by mocking a method to throw
      const originalMethod = enhancedKaitoService['getProjectEngagementData'];
      enhancedKaitoService['getProjectEngagementData'] = jest.fn().mockRejectedValue(new Error('Test error'));

      const result = await enhancedKaitoService.analyzeProjectEngagement('testuser');
      
      expect(result.topProjects).toEqual([]);
      expect(result.trendingOpportunities).toEqual([]);
      expect(result.alignmentAnalysis).toEqual([]);
      expect(result.recommendedProjects).toEqual([]);

      // Restore original method
      enhancedKaitoService['getProjectEngagementData'] = originalMethod;
    });
  });

  describe('analyzeSocialInfluence', () => {
    it('should calculate social influence metrics', async () => {
      const mockKaitoResponse = {
        user_id: 'test123',
        username: 'testuser',
        yaps_all: 500,
        yaps_l7d: 25,
        yaps_l24h: 5,
        yaps_l48h: 8,
        yaps_l30d: 100,
        yaps_l3m: 300,
        yaps_l6m: 450,
        yaps_l12m: 500
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockKaitoResponse
      });

      const result = await enhancedKaitoService.analyzeSocialInfluence('testuser');
      
      expect(result.influenceScore).toBeGreaterThan(0);
      expect(result.reachEstimate).toBeGreaterThan(0);
      expect(result.engagementRate).toBeGreaterThan(0);
      expect(['influencer', 'active', 'casual', 'lurker']).toContain(result.communityStanding);
      expect(['growing', 'stable', 'declining']).toContain(result.growthTrend);
      
      expect(result.recommendedStrategy.primaryFocus).toBeDefined();
      expect(result.recommendedStrategy.contentTypes).toBeInstanceOf(Array);
      expect(result.recommendedStrategy.engagementTargets).toBeInstanceOf(Array);
      expect(result.recommendedStrategy.timingRecommendations).toBeInstanceOf(Array);
      expect(result.recommendedStrategy.projectPriorities).toBeInstanceOf(Array);
    });

    it('should return default result when profile not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const result = await enhancedKaitoService.analyzeSocialInfluence('nonexistentuser');
      
      expect(result.influenceScore).toBe(0);
      expect(result.reachEstimate).toBe(0);
      expect(result.engagementRate).toBe(0);
      expect(result.communityStanding).toBe('lurker');
      expect(result.growthTrend).toBe('stable');
      expect(result.recommendedStrategy.primaryFocus).toBe('Getting Started');
    });
  });

  describe('getComprehensiveAnalysis', () => {
    it('should return comprehensive analysis for valid user', async () => {
      const mockKaitoResponse = {
        user_id: 'test123',
        username: 'testuser',
        yaps_all: 200,
        yaps_l7d: 15,
        yaps_l24h: 3,
        yaps_l48h: 5,
        yaps_l30d: 60,
        yaps_l3m: 150,
        yaps_l6m: 180,
        yaps_l12m: 200
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockKaitoResponse
      });

      const result = await enhancedKaitoService.getComprehensiveAnalysis('testuser');
      
      expect(result.basicAnalysis).toBeDefined();
      expect(result.basicAnalysis.hasProfile).toBe(true);
      expect(result.basicAnalysis.profile).not.toBeNull();
      
      expect(result.enhancedAnalysis).toBeDefined();
      expect(result.enhancedAnalysis.basicMetrics.yapScore).toBe(200);
      
      expect(result.projectEngagement).toBeDefined();
      expect(result.projectEngagement.topProjects).toHaveLength(2);
      
      expect(result.socialInfluence).toBeDefined();
      expect(result.socialInfluence.influenceScore).toBeGreaterThan(0);
    });

    it('should handle Ethereum addresses', async () => {
      const result = await enhancedKaitoService.getComprehensiveAnalysis('0x1234567890123456789012345678901234567890');
      
      expect(result.basicAnalysis.hasProfile).toBe(false);
      expect(result.basicAnalysis.profile).toBeNull();
      
      expect(result.enhancedAnalysis.basicMetrics.yapScore).toBe(0);
      
      expect(result.projectEngagement.topProjects).toEqual([]);
      expect(result.socialInfluence.influenceScore).toBe(0);
    });
  });

  describe('getProjectRecommendations', () => {
    it('should return project recommendations', async () => {
      const result = await enhancedKaitoService.getProjectRecommendations('testuser');
      
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThanOrEqual(0);
      
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('projectName');
        expect(result[0]).toHaveProperty('projectSymbol');
        expect(result[0]).toHaveProperty('recommendationScore');
        expect(result[0]).toHaveProperty('reasonsToEngage');
        expect(result[0]).toHaveProperty('expectedBenefit');
        expect(result[0]).toHaveProperty('engagementStrategy');
      }
    });
  });

  describe('getTrendingOpportunities', () => {
    it('should return trending opportunities', async () => {
      const result = await enhancedKaitoService.getTrendingOpportunities();
      
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(2);
      
      expect(result[0].projectName).toBe('LayerZero');
      expect(result[0].projectSymbol).toBe('ZRO');
      expect(result[0].trendingScore).toBe(95);
      expect(result[0].airdropLikelihood).toBe(85);
      expect(result[0].timeToAct).toBe('urgent');
      
      expect(result[1].projectName).toBe('zkSync Era');
      expect(result[1].projectSymbol).toBe('ZK');
      expect(result[1].trendingScore).toBe(88);
      expect(result[1].airdropLikelihood).toBe(75);
      expect(result[1].timeToAct).toBe('soon');
    });
  });

  describe('Eligibility Factor Calculations', () => {
    it('should calculate eligibility factors correctly', async () => {
      const mockKaitoResponse = {
        user_id: 'test123',
        username: 'testuser',
        yaps_all: 300,
        yaps_l7d: 20,
        yaps_l24h: 4,
        yaps_l48h: 6,
        yaps_l30d: 80,
        yaps_l3m: 200,
        yaps_l6m: 280,
        yaps_l12m: 300
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockKaitoResponse
      });

      const result = await enhancedKaitoService.analyzeEnhancedKaitoActivity('testuser');
      
      expect(result.airdropEligibility.eligibilityFactors).toHaveLength(4);
      
      const factors = result.airdropEligibility.eligibilityFactors;
      expect(factors.find(f => f.factor === 'Yap Score')).toBeDefined();
      expect(factors.find(f => f.factor === 'Activity Consistency')).toBeDefined();
      expect(factors.find(f => f.factor === 'Community Influence')).toBeDefined();
      expect(factors.find(f => f.factor === 'Engagement Quality')).toBeDefined();
      
      factors.forEach(factor => {
        expect(factor.score).toBeGreaterThanOrEqual(0);
        expect(factor.score).toBeLessThanOrEqual(10);
        expect(factor.weight).toBeGreaterThan(0);
        expect(factor.weight).toBeLessThanOrEqual(1);
        expect(factor.description).toBeDefined();
        expect(factor.improvement).toBeDefined();
      });
    });
  });

  describe('Social Strategy Generation', () => {
    it('should generate appropriate strategy for high influence users', async () => {
      const mockKaitoResponse = {
        user_id: 'test123',
        username: 'influencer',
        yaps_all: 1000,
        yaps_l7d: 50,
        yaps_l24h: 10,
        yaps_l48h: 15,
        yaps_l30d: 200,
        yaps_l3m: 600,
        yaps_l6m: 900,
        yaps_l12m: 1000
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockKaitoResponse
      });

      const result = await enhancedKaitoService.analyzeSocialInfluence('influencer');
      
      expect(result.recommendedStrategy.primaryFocus).toBe('Thought Leadership');
      expect(result.recommendedStrategy.contentTypes).toContain('Market Analysis');
      expect(result.recommendedStrategy.engagementTargets).toContain('Crypto Influencers');
    });

    it('should generate appropriate strategy for low influence users', async () => {
      const mockKaitoResponse = {
        user_id: 'test123',
        username: 'newbie',
        yaps_all: 10,
        yaps_l7d: 1,
        yaps_l24h: 0,
        yaps_l48h: 1,
        yaps_l30d: 5,
        yaps_l3m: 8,
        yaps_l6m: 10,
        yaps_l12m: 10
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockKaitoResponse
      });

      const result = await enhancedKaitoService.analyzeSocialInfluence('newbie');
      
      expect(result.recommendedStrategy.primaryFocus).toBe('Engagement Building');
      expect(result.recommendedStrategy.contentTypes).toContain('Questions');
      expect(result.recommendedStrategy.engagementTargets).toContain('Beginners');
    });
  });
});