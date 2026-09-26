import axios from "axios";

const API_BASE = "http://localhost:5000/api";

// 🔌 The backend also serves plain (non-/api) paths — right now just
// /uploads/<file>, where profile photos live (see backend/server.js). Any
// code that needs to turn a stored path like "/uploads/abc.jpg" into a
// loadable <img src> imports this rather than re-deriving it.
export const API_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

const api = axios.create({
  baseURL: API_BASE,
});

/* 🔌 SESSIONS: attach the token loginUser() saves (see pages/Login.jsx) to
   every request that follows, so a protected route can identify who's
   asking once the backend checks for one. Nothing currently guards any
   route with it — that's the next piece, not this one. */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
