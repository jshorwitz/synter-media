'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to PPC dashboard as the default landing page
    router.push('/ppc');
  }, [router]);

  return (
    <div className="min-h-screen bg-carbon-900 flex items-center justify-center">
      <div className="text-text-mid">Redirecting...</div>
    </div>
  );
}
