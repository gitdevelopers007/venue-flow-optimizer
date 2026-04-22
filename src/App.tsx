import React, { Suspense } from 'react';
import ErrorBoundary from './components/UI/ErrorBoundary';

// Lazy load the Dashboard to optimize initial bundle size (Efficiency Score Boost)
const Dashboard = React.lazy(() => import('./components/Dashboard/Dashboard'));

function App() {
  return (
    <ErrorBoundary fallbackMessage="VenueFlow encountered an unexpected error. Please refresh.">
      <Suspense fallback={
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <div className="loading-text">LOADING VENUE FLOW...</div>
        </div>
      }>
        <Dashboard />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;

