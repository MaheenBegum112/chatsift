// src/api.js
// Single API module for Chatsift backend communication (switches between mock and real HTTP calls).

const USE_MOCK = import.meta.env?.VITE_USE_MOCK !== "false";
const BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:8000";

// Latency simulation helper for mock calls
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 1) uploadChat(file, consent)
 * Uploads a WhatsApp chat export (.txt) with user consent.
 *
 * Real: POST {BASE_URL}/upload as multipart/form-data with fields `file` and `consent` ("true").
 * Response: { session_id: string, messages: number, chunks: number }
 *
 * Mock: wait ~1.2s, return { session_id: "demo-123", messages: 1840, chunks: 212 }
 */
export async function uploadChat(file, consent) {
  if (USE_MOCK) {
    await delay(1200);
    return {
      session_id: "demo-123",
      messages: 1840,
      chunks: 212,
    };
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("consent", consent ? "true" : "false");

  const response = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errorMsg = `Upload failed (${response.status})`;
    try {
      const data = await response.json();
      errorMsg = data.detail || data.message || errorMsg;
    } catch {
      const text = await response.text();
      if (text) errorMsg = text;
    }
    throw new Error(errorMsg);
  }

  return await response.json();
}

/**
 * 2) askQuestion(sessionId, question)
 * Asks a natural language question against the indexed chat.
 *
 * Real: POST {BASE_URL}/ask, JSON body { session_id, question }
 * Response: {
 *   answer: string,
 *   found: boolean,
 *   sources: [ { sender: string, time: string, text: string } ]
 * }
 *
 * Mock: wait ~800ms.
 * - If question contains "dbms" or "assignment": return found:true, answer, and 2 sources (Asha, Ravi).
 * - If question contains "error": throw Error("Mock server error").
 * - Otherwise: return found:false, answer "I couldn't find this in the chat.", sources: [].
 */
export async function askQuestion(sessionId, question) {
  if (USE_MOCK) {
    await delay(800);

    const q = (question || "").toLowerCase();

    if (q.includes("error")) {
      throw new Error("Mock server error");
    }

    if (q.includes("dbms") || q.includes("assignment")) {
      return {
        answer: "The DBMS assignment is due on Friday, 22 Nov.",
        found: true,
        sources: [
          {
            sender: "Asha",
            time: "2024-11-18 21:14",
            text: "DBMS assignment due Friday, submit on the portal",
          },
          {
            sender: "Ravi",
            time: "2024-11-18 21:20",
            text: "Sir confirmed no extension",
          },
        ],
      };
    }

    return {
      answer: "I couldn't find this in the chat.",
      found: false,
      sources: [],
    };
  }

  const response = await fetch(`${BASE_URL}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session_id: sessionId,
      question,
    }),
  });

  if (!response.ok) {
    let errorMsg = `Failed to get answer (${response.status})`;
    try {
      const data = await response.json();
      errorMsg = data.detail || data.message || errorMsg;
    } catch {
      const text = await response.text();
      if (text) errorMsg = text;
    }
    throw new Error(errorMsg);
  }

  return await response.json();
}

/**
 * 3) deleteData(sessionId)
 * Removes chat session data from the server.
 *
 * Real: DELETE {BASE_URL}/data/{sessionId}
 * Response: { deleted: true }
 *
 * Mock: wait ~400ms, return { deleted: true }
 */
export async function deleteData(sessionId) {
  if (USE_MOCK) {
    await delay(400);
    return { deleted: true };
  }

  const response = await fetch(`${BASE_URL}/data/${encodeURIComponent(sessionId)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    let errorMsg = `Failed to delete data (${response.status})`;
    try {
      const data = await response.json();
      errorMsg = data.detail || data.message || errorMsg;
    } catch {
      const text = await response.text();
      if (text) errorMsg = text;
    }
    throw new Error(errorMsg);
  }

  return await response.json();
}

export { USE_MOCK, BASE_URL };
