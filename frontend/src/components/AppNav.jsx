/**
 * AppNav
 * The *logged-in* header: wordmark on the left, then the match-history clock
 * and a maroon rounded pill on the right holding HOME / MESSAGES / PROFILE.
 * Whichever route is open turns salmon. Matches Figma "Rectangle 89".
 *
 * Usage:
 *   <AppNav />
 *   <AppNav links={[{ label: "Home", to: "/discover" }]} />
 */
import { useState } from "react";
import { clearToken, logout } from "../auth";
import { NavLink, useNavigate } from "react-router-dom";
import Wordmark from "./Wordmark";
import MatchHistory from "./MatchHistory";

/* 🎛️ EDIT THE MENU HERE --------------------------------------------------- */
const DEFAULT_LINKS = [
  { label: "Home", to: "/discover" },
  { label: "Messages", to: "/messages" },
  { label: "Profile", to: "/profile" },
];

export default function AppNav({ links = DEFAULT_LINKS }) {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  async function logOut() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      if (err?.response?.status === 401) {
        clearToken();
        navigate("/login", { replace: true });
      } else { window.alert("Could not log out. Please try again."); }
    } finally { setLoggingOut(false); }
  }
  return (
    <header className="appnav">
      <style>{`
        .appnav {
          /* the match-history panel pins itself to this on phones */
          position: relative;

          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          padding: clamp(10px, 1.4vw, 20px) var(--pd-gutter);
          border-bottom: 1px solid var(--pd-white);
        }

        /* clock + pill, side by side */
        .appnav-right {
          display: flex;
          align-items: center;
          gap: clamp(8px, 1vw, 20px);   /* 🎛️ space between the clock and the pill */
        }

        .appnav-pill {
          display: flex;
          align-items: center;

          /* 🎛️ THE PILL --------------------------------------------------
             Figma draws this 700x100. These values keep the same look but
             let it shrink on small screens.                               */
          background: var(--pd-maroon);
          border-radius: var(--pd-radius);
          padding: clamp(8px, 1vw, 16px) clamp(10px, 1.4vw, 26px);
          gap: clamp(12px, 2.2vw, 44px);   /* 🎛️ space between links */
        }

        .appnav-pill a, .appnav-pill button {
          background: none; border: 0; padding: 0; cursor: pointer;
          font-family: var(--pd-mono);
          font-weight: 400;
          font-size: clamp(11px, 1vw, 20px);   /* 🎛️ link text size */
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-decoration: none;
          color: var(--pd-white);
          white-space: nowrap;
          transition: color 0.15s ease;
        }

        /* active route = salmon, exactly like the mockup */
        .appnav-pill a:hover { color: var(--pd-pink); }
        .appnav-pill a.active { color: var(--pd-salmon); }

        @media (max-width: 620px) {
          .appnav { justify-content: center; }
        }
      `}</style>

      <Wordmark to="/discover" />

      <div className="appnav-right">
        <MatchHistory />

        <nav className="appnav-pill" aria-label="Main">
          {links.map(({ label, to }) => (
            <NavLink key={to} to={to}>
              {label}
            </NavLink>
          ))}
          <button type="button" disabled={loggingOut} onClick={logOut}>{loggingOut ? "Logging out…" : "Log out"}</button>
        </nav>
      </div>
    </header>
  );
}
