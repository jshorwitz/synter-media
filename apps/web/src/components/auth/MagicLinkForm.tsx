'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function MagicLinkForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { sendMagicLink } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await sendMagicLink(email);
    
    if (result.success) {
      setSent(true);
    } else {
      setError(result.error || 'Failed to send magic link');
    }
    
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="synter-alert synter-alert-success">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Magic link sent!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  We&apos;ve sent a secure login link to <strong>{email}</strong>. 
                  Click the link in your email to sign in.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-slate-600">
          <p>Check your spam folder if you don't see the email.</p>
          <p>The link will expire in 10 minutes for security.</p>
        </div>

        <button
          onClick={() => {
            setSent(false);
            setEmail('');
          }}
          className="synter-button-secondary"
        >
          Try different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="synter-alert synter-alert-error">
          {error}
        </div>
      )}
      
      <div className="synter-form-group">
        <label htmlFor="email" className="synter-form-label">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="synter-input"
          placeholder="you@company.com"
          disabled={loading}
        />
        <div className="synter-form-help">
          We&apos;ll send you a secure link to sign in without a password
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !email}
        className="synter-button-primary w-full flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="loading-spinner mr-2 h-4 w-4" />
            Sending magic link...
          </>
        ) : (
'Send magic link'
        )}
      </button>

      <div className="text-center">
        <div className="synter-alert synter-alert-info">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Magic links are more secure than passwords and work great for teams.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
