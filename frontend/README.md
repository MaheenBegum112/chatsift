# Chatsift — Frontend

Chatsift is a student-friendly web application for querying exported WhatsApp class group chats. Students export their group chat as a `.txt` file, upload it, and ask natural language questions (e.g., *"When is the DBMS assignment due?"*). Chatsift answers using only the uploaded chat and displays the exact source messages cited for the answer. If the answer is not present in the chat, it clearly states that instead of guessing.

The frontend is styled in a clean, modern SaaS design (inspired by **XportConnect**), featuring a dedicated landing page, student authentication modal (with 1-click demo sign-in), authenticated upload workflow, and interactive Q&A citations dashboard.

---

## Tech Stack

- **Framework**: React 19 (Functional components & hooks)
- **Bundler & Dev Server**: Vite
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`, no legacy configs or postcss)
- **Language**: Plain JavaScript (no TypeScript)
- **State Management**: React state only (Chat data and credentials are strictly in-memory and are **never** saved to `localStorage` or `sessionStorage`).

---

## User Flow & Structure

1. **Home / Landing Page (`LandingView`)**:
   - Pure marketing/showcase landing page matching the XportConnect design.
   - Clean top navbar with `Home`, `About`, `→] Login`, and `+ Register` buttons.
   - Centered hero with globe badge icon, 2-line headline (*"Class Chats Made Simple & Secure"*), subtitle, and CTA buttons (*"Get Started Free"* & *"How It Works"*).
   - "Three Steps to Sift Your Class Chat" section.
   - Floating chat action button in the bottom right corner.
2. **Student Authentication (`AuthModal`)**:
   - Clean dialog supporting **Sign In** and **Sign Up** tabs.
   - Includes a **"1-Click Demo Student Sign In"** button for immediate access without typing credentials.
3. **Upload Screen (`UploadView`)**:
   - Shown after sign-in: provides WhatsApp export guidance (without media), drag-and-drop `.txt` file picker (up to 10 MB), consent checkbox, and `ConsentNotice`.
4. **Q&A Citations Dashboard (`AskView`)**:
   - Top 3 stat cards: `Total Messages`, `Semantic Chunks`, and `Session Status`.
   - Question input with Enter key support and 3 clickable suggestion chips.
   - Conversation thread showing `AnswerCard` with collapsible `SourceList` ("Cited from your chat") citing sender and timestamp.
   - Data deletion confirmation dialog.

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
