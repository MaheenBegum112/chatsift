// src/components/LandingView.jsx
// Clean SaaS Landing Page matching the XportConnect design (No upload form on landing page).

import Logo from './Logo.jsx';

export default function LandingView({ onGetStarted, onHowItWorks }) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Centered Hero Section (Exact XportConnect layout) */}
      <section className="text-center max-w-3xl mx-auto mb-20">
        {/* Chatsift Custom Logo Badge */}
        <div className="flex justify-center mb-6">
          <Logo size="lg" showText={false} />
        </div>

        {/* 2-Line Bold Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-5">
          Class Chats Made <br />
          <span className="text-blue-600">Simple & Secure</span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-500 text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-8">
          Sift through thousands of WhatsApp class group messages to find assignment due dates, exam syllabus,
          and announcements with exact original message citations.
        </p>

        {/* Hero Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={onGetStarted}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3 rounded-lg shadow-sm transition cursor-pointer text-sm sm:text-base"
          >
            Get Started Free
          </button>
          <button
            type="button"
            onClick={onHowItWorks}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-7 py-3 rounded-lg bg-white shadow-2xs transition cursor-pointer text-sm sm:text-base"
          >
            How It Works
          </button>
        </div>
      </section>

      {/* "Three Steps to Sift Your Chat" (Matching "Three Ways to Grow Your Business") */}
      <section id="three-steps" className="mb-20 pt-4 text-center">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          Three Steps to Sift Your Class Chat
        </h2>
        <p className="text-slate-500 text-sm sm:text-base max-w-md mx-auto mb-12">
          From an exported WhatsApp chat to verified answers with exact message citations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-200/90 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mb-4 border border-blue-100">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Export WhatsApp Chat</h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-4">
              Open your WhatsApp group &gt; More &gt; Export chat &gt; Select <strong>Without media</strong> &gt; save the <code className="bg-gray-100 px-1 py-0.5 rounded text-slate-800">.txt</code> file.
            </p>
            <div className="space-y-1.5 text-xs text-slate-600 border-t border-gray-100 pt-3 font-medium">
              <p className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">✓</span> No media needed
              </p>
              <p className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">✓</span> Plain text (.txt) export
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-200/90 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mb-4 border border-blue-100">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Login & Privacy Filter</h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-4">
              Sign in with your student account and upload your chat file. Names and phone numbers are redacted automatically.
            </p>
            <div className="space-y-1.5 text-xs text-slate-600 border-t border-gray-100 pt-3 font-medium">
              <p className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">✓</span> Up to 10 MB files
              </p>
              <p className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">✓</span> Delete data anytime
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-200/90 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mb-4 border border-blue-100">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Ask & Get Cited Answers</h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-4">
              Ask when assignments are due or what was discussed. Chatsift provides answers citing original messages with sender and time.
            </p>
            <div className="space-y-1.5 text-xs text-slate-600 border-t border-gray-100 pt-3 font-medium">
              <p className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">✓</span> Original message citations
              </p>
              <p className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">✓</span> Says when not in chat
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Sift Bottom Banner */}
      <section className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-gray-200 text-center max-w-3xl mx-auto shadow-2xs">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
          Ready to sift your class chat?
        </h3>
        <p className="text-slate-500 text-sm sm:text-base max-w-md mx-auto mb-6">
          Sign in or create your student account to access the chat upload and AI search dashboard.
        </p>
        <button
          type="button"
          onClick={onGetStarted}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-lg shadow-sm transition cursor-pointer text-sm sm:text-base"
        >
          Sign In to Upload Chat →
        </button>
      </section>
    </div>
  );
}
