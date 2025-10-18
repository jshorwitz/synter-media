'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface WaitlistLead {
  id: number;
  email: string;
  company: string | null;
  role: string | null;
  ad_spend: number | null;
  status: 'JOINED' | 'INVITED' | 'ACTIVATED';
  invited_at: string | null;
  activated_at: string | null;
  created_at: string;
  source: string | null;
}

interface Metrics {
  totals: {
    total: number;
    joined: number;
    invited: number;
    activated: number;
  };
  conversion: {
    inviteToActivation: number;
  };
  recent: {
    signups: number;
    invites: number;
    activations: number;
  };
}

export default function AdminWaitlistPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [leads, setLeads] = useState<WaitlistLead[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [inviting, setInviting] = useState<number | null>(null);

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Fetch leads
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('q', search);

      const response = await fetch(`/api/admin/waitlist/leads?${params}`);
      const data = await response.json();
      
      setLeads(data.items || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch metrics
  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/waitlist/metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN' || user?.role === 'admin') {
      fetchLeads();
      fetchMetrics();
    }
  }, [page, statusFilter, search, user]);

  const handleInvite = async (leadId: number) => {
    try {
      setInviting(leadId);
      const response = await fetch(`/api/admin/waitlist/leads/${leadId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Invite sent! URL: ${data.inviteUrl}`);
        fetchLeads();
        fetchMetrics();
      }
    } catch (error) {
      console.error('Error sending invite:', error);
      alert('Failed to send invite');
    } finally {
      setInviting(null);
    }
  };

  const handleActivate = async (leadId: number) => {
    try {
      const response = await fetch(`/api/admin/waitlist/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVATED' }),
      });

      if (response.ok) {
        fetchLeads();
        fetchMetrics();
      }
    } catch (error) {
      console.error('Error activating lead:', error);
      alert('Failed to activate lead');
    }
  };

  const formatCurrency = (cents: number | null) => {
    if (!cents) return '-';
    return `$${(cents / 100).toLocaleString()}`;
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      JOINED: 'bg-accent-amber/10 text-accent-amber border-accent-amber/30',
      INVITED: 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30',
      ACTIVATED: 'bg-accent-lime/10 text-accent-lime border-accent-lime/30',
    };
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-mono rounded border ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    );
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'admin')) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-text-hi mb-2">
          Waitlist Management
        </h1>
        <p className="text-text-mid">
          Manage signups, send invites, and track conversions
        </p>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="panel p-6">
            <div className="text-text-low text-xs font-mono uppercase tracking-wider mb-2">
              Total Leads
            </div>
            <div className="text-3xl font-display font-bold text-text-hi">
              {metrics.totals.total}
            </div>
            <div className="text-xs text-text-low mt-1">
              +{metrics.recent.signups} last 7 days
            </div>
          </div>
          
          <div className="panel p-6">
            <div className="text-text-low text-xs font-mono uppercase tracking-wider mb-2">
              Joined
            </div>
            <div className="text-3xl font-display font-bold text-accent-amber">
              {metrics.totals.joined}
            </div>
            <div className="text-xs text-text-low mt-1">
              Pending invite
            </div>
          </div>

          <div className="panel p-6">
            <div className="text-text-low text-xs font-mono uppercase tracking-wider mb-2">
              Invited
            </div>
            <div className="text-3xl font-display font-bold text-accent-cyan">
              {metrics.totals.invited}
            </div>
            <div className="text-xs text-text-low mt-1">
              +{metrics.recent.invites} last 7 days
            </div>
          </div>

          <div className="panel p-6">
            <div className="text-text-low text-xs font-mono uppercase tracking-wider mb-2">
              Activated
            </div>
            <div className="text-3xl font-display font-bold text-accent-lime">
              {metrics.totals.activated}
            </div>
            <div className="text-xs text-text-low mt-1">
              {metrics.conversion.inviteToActivation.toFixed(1)}% conversion
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="panel p-4 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search email or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] bg-carbon-800 border border-stroke-1 rounded px-3 py-2 text-sm text-text-hi placeholder-text-muted focus:outline-none focus:border-accent-cyan"
        />
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-carbon-800 border border-stroke-1 rounded px-3 py-2 text-sm text-text-hi focus:outline-none focus:border-accent-cyan"
        >
          <option value="">All Status</option>
          <option value="JOINED">Joined</option>
          <option value="INVITED">Invited</option>
          <option value="ACTIVATED">Activated</option>
        </select>
      </div>

      {/* Table */}
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-carbon-850 border-b border-stroke-1">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-text-low">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-text-low">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-text-low">
                  Role
                </th>
                <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-wider text-text-low">
                  Ad Spend
                </th>
                <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-text-low">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-text-low">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-wider text-text-low">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke-1">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-text-mid">
                    Loading...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-text-mid">
                    No leads found
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-carbon-850/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-text-hi">
                      {lead.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-mid">
                      {lead.company || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-mid">
                      {lead.role || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-mid text-right font-mono">
                      {formatCurrency(lead.ad_spend)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {getStatusBadge(lead.status)}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-mid font-mono">
                      {formatDate(lead.created_at)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        {lead.status === 'JOINED' && (
                          <button
                            onClick={() => handleInvite(lead.id)}
                            disabled={inviting === lead.id}
                            className="btn-tactical-ghost text-xs px-3 py-1.5"
                          >
                            {inviting === lead.id ? 'Sending...' : 'Invite'}
                          </button>
                        )}
                        {lead.status === 'INVITED' && (
                          <>
                            <button
                              onClick={() => handleInvite(lead.id)}
                              disabled={inviting === lead.id}
                              className="btn-tactical-ghost text-xs px-3 py-1.5"
                            >
                              Resend
                            </button>
                            <button
                              onClick={() => handleActivate(lead.id)}
                              className="btn-tactical-primary text-xs px-3 py-1.5"
                            >
                              Activate
                            </button>
                          </>
                        )}
                        {lead.status === 'ACTIVATED' && (
                          <span className="text-xs text-accent-lime">✓ Active</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > pageSize && (
          <div className="border-t border-stroke-1 px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-text-mid">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} leads
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-tactical-ghost text-xs px-3 py-1.5 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * pageSize >= total}
                className="btn-tactical-ghost text-xs px-3 py-1.5 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
