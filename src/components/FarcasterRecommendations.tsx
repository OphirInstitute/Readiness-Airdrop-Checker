'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, AlertTriangle, ChevronDown, ChevronUp, ArrowRight, Star, Zap } from 'lucide-react';
import { useState } from 'react';
import type { FarcasterAnalysis } from '@/lib/types';

interface FarcasterRecommendationsProps {
  analysis: FarcasterAnalysis;
}

export default function FarcasterRecommendations({ analysis }: FarcasterRecommendationsProps) {
  const [expandedRecommendations, setExpandedRecommendations] = useState(false);
  const [expandedRisks, setExpandedRisks] = useState(false);

  // Priority mapping for recommendations
  const getPriorityLevel = (recommendation: string): 'high' | 'medium' | 'low' => {
    const highPriorityKeywords = ['verify', 'power badge', 'storage', 'cast more'];
    const mediumPriorityKeywords = ['engage', 'follow', 'join channels'];
    
    const lowerRec = recommendation.toLowerCase();
    
    if (highPriorityKeywords.some(keyword => lowerRec.includes(keyword))) {
      return 'high';
    }
    if (mediumPriorityKeywords.some(keyword => lowerRec.includes(keyword))) {
      return 'medium';
    }
    return 'low';
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return '#EF4444'; // Red
      case 'medium': return '#F59E0B'; // Yellow
      case 'low': return '#10B981'; // Green
    }
  };

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return Zap;
      case 'medium': return Star;
      case 'low': return ArrowRight;
    }
  };

  const prioritizedRecommendations = analysis.recommendations
    .map(rec => ({
      text: rec,
      priority: getPriorityLevel(rec)
    }))
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  const displayedRecommendations = expandedRecommendations 
    ? prioritizedRecommendations 
    : prioritizedRecommendations.slice(0, 3);

  const displayedRisks = expandedRisks 
    ? analysis.riskFactors 
    : analysis.riskFactors.slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Recommendations & Risk Factors
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recommendations Section */}
        {analysis.recommendations.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-blue-500" />
                Personalized Recommendations
              </h4>
              <Badge variant="outline" className="text-xs">
                {analysis.recommendations.length} suggestions
              </Badge>
            </div>

            <div className="space-y-3">
              {displayedRecommendations.map((rec, index) => {
                const PriorityIcon = getPriorityIcon(rec.priority);
                const priorityColor = getPriorityColor(rec.priority);

                return (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-3 border border-border rounded-lg bg-muted"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <PriorityIcon 
                        className="h-4 w-4 flex-shrink-0 mt-0.5" 
                        style={{ color: priorityColor }}
                      />
                      <span className="text-sm leading-relaxed text-foreground">{rec.text}</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="text-xs flex-shrink-0"
                      style={{ 
                        borderColor: priorityColor,
                        color: priorityColor,
                        backgroundColor: `${priorityColor}10`
                      }}
                    >
                      {rec.priority}
                    </Badge>
                  </div>
                );
              })}
            </div>

            {analysis.recommendations.length > 3 && (
              <button
                onClick={() => setExpandedRecommendations(!expandedRecommendations)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors p-2 -m-2 touch-manipulation focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                aria-expanded={expandedRecommendations}
                aria-label={`${expandedRecommendations ? 'Show fewer' : 'Show more'} recommendations`}
              >
                {expandedRecommendations ? (
                  <>
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                    Show {analysis.recommendations.length - 3} More
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Risk Factors Section */}
        {analysis.riskFactors.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Risk Factors
              </h4>
              <Badge variant="outline" className="text-xs border-red-200 text-red-600">
                {analysis.riskFactors.length} risks identified
              </Badge>
            </div>

            <div className="space-y-3">
              {displayedRisks.map((risk, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/20"
                >
                  <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-800 dark:text-red-200 leading-relaxed">{risk}</span>
                </div>
              ))}
            </div>

            {analysis.riskFactors.length > 3 && (
              <button
                onClick={() => setExpandedRisks(!expandedRisks)}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 transition-colors p-2 -m-2 touch-manipulation focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                aria-expanded={expandedRisks}
                aria-label={`${expandedRisks ? 'Show fewer' : 'Show more'} risk factors`}
              >
                {expandedRisks ? (
                  <>
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                    Show {analysis.riskFactors.length - 3} More
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* No Profile State */}
        {!analysis.hasProfile && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Lightbulb className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Get Started with Farcaster</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Create a Farcaster profile to improve your airdrop eligibility
              </p>
              <div className="space-y-2 text-sm text-left max-w-md mx-auto">
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                  <span className="text-foreground">Sign up at warpcast.com or other Farcaster clients</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                  <span className="text-foreground">Verify your wallet address</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                  <span className="text-foreground">Start casting and engaging with the community</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                  <span className="text-foreground">Follow channels and participate in discussions</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Priority Legend */}
        {analysis.recommendations.length > 0 && (
          <div className="bg-muted rounded-lg p-3">
            <h5 className="font-medium text-sm mb-2 text-foreground">Priority Levels</h5>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-red-500 dark:text-red-400" />
                <span>High - Immediate impact</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500 dark:text-yellow-400" />
                <span>Medium - Moderate benefit</span>
              </div>
              <div className="flex items-center gap-1">
                <ArrowRight className="h-3 w-3 text-green-500 dark:text-green-400" />
                <span>Low - Long-term improvement</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}