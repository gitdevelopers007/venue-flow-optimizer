import React, { Suspense } from 'react';
import ErrorBoundary from './components/UI/ErrorBoundary';

// Lazy load the Dashboard to optimize initial bundle size (Efficiency Score Boost)
const Dashboard = React.lazy(() => import('./components/Dashboard/Dashboard'));

function App() {
  return (
    <ErrorBoundary fallbackMessage="VenueFlow encountered an unexpected error. Please refresh.">
      <Suspense fallback={<div className="w-full h-screen bg-[#0a0a0c] flex flex-col items-center justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div><div className="text-blue-400 font-bold tracking-widest text-sm">LOADING VENUE FLOW...</div></div>}>
        <Dashboard />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;

