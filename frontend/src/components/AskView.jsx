// src/components/AskView.jsx
// Second screen: Chat session query interface, statistics dashboard, suggestion chips, and conversation thread.

import { useState, useRef, useEffect } from 'react';
import { askQuestion, deleteData } from '../api.js';
import AnswerCard from './AnswerCard.jsx';

const EXAMPLE_QUESTIONS = [
  'When is the assignment due?',
  'What topics are in the exam?',
  'Who shared the Unit 3 notes?',
];

export default function AskView({ session, onUploadDifferent, onResetAll }) {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const inputRef = useRef(null);
  const scrollEndRef = useRef(null);

  // Auto-scroll to newest message or skeleton
  useEffect(() => {
    if (conversation.length > 0 || isLoading) {
      scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation, isLoading]);

  // Submit question to API
  const handleAsk = async (queryToAsk) => {
    const text = (typeof queryToAsk === 'string' ? queryToAsk : question).trim();
    if (!text || isLoading) return;

    setIsLoading(true);
    setCurrentQuery(text);
    setQuestion('');

    const entryId = Date.now().toString();

    try {
      const response = await askQuestion(session.sessionId, text);
      const newCard = {
        id: entryId,
        question: text,
        answer: response.answer,
        found: response.found,
        sources: response.sources || [],
        error: null,
      };
      setConversation((prev) => [...prev, newCard]);
    } catch (err) {
      const failedCard = {
        id: entryId,
        question: text,
        answer: null,
        found: false,
        sources: [],
        error: err.message || 'Something went wrong while searching the chat.',
      };
      setConversation((prev) => [...prev, failedCard]);
    } finally {
      setIsLoading(false);
      setCurrentQuery('');
      inputRef.current?.focus();
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleAsk();
  };

  const handleChipClick = (sample) => {
    setQuestion(sample);
    inputRef.current?.focus();
  };

  const handleRetryQuestion = (failedQuestion) => {
    handleAsk(failedQuestion);
  };

  // Delete chat data and clear state
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteData(session.sessionId);
      setShowDeleteModal(false);
      onResetAll();
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete chat data. Please try again.');
      setIsDeleting(false);
    }
  };

  const messageCount = session.messages?.toLocaleString() || session.messages || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col min-h-screen">
      {/* Top Header Bar & Actions */}
      <header className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="text-blue-600">📊</span> Chat loaded: {messageCount} messages
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Ask natural language questions to search through your class group chat with exact original message citations.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={onUploadDifferent}
              className="text-xs sm:text-sm px-4 py-2 border border-gray-300 text-slate-700 hover:border-blue-400 hover:text-blue-600 rounded-lg transition bg-white shadow-2xs flex items-center gap-1.5 font-semibold cursor-pointer"
            >
              <span>🔄</span> Upload a different chat
            </button>
            <button
              type="button"
              onClick={() => {
                setDeleteError('');
                setShowDeleteModal(true);
              }}
              className="text-xs sm:text-sm px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg transition font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <span>🗑️</span> Delete my data
            </button>
          </div>
        </div>

        {/* 3 Stats Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200/80 p-5 sm:p-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Messages
            </span>
            <p className="text-3xl sm:text-4xl font-extrabold text-blue-600 mt-2">
              {messageCount}
            </p>
            <p className="text-xs text-slate-400 mt-1">all indexed WhatsApp messages</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-gray-200/80 p-5 sm:p-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Semantic Chunks
            </span>
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 mt-2">
              {session.chunks || 0}
            </p>
            <p className="text-xs text-slate-400 mt-1">indexed for AI retrieval</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-gray-200/80 p-5 sm:p-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Session Status
            </span>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-500">
                Active
              </p>
            </div>
            <p className="text-xs text-slate-400 mt-1">Session ID: {session.sessionId}</p>
          </div>
        </div>
      </header>

      {/* Main Conversation Stream */}
      <main className="flex-1 space-y-4 mb-8" aria-live="polite">
        {conversation.length === 0 && !isLoading && (
          <div className="text-center py-14 px-6 rounded-2xl border border-dashed border-gray-300 bg-white/70 shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-3xl mx-auto mb-3">
              💬
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Ready to answer your questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              Ask about assignment deadlines, exam syllabus, notes shared in the group, or select one of the
              suggested chips below.
            </p>
          </div>
        )}

        {/* Answer Cards */}
        {conversation.map((item) => (
          <AnswerCard key={item.id} item={item} onRetry={handleRetryQuestion} />
        ))}

        {/* Loading Skeleton Card */}
        {isLoading && (
          <div
            className="bg-white rounded-2xl shadow-sm border border-blue-200/90 p-6 space-y-3.5"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                Q
              </span>
              <p className="text-base font-bold text-slate-900 truncate">
                {currentQuery}
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                <svg
                  className="animate-spin h-4 w-4 text-blue-600 shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Searching your chat...</span>
              </div>
              <div className="animate-pulse space-y-2.5">
                <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={scrollEndRef} />
      </main>

      {/* Sticky Bottom Form & Chips */}
      <footer className="sticky bottom-4 z-10 space-y-3 bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-gray-200/80 shadow-md">
        {/* Clickable Example Question Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold whitespace-nowrap pl-1">Try:</span>
          {EXAMPLE_QUESTIONS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleChipClick(chip)}
              disabled={isLoading}
              className="whitespace-nowrap px-3.5 py-1.5 rounded-full bg-slate-50 border border-gray-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 text-xs font-semibold transition shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50 cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Field and Submit Button */}
        <form onSubmit={handleFormSubmit} className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
            placeholder="Ask a question about your chat (e.g. When is the DBMS assignment due?)"
            aria-label="Ask a question about your class chat"
            className="w-full bg-slate-50 border border-gray-300 rounded-xl pl-4 pr-24 py-3.5 text-sm text-slate-900 placeholder-slate-400 shadow-2xs focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
          />
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className={`absolute right-1.5 px-5 py-2.5 rounded-lg font-semibold text-xs sm:text-sm text-white transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              isLoading || !question.trim()
                ? 'bg-blue-300 text-white/80 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-sm cursor-pointer'
            }`}
          >
            Ask
          </button>
        </form>
      </footer>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl">
              🗑️
            </div>

            <div>
              <h2 id="delete-dialog-title" className="text-lg font-bold text-slate-900">
                Delete my data
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                This removes your chat from Chatsift. Continue?
              </p>
            </div>

            {deleteError && (
              <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200" role="alert">
                {deleteError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin h-3.5 w-3.5 text-white shrink-0"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
