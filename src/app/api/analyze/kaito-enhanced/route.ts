import { NextRequest, NextResponse } from 'next/server';
import { enhancedKaitoService } from '@/lib/services/kaito';
import type { 
  EnhancedKaitoResult,
  ProjectEngagementResult,
  SocialInfluenceResult,
  APIResponse 
} from '@/lib/types';



// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // requests per minute (lower for enhanced analysis)
const RATE_LIMIT_WINDOW = 60 * 1000;

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

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED'
        }
      } as APIResponse, { status: 429 });
    }

    // Parse request
    const body = await request.json();
    const { address } = body;

    if (!address || typeof address !== 'string') {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Address is required and must be a string',
          code: 'INVALID_INPUT'
        }
      } as APIResponse, { status: 400 });
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Invalid Ethereum address format',
          code: 'INVALID_ADDRESS'
        }
      } as APIResponse, { status: 400 });
    }

    // Perform enhanced analysis
    const kaitoData = await enhancedKaitoService.analyzeEnhancedKaitoActivity(address);
    
    // Get project engagement and social influence if user has profile
    let projectEngagement = null;
    let socialInfluence = null;
    
    if (kaitoData.basicMetrics.yapScore > 0) {
      try {
        // In a real implementation, we'd get the Twitter username from the Kaito profile
        const mockTwitterUsername = `user_${address.slice(-6)}`;
        
        [projectEngagement, socialInfluence] = await Promise.all([
          enhancedKaitoService.analyzeProjectEngagement(mockTwitterUsername),
          enhancedKaitoService.analyzeSocialInfluence(mockTwitterUsername)
        ]);
      } catch (error) {
        console.warn('Failed to get extended metrics:', error);
        // Continue with basic analysis only
      }
    }

    const response: APIResponse<{
      kaitoData: EnhancedKaitoResult;
      projectEngagement: ProjectEngagementResult | null;
      socialInfluence: SocialInfluenceResult | null;
      metadata: {
        processingTime: number;
        timestamp: string;
        version: string;
      };
    }> = {
      success: true,
      data: {
        kaitoData,
        projectEngagement,
        socialInfluence,
        metadata: {
          processingTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          version: '2.0.0'
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Enhanced Kaito analysis error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'An error occurred during enhanced Kaito analysis',
        code: 'INTERNAL_ERROR'
      }
    } as APIResponse, { status: 500 });
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json({
    success: false,
    error: {
      message: 'GET method not supported. Use POST with address in request body.',
      code: 'METHOD_NOT_ALLOWED'
    }
  } as APIResponse, { status: 405 });
}