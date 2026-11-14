// src/components/AskView.jsx
// Second screen: Chat session query interface, citation browsing, and data deletion.

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

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10 flex flex-col min-h-screen">
      {/* Header Bar */}
      <header className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h1 className="text-sm sm:text-base font-semibold text-slate-900">
                Chat loaded: {session.messages?.toLocaleString() || session.messages || 0} messages
              </h1>
            </div>
            {session.chunks && (
              <p className="text-xs text-slate-500 mt-0.5">
                Indexed in {session.chunks} chunks
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={onUploadDifferent}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer"
            >
              Upload a different chat
            </button>
            <button
              type="button"
              onClick={() => {
                setDeleteError('');
                setShowDeleteModal(true);
              }}
              className="text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer"
            >
              Delete my data
            </button>
          </div>
        </div>
      </header>

      {/* Main Conversation Stream */}
      <main className="flex-1 space-y-4 mb-6" aria-live="polite">
        {conversation.length === 0 && !isLoading && (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-300 bg-white/60">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-slate-800">
              Ready to answer your questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1">
              Ask when an assignment is due, what was covered in class, or select a suggestion below.
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
            className="bg-white rounded-2xl border border-violet-200/90 shadow-xs p-4 sm:p-5 space-y-3"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center shrink-0">
                Q
              </span>
              <p className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                {currentQuery}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-medium text-violet-700">
                <svg
                  className="animate-spin h-3.5 w-3.5 text-violet-600 shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                <span>Searching your chat...</span>
              </div>
              <div className="animate-pulse space-y-2">
                <div className="h-3.5 bg-slate-200 rounded w-5/6"></div>
                <div className="h-3.5 bg-slate-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={scrollEndRef} />
      </main>

      {/* Sticky Bottom Form & Chips */}
      <footer className="sticky bottom-4 z-10 space-y-2.5 bg-slate-50/90 backdrop-blur-xs pt-2">
        {/* 3 Clickable Example Question Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium whitespace-nowrap pl-0.5">Try:</span>
          {EXAMPLE_QUESTIONS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleChipClick(chip)}
              disabled={isLoading}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-violet-400 hover:text-violet-700 hover:bg-violet-50/40 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:opacity-50 cursor-pointer"
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
            className="w-full bg-white border border-slate-300 rounded-xl pl-4 pr-24 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className={`absolute right-1.5 px-4 py-2 rounded-lg font-medium text-xs sm:text-sm text-white transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 ${
              isLoading || !question.trim()
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-violet-600 hover:bg-violet-700 active:bg-violet-800 shadow-xs cursor-pointer'
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
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>

            <div>
              <h2 id="delete-dialog-title" className="text-base font-semibold text-slate-900">
                Delete my data
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                This removes your chat from Chatsift. Continue?
              </p>
            </div>

            {deleteError && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg" role="alert">
                {deleteError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
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
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
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
