'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Overview } from '@/components/dashboard/Overview';

export default function DemoPage() {
  return (
    <DashboardLayout>
      <Overview />
    </DashboardLayout>
  );
}
