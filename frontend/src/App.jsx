/**
 * App — the route table for the whole frontend.
 *
 * 🎛️ ADD A PAGE
 *   1. create it in src/pages/
 *   2. import it here
 *   3. add a <Route path="/your-path" element={<YourPage />} />
 *
 * 🔌 BACKEND / AUTH
 *   The admin route is open to anyone right now. Once login sessions exist,
 *   wrap the protected routes in a guard — see the RequireAuth sketch at the
 *   bottom. (The /login page is built; it just doesn't remember anyone yet.)
 */
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";

import "./App.css";

function App() {
  return (
    <Routes>
      {/* ── public ────────────────────────────────────────────────────── */}
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      {/* log-in, plus the "forgot password" screens (recovery code → new password) */}
      <Route path="/login" element={<Login />} />

      {/* ── signed in ─────────────────────────────────────────────────── */}
      <Route path="/discover" element={<Discover />} />
      <Route path="/profile" element={<Profile />} />

      {/* ── staff ─────────────────────────────────────────────────────────
          One page, two roles. "admin" shows all nine sidebar sections;
          "moderator" shows the shorter six-item list. */}
      <Route path="/admin" element={<AdminDashboard role="admin" />} />
      <Route path="/moderator" element={<AdminDashboard role="moderator" />} />

      {/* Anything unrecognised goes home rather than showing a blank page. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

/* 🔌 BACKEND — protecting routes once login is built:
 *
 *   function RequireAuth({ role, children }) {
 *     const user = useCurrentUser();                  // your auth hook
 *     if (!user) return <Navigate to="/login" replace />;
 *     if (role && user.role !== role) return <Navigate to="/" replace />;
 *     return children;
 *   }
 *
 *   <Route path="/admin" element={
 *     <RequireAuth role="admin"><AdminDashboard role="admin" /></RequireAuth>
 *   } />
 *
 * "/discover" and "/profile" want the same treatment (wrap in <RequireAuth>
 * with no role) once accounts exist — right now anyone can open them, same
 * as "/admin" until login lands.
 */
