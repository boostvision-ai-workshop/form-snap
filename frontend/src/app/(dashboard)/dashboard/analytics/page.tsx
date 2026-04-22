import type { Metadata } from 'next';
import { BarChart2 } from 'lucide-react';
import { ComingSoon } from '@/components/dashboard/coming-soon';

export const metadata: Metadata = {
  title: 'Analytics — FormSnap',
};

export default function AnalyticsPage() {
  return (
    <ComingSoon
      title="Analytics"
      description="Conversion funnels, drop-off, and field-level insights"
      icon={BarChart2}
      bullets={[
        'Views, starts, and completion rate per form',
        'Field-level drop-off heatmap',
        'Source attribution and time-of-day breakdowns',
      ]}
    />
  );
}
