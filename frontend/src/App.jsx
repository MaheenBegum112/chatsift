// src/App.jsx
// Root application component managing Auth, Landing, Upload, and Ask views in pure React state.

import { useState } from 'react';
import LandingView from './components/LandingView.jsx';
import UploadView from './components/UploadView.jsx';
import AskView from './components/AskView.jsx';
import AuthModal from './components/AuthModal.jsx';
import Logo from './components/Logo.jsx';

export default function App() {
 
  const [user, setUser] = useState(null);

  
  const [currentView, setCurrentView] = useState('landing');

  
  const [session, setSession] = useState(null);

  // Auth Modal state
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });

  const openAuth = (mode = 'login') => {
    setAuthModal({ isOpen: true, mode });
  };

  const closeAuth = () => {
    setAuthModal({ isOpen: false, mode: 'login' });
  };

  // Called when student signs in or registers
  const handleAuthSuccess = (userData) => {
    setUser(userData);
    closeAuth();
    // After logging in, take them directly to Upload (or Ask if session already exists)
    if (session) {
      setCurrentView('ask');
    } else {
      setCurrentView('upload');
    }
  };

  // Sign out user
  const handleSignOut = () => {
    setUser(null);
    setSession(null);
    setCurrentView('landing');
  };

  // Navigation handlers
  const handleNavUpload = () => {
    if (!user) {
      openAuth('login');
    } else {
      setCurrentView('upload');
    }
  };

  const handleNavAbout = () => {
    if (currentView !== 'landing') {
      setCurrentView('landing');
      setTimeout(() => {
        document.getElementById('three-steps')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      document.getElementById('three-steps')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Successfully uploaded chat -> move to Ask view
  const handleUploadSuccess = ({ sessionId, messages, chunks }) => {
    setSession({ sessionId, messages, chunks });
    setCurrentView('ask');
  };

  // Switch back to upload screen without clearing session
  const handleUploadDifferent = () => {
    setCurrentView('upload');
  };

  // "Delete my data" confirmed -> wipe all session state and return to upload screen
  const handleResetAll = () => {
    setSession(null);
    setCurrentView('upload');
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navbar (Exact XportConnect design with Home, About, Login, Register) */}
      <nav className="flex justify-between items-center px-6 md:px-16 py-4 bg-white border-b border-gray-100 sticky top-0 z-30 shadow-2xs">
        {/* Brand Logo */}
        <div
          onClick={() => setCurrentView('landing')}
          className="cursor-pointer"
        >
          <Logo size="md" />
        </div>

        {/* Center Nav Links */}
        <div className="hidden sm:flex items-center gap-8 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setCurrentView('landing')}
            className={`transition cursor-pointer ${
              currentView === 'landing'
                ? 'text-blue-600 border-b-2 border-blue-600 pb-0.5'
                : 'text-slate-600 hover:text-blue-600'
            }`}
          >
            Home
          </button>

          <button
            type="button"
            onClick={handleNavUpload}
            className={`transition cursor-pointer ${
              currentView === 'upload'
                ? 'text-blue-600 border-b-2 border-blue-600 pb-0.5'
                : 'text-slate-600 hover:text-blue-600'
            }`}
          >
            Upload
          </button>

          <button
            type="button"
            onClick={() => {
              if (session) setCurrentView('ask');
            }}
            disabled={!session}
            className={`transition ${
              session
                ? currentView === 'ask'
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-0.5 cursor-pointer'
                  : 'text-slate-600 hover:text-blue-600 cursor-pointer'
                : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            Q&A Sift
          </button>

          <button
            type="button"
            onClick={handleNavAbout}
            className="text-slate-600 hover:text-blue-600 transition cursor-pointer"
          >
            About
          </button>
        </div>

        {/* Right Actions: Login + Register OR User Profile */}
        <div className="flex items-center gap-3">
          {user ? (
            /* Logged in state */
            <div className="flex items-center gap-2.5">
              <div className="hidden md:flex items-center gap-2 bg-blue-50 text-blue-700 px-3.5 py-1.5 rounded-lg border border-blue-100 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{user.name}</span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-xs text-slate-500 hover:text-red-600 font-semibold px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-red-50 transition cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            /* Logged out state: Exactly like screenshot (Login with arrow, + Register button) */
            <>
              <button
                type="button"
                onClick={() => openAuth('login')}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 transition cursor-pointer px-3 py-2"
              >
                <span>→]</span> Login
              </button>
              <button
                type="button"
                onClick={() => openAuth('register')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-lg font-semibold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span>+</span> Register
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Main View Router */}
      <main className="flex-1 bg-white">
        {currentView === 'landing' ? (
          <LandingView
            onGetStarted={() => {
              if (user) {
                setCurrentView(session ? 'ask' : 'upload');
              } else {
                openAuth('register');
              }
            }}
            onHowItWorks={handleNavAbout}
          />
        ) : currentView === 'upload' ? (
          <UploadView user={user} onUploadSuccess={handleUploadSuccess} />
        ) : (
          <AskView
            session={session}
            onUploadDifferent={handleUploadDifferent}
            onResetAll={handleResetAll}
          />
        )}
      </main>

      {/* Floating Action Button (Matches bottom-right widget from screenshot) */}
      <button
        type="button"
        onClick={() => {
          if (!user) {
            openAuth('login');
          } else if (session) {
            setCurrentView('ask');
          } else {
            setCurrentView('upload');
          }
        }}
        className="fixed bottom-6 right-6 z-40 w-13 h-13 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 transition flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95"
        title={user ? (session ? 'Open Q&A Sift' : 'Upload Chat') : 'Sign In to Start'}
        aria-label="Quick Action"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        onClose={closeAuth}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-10 px-6 md:px-16 text-center text-xs sm:text-sm text-slate-400 space-y-2 mt-auto">
        <div className="flex items-center justify-center">
          <Logo size="sm" />
        </div>
        <p className="text-slate-500">
          © 2026 Chatsift. Sift your class chat into answers.
        </p>
        <p className="text-[11px] text-slate-400 max-w-md mx-auto">
          Independent student study tool. Designed with clean modern SaaS styling. Not affiliated with WhatsApp.
        </p>
      </footer>
    </div>
  );
}
