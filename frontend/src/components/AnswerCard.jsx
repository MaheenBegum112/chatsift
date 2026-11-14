// src/components/AnswerCard.jsx
// Displays a question and its corresponding answer, citation sources, or not-found state.

import SourceList from './SourceList.jsx';

export default function AnswerCard({ item, onRetry }) {
  const { question, answer, found, sources, error } = item;

  return (
    <article
      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 transition-shadow hover:shadow-sm"
      aria-labelledby={`question-${item.id}`}
    >
      {/* Question Header */}
      <div className="flex items-start gap-2.5 mb-3">
        <span
          className="shrink-0 w-6 h-6 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center mt-0.5"
          aria-hidden="true"
        >
          Q
        </span>
        <h2 id={`question-${item.id}`} className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
          {question}
        </h2>
      </div>

      {/* Answer / Status Body */}
      {error ? (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs sm:text-sm text-rose-800">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-rose-600 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              <span>{error}</span>
            </div>
            {onRetry && (
              <button
                type="button"
                onClick={() => onRetry(question)}
                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-rose-600 text-white hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1 shrink-0 cursor-pointer"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      ) : found ? (
        <div className="space-y-3">
          <div className="flex items-start gap-2.5">
            <span
              className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center mt-0.5"
              aria-hidden="true"
            >
              A
            </span>
            <div className="text-sm sm:text-base text-slate-800 leading-relaxed font-normal">
              {answer}
            </div>
          </div>

          {/* Sources cited */}
          <SourceList sources={sources} />
        </div>
      ) : (
        /* Muted Not found state */
        <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <svg
              className="w-4 h-4 text-amber-500 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <span className="font-semibold text-slate-700">Not found in the chat</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700">{answer}</p>
          <p className="text-xs text-slate-500 italic pt-0.5">
            Try rephrasing, or check that the topic was discussed in this group.
          </p>
        </div>
      )}
    </article>
  );
}
