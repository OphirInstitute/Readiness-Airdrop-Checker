import { NextRequest, NextResponse } from 'next/server';
import { OrbiterFinanceService } from '@/lib/services/orbiter-finance';
import { HopProtocolService } from '@/lib/services/hop-protocol';
import { HistoricalAirdropService } from '@/lib/services/historical-airdrop';
import type {
  ComprehensiveBridgeAnalysis,
  BridgeAnalysisError,
  BridgeAnalysisResponse
} from '@/lib/types';

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  return true;
}

function validateAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `bridge_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json({
        success: false,
        errors: [{
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
          service: 'api',
          severity: 'medium',
          retryable: true,
          timestamp: Date.now()
        }],
        metadata: {
          requestId,
          timestamp: Date.now(),
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      } as BridgeAnalysisResponse, { status: 429 });
    }

    // Parse request body
    const body = await request.json();
    const { address } = body;

    // Validate input
    if (!address || typeof address !== 'string') {
      return NextResponse.json({
        success: false,
        errors: [{
          code: 'INVALID_ADDRESS',
          message: 'Address is required and must be a string',
          service: 'api',
          severity: 'high',
          retryable: false,
          timestamp: Date.now()
        }],
        metadata: {
          requestId,
          timestamp: Date.now(),
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      } as BridgeAnalysisResponse, { status: 400 });
    }

    if (!validateAddress(address)) {
      return NextResponse.json({
        success: false,
        errors: [{
          code: 'INVALID_ADDRESS_FORMAT',
          message: 'Invalid Ethereum address format',
          service: 'api',
          severity: 'high',
          retryable: false,
          timestamp: Date.now()
        }],
        metadata: {
          requestId,
          timestamp: Date.now(),
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      } as BridgeAnalysisResponse, { status: 400 });
    }

    // Initialize services
    const orbiterService = new OrbiterFinanceService();
    const hopService = new HopProtocolService();
    const historicalService = new HistoricalAirdropService();

    const errors: BridgeAnalysisError[] = [];
    const warnings: string[] = [];

    // Parallel processing for Orbiter and Hop data
    const [orbiterResult, hopResult] = await Promise.allSettled([
      orbiterService.analyzeOrbiterActivity(address),
      hopService.analyzeHopActivity(address)
    ]);

    // Process Orbiter results
    let orbiterAnalysis = null;
    if (orbiterResult.status === 'fulfilled') {
      orbiterAnalysis = orbiterResult.value;
    } else {
      errors.push({
        code: 'ORBITER_ANALYSIS_FAILED',
        message: `Orbiter analysis failed: ${orbiterResult.reason?.message || 'Unknown error'}`,
        service: 'orbiter',
        severity: 'medium',
        retryable: true,
        timestamp: Date.now(),
        context: { address }
      });
      warnings.push('Orbiter Finance analysis unavailable - results may be incomplete');
    }

    // Process Hop results
    let hopAnalysis = null;
    if (hopResult.status === 'fulfilled') {
      hopAnalysis = hopResult.value;
    } else {
      errors.push({
        code: 'HOP_ANALYSIS_FAILED',
        message: `Hop analysis failed: ${hopResult.reason?.message || 'Unknown error'}`,
        service: 'hop',
        severity: 'medium',
        retryable: true,
        timestamp: Date.now(),
        context: { address }
      });
      warnings.push('Hop Protocol analysis unavailable - results may be incomplete');
    }

    // Historical comparison (only if we have at least one successful analysis)
    let historicalComparison = null;
    if (orbiterAnalysis || hopAnalysis) {
      try {
        // Create user metrics for historical comparison
        const userMetrics = {
          totalBridgeVolume: (
            parseFloat(orbiterAnalysis?.totalVolume || '0') +
            parseFloat(hopAnalysis?.bridgeActivity.totalVolume || '0')
          ).toString(),
          totalBridgeTransactions: (
            (orbiterAnalysis?.totalTransactions || 0) +
            (hopAnalysis?.bridgeActivity.totalTransactions || 0)
          ),
          totalLPVolume: hopAnalysis?.lpActivity.totalLiquidityProvided || '0',
          totalLPDuration: hopAnalysis?.lpActivity.averagePositionDuration || 0,
          uniqueChains: Math.max(
            orbiterAnalysis?.uniqueChains || 0,
            hopAnalysis?.bridgeActivity.uniqueChains || 0
          ),
          uniqueTokens: Math.max(
            orbiterAnalysis?.uniqueTokens || 0,
            hopAnalysis?.bridgeActivity.uniqueTokens || 0
          )
        };

        historicalComparison = await historicalService.compareToHistoricalAirdrops(userMetrics);
      } catch (error) {
        errors.push({
          code: 'HISTORICAL_COMPARISON_FAILED',
          message: `Historical comparison failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          service: 'historical',
          severity: 'low',
          retryable: true,
          timestamp: Date.now(),
          context: { address }
        });
        warnings.push('Historical comparison unavailable - basic analysis provided');
      }
    }

    // Calculate overall metrics
    const totalBridgeVolume = (
      parseFloat(orbiterAnalysis?.totalVolume || '0') +
      parseFloat(hopAnalysis?.bridgeActivity.totalVolume || '0')
    ).toString();

    const totalBridgeTransactions = (
      (orbiterAnalysis?.totalTransactions || 0) +
      (hopAnalysis?.bridgeActivity.totalTransactions || 0)
    );

    const totalLPVolume = hopAnalysis?.lpActivity.totalLiquidityProvided || '0';
    const totalLPDuration = hopAnalysis?.lpActivity.averagePositionDuration || 0;

    // Calculate combined eligibility score
    const orbiterScore = orbiterAnalysis?.eligibilityScore || 0;
    const hopScore = hopAnalysis?.eligibilityMetrics.combinedScore || 0;
    const combinedEligibilityScore = orbiterAnalysis && hopAnalysis
      ? Math.round((orbiterScore + hopScore) / 2)
      : orbiterScore || hopScore || 0;

    // Determine overall tier
    const overallTier = combinedEligibilityScore >= 90 ? 'platinum' :
      combinedEligibilityScore >= 75 ? 'gold' :
        combinedEligibilityScore >= 60 ? 'silver' :
          combinedEligibilityScore >= 40 ? 'bronze' : 'none';

    // Calculate percentile rank
    const percentileRank = historicalComparison?.overallPercentile.combined ||
      Math.min(100, Math.round(combinedEligibilityScore * 0.9 + 10));

    // Calculate completeness and reliability
    const completeness = Math.round(
      ((orbiterAnalysis ? 50 : 0) + (hopAnalysis ? 50 : 0))
    );

    const reliability = Math.round(
      100 - (errors.length * 20) - (warnings.length * 5)
    );

    // Build comprehensive analysis result
    const analysisResult: ComprehensiveBridgeAnalysis = {
      address,
      timestamp: new Date().toISOString(),
      orbiterAnalysis,
      hopAnalysis,
      historicalComparison,
      recommendations: null, // Would be generated by a separate service
      overallMetrics: {
        totalBridgeVolume,
        totalBridgeTransactions,
        totalLPVolume,
        totalLPDuration,
        combinedEligibilityScore,
        overallTier,
        percentileRank
      },
      metadata: {
        analysisVersion: '2.0.0',
        dataFreshness: 0, // Real-time analysis
        completeness,
        reliability,
        processingTime: Date.now() - startTime,
        errors: errors.map(e => e.message),
        warnings
      }
    };

    // Return successful response
    const response: BridgeAnalysisResponse = {
      success: true,
      data: analysisResult,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTime: Date.now() - startTime,
        version: '1.0.0'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Bridge analysis API error:', error);

    const response: BridgeAnalysisResponse = {
      success: false,
      errors: [{
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred during bridge analysis',
        service: 'api',
        severity: 'critical',
        retryable: true,
        timestamp: Date.now(),
        context: { error: error instanceof Error ? error.message : 'Unknown error' }
      }],
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTime: Date.now() - startTime,
        version: '1.0.0'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json({
    success: false,
    errors: [{
      code: 'METHOD_NOT_ALLOWED',
      message: 'GET method not supported. Use POST with address in request body.',
      service: 'api',
      severity: 'medium',
      retryable: false,
      timestamp: Date.now()
    }]
  }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({
    success: false,
    errors: [{
      code: 'METHOD_NOT_ALLOWED',
      message: 'PUT method not supported. Use POST with address in request body.',
      service: 'api',
      severity: 'medium',
      retryable: false,
      timestamp: Date.now()
    }]
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({
    success: false,
    errors: [{
      code: 'METHOD_NOT_ALLOWED',
      message: 'DELETE method not supported. Use POST with address in request body.',
      service: 'api',
      severity: 'medium',
      retryable: false,
      timestamp: Date.now()
    }]
  }, { status: 405 });
}