'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

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

  const passwordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 8) return { strength: 1, label: 'Weak', color: 'hsl(0 84% 60%)' };
    if (password.length < 12) return { strength: 2, label: 'Fair', color: 'hsl(45 93% 47%)' };
    return { strength: 3, label: 'Strong', color: 'hsl(142 76% 36%)' };
  };

  const strength = passwordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
          htmlFor="name" 
          className="block text-sm font-medium"
          style={{color: 'hsl(215 20% 65%)'}}
        >
          Full name
        </label>
        <div className="relative">
          <User 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{color: 'hsl(215 20% 65%)'}}
          />
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{
              background: 'rgba(15, 23, 42, 0.5)',
              borderColor: 'rgba(51, 65, 85, 0.6)',
              color: 'hsl(210 40% 96%)'
            }}
            placeholder="John Doe"
            disabled={loading}
          />
        </div>
      </div>

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
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
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
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{
              background: 'rgba(15, 23, 42, 0.5)',
              borderColor: 'rgba(51, 65, 85, 0.6)',
              color: 'hsl(210 40% 96%)'
            }}
            placeholder="Create a strong password"
            disabled={loading}
          />
        </div>
        {formData.password && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-xs">
              <span style={{color: 'hsl(215 20% 65%)'}}>Password strength:</span>
              <span style={{color: strength.color, fontWeight: 600}}>{strength.label}</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-300"
                style={{
                  width: `${(strength.strength / 3) * 100}%`,
                  background: strength.color
                }}
              />
            </div>
            <p className="text-xs" style={{color: 'hsl(215 20% 65%)'}}>
              Must be at least 8 characters long
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label 
          htmlFor="confirmPassword" 
          className="block text-sm font-medium"
          style={{color: 'hsl(215 20% 65%)'}}
        >
          Confirm password
        </label>
        <div className="relative">
          <Lock 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{color: 'hsl(215 20% 65%)'}}
          />
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{
              background: 'rgba(15, 23, 42, 0.5)',
              borderColor: 'rgba(51, 65, 85, 0.6)',
              color: 'hsl(210 40% 96%)'
            }}
            placeholder="Confirm your password"
            disabled={loading}
          />
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <CheckCircle 
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{color: 'hsl(142 76% 36%)'}}
            />
          )}
        </div>
      </div>

      <div className="flex items-start">
        <input
          id="terms"
          type="checkbox"
          required
          className="w-4 h-4 rounded border-2 transition-all cursor-pointer mt-1"
          style={{
            borderColor: 'rgba(51, 65, 85, 0.6)',
            background: 'rgba(15, 23, 42, 0.5)'
          }}
          disabled={loading}
        />
        <label htmlFor="terms" className="ml-2 text-sm" style={{color: 'hsl(215 20% 65%)'}}>
          I agree to the{' '}
          <a href="#" className="hover:underline" style={{color: 'hsl(217 91% 60%)'}}>
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="hover:underline" style={{color: 'hsl(217 91% 60%)'}}>
            Privacy Policy
          </a>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        style={{
          background: loading ? 'hsl(215 28% 24%)' : 'hsl(142 76% 36%)',
          color: 'white'
        }}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Creating account...
          </>
        ) : (
          'Create account'
        )}
      </button>
    </form>
  );
}
