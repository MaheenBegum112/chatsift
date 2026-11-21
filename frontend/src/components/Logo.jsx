// src/components/Logo.jsx
// Distinctive modern vector logo mark for Chatsift combining a chat bubble with sifter/filter lines.

export default function Logo({ size = 'md', showText = true, textClassName = '' }) {
  const containerClasses = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
  }[size] || 'w-9 h-9 rounded-xl';

  const iconClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  }[size] || 'w-5 h-5';

  return (
    <div className="flex items-center gap-2.5 select-none">
      <div
        className={`${containerClasses} bg-gradient-to-tr from-blue-600 via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/20 shrink-0 transition-transform duration-200 hover:scale-105`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={`${iconClasses} text-white`}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Chat bubble body */}
          <path
            d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
            strokeWidth="2"
          />
          {/* Sifting/filtering lines inside the chat bubble */}
          <line x1="8.5" y1="9" x2="15.5" y2="9" strokeWidth="2.2" />
          <line x1="9.5" y1="12" x2="14.5" y2="12" strokeWidth="2.2" />
          <line x1="11" y1="15" x2="13" y2="15" strokeWidth="2.2" />
        </svg>
      </div>

      {showText && (
        <span className={`text-xl font-black tracking-tight text-slate-900 ${textClassName}`}>
          Chat<span className="text-blue-600">sift</span>
        </span>
      )}
    </div>
  );
}
