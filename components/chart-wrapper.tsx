// Create a wrapper that only loads charts when needed
'use client';

import { lazy, Suspense } from 'react';
import { ChartData } from '@/types';

const ChartComponents = {
  bar: lazy(() => import('react-chartjs-2').then(mod => ({ default: mod.Bar }))),
  line: lazy(() => import('react-chartjs-2').then(mod => ({ default: mod.Line }))),
  // ... etc
};

export default function ChartWrapper({ type, data, title }: { type: string; data: ChartData; title?: string }) {
  const ChartComponent = ChartComponents[type as keyof typeof ChartComponents];
  
  if (!ChartComponent) return null;
  
  const ariaLabel = title || `Chart: ${type}`;
  
  return (
    <div role="img" aria-label={ariaLabel} className="chart-container">
      <Suspense fallback={<div>Loading chart...</div>}>
        <ChartComponent data={data} />
      </Suspense>
    </div>
  );
}
