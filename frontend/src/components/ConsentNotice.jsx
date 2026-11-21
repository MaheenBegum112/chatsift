// src/components/ConsentNotice.jsx
// Privacy reminder and WhatsApp affiliation disclaimer in XportConnect clean blue SaaS style.

export default function ConsentNotice() {
  return (
    <div
      className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900 leading-relaxed shadow-2xs"
      role="note"
      aria-label="Privacy notice"
    >
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
          </svg>
        </div>
        <div className="space-y-1">
          <p className="font-bold text-blue-950 flex items-center gap-2">
            Your privacy is protected
            <span className="bg-blue-200/80 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
              Safe & Encrypted
            </span>
          </p>
          <p className="text-blue-800/90">
            Student names and phone numbers are automatically redacted before chat text is sent to the AI.
            You can delete your chat data at any time. Chatsift is an independent study tool and is not
            affiliated with or endorsed by WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
}
