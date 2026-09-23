/**
 * Login — the log-in page, with password recovery built in.
 *
 * One route (/login), three views that swap inside the same panel, exactly
 * like the three Figma frames:
 *
 *    view "login"              view "recovery"            view "password"
 *   ┌───────────────┐         ┌───────────────┐          ┌───────────────┐
 *   │    LOG-IN     │ forgot  │   RECOVERY    │ code ok  │   PASSWORD    │
 *   │ email + pass  │────────▶│  enter code   │─────────▶│ new + repeat  │
 *   │ Forgot pass?  │         │  00:00 timer  │          │   CONFIRM     │
 *   └───────────────┘         └───────────────┘          └───────┬───────┘
 *           ▲                                                    │
 *           └────────────────── password saved ──────────────────┘
 *
 * Clicking "Log in" in the header while you're already here starts over at
 * the first view, which is the way out of the recovery screens.
 *
 * This page owns the FLOW (which view, which email, when the code expires)
 * and makes the four backend calls. The forms in components/auth/ only check
 * their boxes and report back, the same way the sign-up steps do.
 *
 * 🔌 BACKEND: every call below lives in services/postdateApi.js
 *      loginUser            POST /api/auth/login             — real
 *      requestRecoveryCode  POST /api/auth/recovery/request   — still mock
 *      verifyRecoveryCode   POST /api/auth/recovery/verify    — still mock
 *      resetPassword        POST /api/auth/recovery/reset     — still mock
 * Recovery stays mocked until an email service exists to send the codes —
 * same reason as VerificationModal's code (see pages/Signup.jsx).
 *
 * 🎛️ Like the sign-up page this is a fixed layout sized in Figma pixels
 *    (`calc(<Figma px> * var(--u))`); --u lives in src/theme.css.
 */
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import AuthPanel from "../components/auth/AuthPanel";
import LoginForm from "../components/auth/LoginForm";
import RecoveryForm from "../components/auth/RecoveryForm";
import NewPasswordForm from "../components/auth/NewPasswordForm";

import {
  loginUser,
  requestRecoveryCode,
  verifyRecoveryCode,
  resetPassword,
} from "../services/postdateApi";

/* 🎛️ WHERE EACH KIND OF ACCOUNT LANDS AFTER LOGGING IN --------------------
   The key is the `role` the server sends back from loginUser().            */
const HOME_BY_ROLE = {
  user: "/discover",
  moderator: "/moderator",
  admin: "/admin",
};

/* the big title for each view (Figma: LOG-IN / RECOVERY / PASSWORD) */
const TITLES = { login: "Log-in", recovery: "Recovery", password: "Password" };

/* if the server forgets to say how long a code lasts, assume 5 minutes */
const DEFAULT_CODE_SECONDS = 300;
const expiryFrom = (seconds) =>
  Date.now() + (Number(seconds) > 0 ? Number(seconds) : DEFAULT_CODE_SECONDS) * 1000;

function Login() {
  const navigate = useNavigate();

  const [view, setView] = useState("login"); // "login" | "recovery" | "password"
  const [email, setEmail] = useState("");
  const [expiresAt, setExpiresAt] = useState(0); // when the emailed code stops working
  const [resetToken, setResetToken] = useState(""); // proof the code was right, kept in memory only
  const [notice, setNotice] = useState(""); // e.g. "Password updated" on the log-in view

  /* Clicking "Log in" in the header while you're already on this page starts
     over at the log-in view — the way out of the recovery screens. */
  const { key } = useLocation();
  useEffect(() => {
    setView("login");
    setNotice("");
  }, [key]);

  return (
    <div className="login">
      <style>{`
        .login {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--pd-pink);
        }

        .login-main {
          flex: 1;
          padding: calc(30 * var(--u)) 0 calc(60 * var(--u));   /* 🎛️ space above / below the panel */
        }
        .login-main > .auth-panel { margin: 0 auto; }
      `}</style>

      <SiteNav />

      <main className="login-main">
        <AuthPanel title={TITLES[view]}>
          {view === "login" && (
            <LoginForm
              defaultEmail={email}
              notice={notice}
              onSubmit={async ({ email, password }) => {
                /* 🔌 BACKEND: POST /api/auth/login — see services/postdateApi.js.
                   The token gets attached to future requests by the
                   interceptor in src/api.js. Nothing reads it back to restore
                   a session after a refresh yet — the next piece to build,
                   not this one. */
                const session = await loginUser({ email, password });
                if (session?.token) localStorage.setItem("token", session.token);
                navigate(HOME_BY_ROLE[session?.role] ?? "/discover");
              }}
              onForgot={async (typedEmail) => {
                /* 🔌 BACKEND: POST /api/auth/recovery/request */
                const { expiresInSeconds } = await requestRecoveryCode(typedEmail);
                setEmail(typedEmail);
                setExpiresAt(expiryFrom(expiresInSeconds));
                setNotice("");
                setView("recovery");
              }}
            />
          )}

          {view === "recovery" && (
            <RecoveryForm
              expiresAt={expiresAt}
              onVerify={async (code) => {
                /* 🔌 BACKEND: POST /api/auth/recovery/verify */
                const { resetToken: token } = await verifyRecoveryCode({ email, code });
                setResetToken(token);
                setView("password");
              }}
              onResend={async () => {
                /* 🔌 BACKEND: POST /api/auth/recovery/request (same route again) */
                const { expiresInSeconds } = await requestRecoveryCode(email);
                setExpiresAt(expiryFrom(expiresInSeconds));
              }}
            />
          )}

          {view === "password" && (
            <NewPasswordForm
              onSubmit={async (newPassword) => {
                /* 🔌 BACKEND: POST /api/auth/recovery/reset */
                await resetPassword({ resetToken, newPassword });
                setResetToken("");
                setNotice("Password updated. Log in");
                setView("login");
              }}
            />
          )}
        </AuthPanel>
      </main>

      <SiteFooter />
    </div>
  );
}

export default Login;
