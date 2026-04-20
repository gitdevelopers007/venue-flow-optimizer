import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../components/Dashboard/Dashboard';

// Mock the VenueMap to avoid Google Maps API loading issues in tests
vi.mock('../components/Map/VenueMap', () => ({
  default: () => <div data-testid="mock-venue-map">Neural Map Simulator Active</div>,
}));

// Mock the SmartAssistant
vi.mock('../components/Assistant/SmartAssistant', () => ({
  default: () => <div data-testid="mock-smart-assistant">Smart Assistant</div>,
}));

describe('Dashboard Component - Integration Tests', () => {
  it('renders the core dashboard elements successfully', () => {
    render(<Dashboard />);
    
    // Check Title
    expect(screen.getByText('VenueFlow Optimizer')).toBeInTheDocument();
    expect(screen.getByText('Real-time Coordination System')).toBeInTheDocument();
    
    // Check Map is rendered
    expect(screen.getByTestId('mock-venue-map')).toBeInTheDocument();
    
    // Check Assistant is rendered
    expect(screen.getByTestId('mock-smart-assistant')).toBeInTheDocument();
    
    // Check initial default view (Heatmap Insights)
    expect(screen.getByText('Live Insights')).toBeInTheDocument();
    expect(screen.getByText('Main Entrance')).toBeInTheDocument();
  });

  it('toggles Mobility-First mode and maintains ADA compliance state', () => {
    render(<Dashboard />);
    
    const mobilityToggle = screen.getByRole('button', { name: /MOBILITY FIRST/i });
    expect(mobilityToggle).toHaveAttribute('aria-pressed', 'false');
    
    fireEvent.click(mobilityToggle);
    expect(mobilityToggle).toHaveAttribute('aria-pressed', 'true');
  });

  it('switches tabs between Explore, Navigate, and Queue', () => {
    render(<Dashboard />);
    
    // Default is explore, Live Insights should be visible
    expect(screen.getByText('Live Insights')).toBeInTheDocument();
    
    // Switch to Facilities (Queue)
    const queueTab = screen.getByRole('tab', { name: /Facility Queues/i });
    fireEvent.click(queueTab);
    
    // The mock Virtual Queue component (or its props text) should now be visible instead of Insights
    expect(screen.queryByText('Live Insights')).not.toBeInTheDocument();
    expect(screen.getByText('Nitro Burgers & Shakes')).toBeInTheDocument();
  });
});
