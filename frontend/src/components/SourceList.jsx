// src/components/SourceList.jsx
// Collapsible list of source chat messages backing an answer, in clean blue SaaS style.

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
    <div className="mt-5 pt-4 border-t border-gray-100">
      <div className="flex items-center justify-between text-xs font-medium text-gray-500 mb-3">
        <span className="flex items-center gap-2 font-bold text-gray-800">
          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
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
          className="text-xs text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-200"
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'Hide sources' : `Show ${sources.length} sources`}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-2.5 mt-2">
          {sources.map((src, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-gray-50 border border-gray-100 p-3.5 text-xs text-gray-700 transition"
            >
              <div className="flex items-center justify-between mb-1.5 text-[11px] text-gray-400">
                <span className="font-bold text-blue-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
                  {src.sender || 'Group Member'}
                </span>
                {src.time && <span>{formatTimestamp(src.time)}</span>}
              </div>
              <p className="text-gray-800 font-mono text-[12px] whitespace-pre-wrap bg-white rounded-lg p-2.5 border border-gray-200/80 shadow-2xs">
                "{src.text}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
