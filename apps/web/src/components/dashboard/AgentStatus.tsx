'use client';

import { getRelativeTimeString, getStatusColor } from '@/lib/utils';

interface Agent {
  name: string;
  status: 'running' | 'success' | 'failed' | 'pending';
  lastRun: string;
  nextRun?: string;
  recordsProcessed?: number;
  duration?: number;
  error?: string;
}

interface AgentStatusProps {
  agents?: Agent[];
}

export function AgentStatus({ agents = [] }: AgentStatusProps) {
  const mockAgents: Agent[] = [
    {
      name: 'Ingestor-Google',
      status: 'success',
      lastRun: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
      nextRun: new Date(Date.now() + 1000 * 60 * 90).toISOString(), // 90 min from now
      recordsProcessed: 1247,
      duration: 23,
    },
    {
      name: 'Ingestor-Reddit',
      status: 'running',
      lastRun: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min ago
      recordsProcessed: 89,
    },
    {
      name: 'Touchpoint-Extractor',
      status: 'success',
      lastRun: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min ago
      nextRun: new Date(Date.now() + 1000 * 60 * 5).toISOString(), // 5 min from now
      recordsProcessed: 456,
      duration: 8,
    },
    {
      name: 'Conversion-Uploader',
      status: 'failed',
      lastRun: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      error: 'API quota exceeded',
    },
    {
      name: 'Budget-Optimizer',
      status: 'pending',
      lastRun: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
      nextRun: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), // 2 hours from now
    },
  ];

  const displayAgents = agents.length > 0 ? agents : mockAgents;

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-slate-900">Agent Status</h3>
            <p className="mt-1 text-sm text-slate-500">
              Automated job status and health
            </p>
          </div>
          <a
            href="/agents"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Manage →
          </a>
        </div>
      </div>

      <div className="divide-y divide-slate-200">
        {displayAgents.map((agent, index) => (
          <div key={index} className="p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <h4 className="text-sm font-medium text-slate-900 truncate">
                    {agent.name}
                  </h4>
                  <span className={`ml-2 ${getStatusColor(agent.status)}`}>
                    {agent.status}
                  </span>
                </div>
                
                <div className="mt-1 flex items-center text-xs text-slate-500 space-x-4">
                  <span>
                    Last run: {getRelativeTimeString(new Date(agent.lastRun))}
                  </span>
                  
                  {agent.nextRun && (
                    <span>
                      Next: {getRelativeTimeString(new Date(agent.nextRun))}
                    </span>
                  )}
                  
                  {agent.recordsProcessed && (
                    <span>
                      {agent.recordsProcessed} records
                    </span>
                  )}
                  
                  {agent.duration && (
                    <span>
                      {agent.duration}s
                    </span>
                  )}
                </div>

                {agent.error && (
                  <div className="mt-1 text-xs text-red-600">
                    Error: {agent.error}
                  </div>
                )}
              </div>

              <div className="ml-4 flex-shrink-0">
                {agent.status === 'running' && (
                  <div className="h-4 w-4 relative">
                    <div className="absolute inset-0 h-4 w-4 bg-blue-600 rounded-full animate-ping opacity-75"></div>
                    <div className="relative h-4 w-4 bg-blue-600 rounded-full"></div>
                  </div>
                )}
                
                {agent.status === 'success' && (
                  <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                
                {agent.status === 'failed' && (
                  <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                )}
                
                {agent.status === 'pending' && (
                  <svg className="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 py-3 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-green-600">
              <div className="h-2 w-2 bg-green-500 rounded-full mr-1"></div>
              {displayAgents.filter(a => a.status === 'success').length} Healthy
            </span>
            <span className="flex items-center text-blue-600">
              <div className="h-2 w-2 bg-blue-500 rounded-full mr-1"></div>
              {displayAgents.filter(a => a.status === 'running').length} Running
            </span>
            <span className="flex items-center text-red-600">
              <div className="h-2 w-2 bg-red-500 rounded-full mr-1"></div>
              {displayAgents.filter(a => a.status === 'failed').length} Failed
            </span>
          </div>
          
          <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
            Run All
          </button>
        </div>
      </div>
    </div>
  );
}
