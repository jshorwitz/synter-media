'use client';

import { useEffect } from 'react';
import { setupLauncherCleanup } from '@/utils/launcher-cleanup';

export function Launcher() {
  useEffect(() => {
    // Prevent multiple mounts of the same launcher
    if ((window as any).__launcherMounted) return;
    (window as any).__launcherMounted = true;

    // Set up cleanup for duplicate launchers
    const observer = setupLauncherCleanup();

    // Initialize any third-party launcher widget here if needed
    // For example, if using a feedback widget like Nolt, UserVoice, etc.
    
    return () => {
      (window as any).__launcherMounted = false;
      observer?.disconnect();
    };
  }, []);

  return (
    <div className="launcher-container fixed top-4 right-4 z-40 pointer-events-auto">
      {/* Placeholder for actual launcher content - replace with your feedback widget */}
      <button
        className="launcher h-12 w-12 bg-synter-volt hover:bg-synter-volt-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-synter-surface font-bold"
        aria-label="Feedback launcher"
      >
        N
      </button>
    </div>
  );
}
