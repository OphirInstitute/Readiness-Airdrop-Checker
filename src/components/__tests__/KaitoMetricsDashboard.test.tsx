import React from 'react';
import { render, screen } from '@testing-library/react';
import { KaitoMetricsDashboard } from '../KaitoMetricsDashboard';
import type { EnhancedKaitoResult } from '../../lib/types';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  },
}));

const mockKaitoData: EnhancedKaitoResult = {
  basicMetrics: {
    yapScore: 85,
    weeklyYaps: 12,
    totalYaps: 450,
    alignmentScore: 78,
    leaderboardRank: 156
  },
  engagementMetrics: {
    averageEngagementRate: 0.045,
    replyRate: 0.23,
    retweetRatio: 1.8,
    communityInteraction: 67,
    influenceScore: 72
  },
  activityTrends: {
    dailyActivity: [
      { date: '2024-01-01', yaps: 3, engagement: 15, reach: 1200 },
      { date: '2024-01-02', yaps: 5, engagement: 22, reach: 1800 }
    ],
    weeklyGrowth: 12.5,
    monthlyGrowth: 8.3,
    consistencyScore: 85
  },
  airdropEligibility: {
    eligibilityScore: 78,
    eligibilityFactors: [
      { factor: 'Activity Level', score: 85, weight: 0.3, description: 'High activity', improvement: 'Maintain consistency' },
      { factor: 'Engagement Quality', score: 72, weight: 0.25, description: 'Good engagement', improvement: 'Increase reply rate' }
    ],
    recommendations: [
      { type: 'engagement', priority: 'high', title: 'Increase replies', description: 'Reply more to build community', actionItems: ['Reply to trending topics'], expectedImpact: 15 }
    ]
  }
};

describe('KaitoMetricsDashboard', () => {
  it('renders Kaito metrics when data is provided', () => {
    render(
      <KaitoMetricsDashboard
        address="0x123"
        kaitoData={mockKaitoData}
        projectEngagement={null}
        socialInfluence={null}
        isLoading={false}
      />
    );

    expect(screen.getByText('Kaito Social Metrics')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument(); // Yap Score
    expect(screen.getByText('Weekly Yaps')).toBeInTheDocument();
    expect(screen.getByText('Alignment Score')).toBeInTheDocument();
  });

  it('renders no activity state when no data provided', () => {
    render(
      <KaitoMetricsDashboard
        address="0x123"
        kaitoData={null}
        projectEngagement={null}
        socialInfluence={null}
        isLoading={false}
      />
    );

    expect(screen.getByText('No Kaito Activity Found')).toBeInTheDocument();
    expect(screen.getByText(/could not find any Kaito social activity/i)).toBeInTheDocument();
  });

  it('renders loading state when isLoading is true', () => {
    render(
      <KaitoMetricsDashboard
        address="0x123"
        kaitoData={null}
        projectEngagement={null}
        socialInfluence={null}
        isLoading={true}
      />
    );

    // Check for loading skeleton elements
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});