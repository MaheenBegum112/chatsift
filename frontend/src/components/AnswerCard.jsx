// src/components/AnswerCard.jsx
// Displays a question, answer with citations, not-found state, or error in clean SaaS card style.

import SourceList from './SourceList.jsx';

export default function AnswerCard({ item, onRetry }) {
  const { question, answer, found, sources, error } = item;

  return (
    <article
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition hover:shadow-md"
      aria-labelledby={`question-${item.id}`}
    >
      {/* Question Header */}
      <div className="flex items-start gap-3 mb-4">
        <span
          className="shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs flex items-center justify-center mt-0.5"
          aria-hidden="true"
        >
          Q
        </span>
        <h2 id={`question-${item.id}`} className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
          {question}
        </h2>
      </div>

      {/* Answer Body / Status */}
      {error ? (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs sm:text-sm text-red-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={() => onRetry(question)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition shadow-sm shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Try again
            </button>
          )}
        </div>
      ) : found ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span
              className="shrink-0 w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-extrabold text-xs flex items-center justify-center mt-0.5"
              aria-hidden="true"
            >
              A
            </span>
            <div className="text-sm sm:text-base text-gray-800 leading-relaxed font-normal">
              {answer}
            </div>
          </div>

          {/* Sources cited */}
          <SourceList sources={sources} />
        </div>
      ) : (
        /* Muted Not found state */
        <div className="rounded-xl bg-gray-50 border border-gray-200/90 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
            <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1.5">
              <span>⏳</span> Not found in the chat
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-700 pl-1">{answer}</p>
          <p className="text-xs text-gray-400 italic pl-1">
            Try rephrasing, or check that the topic was discussed in this group.
          </p>
        </div>
      )}
    </article>
  );
}
