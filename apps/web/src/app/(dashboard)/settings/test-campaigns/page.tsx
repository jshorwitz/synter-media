'use client';

import { useState } from 'react';

export default function TestCampaignsPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testGetCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      setResult({ operation: 'GET /api/campaigns', status: res.status, data });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testCreateCampaign = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Campaign ' + Date.now(),
          platform: 'google',
          daily_budget_cents: 5000,
          objective: 'Lead Generation',
          target_audience: 'B2B SaaS companies',
          creative_brief: 'Focus on ROI and efficiency'
        }),
      });
      const data = await res.json();
      setResult({ operation: 'POST /api/campaigns', status: res.status, data });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testLaunchCampaign = async (campaignId: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/launch`, {
        method: 'POST',
      });
      const data = await res.json();
      setResult({ operation: `POST /api/campaigns/${campaignId}/launch`, status: res.status, data });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Campaign API Tests</h1>
      
      <div className="space-y-4 mb-8">
        <button
          onClick={testGetCampaigns}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 mr-2"
        >
          Test GET Campaigns
        </button>
        
        <button
          onClick={testCreateCampaign}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 mr-2"
        >
          Test CREATE Campaign
        </button>
        
        {result?.data?.campaign?.id && (
          <button
            onClick={() => testLaunchCampaign(result.data.campaign.id)}
            disabled={loading}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Test LAUNCH Campaign #{result.data.campaign.id}
          </button>
        )}
      </div>

      {loading && (
        <div className="p-4 bg-blue-100 text-blue-800 rounded">
          Loading...
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 text-red-800 rounded mb-4">
          Error: {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 rounded">
            <h3 className="font-bold mb-2">Operation: {result.operation}</h3>
            <p className="mb-2">Status: <span className={result.status === 200 || result.status === 201 ? 'text-green-600' : 'text-red-600'}>{result.status}</span></p>
            <pre className="bg-white p-4 rounded overflow-auto text-xs">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-bold mb-2">🧪 Test Instructions:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Click "Test GET Campaigns" to list your campaigns</li>
          <li>Click "Test CREATE Campaign" to create a new test campaign</li>
          <li>After creating, click "Test LAUNCH Campaign" to activate it</li>
          <li>Refresh and click "Test GET Campaigns" again to see the launched campaign</li>
        </ol>
      </div>
    </div>
  );
}
