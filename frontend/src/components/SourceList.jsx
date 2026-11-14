// src/components/SourceList.jsx
// Collapsible list of source chat messages backing an answer.

import { useState } from 'react';

function formatTimestamp(timeStr) {
  if (!timeStr) return '';
  const date = new Date(timeStr.replace(' ', 'T'));
  if (!isNaN(date.getTime())) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
  return timeStr;
}

export default function SourceList({ sources = [] }) {
  if (!sources || sources.length === 0) return null;

  // Auto-expand if 3 or fewer sources; collapse by default if more than 3
  const [isExpanded, setIsExpanded] = useState(sources.length <= 3);

  return (
    <div className="mt-4 pt-3 border-t border-slate-100">
      <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
        <span className="flex items-center gap-1.5 font-semibold text-slate-700">
          <svg
            className="w-3.5 h-3.5 text-violet-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
          Cited from your chat ({sources.length})
        </span>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-violet-600 hover:text-violet-700 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-1 rounded px-1.5 py-0.5 transition-colors cursor-pointer"
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'Hide sources' : `Show ${sources.length} sources`}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-2 mt-2">
          {sources.map((src, idx) => (
            <div
              key={idx}
              className="rounded-lg bg-slate-50 border border-slate-200/80 p-3 text-xs text-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-1 text-[11px] text-slate-500">
                <span className="font-semibold text-violet-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block"></span>
                  {src.sender || 'Group Member'}
                </span>
                {src.time && <span>{formatTimestamp(src.time)}</span>}
              </div>
              <p className="text-slate-800 font-mono text-[11.5px] whitespace-pre-wrap bg-white/80 rounded p-2 border border-slate-100">
                "{src.text}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
