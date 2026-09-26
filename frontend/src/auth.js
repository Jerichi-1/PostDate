/**
 * auth.js
 * Reads the token loginUser() stores in localStorage (see pages/Login.jsx)
 * well enough to answer two UI questions: "is anyone logged in?" and
 * "what's their role?" — used by <RequireAuth> to decide whether to render
 * a page or bounce to /login.
 *
 * ⚠️ This is routing convenience, not a security boundary. A token can be
 * edited by anyone in devtools before it's decoded here, and this file
 * never checks the signature — only the backend's requireAuth/requireRole
 * (backend/middleware/auth.js) actually enforce anything. Client-side, the
 * worst a forged token does is show/hide a route; every real request still
 * gets re-checked server-side.
 */

const TOKEN_KEY = "token"; // 🎛️ keep in sync with pages/Login.jsx

/** Decodes a JWT's payload without verifying it — see the warning above. */
function decodePayload(token) {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    // JWTs use base64url; atob wants base64, so swap the two characters
    // that differ before padding it out to a multiple of 4.
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/** True if a token is present and its own `exp` claim hasn't passed. */
export function isAuthenticated() {
  const token = getToken();
  if (!token) return false;
  const payload = decodePayload(token);
  if (!payload?.exp) return Boolean(payload); // no exp claim — trust presence
  return payload.exp * 1000 > Date.now();
}

/** "user" | "moderator" | "admin" | null */
export function getRole() {
  if (!isAuthenticated()) return null;
  return decodePayload(getToken())?.role ?? null;
}
