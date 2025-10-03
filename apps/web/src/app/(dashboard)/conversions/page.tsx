'use client';

import { useState, useEffect } from 'react';
import { Code, Copy, Check, Zap, TrendingUp, AlertCircle } from 'lucide-react';

export default function ConversionsPage() {
  const [trackingId, setTrackingId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isSetup, setIsSetup] = useState(false);

  useEffect(() => {
    loadTrackingConfig();
  }, []);

  const loadTrackingConfig = async () => {
    try {
      const response = await fetch('/api/conversions/config');
      const data = await response.json();
      setTrackingId(data.trackingId || '');
      setIsSetup(!!data.trackingId);
    } catch (error) {
      console.error('Failed to load tracking config:', error);
    }
  };

  const generateTrackingId = async () => {
    try {
      const response = await fetch('/api/conversions/config', {
        method: 'POST',
      });
      const data = await response.json();
      setTrackingId(data.trackingId);
      setIsSetup(true);
    } catch (error) {
      console.error('Failed to generate tracking ID:', error);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const trackingSnippet = `<!-- Synter Conversion Tracking -->
<script>
  !function(t,e){var n=e.createElement("script");n.async=!0,
  n.src="https://synter-clean-web.vercel.app/pixel.js?id=${trackingId}",
  e.head.appendChild(n),t.synter=t.synter||{},
  t.synter.track=function(e,n){fetch("https://synter-clean-web.vercel.app/api/conversions/track",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({tracking_id:"${trackingId}",event:e,properties:n})
  })}}(window,document);
</script>
<!-- End Synter Conversion Tracking -->`;

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-bold text-white mb-2">Conversion Tracking</h1>
      <p className="text-slate-400 mb-8">
        Track conversions from your ad campaigns by adding our snippet to your website
      </p>

      {!isSetup ? (
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-8 text-center">
          <Zap className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Set Up Conversion Tracking</h2>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Add our tracking snippet to your website to automatically track conversions and attribute them to your ad campaigns.
          </p>
          <button
            onClick={generateTrackingId}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all"
          >
            Generate Tracking Code
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Installation Instructions */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Code className="w-5 h-5" />
                Installation
              </h2>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-700 rounded-lg p-4 mb-4 relative">
              <pre className="text-sm text-slate-300 overflow-x-auto">
                <code>{trackingSnippet}</code>
              </pre>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-200">
                <p className="font-semibold mb-1">Installation Instructions:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-300">
                  <li>Copy the code snippet above</li>
                  <li>Paste it in your website's &lt;head&gt; section, before the closing &lt;/head&gt; tag</li>
                  <li>Deploy your website</li>
                  <li>Conversions will appear below within a few minutes</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Tracking Events */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Track Conversion Events</h2>
            <p className="text-slate-400 mb-4">
              Use these JavaScript functions on your website to track specific conversion events:
            </p>

            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-700 rounded-lg p-4">
                <div className="text-sm font-semibold text-slate-300 mb-2">Track a Purchase</div>
                <pre className="text-sm text-green-400 overflow-x-auto">
                  <code>{`synter.track('purchase', {
  value: 99.99,
  currency: 'USD',
  order_id: 'ORD-12345'
});`}</code>
                </pre>
              </div>

              <div className="bg-slate-950 border border-slate-700 rounded-lg p-4">
                <div className="text-sm font-semibold text-slate-300 mb-2">Track a Lead/Signup</div>
                <pre className="text-sm text-green-400 overflow-x-auto">
                  <code>{`synter.track('lead', {
  value: 50.00,
  email: 'user@example.com'
});`}</code>
                </pre>
              </div>

              <div className="bg-slate-950 border border-slate-700 rounded-lg p-4">
                <div className="text-sm font-semibold text-slate-300 mb-2">Track Custom Event</div>
                <pre className="text-sm text-green-400 overflow-x-auto">
                  <code>{`synter.track('custom_event', {
  value: 25.00,
  custom_property: 'value'
});`}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Recent Conversions */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recent Conversions
              </h2>
              <span className="text-sm text-slate-400">Last 24 hours</span>
            </div>

            <div className="text-center py-12 text-slate-400">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No conversions tracked yet</p>
              <p className="text-sm mt-1">Install the tracking code on your website to see conversions here</p>
            </div>
          </div>

          {/* Your Tracking ID */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Your Tracking ID</h2>
            <div className="bg-slate-950 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
              <code className="text-blue-400 font-mono">{trackingId}</code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(trackingId);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Use this ID to identify your conversions. Keep it secure.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
