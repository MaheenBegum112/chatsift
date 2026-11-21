// src/components/UploadView.jsx
// Authenticated Upload Screen: Step-by-step export instructions, drag-and-drop file picker, consent, and upload.

import { useState, useRef } from 'react';
import { uploadChat } from '../api.js';
import ConsentNotice from './ConsentNotice.jsx';
import Logo from './Logo.jsx';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function UploadView({ user, onUploadSuccess }) {
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Upload Screen Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <Logo size="md" showText={false} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {user?.name ? `Welcome, ${user.name}` : 'Upload Class Chat'}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Upload your exported WhatsApp chat file to start indexing questions and answers.
        </p>
      </div>

      {/* Main Upload Box Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/90 p-6 sm:p-8 space-y-6">
        {/* Step-by-Step Instructions */}
        <section aria-labelledby="export-guide-title">
          <h2 id="export-guide-title" className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            How to export your chat:
          </h2>
          <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200/70 font-medium">
            <li>In WhatsApp open your class group chat.</li>
            <li>Tap <span className="font-semibold text-slate-900">More</span> (or 3 dots) &gt; <span className="font-semibold text-slate-900">Export chat</span>.</li>
            <li>Choose <span className="font-semibold text-slate-900">Without media</span>.</li>
            <li>Save the exported <code className="px-1.5 py-0.5 rounded bg-slate-200 font-mono text-xs">.txt</code> file and upload it below.</li>
          </ol>
        </section>

        {/* Upload Error Banner */}
        {uploadError && (
          <div
            role="alert"
            className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs sm:text-sm text-red-700 flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-2">
              <span className="text-base" aria-hidden="true">
                ⚠️
              </span>
              <div>
                <p className="font-bold">Upload failed</p>
                <p className="mt-0.5 text-red-600">{uploadError}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleUpload}
              className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm shrink-0 cursor-pointer"
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
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/70'
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
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
              <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-800">
                <span className="text-blue-600 hover:underline">Choose a .txt file</span> or drag and drop here
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Accepts WhatsApp chat exports in plain text (up to 10 MB)
              </p>
            </div>
          ) : (
            /* Selected File Display */
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  TXT
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
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
                  className="text-xs text-slate-500 hover:text-red-600 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
                  aria-label="Remove selected file"
                >
                  Change file
                </button>
              )}
            </div>
          )}

          {/* Inline Validation Error */}
          {validationError && (
            <p className="text-xs text-red-600 mt-2 flex items-center gap-1.5 font-medium" role="alert">
              <span>⚠️</span>
              {validationError}
            </p>
          )}
        </section>

        {/* Consent Section */}
        <section className="space-y-3.5">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              disabled={isLoading}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 cursor-pointer accent-blue-600"
            />
            <span className="text-xs sm:text-sm text-slate-700 leading-snug font-medium">
              I have permission to use this chat. I understand its text may be processed by an AI service.
            </span>
          </label>

          {/* Privacy & WhatsApp Disclaimer Box */}
          <ConsentNotice />
        </section>

        {/* Upload Action Button */}
        <div>
          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploadDisabled}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-sm sm:text-base text-white shadow-sm flex items-center justify-center gap-2 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${
              isUploadDisabled
                ? 'bg-blue-300 cursor-not-allowed text-white/80 shadow-none'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
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
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Reading your chat...</span>
              </>
            ) : (
              <span>Upload Chat & Start Sifting →</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
