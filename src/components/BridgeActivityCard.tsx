'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  ArrowRightLeft, 
  TrendingUp, 
  Activity,
  DollarSign,
  Network,
  Award
} from 'lucide-react';
import type { 
  OrbiterActivityResult, 
  HopActivityResult, 
  HistoricalComparisonResult 
} from '../lib/types';
import { MetricCard } from './MetricCard';
import { BridgeActivityTimeline } from './BridgeActivityTimeline';
// import { ProtocolBreakdown } from './ProtocolBreakdown';

interface BridgeActivityCardProps {
  orbiterData: OrbiterActivityResult | null;
  hopData: HopActivityResult | null;
  historicalComparison: HistoricalComparisonResult | null;
  isLoading?: boolean;
}

export const BridgeActivityCard: React.FC<BridgeActivityCardProps> = ({
  orbiterData,
  hopData,
  historicalComparison,
  isLoading = false
}) => {
  if (isLoading) {
    return <BridgeActivitySkeleton />;
  }

  if (!orbiterData && !hopData) {
    return <NoBridgeActivity />;
  }

  const totalBridges = (orbiterData?.totalTransactions || 0) + (hopData?.bridgeActivity.totalTransactions || 0);
  const totalVolume = parseFloat(orbiterData?.totalVolume || '0') + parseFloat(hopData?.bridgeActivity.totalVolume || '0');
  const protocolsUsed = [orbiterData?.totalTransactions, hopData?.bridgeActivity.totalTransactions].filter(Boolean).length;
  const combinedEligibilityScore = Math.round(
    ((orbiterData?.eligibilityScore || 0) + (hopData?.eligibilityMetrics.combinedScore || 0)) / 2
  );

  const percentileRank = historicalComparison?.overallPercentile.combined || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="bg-background-secondary border-gray-800 rounded-xl overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-accent-primary/10 rounded-xl flex items-center justify-center">
                <ArrowRightLeft className="w-6 h-6 text-accent-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary">Bridge Activity</h3>
                <p className="text-sm text-text-secondary">Cross-chain transaction history</p>
              </div>
            </div>
            
            {percentileRank > 0 && (
              <div className="flex items-center space-x-2">
                <Badge 
                  variant="secondary" 
                  className="bg-accent-primary/10 text-accent-primary border-accent-primary/20"
                >
                  <Award className="w-3 h-3 mr-1" />
                  Top {Math.round(100 - percentileRank)}%
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Professional metrics grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Total Bridges"
              value={totalBridges.toString()}
              icon={<Activity className="w-4 h-4" />}
              trend={totalBridges > 10 ? 'up' : totalBridges > 5 ? 'stable' : 'down'}
              trendValue={`${totalBridges > 10 ? '+' : ''}${Math.round((totalBridges / 10) * 100 - 100)}%`}
            />
            <MetricCard
              label="Total Volume"
              value={`$${formatCurrency(totalVolume)}`}
              icon={<DollarSign className="w-4 h-4" />}
              trend={totalVolume > 1000 ? 'up' : totalVolume > 500 ? 'stable' : 'down'}
              trendValue={`${totalVolume > 1000 ? '+' : ''}${Math.round((totalVolume / 1000) * 100 - 100)}%`}
            />
            <MetricCard
              label="Protocols Used"
              value={protocolsUsed.toString()}
              icon={<Network className="w-4 h-4" />}
              subtitle={getProtocolNames(orbiterData, hopData)}
            />
            <MetricCard
              label="Eligibility Score"
              value={combinedEligibilityScore.toString()}
              icon={<Award className="w-4 h-4" />}
              subtitle="/100"
              trend={combinedEligibilityScore > 70 ? 'up' : combinedEligibilityScore > 40 ? 'stable' : 'down'}
            />
          </div>

          {/* Eligibility Score Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-text-primary">Overall Eligibility Score</span>
              <span className="text-sm text-text-secondary">{combinedEligibilityScore}/100</span>
            </div>
            <Progress 
              value={combinedEligibilityScore} 
              className="h-2"
            />
            <p className="text-xs text-text-secondary">
              {getScoreDescription(combinedEligibilityScore)}
            </p>
          </div>

          {/* Professional bridge timeline visualization */}
          {(orbiterData || hopData) && (
            <BridgeActivityTimeline
              orbiterActivity={orbiterData?.routePatterns || []}
              hopActivity={hopData?.activityTimeline || []}
              showComparison={true}
              highlightBaseActivity={true}
            />
          )}

          {/* Protocol-specific breakdown */}
          <div className="grid md:grid-cols-2 gap-4">
            {orbiterData && (
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-400 mb-2">Orbiter Finance</h4>
                <p className="text-xs text-text-secondary">
                  {orbiterData.totalTransactions} transactions, ${parseFloat(orbiterData.totalVolume).toFixed(0)} volume
                </p>
              </div>
            )}
            {hopData && (
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-purple-400 mb-2">Hop Protocol</h4>
                <p className="text-xs text-text-secondary">
                  {hopData.bridgeActivity.totalTransactions} transactions, ${parseFloat(hopData.bridgeActivity.totalVolume).toFixed(0)} volume
                </p>
              </div>
            )}
          </div>

          {/* Historical comparison insights */}
          {historicalComparison && (
            <div className="bg-background-tertiary rounded-lg p-4 border border-gray-700">
              <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-accent-secondary" />
                Historical Comparison
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-accent-primary">
                    {Math.round(historicalComparison.overallPercentile.bridgeActivity)}%
                  </div>
                  <div className="text-xs text-text-secondary">Bridge Activity</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-accent-secondary">
                    {Math.round(historicalComparison.overallPercentile.volumeRanking)}%
                  </div>
                  <div className="text-xs text-text-secondary">Volume Ranking</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-accent-tertiary">
                    {Math.round(historicalComparison.overallPercentile.crossChainDiversity)}%
                  </div>
                  <div className="text-xs text-text-secondary">Chain Diversity</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-status-success">
                    {Math.round(historicalComparison.overallPercentile.combined)}%
                  </div>
                  <div className="text-xs text-text-secondary">Overall Rank</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Helper component for loading state
const BridgeActivitySkeleton: React.FC = () => (
  <Card className="bg-background-secondary border-gray-800 rounded-xl">
    <CardHeader className="pb-4">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gray-700 rounded-xl animate-pulse" />
        <div className="space-y-2">
          <div className="h-5 w-32 bg-gray-700 rounded animate-pulse" />
          <div className="h-3 w-48 bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-background-tertiary rounded-lg p-4 space-y-2">
            <div className="h-4 w-20 bg-gray-700 rounded animate-pulse" />
            <div className="h-6 w-16 bg-gray-700 rounded animate-pulse" />
            <div className="h-3 w-12 bg-gray-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="h-32 bg-background-tertiary rounded-lg animate-pulse" />
    </CardContent>
  </Card>
);

// Helper component for no bridge activity state
const NoBridgeActivity: React.FC = () => (
  <Card className="bg-background-secondary border-gray-800 rounded-xl">
    <CardContent className="py-12 text-center">
      <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
        <ArrowRightLeft className="w-8 h-8 text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">No Bridge Activity Found</h3>
      <p className="text-text-secondary mb-6 max-w-md mx-auto">
        We could not find any bridge transactions for this address. Start bridging assets to improve your airdrop eligibility.
      </p>
      <div className="space-y-2">
        <Badge variant="outline" className="mr-2">Try Orbiter Finance</Badge>
        <Badge variant="outline">Try Hop Protocol</Badge>
      </div>
    </CardContent>
  </Card>
);

// Helper functions
function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

function getProtocolNames(orbiterData: OrbiterActivityResult | null, hopData: HopActivityResult | null): string {
  const protocols = [];
  if (orbiterData?.totalTransactions) protocols.push('Orbiter');
  if (hopData?.bridgeActivity.totalTransactions) protocols.push('Hop');
  return protocols.join(' + ') || 'None';
}



function getScoreDescription(score: number): string {
  if (score >= 80) return 'Excellent bridge activity - strong airdrop eligibility';
  if (score >= 60) return 'Good bridge activity - moderate airdrop eligibility';
  if (score >= 40) return 'Fair bridge activity - some airdrop potential';
  return 'Limited bridge activity - consider increasing cross-chain usage';
}