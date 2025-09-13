'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SSOButtons } from './SSOButtons';

export function SignupForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    const result = await signup(formData.email, formData.password, formData.name);
    
    if (!result.success) {
      setError(result.error || 'Signup failed');
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
        <label htmlFor="name" className="synter-form-label">
          Full name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          className="synter-input"
          placeholder="Enter your full name"
          disabled={loading}
        />
      </div>

      <div className="synter-form-group">
        <label htmlFor="email" className="synter-form-label">
          Email address *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="synter-input"
          placeholder="Enter your email address"
          disabled={loading}
        />
      </div>

      <div className="synter-form-group">
        <label htmlFor="password" className="synter-form-label">
          Password *
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={formData.password}
          onChange={handleChange}
          className="synter-input"
          placeholder="Create a strong password"
          disabled={loading}
        />
        <div className="synter-form-help">
          Must be at least 8 characters long
        </div>
      </div>

      <div className="synter-form-group">
        <label htmlFor="confirmPassword" className="synter-form-label">
          Confirm password *
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          value={formData.confirmPassword}
          onChange={handleChange}
          className="synter-input"
          placeholder="Confirm your password"
          disabled={loading}
        />
      </div>

      <div className="flex items-start">
        <input
          id="terms"
          type="checkbox"
          required
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded mt-1"
          disabled={loading}
        />
        <label htmlFor="terms" className="ml-2 text-sm text-slate-600">
          I agree to the{' '}
          <a href="#" className="text-blue-600 hover:text-blue-500">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-blue-600 hover:text-blue-500">
            Privacy Policy
          </a>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="synter-button-primary w-full flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="loading-spinner mr-2 h-4 w-4" />
            Creating account...
          </>
        ) : (
          'Create account'
        )}
      </button>

      <div className="mt-6">
        <SSOButtons mode="signup" onError={setError} />
      </div>
    </form>
  );
}
