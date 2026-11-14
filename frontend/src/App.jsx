// src/App.jsx
// Main application component managing active view and in-memory session state.

import { useState } from 'react';
import UploadView from './components/UploadView.jsx';
import AskView from './components/AskView.jsx';

export default function App() {
  // Screen state: 'upload' | 'ask'
  const [currentView, setCurrentView] = useState('upload');

  // In-memory session state (strictly never persisted to localStorage or sessionStorage)
  const [session, setSession] = useState(null);

  // Successfully uploaded chat -> move to Ask view
  const handleUploadSuccess = ({ sessionId, messages, chunks }) => {
    setSession({ sessionId, messages, chunks });
    setCurrentView('ask');
  };

  // Switch back to upload screen without resetting current state
  const handleUploadDifferent = () => {
    setCurrentView('upload');
  };

  // "Delete my data" confirmed -> wipe all session state and return to upload screen
  const handleResetAll = () => {
    setSession(null);
    setCurrentView('upload');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-violet-200">
      {currentView === 'upload' ? (
        <UploadView onUploadSuccess={handleUploadSuccess} />
      ) : (
        <AskView
          session={session}
          onUploadDifferent={handleUploadDifferent}
          onResetAll={handleResetAll}
        />
      )}
    </div>
  );
}
