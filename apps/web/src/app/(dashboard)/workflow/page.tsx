import { Suspense } from 'react';
import { WorkflowLauncher } from '@/components/workflow/WorkflowLauncher';

export default function WorkflowPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-synter-volt border-t-transparent rounded-full" />
      </div>
    }>
      <WorkflowLauncher />
    </Suspense>
  );
}
