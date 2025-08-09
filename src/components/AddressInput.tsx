'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Search, Wallet, User, AlertCircle, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import FarcasterProfileOverview from './FarcasterProfileOverview';
import FarcasterEligibilityAnalysis from './FarcasterEligibilityAnalysis';
import FarcasterActivityMetrics from './FarcasterActivityMetrics';
import FarcasterAccountStatus from './FarcasterAccountStatus';
import FarcasterRecommendations from './FarcasterRecommendations';
import FarcasterChannelActivity from './FarcasterChannelActivity';
import { BridgeActivityCard } from './BridgeActivityCard';
import { KaitoMetricsDashboard } from './KaitoMetricsDashboard';
import { ProfessionalLoadingSkeleton } from './ProfessionalLoadingSkeleton';
import { BridgeErrorState, KaitoErrorState, PartialDataDisplay } from './ProfessionalErrorBoundary';
import type { 
  ComprehensiveAnalysis, 
  ComprehensiveBridgeAnalysis,
  EnhancedKaitoResult,
  ProjectEngagementResult,
  SocialInfluenceResult 
} from '@/lib/types';

type AnalysisResult = ComprehensiveAnalysis;

export default function AddressInput() {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    profile: true,
    eligibility: true,
    activity: false,
    account: false,
    channels: false,
    recommendations: false,
    bridge: true,
    kaito: true
  });
  
  // Enhanced analysis states
  const [bridgeAnalysis, setBridgeAnalysis] = useState<ComprehensiveBridgeAnalysis | null>(null);
  const [enhancedKaito, setEnhancedKaito] = useState<{
    kaitoData: EnhancedKaitoResult | null;
    projectEngagement: ProjectEngagementResult | null;
    socialInfluence: SocialInfluenceResult | null;
  } | null>(null);
  const [analysisErrors, setAnalysisErrors] = useState<{
    bridge?: string;
    kaito?: string;
  }>({});

  const handleAnalyze = async () => {
    if (!input.trim()) {
      setError('Please enter a wallet address or username');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setProgress(0);
    setBridgeAnalysis(null);
    setEnhancedKaito(null);
    setAnalysisErrors({});

    let progressInterval: NodeJS.Timeout | null = null;

    try {
      // Simulate progress updates
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            if (progressInterval) clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: input.trim() }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (progressInterval) clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        let errorMessage = 'Analysis failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If we can't parse the error response, use a generic message
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      // Use the full API response data directly
      const result: AnalysisResult = data.data;

      setResult(result);
      
      // Perform enhanced analysis in parallel
      const enhancedAnalysisPromises = [];
      
      // Bridge analysis
      if (input.startsWith('0x')) {
        enhancedAnalysisPromises.push(
          fetch('/api/analyze/bridge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: input.trim() })
          })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setBridgeAnalysis(data.data);
            } else {
              setAnalysisErrors(prev => ({ ...prev, bridge: 'Bridge analysis failed' }));
            }
          })
          .catch(err => {
            console.error('Bridge analysis error:', err);
            setAnalysisErrors(prev => ({ ...prev, bridge: 'Bridge analysis unavailable' }));
          })
        );
      }
      
      // Enhanced Kaito analysis - temporarily disabled due to build issues
      // if (input.startsWith('0x')) {
      //   enhancedAnalysisPromises.push(
      //     fetch('/api/analyze/kaito-enhanced', {
      //       method: 'POST',
      //       headers: { 'Content-Type': 'application/json' },
      //       body: JSON.stringify({ address: input.trim() })
      //     })
      //     .then(res => res.json())
      //     .then(data => {
      //       if (data.success) {
      //         setEnhancedKaito(data.data);
      //       } else {
      //         setAnalysisErrors(prev => ({ ...prev, kaito: 'Enhanced Kaito analysis failed' }));
      //       }
      //     })
      //     .catch(err => {
      //       console.error('Enhanced Kaito analysis error:', err);
      //       setAnalysisErrors(prev => ({ ...prev, kaito: 'Enhanced Kaito analysis unavailable' }));
      //     })
      //   );
      // }
      
      // Wait for enhanced analyses to complete (but don't block main result)
      Promise.allSettled(enhancedAnalysisPromises);
    } catch (err) {
      if (progressInterval) clearInterval(progressInterval);
      
      let errorMessage = 'An unexpected error occurred';
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'Request timed out. Please try again.';
        } else if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const CollapsibleSection = ({ 
    title, 
    sectionKey, 
    children
  }: { 
    title: string; 
    sectionKey: keyof typeof expandedSections; 
    children: React.ReactNode;
  }) => {
    const isExpanded = expandedSections[sectionKey];
    
    return (
      <div className="space-y-4">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors touch-manipulation sm:hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-expanded={isExpanded}
          aria-controls={`section-${sectionKey}`}
          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${title} section`}
        >
          <span className="font-medium text-left">{title}</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          )}
        </button>
        <div 
          className={`${isExpanded ? 'block' : 'hidden'} sm:block`}
          id={`section-${sectionKey}`}
          role="region"
          aria-labelledby={`section-${sectionKey}-button`}
        >
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Address Analysis
          </CardTitle>
          <CardDescription id="input-description">
            Enter a wallet address (0x...) or username (@username) to analyze airdrop eligibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="0x742d35Cc6634C0532925a3b8D4C9db96590e4CAF or @username"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isAnalyzing && handleAnalyze()}
                disabled={isAnalyzing}
                className="pr-10"
                aria-label="Enter wallet address or username for analysis"
                aria-describedby="input-description"
              />
              {input.startsWith('0x') ? (
                <Wallet className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              ) : input.startsWith('@') ? (
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              ) : null}
            </div>
            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || !input.trim()}
              className="min-w-[100px]"
              aria-describedby={isAnalyzing ? "analyzing-status" : undefined}
            >
              {isAnalyzing ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing
                </>
              ) : (
                'Analyze'
              )}
            </Button>
          </div>

          {/* Example inputs for testing */}
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="text-muted-foreground">Try these examples:</span>
            <button
              onClick={() => setInput('0x742d35Cc6634C0532925a3b8D4C9db96590e4CAF')}
              className="text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-1"
              disabled={isAnalyzing}
              aria-label="Use sample Ethereum address for testing"
            >
              Sample Address
            </button>
            <span className="text-muted-foreground" aria-hidden="true">•</span>
            <button
              onClick={() => setInput('@jhunsaker')}
              className="text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-1"
              disabled={isAnalyzing}
              aria-label="Use @jhunsaker username for testing"
            >
              @jhunsaker
            </button>
            <span className="text-muted-foreground" aria-hidden="true">•</span>
            <button
              onClick={() => setInput('@cryptowhale')}
              className="text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-1"
              disabled={isAnalyzing}
              aria-label="Use @cryptowhale username for testing"
            >
              @cryptowhale
            </button>
            <span className="text-muted-foreground" aria-hidden="true">•</span>
            <button
              onClick={() => setInput('@defimaxi')}
              className="text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-1"
              disabled={isAnalyzing}
              aria-label="Use @defimaxi username for testing"
            >
              @defimaxi
            </button>
          </div>

          {isAnalyzing && (
            <div className="space-y-2" role="status" aria-live="polite">
              <div className="flex justify-between text-sm text-muted-foreground" id="analyzing-status">
                <span>Analyzing eligibility...</span>
                <span>{progress}%</span>
              </div>
              <Progress 
                value={progress} 
                className="w-full" 
                aria-label={`Analysis progress: ${progress}%`}
              />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="space-y-4">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Eligibility Analysis Complete
                </span>
                <Badge variant={getScoreBadgeVariant(result.eligibilityScore)} className="text-lg px-3 py-1">
                  {result.eligibilityScore}/100
                </Badge>
              </CardTitle>
              <CardDescription>
                Analysis for {result.address} • {new Date(result.timestamp).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(result.eligibilityScore)} mb-2`}>
                {result.eligibilityScore >= 80 ? 'High Eligibility' : 
                 result.eligibilityScore >= 60 ? 'Moderate Eligibility' : 'Low Eligibility'}
              </div>
              <Progress value={result.eligibilityScore} className="w-full" />
            </CardContent>
          </Card>

          {/* On-chain Analysis */}
          {result.onchainAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  On-chain Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {result.onchainAnalysis.transactionCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Transactions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {result.onchainAnalysis.totalVolume}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Volume</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {result.onchainAnalysis.firstTransaction}
                    </div>
                    <div className="text-sm text-muted-foreground">First TX</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {result.onchainAnalysis.eligibleAirdrops.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Eligible Airdrops</div>
                  </div>
                </div>
                
                {result.onchainAnalysis.eligibleAirdrops.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Potential Airdrops:</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.onchainAnalysis.eligibleAirdrops.map((airdrop) => (
                        <Badge key={airdrop} variant="outline">{airdrop}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Enhanced Farcaster Analysis */}
          {result.socialAnalysis?.farcasterProfile?.hasProfile && result.socialAnalysis.farcasterProfile.profile && (
            <div className="space-y-4">
              {/* Profile Overview - Always visible */}
              <FarcasterProfileOverview profile={result.socialAnalysis.farcasterProfile.profile} />
              
              {/* Eligibility Analysis - Always visible */}
              <FarcasterEligibilityAnalysis analysis={result.socialAnalysis.farcasterProfile} />
              
              {/* Activity Metrics - Collapsible on mobile */}
              <CollapsibleSection 
                title="Activity & Engagement Metrics" 
                sectionKey="activity"
              >
                <FarcasterActivityMetrics 
                  profile={result.socialAnalysis.farcasterProfile.profile}
                  castMetrics={result.socialAnalysis.farcasterProfile.castMetrics}
                />
              </CollapsibleSection>
              
              {/* Account Status - Collapsible on mobile */}
              <CollapsibleSection 
                title="Account Status & Verification" 
                sectionKey="account"
              >
                <FarcasterAccountStatus profile={result.socialAnalysis.farcasterProfile.profile} />
              </CollapsibleSection>
              
              {/* Channel Activity - Collapsible on mobile */}
              <CollapsibleSection 
                title="Channel Activity & Cast Performance" 
                sectionKey="channels"
              >
                <FarcasterChannelActivity 
                  channelActivity={result.socialAnalysis.farcasterProfile.channelActivity}
                  castMetrics={result.socialAnalysis.farcasterProfile.castMetrics}
                />
              </CollapsibleSection>
              
              {/* Recommendations - Collapsible on mobile */}
              <CollapsibleSection 
                title="Recommendations & Risk Factors" 
                sectionKey="recommendations"
              >
                <FarcasterRecommendations analysis={result.socialAnalysis.farcasterProfile} />
              </CollapsibleSection>
            </div>
          )}

          {/* Enhanced Bridge Analysis */}
          <CollapsibleSection 
            title="Bridge Activity Analysis" 
            sectionKey="bridge"
          >
            {isAnalyzing ? (
              <ProfessionalLoadingSkeleton type="bridge" />
            ) : analysisErrors.bridge ? (
              <BridgeErrorState 
                type="bridge"
                message={analysisErrors.bridge}
                onRetry={() => {
                  setAnalysisErrors(prev => ({ ...prev, bridge: undefined }));
                  // Retry bridge analysis
                }}
              />
            ) : bridgeAnalysis ? (
              <BridgeActivityCard
                orbiterData={bridgeAnalysis.orbiterAnalysis}
                hopData={bridgeAnalysis.hopAnalysis}
                historicalComparison={bridgeAnalysis.historicalComparison}
                isLoading={false}
              />
            ) : input.startsWith('0x') ? (
              <ProfessionalLoadingSkeleton type="bridge" />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Bridge analysis is only available for wallet addresses
              </div>
            )}
          </CollapsibleSection>

          {/* Enhanced Kaito Analysis */}
          <CollapsibleSection 
            title="Enhanced Kaito Social Metrics" 
            sectionKey="kaito"
          >
            {isAnalyzing ? (
              <ProfessionalLoadingSkeleton type="kaito" />
            ) : analysisErrors.kaito ? (
              <KaitoErrorState 
                type="kaito"
                message={analysisErrors.kaito}
                onRetry={() => {
                  setAnalysisErrors(prev => ({ ...prev, kaito: undefined }));
                  // Retry Kaito analysis
                }}
              />
            ) : enhancedKaito ? (
              <KaitoMetricsDashboard
                address={result.address}
                kaitoData={enhancedKaito.kaitoData}
                projectEngagement={enhancedKaito.projectEngagement}
                socialInfluence={enhancedKaito.socialInfluence}
                isLoading={false}
              />
            ) : result.socialAnalysis?.kaitoEngagement?.hasProfile ? (
              // Fallback to basic Kaito display
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Kaito Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-orange-600">
                        {result.socialAnalysis.kaitoEngagement.profile?.yapScore || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Engagement Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-red-600">
                        {result.socialAnalysis.kaitoEngagement.profile?.totalEngagement || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Interactions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : input.startsWith('0x') ? (
              <ProfessionalLoadingSkeleton type="kaito" />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Enhanced Kaito analysis is only available for wallet addresses
              </div>
            )}
          </CollapsibleSection>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>
                Actions to improve your airdrop eligibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}