'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SSOButtons } from './SSOButtons';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
    
    setLoading(false);
  };

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
      </div>

      <div className="synter-form-group">
        <label htmlFor="password" className="synter-form-label">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="synter-input"
          placeholder="Enter your password"
          disabled={loading}
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
          />
          <span className="ml-2 text-sm text-slate-600">Remember me</span>
        </label>
        
        <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
          Forgot password?
        </a>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="synter-button-primary w-full flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="loading-spinner mr-2 h-4 w-4" />
            Signing in...
          </>
        ) : (
          'Sign in'
        )}
      </button>

      <div className="mt-6">
        <SSOButtons mode="login" onError={setError} />
      </div>
    </form>
  );
}
