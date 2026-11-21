// src/components/AuthModal.jsx
// Student authentication modal (Login / Sign Up) in clean modern SaaS styling.

import { useState } from 'react';
import Logo from './Logo.jsx';

export default function AuthModal({ isOpen, initialMode = 'login', onClose, onAuthSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const targetEmail = email.trim();
    if (!targetEmail || !password.trim()) {
      setError('Please provide both email and password.');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    // Successful in-memory student auth
    onAuthSuccess({
      name: mode === 'register' ? name.trim() : targetEmail.split('@')[0] || 'Student',
      email: targetEmail,
    });
  };

  // Instant 1-click demo student sign-in
  const handleQuickDemo = () => {
    onAuthSuccess({
      name: 'Alex Student',
      email: 'alex.student@university.edu',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 text-lg font-bold w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition cursor-pointer"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Modal Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <Logo size="md" showText={false} />
          <div>
            <h2 id="auth-modal-title" className="text-xl font-bold text-slate-900 leading-tight">
              {mode === 'login' ? 'Student Sign In' : 'Create Student Account'}
            </h2>
            <p className="text-xs text-slate-500">Sign in to upload and sift your class group chats</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200 mb-6 text-sm font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`pb-2.5 px-4 transition cursor-pointer ${
              mode === 'login'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`pb-2.5 px-4 transition cursor-pointer ${
              mode === 'register'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Johnson"
                className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Student Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              required
              className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm shadow-sm transition cursor-pointer mt-2"
          >
            {mode === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-slate-400 font-medium">Or continue with</span>
          </div>
        </div>

        {/* One-Click Quick Demo Sign In Button */}
        <button
          type="button"
          onClick={handleQuickDemo}
          className="w-full bg-slate-50 hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-gray-200 hover:border-blue-300 font-semibold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
        >
          <span>⚡</span>
          <span>1-Click Demo Student Sign In</span>
        </button>

        <p className="text-[11px] text-slate-400 text-center mt-4">
          Chat content and credentials remain strictly in React memory and are never persisted to disk or cloud storage.
        </p>
      </div>
    </div>
  );
}
