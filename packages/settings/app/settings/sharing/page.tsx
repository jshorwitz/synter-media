'use client';

import React, { useState, useEffect } from 'react';

interface SharingPolicy {
  id: string;
  name: string;
  description?: string;
  type: 'public_link' | 'password_protected' | 'team_only' | 'specific_emails';
  settings: Record<string, any>;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

interface SharedReport {
  id: string;
  title: string;
  description?: string;
  reportType: string;
  shareToken: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  policy?: {
    id: string;
    name: string;
    type: string;
  };
}

export default function SharingPage() {
  const [policies, setPolicies] = useState<SharingPolicy[]>([]);
  const [reports, setReports] = useState<SharedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Policy form state
  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const [policyFormData, setPolicyFormData] = useState({
    name: '',
    description: '',
    type: 'team_only' as const,
    settings: {},
    expiresAt: ''
  });

  // Report form state
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportFormData, setReportFormData] = useState({
    title: '',
    description: '',
    reportType: 'performance_summary',
    reportConfig: {},
    policyId: '',
    expiresAt: ''
  });

  useEffect(() => {
    loadSharingData();
  }, []);

  const loadSharingData = async () => {
    setLoading(true);
    try {
      const [policiesRes, reportsRes] = await Promise.all([
        fetch('/api/v1/sharing/policies'),
        fetch('/api/v1/sharing/reports')
      ]);

      if (policiesRes.ok) {
        const policiesData = await policiesRes.json();
        setPolicies(policiesData.policies || []);
      }

      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData.reports || []);
      }
    } catch (err) {
      setError('Failed to load sharing data');
      console.error('Error loading sharing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePolicy = async () => {
    if (!policyFormData.name || !policyFormData.type) {
      setError('Name and type are required');
      return;
    }

    try {
      const response = await fetch('/api/v1/sharing/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...policyFormData,
          expiresAt: policyFormData.expiresAt || undefined
        })
      });

      if (response.ok) {
        const newPolicy = await response.json();
        setPolicies(prev => [newPolicy, ...prev]);
        setPolicyFormData({
          name: '',
          description: '',
          type: 'team_only',
          settings: {},
          expiresAt: ''
        });
        setShowPolicyForm(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create policy');
      }
    } catch (err) {
      setError('Failed to create policy');
      console.error('Error creating policy:', err);
    }
  };

  const handleCreateReport = async () => {
    if (!reportFormData.title || !reportFormData.reportType) {
      setError('Title and report type are required');
      return;
    }

    try {
      const response = await fetch('/api/v1/sharing/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reportFormData,
          policyId: reportFormData.policyId || undefined,
          expiresAt: reportFormData.expiresAt || undefined
        })
      });

      if (response.ok) {
        const newReport = await response.json();
        setReports(prev => [newReport, ...prev]);
        setReportFormData({
          title: '',
          description: '',
          reportType: 'performance_summary',
          reportConfig: {},
          policyId: '',
          expiresAt: ''
        });
        setShowReportForm(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create shared report');
      }
    } catch (err) {
      setError('Failed to create shared report');
      console.error('Error creating report:', err);
    }
  };

  const handleTogglePolicy = async (policyId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/v1/sharing/policies/${policyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      });

      if (response.ok) {
        const updatedPolicy = await response.json();
        setPolicies(prev =>
          prev.map(policy => policy.id === policyId ? updatedPolicy : policy)
        );
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to toggle policy');
      }
    } catch (err) {
      setError('Failed to toggle policy');
      console.error('Error toggling policy:', err);
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    if (!confirm('Are you sure you want to delete this sharing policy?')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/sharing/policies/${policyId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setPolicies(prev => prev.filter(policy => policy.id !== policyId));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete policy');
      }
    } catch (err) {
      setError('Failed to delete policy');
      console.error('Error deleting policy:', err);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this shared report?')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/sharing/reports/${reportId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setReports(prev => prev.filter(report => report.id !== reportId));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete report');
      }
    } catch (err) {
      setError('Failed to delete report');
      console.error('Error deleting report:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      alert('Link copied to clipboard!');
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'public_link':
        return 'bg-green-100 text-green-800';
      case 'password_protected':
        return 'bg-yellow-100 text-yellow-800';
      case 'team_only':
        return 'bg-blue-100 text-blue-800';
      case 'specific_emails':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sharing & Reports</h1>
        <div className="space-x-3">
          <button
            onClick={() => setShowPolicyForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            New Policy
          </button>
          <button
            onClick={() => setShowReportForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Share Report
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Policy Form Modal */}
      {showPolicyForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Create Sharing Policy</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={policyFormData.name}
                  onChange={(e) => setPolicyFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={policyFormData.description}
                  onChange={(e) => setPolicyFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Access Type</label>
                <select
                  value={policyFormData.type}
                  onChange={(e) => setPolicyFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="team_only">Team Only</option>
                  <option value="public_link">Public Link</option>
                  <option value="password_protected">Password Protected</option>
                  <option value="specific_emails">Specific Emails</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expires At (Optional)</label>
                <input
                  type="datetime-local"
                  value={policyFormData.expiresAt}
                  onChange={(e) => setPolicyFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPolicyForm(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePolicy}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Create Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Form Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Share Report</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={reportFormData.title}
                  onChange={(e) => setReportFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={reportFormData.description}
                  onChange={(e) => setReportFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                <select
                  value={reportFormData.reportType}
                  onChange={(e) => setReportFormData(prev => ({ ...prev, reportType: e.target.value }))}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="performance_summary">Performance Summary</option>
                  <option value="campaign_analysis">Campaign Analysis</option>
                  <option value="attribution_report">Attribution Report</option>
                  <option value="custom_report">Custom Report</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sharing Policy</label>
                <select
                  value={reportFormData.policyId}
                  onChange={(e) => setReportFormData(prev => ({ ...prev, policyId: e.target.value }))}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select policy (optional)</option>
                  {policies.filter(p => p.isActive).map((policy) => (
                    <option key={policy.id} value={policy.id}>
                      {policy.name} ({policy.type})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expires At (Optional)</label>
                <input
                  type="datetime-local"
                  value={reportFormData.expiresAt}
                  onChange={(e) => setReportFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowReportForm(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateReport}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Create Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sharing Policies */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Sharing Policies ({policies.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {policies.map((policy) => (
                <tr key={policy.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{policy.name}</div>
                      {policy.description && (
                        <div className="text-sm text-gray-500">{policy.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(policy.type)}`}>
                      {policy.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleTogglePolicy(policy.id, policy.isActive)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        policy.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {policy.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(policy.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleDeletePolicy(policy.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shared Reports */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Shared Reports ({reports.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Policy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Share Link
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{report.title}</div>
                      {report.description && (
                        <div className="text-sm text-gray-500">{report.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.reportType.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.policy ? report.policy.name : 'No policy'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => copyToClipboard(`${window.location.origin}/shared/${report.shareToken}`)}
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      Copy Link
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
