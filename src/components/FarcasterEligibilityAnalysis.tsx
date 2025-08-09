'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, CheckCircle, Activity, Users, Shield } from 'lucide-react';
import type { FarcasterAnalysis } from '@/lib/types';
import {
  getAirdropTierColor,
  getStatusIndicatorColor,
  formatTierDisplayName,
  getTierDescription
} from '@/lib/utils/farcaster-display';

interface FarcasterEligibilityAnalysisProps {
  analysis: FarcasterAnalysis;
}

export default function FarcasterEligibilityAnalysis({ analysis }: FarcasterEligibilityAnalysisProps) {
  const tierColor = getAirdropTierColor(analysis.airdropTier);
  const tierDescription = getTierDescription(analysis.airdropTier);

  // Factor icons mapping
  const factorIcons = {
    accountAge: Shield,
    engagement: TrendingUp,
    verification: CheckCircle,
    activity: Activity,
    socialSignals: Users,
  };

  // Factor display names
  const factorNames = {
    accountAge: 'Account Age',
    engagement: 'Engagement',
    verification: 'Verification',
    activity: 'Activity',
    socialSignals: 'Social Signals',
  };

  // Factor descriptions
  const factorDescriptions = {
    accountAge: 'Account maturity and establishment',
    engagement: 'Likes, recasts, and replies per cast',
    verification: 'Address verification status',
    activity: 'Recent casting and participation',
    socialSignals: 'Quality score and social presence',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Airdrop Eligibility Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Airdrop Tier Badge */}
        <div className="text-center">
          <Badge 
            variant="outline" 
            className="text-lg px-4 py-2 mb-2"
            style={{ 
              borderColor: tierColor,
              color: tierColor,
              backgroundColor: `${tierColor}10`
            }}
          >
            {formatTierDisplayName(analysis.airdropTier)} Tier
          </Badge>
          <p className="text-sm text-text-secondary">{tierDescription}</p>
        </div>

        {/* Overall Eligibility Score */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground">Overall Eligibility Score</h4>
            <span className="text-2xl font-bold" style={{ color: tierColor }}>
              {analysis.eligibilityScore}/100
            </span>
          </div>
          <Progress 
            value={analysis.eligibilityScore} 
            className="w-full h-3"
            style={{
              '--progress-background': tierColor,
            } as React.CSSProperties}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        {/* 5-Factor Breakdown */}
        <div className="space-y-4">
          <h4 className="font-semibold">Factor Breakdown</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {Object.entries(analysis.eligibilityFactors).map(([factorKey, factor]) => {
              const IconComponent = factorIcons[factorKey as keyof typeof factorIcons];
              const factorName = factorNames[factorKey as keyof typeof factorNames];
              const factorDescription = factorDescriptions[factorKey as keyof typeof factorDescriptions];
              const statusColor = getStatusIndicatorColor(factor.status);

              return (
                <div 
                  key={factorKey}
                  className="border rounded-lg p-4 space-y-3 touch-manipulation"
                  style={{ borderColor: `${statusColor}30` }}
                >
                  <div className="flex items-center gap-2">
                    {IconComponent && (
                      <IconComponent 
                        className="h-4 w-4" 
                        style={{ color: statusColor }}
                      />
                    )}
                    <span className="font-medium text-sm">{factorName}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold" style={{ color: statusColor }}>
                      {factor.score}
                    </span>
                    <Badge 
                      variant="outline" 
                      className="text-xs px-2 py-1"
                      style={{ 
                        borderColor: statusColor,
                        color: statusColor,
                        backgroundColor: `${statusColor}10`
                      }}
                    >
                      {factor.status}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">{factorDescription}</p>
                  
                  {/* Mini progress bar for the factor */}
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(factor.score / 30) * 100}%`, // Assuming max score is 30 for social signals, 20 for others
                        backgroundColor: statusColor 
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Score Interpretation */}
        <div className="bg-muted rounded-lg p-4">
          <h5 className="font-medium mb-2 text-foreground">Score Interpretation</h5>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Excellent (80-100)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Good (60-79)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Fair (40-59)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Poor (0-39)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}