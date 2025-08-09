'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Target, Star, TrendingUp } from 'lucide-react';

interface ProjectMetric {
  projectName: string;
  projectSymbol: string;
  metrics: {
    engagement: number;
    alignment: number;
    frequency: number;
    quality: number;
    influence: number;
    potential: number;
  };
  color: string;
}

interface ProjectEngagementRadarProps {
  projects: ProjectMetric[];
  maxProjects?: number;
  showComparison?: boolean;
  className?: string;
}

export const ProjectEngagementRadar: React.FC<ProjectEngagementRadarProps> = ({
  projects,
  maxProjects = 3,
  showComparison = true,
  className = ''
}) => {
  const displayProjects = projects.slice(0, maxProjects);
  const radarSize = 200;
  const center = radarSize / 2;
  const maxRadius = center - 20;
  
  const metrics = [
    { key: 'engagement', label: 'Engagement', angle: 0 },
    { key: 'alignment', label: 'Alignment', angle: 60 },
    { key: 'frequency', label: 'Frequency', angle: 120 },
    { key: 'quality', label: 'Quality', angle: 180 },
    { key: 'influence', label: 'Influence', angle: 240 },
    { key: 'potential', label: 'Potential', angle: 300 }
  ];

  const getCoordinates = (angle: number, radius: number) => {
    const radian = (angle - 90) * (Math.PI / 180);
    return {
      x: center + radius * Math.cos(radian),
      y: center + radius * Math.sin(radian)
    };
  };

  const createPolygonPath = (project: ProjectMetric) => {
    const points = metrics.map(metric => {
      const value = project.metrics[metric.key as keyof typeof project.metrics];
      const radius = (value / 100) * maxRadius;
      return getCoordinates(metric.angle, radius);
    });
    
    return points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ') + ' Z';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center">
            <Target className="w-5 h-5 mr-2 text-secondary" />
            Project Engagement Radar
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Multi-dimensional analysis of project engagement patterns
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Radar Chart */}
          <div className="flex justify-center">
            <div className="relative">
              <svg width={radarSize} height={radarSize} className="overflow-visible">
                {/* Grid circles */}
                {[20, 40, 60, 80, 100].map(percentage => (
                  <circle
                    key={percentage}
                    cx={center}
                    cy={center}
                    r={(percentage / 100) * maxRadius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-gray-700/30"
                  />
                ))}
                
                {/* Grid lines */}
                {metrics.map(metric => {
                  const endPoint = getCoordinates(metric.angle, maxRadius);
                  return (
                    <line
                      key={metric.key}
                      x1={center}
                      y1={center}
                      x2={endPoint.x}
                      y2={endPoint.y}
                      stroke="currentColor"
                      strokeWidth="1"
                      className="text-gray-700/30"
                    />
                  );
                })}
                
                {/* Project polygons */}
                {displayProjects.map((project, index) => (
                  <motion.g key={project.projectName}>
                    <motion.path
                      d={createPolygonPath(project)}
                      fill={project.color}
                      fillOpacity="0.1"
                      stroke={project.color}
                      strokeWidth="2"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                    
                    {/* Data points */}
                    {metrics.map(metric => {
                      const value = project.metrics[metric.key as keyof typeof project.metrics];
                      const radius = (value / 100) * maxRadius;
                      const point = getCoordinates(metric.angle, radius);
                      
                      return (
                        <motion.circle
                          key={`${project.projectName}-${metric.key}`}
                          cx={point.x}
                          cy={point.y}
                          r="3"
                          fill={project.color}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.2 + 0.5 }}
                          className="hover:r-4 transition-all cursor-pointer"
                        />
                      );
                    })}
                  </motion.g>
                ))}
              </svg>
              
              {/* Metric labels */}
              {metrics.map(metric => {
                const labelPoint = getCoordinates(metric.angle, maxRadius + 15);
                return (
                  <div
                    key={metric.key}
                    className="absolute text-xs text-text-secondary font-medium transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: labelPoint.x,
                      top: labelPoint.y
                    }}
                  >
                    {metric.label}
                  </div>
                );
              })}
              
              {/* Center score */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center bg-muted rounded-full w-12 h-12 flex items-center justify-center border border-border">
                  <div className="text-xs font-bold text-foreground">
                    {Math.round(
                      displayProjects.reduce((sum, project) => {
                        const avgScore = Object.values(project.metrics).reduce((a, b) => a + b, 0) / 6;
                        return sum + avgScore;
                      }, 0) / displayProjects.length
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center">
              <Star className="w-4 h-4 mr-2" />
              Projects
            </h4>
            <div className="space-y-2">
              {displayProjects.map((project, index) => (
                <motion.div
                  key={project.projectName}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-2 bg-muted rounded-lg border border-border"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {project.projectName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {project.projectSymbol}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-bold text-foreground">
                      {Math.round(
                        Object.values(project.metrics).reduce((a, b) => a + b, 0) / 6
                      )}/100
                    </div>
                    <div className="text-xs text-muted-foreground">Avg Score</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Metric Breakdown */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Metric Breakdown
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {metrics.map(metric => {
                const avgScore = displayProjects.reduce((sum, project) => {
                  return sum + project.metrics[metric.key as keyof typeof project.metrics];
                }, 0) / displayProjects.length;
                
                return (
                  <div key={metric.key} className="text-center">
                    <div className="text-lg font-bold text-foreground">
                      {Math.round(avgScore)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {metric.label}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs mt-1 ${
                        avgScore >= 80 ? 'border-green-500 text-green-500 dark:border-green-400 dark:text-green-400' :
                        avgScore >= 60 ? 'border-primary text-primary' :
                        avgScore >= 40 ? 'border-yellow-500 text-yellow-500 dark:border-yellow-400 dark:text-yellow-400' :
                        'border-red-500 text-red-500 dark:border-red-400 dark:text-red-400'
                      }`}
                    >
                      {avgScore >= 80 ? 'Excellent' :
                       avgScore >= 60 ? 'Good' :
                       avgScore >= 40 ? 'Fair' : 'Poor'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Insights */}
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 rounded-lg p-4 border border-primary/20">
            <h4 className="text-sm font-medium text-foreground mb-2">Key Insights</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              {displayProjects.length > 0 && (
                <>
                  <div>
                    • Strongest area: {
                      metrics.reduce((best, metric) => {
                        const avgScore = displayProjects.reduce((sum, project) => {
                          return sum + project.metrics[metric.key as keyof typeof project.metrics];
                        }, 0) / displayProjects.length;
                        
                        const bestAvgScore = displayProjects.reduce((sum, project) => {
                          return sum + project.metrics[best.key as keyof typeof project.metrics];
                        }, 0) / displayProjects.length;
                        
                        return avgScore > bestAvgScore ? metric : best;
                      }).label
                    }
                  </div>
                  <div>
                    • Top performer: {
                      displayProjects.reduce((best, project) => {
                        const bestAvg = Object.values(best.metrics).reduce((a, b) => a + b, 0) / 6;
                        const projectAvg = Object.values(project.metrics).reduce((a, b) => a + b, 0) / 6;
                        return projectAvg > bestAvg ? project : best;
                      }).projectName
                    }
                  </div>
                  <div>
                    • Engagement diversity: {displayProjects.length} project{displayProjects.length !== 1 ? 's' : ''} tracked
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};