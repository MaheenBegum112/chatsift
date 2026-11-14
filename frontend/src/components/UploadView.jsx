// src/components/UploadView.jsx
// First screen: Explainer, WhatsApp export instructions, drag-and-drop file picker, consent, and chat upload.

import { useState, useRef } from 'react';
import { uploadChat } from '../api.js';
import ConsentNotice from './ConsentNotice.jsx';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function UploadView({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [consent, setConsent] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  // Validate incoming .txt file
  const handleValidateFile = (candidate) => {
    setValidationError('');
    setUploadError('');

    if (!candidate) return;

    if (!candidate.name.toLowerCase().endsWith('.txt')) {
      setFile(null);
      setValidationError('Please select a valid .txt file exported from WhatsApp.');
      return;
    }

    if (candidate.size > MAX_FILE_SIZE_BYTES) {
      setFile(null);
      setValidationError('File exceeds the 10 MB limit. Export without media or choose a smaller file.');
      return;
    }

    setFile(candidate);
  };

  const handleInputChange = (e) => {
    const selected = e.target.files?.[0];
    handleValidateFile(selected);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    handleValidateFile(dropped);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setValidationError('');
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async (e) => {
    if (e) e.preventDefault();
    if (!file || !consent || isLoading) return;

    setIsLoading(true);
    setUploadError('');

    try {
      const data = await uploadChat(file, consent);
      onUploadSuccess({
        sessionId: data.session_id,
        messages: data.messages,
        chunks: data.chunks,
      });
    } catch (err) {
      setUploadError(err.message || 'Failed to upload chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isUploadDisabled = !file || !consent || isLoading;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Brand & Tagline */}
      <header className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-600 text-white shadow-md shadow-violet-200 mb-3">
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
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Chatsift
        </h1>
        <p className="mt-1 text-base sm:text-lg text-violet-700 font-medium">
          Sift your class chat into answers.
        </p>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Upload your WhatsApp group export to search assignments, deadlines, syllabus questions,
          and announcements with exact message citations.
        </p>
      </header>

      {/* Main Upload Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-7 space-y-6">
        {/* Numbered WhatsApp Export Guide */}
        <section aria-labelledby="export-guide-title">
          <h2 id="export-guide-title" className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
            How to export your WhatsApp chat
          </h2>
          <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
            <li>In WhatsApp open the group.</li>
            <li>Tap <span className="font-medium text-slate-900">More</span> &gt; <span className="font-medium text-slate-900">Export chat</span>.</li>
            <li>Choose <span className="font-medium text-slate-900">Without media</span>.</li>
            <li>Save the exported <code className="px-1.5 py-0.5 rounded bg-slate-200/70 font-mono text-xs">.txt</code> file and upload it below.</li>
          </ol>
        </section>

        {/* Upload Error Banner */}
        {uploadError && (
          <div
            role="alert"
            className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs sm:text-sm text-rose-800 flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-rose-600 shrink-0 mt-0.5"
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
              <div>
                <p className="font-semibold">Upload failed</p>
                <p className="mt-0.5 text-rose-700">{uploadError}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleUpload}
              className="px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 shrink-0 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Drag-and-drop & File Picker */}
        <section aria-label="Upload chat file">
          <input
            ref={fileInputRef}
            type="file"
            id="chat-file-input"
            accept=".txt,text/plain"
            onChange={handleInputChange}
            className="sr-only"
            disabled={isLoading}
          />

          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-violet-500 bg-violet-50/60'
                  : 'border-slate-300 hover:border-violet-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              aria-label="Click or drag and drop a .txt chat file"
            >
              <div className="mx-auto w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mb-3">
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
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-800">
                <span className="text-violet-600 hover:underline">Choose a .txt file</span> or drag and drop here
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Accepts WhatsApp chat exports in plain text (up to 10 MB)
              </p>
            </div>
          ) : (
            /* Selected File Display */
            <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              {!isLoading && (
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-xs text-slate-500 hover:text-rose-600 font-medium px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer"
                  aria-label="Remove selected file"
                >
                  Change file
                </button>
              )}
            </div>
          )}

          {/* Inline Validation Error */}
          {validationError && (
            <p className="text-xs text-rose-600 mt-2 flex items-center gap-1.5" role="alert">
              <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {validationError}
            </p>
          )}
        </section>

        {/* Consent Section */}
        <section className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              disabled={isLoading}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 disabled:opacity-50 cursor-pointer"
            />
            <span className="text-xs sm:text-sm text-slate-700 leading-snug">
              I have permission to use this chat. I understand its text may be processed by an AI service.
            </span>
          </label>

          {/* Privacy & WhatsApp Notice */}
          <ConsentNotice />
        </section>

        {/* Upload Button */}
        <div>
          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploadDisabled}
            className={`w-full py-3 px-4 rounded-xl font-medium text-sm sm:text-base text-white shadow-xs flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 ${
              isUploadDisabled
                ? 'bg-slate-300 cursor-not-allowed text-slate-500 shadow-none'
                : 'bg-violet-600 hover:bg-violet-700 active:bg-violet-800 cursor-pointer'
            }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white shrink-0"
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
                <span>Reading your chat...</span>
              </>
            ) : (
              <span>Upload</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
