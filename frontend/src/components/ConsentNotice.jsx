// src/components/ConsentNotice.jsx
// Privacy reminder and WhatsApp affiliation disclaimer.

export default function ConsentNotice() {
  return (
    <div
      className="rounded-xl border border-violet-100 bg-violet-50/60 p-4 text-xs text-slate-600 leading-relaxed"
      role="note"
      aria-label="Privacy notice"
    >
      <div className="flex items-start gap-2.5">
        <svg
          className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
          />
        </svg>
        <div className="space-y-1">
          <p className="font-semibold text-slate-800">Your privacy matters</p>
          <p>
            Names and phone numbers are automatically hidden before chat text is sent to the AI.
            You can delete your chat data at any time. Chatsift is an independent student study
            tool and is not affiliated with or endorsed by WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
}
