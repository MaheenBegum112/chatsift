# Chatsift — Frontend

Chatsift is a student-friendly web application for querying exported WhatsApp class group chats. Students export their group chat as a `.txt` file, upload it, and ask natural language questions (e.g., *"When is the DBMS assignment due?"*). Chatsift answers using only the uploaded chat and displays the exact source messages cited for the answer. If the answer is not present in the chat, it clearly states that instead of guessing.

This repository contains **only the frontend** of Chatsift, built with React, Vite, and Tailwind CSS v4. It features a complete mock API layer for standalone development and testing, and can be switched to a real backend via environment variables.

---

## Tech Stack

- **Framework**: React 19 (Functional components & hooks)
- **Bundler & Dev Server**: Vite
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`, no legacy configs or postcss)
- **Language**: Plain JavaScript (no TypeScript)
- **State Management**: React state only (Chat data is strictly in-memory and is **never** saved to `localStorage` or `sessionStorage`).

---

## Project Structure

```text
chatsift/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── api.js                 # The ONLY file that talks to the backend (mock + real)
    ├── App.jsx                # Holds app state and switches between views
    ├── index.css              # @import "tailwindcss";
    ├── main.jsx               # React entry point
    └── components/
        ├── UploadView.jsx     # Export guide, drag-and-drop file picker, consent, upload
        ├── AskView.jsx        # Question input, example chips, thread, delete dialog
        ├── AnswerCard.jsx     # Card rendering found answers, not-found state, and errors
        ├── SourceList.jsx     # Collapsible cited messages with sender and time
        └── ConsentNotice.jsx  # Privacy policy and WhatsApp disclaimer
```

---

## Quickstart & Running Locally

### 1. Install dependencies
```bash
npm install
```

### 2. Start the development server (Mock API by default)
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

By default, the app runs in **mock mode** (`VITE_USE_MOCK=true`), so no backend server is needed.

---

## Switching to Real Backend API

All backend interaction is centralized in `src/api.js`. It checks two environment variables:
- `VITE_USE_MOCK`: Set to `"false"` to disable mock responses and send real HTTP requests.
- `VITE_API_URL`: Base URL of your backend (defaults to `http://localhost:8000`).

### Configuration via `.env.local`

Create a `.env.local` file in the project root:

```env
# Disable mock mode
VITE_USE_MOCK=false

# Point to your backend server URL
VITE_API_URL=http://localhost:8000
```

Restart the dev server (`npm run dev`) after creating or editing `.env.local`.

---

## API Contract Specification

When `VITE_USE_MOCK="false"`, `src/api.js` connects to the following REST endpoints:

### 1. Upload Chat
- **Endpoint**: `POST {VITE_API_URL}/upload`
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `file`: The `.txt` WhatsApp chat export file
  - `consent`: `"true"` (string)
- **Response** (`200 OK`):
  ```json
  {
    "session_id": "demo-123",
    "messages": 1840,
    "chunks": 212
  }
  ```

### 2. Ask Question
- **Endpoint**: `POST {VITE_API_URL}/ask`
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "session_id": "demo-123",
    "question": "When is the DBMS assignment due?"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "answer": "The DBMS assignment is due on Friday, 22 Nov.",
    "found": true,
    "sources": [
      {
        "sender": "Asha",
        "time": "2024-11-18 21:14",
        "text": "DBMS assignment due Friday, submit on the portal"
      },
      {
        "sender": "Ravi",
        "time": "2024-11-18 21:20",
        "text": "Sir confirmed no extension"
      }
    ]
  }
  ```
  *When not found:*
  ```json
  {
    "answer": "I couldn't find this in the chat.",
    "found": false,
    "sources": []
  }
  ```

### 3. Delete Session Data
- **Endpoint**: `DELETE {VITE_API_URL}/data/{sessionId}`
- **Response** (`200 OK`):
  ```json
  {
    "deleted": true
  }
  ```

---

## Mock Mode Behavior Reference

When `VITE_USE_MOCK` is active (default):
1. **`uploadChat(file, consent)`**: Waits ~1.2s, returns `{ session_id: "demo-123", messages: 1840, chunks: 212 }`.
2. **`askQuestion(sessionId, question)`**: Waits ~800ms:
   - If question contains `"dbms"` or `"assignment"`, returns `found: true`, answer, and 2 cited sources from "Asha" and "Ravi".
   - If question contains `"error"`, throws `Error("Mock server error")` to test error banner and retry UI.
   - Otherwise, returns `found: false` with `"I couldn't find this in the chat."` and empty sources.
3. **`deleteData(sessionId)`**: Waits ~400ms, returns `{ deleted: true }`.
