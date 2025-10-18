'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, AlertCircle, X } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordError('');
    setForgotPasswordSuccess(false);

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setForgotPasswordSuccess(true);
      } else {
        setForgotPasswordError(data.error || 'Failed to send reset link');
      }
    } catch (err) {
      setForgotPasswordError('Network error. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div 
          className="flex items-start gap-3 p-4 rounded-lg border animate-fade-in"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
            color: 'hsl(0 84% 60%)'
          }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <div className="space-y-2">
        <label 
          htmlFor="email" 
          className="block text-sm font-medium"
          style={{color: 'hsl(215 20% 65%)'}}
        >
          Email address
        </label>
        <div className="relative">
          <Mail 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{color: 'hsl(215 20% 65%)'}}
          />
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{
              background: 'rgba(15, 23, 42, 0.5)',
              borderColor: 'rgba(51, 65, 85, 0.6)',
              color: 'hsl(210 40% 96%)'
            }}
            placeholder="you@company.com"
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label 
          htmlFor="password" 
          className="block text-sm font-medium"
          style={{color: 'hsl(215 20% 65%)'}}
        >
          Password
        </label>
        <div className="relative">
          <Lock 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{color: 'hsl(215 20% 65%)'}}
          />
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{
              background: 'rgba(15, 23, 42, 0.5)',
              borderColor: 'rgba(51, 65, 85, 0.6)',
              color: 'hsl(210 40% 96%)'
            }}
            placeholder="••••••••"
            disabled={loading}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center cursor-pointer group">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-2 transition-all cursor-pointer"
            style={{
              borderColor: 'rgba(51, 65, 85, 0.6)',
              background: 'rgba(15, 23, 42, 0.5)'
            }}
          />
          <span className="ml-2 text-sm group-hover:text-blue-400 transition-colors" style={{color: 'hsl(215 20% 65%)'}}>
            Remember me
          </span>
        </label>
        
        <button 
          type="button"
          onClick={() => {
            setForgotPasswordEmail(email);
            setShowForgotPassword(true);
          }}
          className="text-sm hover:underline transition-colors"
          style={{color: 'hsl(217 91% 60%)'}}
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        style={{
          background: loading ? 'hsl(215 28% 24%)' : 'hsl(217 91% 60%)',
          color: 'white'
        }}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign in'
        )}
      </button>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.8)' }}
          onClick={() => {
            setShowForgotPassword(false);
            setForgotPasswordSuccess(false);
            setForgotPasswordError('');
          }}
        >
          <div 
            className="w-full max-w-md rounded-xl p-6 relative"
            style={{
              background: 'hsl(222 47% 11%)',
              border: '1px solid rgba(51, 65, 85, 0.6)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setForgotPasswordSuccess(false);
                setForgotPasswordError('');
              }}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <X className="w-5 h-5" style={{color: 'hsl(215 20% 65%)'}} />
            </button>

            <h2 className="text-2xl font-bold mb-2" style={{color: 'hsl(210 40% 96%)'}}>
              Reset Password
            </h2>
            <p className="mb-6 text-sm" style={{color: 'hsl(215 20% 65%)'}}>
              Enter your email and we'll send you a magic link to sign in.
            </p>

            {forgotPasswordSuccess ? (
              <div 
                className="p-4 rounded-lg border"
                style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  borderColor: 'rgba(34, 197, 94, 0.3)',
                  color: 'hsl(142 71% 45%)'
                }}
              >
                <p className="text-sm">
                  Check your email! We've sent a magic link to {forgotPasswordEmail}
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {forgotPasswordError && (
                  <div 
                    className="flex items-start gap-3 p-4 rounded-lg border"
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      borderColor: 'rgba(239, 68, 68, 0.3)',
                      color: 'hsl(0 84% 60%)'
                    }}
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{forgotPasswordError}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label 
                    htmlFor="forgot-email" 
                    className="block text-sm font-medium"
                    style={{color: 'hsl(215 20% 65%)'}}
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail 
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                      style={{color: 'hsl(215 20% 65%)'}}
                    />
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{
                        background: 'rgba(15, 23, 42, 0.5)',
                        borderColor: 'rgba(51, 65, 85, 0.6)',
                        color: 'hsl(210 40% 96%)'
                      }}
                      placeholder="you@company.com"
                      disabled={forgotPasswordLoading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotPasswordLoading}
                  className="w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    background: forgotPasswordLoading ? 'hsl(215 28% 24%)' : 'hsl(217 91% 60%)',
                    color: 'white'
                  }}
                >
                  {forgotPasswordLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send magic link'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
