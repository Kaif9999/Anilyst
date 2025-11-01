// Create a wrapper that only loads charts when needed
'use client';

import { lazy, Suspense } from 'react';
import { ChartData } from '@/types';

const ChartComponents = {
  bar: lazy(() => import('react-chartjs-2').then(mod => ({ default: mod.Bar }))),
  line: lazy(() => import('react-chartjs-2').then(mod => ({ default: mod.Line }))),
  // ... etc
};

export default function ChartWrapper({ type, data }: { type: string; data: ChartData }) {
  const ChartComponent = ChartComponents[type];
  
  if (!ChartComponent) return null;
  
  return (
    <Suspense fallback={<div>Loading chart...</div>}>
      <ChartComponent data={data} />
    </Suspense>
  );
}
