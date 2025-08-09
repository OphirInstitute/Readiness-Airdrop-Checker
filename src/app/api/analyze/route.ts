import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { analysisService } from '@/lib/services/analysis';

// Request validation schema
const analyzeRequestSchema = z.object({
  address: z.string().min(1, 'Address is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = analyzeRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    let { address } = validationResult.data;
    
    // Normalize input - add @ to usernames if not present
    if (!address.startsWith('0x') && !address.startsWith('@')) {
      address = `@${address}`;
    }

    // Basic input validation
    if (address.startsWith('0x') && address.length !== 42) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address format. Must be 42 characters starting with 0x' },
        { status: 400 }
      );
    }

    if (address.startsWith('@') && address.length < 2) {
      return NextResponse.json(
        { error: 'Invalid username format. Must be at least 1 character after @' },
        { status: 400 }
      );
    }

    // Perform real analysis
    const analysis = await analysisService.analyzeInput(address);
    
    return NextResponse.json({
      success: true,
      data: analysis,
    });

  } catch (error) {
    console.error('Analysis API error:', error);
    
    // Return more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Service configuration error. Please try again later.' },
          { status: 503 }
        );
      }
      
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again in a few minutes.' },
          { status: 429 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Analysis failed. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Airdrop Eligibility Checker API',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      analyze: 'POST /api/analyze',
    },
    supportedInputs: [
      'Ethereum addresses (0x...)',
      'Usernames (@username)',
    ],
    features: [
      'On-chain transaction analysis',
      'Social platform engagement tracking',
      'Airdrop eligibility scoring',
      'Personalized recommendations',
    ],
  });
}