'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, Calendar, DollarSign } from 'lucide-react';

interface BridgeVolumeData {
  date: string;
  orbiterVolume: number;
  hopVolume: number;
  totalVolume: number;
  transactionCount: number;
}

interface BridgeVolumeChartProps {
  data: BridgeVolumeData[];
  timeframe: '7d' | '30d' | '90d' | '1y';
  showComparison?: boolean;
  className?: string;
}

export const BridgeVolumeChart: React.FC<BridgeVolumeChartProps> = ({
  data,
  timeframe,
  showComparison = true,
  className = ''
}) => {
  const maxVolume = Math.max(...data.map(d => d.totalVolume));
  const totalVolume = data.reduce((sum, d) => sum + d.totalVolume, 0);
  const totalTransactions = data.reduce((sum, d) => sum + d.transactionCount, 0);
  const avgVolume = totalVolume / data.length;

  // Calculate growth
  const firstVolume = data[0]?.totalVolume || 0;
  const lastVolume = data[data.length - 1]?.totalVolume || 0;
  const growth = firstVolume > 0 ? ((lastVolume - firstVolume) / firstVolume) * 100 : 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    switch (timeframe) {
      case '7d':
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      case '30d':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case '90d':
      case '1y':
        return date.toLocaleDateString('en-US', { month: 'short' });
      default:
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(1)}K`;
    return `$${volume.toFixed(0)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="bg-background-secondary border-white/10 dark:border-white/10 border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-text-primary flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-accent-primary" />
                Bridge Volume Over Time
              </CardTitle>
              <p className="text-sm text-text-secondary mt-1">
                Cross-chain transaction volume analysis
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-text-primary">
                {formatVolume(totalVolume)}
              </div>
              <div className="text-xs text-text-secondary">Total Volume</div>
              <div className={`text-xs font-medium flex items-center mt-1 ${
                growth >= 0 ? 'text-status-success' : 'text-status-error'
              }`}>
                <TrendingUp className={`w-3 h-3 mr-1 ${growth < 0 ? 'rotate-180' : ''}`} />
                {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Chart */}
          <div className="relative h-48">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border-t border-white/10 dark:border-white/10 border-gray-200" />
              ))}
            </div>
            
            {/* Volume bars */}
            <div className="absolute inset-0 flex items-end justify-between space-x-1">
              {data.map((item, index) => (
                <motion.div
                  key={item.date}
                  initial={{ height: 0 }}
                  animate={{ height: `${(item.totalVolume / maxVolume) * 100}%` }}
                  transition={{ duration: 0.8, delay: index * 0.05 }}
                  className="flex-1 group relative"
                >
                  {/* Stacked bars for comparison */}
                  {showComparison ? (
                    <div className="w-full h-full flex flex-col justify-end">
                      <motion.div
                        className="w-full bg-blue-500 rounded-t-sm"
                        style={{ 
                          height: `${(item.orbiterVolume / item.totalVolume) * 100}%`
                        }}
                        initial={{ height: 0 }}
                        animate={{ height: `${(item.orbiterVolume / item.totalVolume) * 100}%` }}
                        transition={{ duration: 0.8, delay: index * 0.05 + 0.2 }}
                      />
                      <motion.div
                        className="w-full bg-purple-500"
                        style={{ 
                          height: `${(item.hopVolume / item.totalVolume) * 100}%`
                        }}
                        initial={{ height: 0 }}
                        animate={{ height: `${(item.hopVolume / item.totalVolume) * 100}%` }}
                        transition={{ duration: 0.8, delay: index * 0.05 + 0.4 }}
                      />
                    </div>
                  ) : (
                    <div
                      className="w-full bg-gradient-to-t from-accent-primary to-accent-secondary rounded-t-sm"
                      style={{ height: '100%' }}
                    />
                  )}
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-background-tertiary border border-white/10 dark:border-white/10 border-gray-200 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap shadow-lg">
                    <div className="text-xs space-y-1">
                      <div className="font-medium text-text-primary">
                        {formatDate(item.date)}
                      </div>
                      <div className="text-accent-primary">
                        Total: {formatVolume(item.totalVolume)}
                      </div>
                      {showComparison && (
                        <>
                          <div className="text-blue-400">
                            Orbiter: {formatVolume(item.orbiterVolume)}
                          </div>
                          <div className="text-purple-400">
                            Hop: {formatVolume(item.hopVolume)}
                          </div>
                        </>
                      )}
                      <div className="text-text-secondary">
                        {item.transactionCount} transactions
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Y-axis labels */}
            <div className="absolute left-0 inset-y-0 flex flex-col justify-between text-xs text-text-secondary -ml-12">
              {[...Array(5)].map((_, i) => (
                <span key={i}>
                  {formatVolume((maxVolume * (4 - i)) / 4)}
                </span>
              ))}
            </div>
          </div>
          
          {/* X-axis labels */}
          <div className="flex justify-between text-xs text-text-secondary">
            {data.map((item, index) => (
              <span key={index} className="truncate">
                {formatDate(item.date)}
              </span>
            ))}
          </div>
          
          {/* Legend and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Legend */}
            {showComparison && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-text-primary">Protocols</h4>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm" />
                    <span className="text-xs text-text-secondary">Orbiter Finance</span>
                    <Badge variant="outline" className="text-xs">
                      {formatVolume(data.reduce((sum, d) => sum + d.orbiterVolume, 0))}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-sm" />
                    <span className="text-xs text-text-secondary">Hop Protocol</span>
                    <Badge variant="outline" className="text-xs">
                      {formatVolume(data.reduce((sum, d) => sum + d.hopVolume, 0))}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
            
            {/* Stats */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-text-primary">Statistics</h4>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary flex items-center">
                    <DollarSign className="w-3 h-3 mr-1" />
                    Avg Daily Volume
                  </span>
                  <span className="text-xs font-medium text-text-primary">
                    {formatVolume(avgVolume)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Total Transactions
                  </span>
                  <span className="text-xs font-medium text-text-primary">
                    {totalTransactions}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Peak Day
                  </span>
                  <span className="text-xs font-medium text-text-primary">
                    {formatVolume(maxVolume)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};