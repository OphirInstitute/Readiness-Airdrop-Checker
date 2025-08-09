'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  ArrowRightLeft, 
  Calendar, 
  DollarSign,
  ExternalLink,
  Layers
} from 'lucide-react';

interface BridgeTransaction {
  fromChain: string;
  toChain: string;
  transactionCount: number;
  volume: string;
  averageFee: string;
}

interface TimelineActivity {
  timestamp: number;
  type: 'bridge' | 'lp_deposit' | 'lp_withdraw' | 'rewards_claim';
  amount: string;
  token: string;
  chain: string;
  details: Record<string, unknown>;
}

interface BridgeActivityTimelineProps {
  orbiterActivity: BridgeTransaction[];
  hopActivity: TimelineActivity[];
  showComparison?: boolean;
  highlightBaseActivity?: boolean;
}

export const BridgeActivityTimeline: React.FC<BridgeActivityTimelineProps> = ({
  orbiterActivity,
  hopActivity,
  showComparison = true,
  highlightBaseActivity = true
}) => {
  // Combine and sort activities by volume for display
  const combinedActivities = [
    ...orbiterActivity.map(activity => ({
      ...activity,
      protocol: 'Orbiter Finance',
      color: 'blue',
      timestamp: Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 // Mock timestamp
    })),
    ...hopActivity.slice(0, 10).map(activity => ({
      fromChain: activity.chain,
      toChain: activity.details.destinationChain as string || 'Unknown',
      transactionCount: 1,
      volume: activity.amount,
      averageFee: '0',
      protocol: 'Hop Protocol',
      color: 'purple',
      timestamp: activity.timestamp,
      token: activity.token,
      type: activity.type
    }))
  ].sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume)).slice(0, 8);

  if (combinedActivities.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-8 text-center">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
            <ArrowRightLeft className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No bridge activity to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center">
          <Layers className="w-4 h-4 mr-2 text-primary" />
          Bridge Activity Timeline
          {showComparison && (
            <Badge variant="outline" className="ml-2 text-xs">
              Top {combinedActivities.length} Transactions
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {combinedActivities.map((activity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`
              relative p-3 rounded-lg border transition-colors
              ${activity.protocol === 'Orbiter Finance' 
                ? 'bg-blue-500/5 border-blue-500/20 hover:border-blue-500/30' 
                : 'bg-purple-500/5 border-purple-500/20 hover:border-purple-500/30'
              }
              ${highlightBaseActivity && (activity.toChain?.toLowerCase().includes('base') || activity.fromChain?.toLowerCase().includes('base'))
                ? 'ring-1 ring-accent-tertiary/30'
                : ''
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${activity.protocol === 'Orbiter Finance' 
                    ? 'bg-blue-500/10' 
                    : 'bg-purple-500/10'
                  }
                `}>
                  <ArrowRightLeft className={`
                    w-4 h-4
                    ${activity.protocol === 'Orbiter Finance' 
                      ? 'text-blue-400' 
                      : 'text-purple-400'
                    }
                  `} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground">
                      {activity.fromChain}
                    </span>
                    <ArrowRightLeft className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {activity.toChain}
                    </span>
                    {(activity.toChain?.toLowerCase().includes('base') || activity.fromChain?.toLowerCase().includes('base')) && (
                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                        Base
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        ${formatNumber(parseFloat(activity.volume))}
                      </span>
                    </div>
                    
                    {activity.transactionCount > 1 && (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground">
                          {activity.transactionCount}x
                        </span>
                      </div>
                    )}
                    
                    {activity.token && (
                      <Badge variant="outline" className="text-xs">
                        {activity.token}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${
                    activity.protocol === 'Orbiter Finance' 
                      ? 'bg-blue-500/10 text-blue-400' 
                      : 'bg-purple-500/10 text-purple-400'
                  }`}
                >
                  {activity.protocol === 'Orbiter Finance' ? 'Orbiter' : 'Hop'}
                </Badge>
                
                {activity.timestamp && (
                  <div className="flex items-center space-x-1 mt-1">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(activity.timestamp)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {parseFloat(activity.averageFee) > 0 && (
              <div className="mt-2 pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Avg Fee: ${parseFloat(activity.averageFee).toFixed(2)}
                </span>
              </div>
            )}
          </motion.div>
        ))}
        
        {(orbiterActivity.length + hopActivity.length) > 8 && (
          <div className="text-center pt-2">
            <button className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center space-x-1 mx-auto">
              <span>View all {orbiterActivity.length + hopActivity.length} transactions</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper functions
function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}mo ago`;
  return `${Math.floor(diffInDays / 365)}y ago`;
}