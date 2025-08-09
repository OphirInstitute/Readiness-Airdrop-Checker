'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Rocket, 
  TrendingUp, 
  Target,
  AlertCircle
} from 'lucide-react';
import type { ProjectEngagement, TrendingProject } from '../lib/types';

interface ProjectEngagementChartProps {
  projects: ProjectEngagement[];
  trendingOpportunities: TrendingProject[];
}

export const ProjectEngagementChart: React.FC<ProjectEngagementChartProps> = ({
  projects,
  trendingOpportunities
}) => {
  const topProjects = projects.slice(0, 6);
  const topOpportunities = trendingOpportunities.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Project Engagements */}
      <Card className="bg-background-secondary border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-text-primary flex items-center">
            <Target className="w-5 h-5 mr-2 text-accent-secondary" />
            Top Project Engagements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topProjects.length > 0 ? (
            <div className="space-y-4">
              {topProjects.map((project, index) => (
                <motion.div
                  key={project.projectName}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-background-tertiary rounded-lg border border-gray-700/50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-accent-primary">
                        {project.projectSymbol.charAt(0)}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-text-primary">
                          {project.projectName}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {project.projectSymbol}
                        </Badge>
                        {project.airdropPotential > 70 && (
                          <Badge className="bg-status-success/10 text-status-success border-status-success/20 text-xs">
                            High Potential
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-text-secondary">
                          {project.discussionCount} discussions
                        </span>
                        <span className="text-xs text-text-secondary">
                          Rank #{project.communityRank}
                        </span>
                        <span className="text-xs text-text-secondary">
                          {formatDate(project.lastEngagement)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <div className="text-sm font-bold text-text-primary">
                      {project.engagementScore}/100
                    </div>
                    <div className="w-16">
                      <Progress 
                        value={project.engagementScore} 
                        className="h-1"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-text-secondary">No project engagements found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trending Opportunities */}
      <Card className="bg-gradient-to-r from-orange-900/10 to-red-900/10 border-orange-500/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-text-primary flex items-center">
            <Rocket className="w-5 h-5 mr-2 text-orange-400" />
            Trending Airdrop Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topOpportunities.length > 0 ? (
            <div className="space-y-4">
              {topOpportunities.map((opportunity, index) => (
                <motion.div
                  key={opportunity.projectName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 bg-background-tertiary rounded-lg border border-orange-500/20"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-orange-400">
                          {opportunity.projectSymbol}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-semibold text-text-primary">
                          {opportunity.projectName}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            className={`text-xs ${getUrgencyStyle(opportunity.timeToAct)}`}
                          >
                            {opportunity.timeToAct.charAt(0).toUpperCase() + opportunity.timeToAct.slice(1)}
                          </Badge>
                          <span className="text-xs text-text-secondary">
                            {opportunity.airdropLikelihood}% likelihood
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-orange-400">
                        {opportunity.trendingScore}
                      </div>
                      <div className="text-xs text-text-secondary">Trending</div>
                    </div>
                  </div>
                  
                  {/* Recommended Actions */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-medium text-text-primary flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Recommended Actions
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {opportunity.recommendedActions.slice(0, 3).map((action, actionIndex) => (
                        <Badge 
                          key={actionIndex}
                          variant="outline" 
                          className="text-xs bg-orange-500/5 border-orange-500/20"
                        >
                          {action}
                        </Badge>
                      ))}
                      {opportunity.recommendedActions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{opportunity.recommendedActions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Eligibility Criteria */}
                  {opportunity.eligibilityCriteria.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-700/50">
                      <h5 className="text-xs font-medium text-text-primary flex items-center mb-2">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Key Criteria
                      </h5>
                      <div className="text-xs text-text-secondary">
                        {opportunity.eligibilityCriteria.slice(0, 2).join(' • ')}
                        {opportunity.eligibilityCriteria.length > 2 && ' • ...'}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Rocket className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-text-secondary">No trending opportunities found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions
function formatDate(date: Date): string {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}mo ago`;
  return `${Math.floor(diffInDays / 365)}y ago`;
}

function getUrgencyStyle(timeToAct: 'urgent' | 'soon' | 'monitor'): string {
  switch (timeToAct) {
    case 'urgent':
      return 'bg-status-error/10 text-status-error border-status-error/20';
    case 'soon':
      return 'bg-status-warning/10 text-status-warning border-status-warning/20';
    case 'monitor':
      return 'bg-status-info/10 text-accent-primary border-accent-primary/20';
    default:
      return 'bg-gray-500/10 text-text-secondary border-gray-500/20';
  }
}