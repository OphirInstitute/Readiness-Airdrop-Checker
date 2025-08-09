import { blockchainService, type OnChainAnalysis } from './blockchain';
import { farcasterService, type FarcasterAnalysis } from './farcaster';
import { kaitoService, type KaitoAnalysis } from './kaito';

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

class AnalysisService {
  async analyzeInput(input: string): Promise<ComprehensiveAnalysis> {
    const startTime = Date.now();
    const isAddress = input.startsWith('0x');
    const inputType = isAddress ? 'address' : 'username';
    
    const successfulServices: string[] = [];
    const failedServices: string[] = [];
    
    // Initialize results
    let onchainAnalysis: OnChainAnalysis | null = null;
    let farcasterAnalysis: FarcasterAnalysis | null = null;
    let kaitoAnalysis: KaitoAnalysis | null = null;

    // Run analyses in parallel with error handling
    const [blockchainResult, farcasterResult, kaitoResult] = await Promise.allSettled([
      this.runBlockchainAnalysis(input, isAddress),
      this.runFarcasterAnalysis(input),
      this.runKaitoAnalysis(input)
    ]);

    // Process blockchain analysis result
    if (blockchainResult.status === 'fulfilled' && blockchainResult.value) {
      onchainAnalysis = blockchainResult.value;
      successfulServices.push('blockchain');
    } else {
      failedServices.push('blockchain');
      console.error('Blockchain analysis failed:', blockchainResult.status === 'rejected' ? blockchainResult.reason : 'No data');
    }

    // Process Farcaster analysis result
    if (farcasterResult.status === 'fulfilled' && farcasterResult.value) {
      farcasterAnalysis = farcasterResult.value;
      successfulServices.push('farcaster');
    } else {
      failedServices.push('farcaster');
      console.error('Farcaster analysis failed:', farcasterResult.status === 'rejected' ? farcasterResult.reason : 'No data');
    }

    // Process Kaito analysis result
    if (kaitoResult.status === 'fulfilled' && kaitoResult.value) {
      kaitoAnalysis = kaitoResult.value;
      successfulServices.push('kaito');
    } else {
      failedServices.push('kaito');
      console.error('Kaito analysis failed:', kaitoResult.status === 'rejected' ? kaitoResult.reason : 'No data');
    }

    // Calculate overall eligibility score
    const eligibilityScore = this.calculateOverallScore({
      onchain: onchainAnalysis,
      farcaster: farcasterAnalysis,
      kaito: kaitoAnalysis
    });

    // Generate comprehensive recommendations
    const recommendations = this.generateComprehensiveRecommendations({
      onchain: onchainAnalysis,
      farcaster: farcasterAnalysis,
      kaito: kaitoAnalysis,
      inputType
    });

    // Identify risk factors
    const riskFactors = this.identifyRiskFactors({
      onchain: onchainAnalysis,
      farcaster: farcasterAnalysis,
      kaito: kaitoAnalysis
    });

    const duration = Date.now() - startTime;

    return {
      address: isAddress ? input : this.extractAddressFromSocial(farcasterAnalysis) || input,
      timestamp: new Date().toISOString(),
      inputType,
      onchainAnalysis,
      socialAnalysis: {
        farcasterProfile: farcasterAnalysis,
        kaitoEngagement: kaitoAnalysis
      },
      eligibilityScore,
      recommendations,
      riskFactors,
      metadata: {
        duration,
        successfulServices,
        failedServices
      }
    };
  }

  private async runBlockchainAnalysis(input: string, isAddress: boolean): Promise<OnChainAnalysis | null> {
    if (!isAddress) {
      return null; // Can't analyze blockchain data without an address
    }

    try {
      return await blockchainService.analyzeAddress(input);
    } catch (error) {
      console.error('Blockchain analysis error:', error);
      return null;
    }
  }

  private async runFarcasterAnalysis(input: string): Promise<FarcasterAnalysis | null> {
    try {
      return await farcasterService.analyzeUser(input);
    } catch (error) {
      console.error('Farcaster analysis error:', error);
      return null;
    }
  }

  private async runKaitoAnalysis(input: string): Promise<KaitoAnalysis | null> {
    try {
      return await kaitoService.analyzeUser(input);
    } catch (error) {
      console.error('Kaito analysis error:', error);
      return null;
    }
  }

  private calculateOverallScore(data: {
    onchain: OnChainAnalysis | null;
    farcaster: FarcasterAnalysis | null;
    kaito: KaitoAnalysis | null;
  }): number {
    let totalScore = 0;
    let maxPossibleScore = 0;

    // Blockchain score (40% weight)
    if (data.onchain) {
      const onchainScore = this.calculateOnchainScore(data.onchain);
      totalScore += onchainScore * 0.4;
    }
    maxPossibleScore += 40;

    // Farcaster score (30% weight)
    if (data.farcaster) {
      totalScore += data.farcaster.eligibilityScore * 0.3;
    }
    maxPossibleScore += 30;

    // Kaito score (30% weight)
    if (data.kaito) {
      totalScore += data.kaito.eligibilityScore * 0.3;
    }
    maxPossibleScore += 30;

    // Normalize score to 0-100 range
    return maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
  }

  private calculateOnchainScore(onchain: OnChainAnalysis): number {
    let score = 0;

    // Transaction count scoring
    if (onchain.transactionCount >= 100) score += 30;
    else if (onchain.transactionCount >= 50) score += 25;
    else if (onchain.transactionCount >= 20) score += 20;
    else if (onchain.transactionCount >= 10) score += 15;
    else if (onchain.transactionCount >= 5) score += 10;
    else if (onchain.transactionCount > 0) score += 5;

    // Contract interactions scoring
    if (onchain.contractInteractions >= 20) score += 25;
    else if (onchain.contractInteractions >= 10) score += 20;
    else if (onchain.contractInteractions >= 5) score += 15;
    else if (onchain.contractInteractions > 0) score += 10;

    // Protocol diversity scoring
    if (onchain.uniqueProtocols >= 10) score += 20;
    else if (onchain.uniqueProtocols >= 5) score += 15;
    else if (onchain.uniqueProtocols >= 3) score += 10;
    else if (onchain.uniqueProtocols > 0) score += 5;

    // Airdrop eligibility bonus
    score += Math.min(onchain.eligibleAirdrops.length * 5, 25);

    return Math.min(score, 100);
  }

  private generateComprehensiveRecommendations(data: {
    onchain: OnChainAnalysis | null;
    farcaster: FarcasterAnalysis | null;
    kaito: KaitoAnalysis | null;
    inputType: 'address' | 'username';
  }): string[] {
    const recommendations: string[] = [];

    // Blockchain recommendations
    if (!data.onchain && data.inputType === 'username') {
      recommendations.push('Connect your wallet address to enable on-chain analysis');
    } else if (data.onchain) {
      if (data.onchain.transactionCount < 10) {
        recommendations.push('Increase on-chain activity with more transactions');
      }
      if (data.onchain.contractInteractions < 5) {
        recommendations.push('Interact with more DeFi protocols and smart contracts');
      }
      if (data.onchain.eligibleAirdrops.length < 3) {
        recommendations.push('Diversify across more blockchain ecosystems');
      }
    }

    // Social recommendations
    if (!data.farcaster?.hasProfile) {
      recommendations.push('Create a Farcaster profile to increase social eligibility');
    } else if (data.farcaster.recommendations.length > 0) {
      recommendations.push(...data.farcaster.recommendations.slice(0, 2));
    }

    if (!data.kaito?.hasProfile) {
      recommendations.push('Join Kaito and start building your Yap score');
    } else if (data.kaito.recommendations.length > 0) {
      recommendations.push(...data.kaito.recommendations.slice(0, 2));
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('Excellent profile! Continue your current engagement strategy');
    }

    return recommendations.slice(0, 6); // Limit to 6 recommendations
  }

  private identifyRiskFactors(data: {
    onchain: OnChainAnalysis | null;
    farcaster: FarcasterAnalysis | null;
    kaito: KaitoAnalysis | null;
  }): string[] {
    const riskFactors: string[] = [];

    // Blockchain risk factors
    if (data.onchain) {
      if (data.onchain.transactionCount === 0) {
        riskFactors.push('No on-chain activity detected');
      } else if (data.onchain.transactionCount < 5) {
        riskFactors.push('Very low transaction count');
      }

      if (data.onchain.contractInteractions === 0) {
        riskFactors.push('No smart contract interactions');
      }

      if (!data.onchain.isActive) {
        riskFactors.push('Inactive wallet address');
      }
    }

    // Social risk factors
    if (!data.farcaster?.hasProfile && !data.kaito?.hasProfile) {
      riskFactors.push('No social platform presence');
    }

    if (data.farcaster?.hasProfile && !data.farcaster.profile?.isActive) {
      riskFactors.push('Inactive Farcaster profile');
    }

    return riskFactors;
  }

  private extractAddressFromSocial(farcaster: FarcasterAnalysis | null): string | null {
    if (farcaster?.profile?.verifications && farcaster.profile.verifications.length > 0) {
      return farcaster.profile.verifications[0];
    }
    return null;
  }
}

export const analysisService = new AnalysisService();