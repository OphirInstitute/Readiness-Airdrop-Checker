import React from 'react';
import { render, screen } from '@testing-library/react';
import { BridgeActivityCard } from '../BridgeActivityCard';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('BridgeActivityCard', () => {
  it('renders no bridge activity state when no data provided', () => {
    render(
      <BridgeActivityCard
        orbiterData={null}
        hopData={null}
        historicalComparison={null}
        isLoading={false}
      />
    );

    expect(screen.getByText('No Bridge Activity Found')).toBeInTheDocument();
    expect(screen.getByText(/could not find any bridge transactions/i)).toBeInTheDocument();
  });

  it('renders loading state when isLoading is true', () => {
    render(
      <BridgeActivityCard
        orbiterData={null}
        hopData={null}
        historicalComparison={null}
        isLoading={true}
      />
    );

    // Check for loading skeleton elements
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});