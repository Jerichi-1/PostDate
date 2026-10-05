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
import { NavLink } from "react-router-dom";
import Wordmark from "./Wordmark";
import MatchHistory from "./MatchHistory";

/* 🎛️ EDIT THE MENU HERE --------------------------------------------------- */
const DEFAULT_LINKS = [
  { label: "Home", to: "/discover" },
  { label: "Messages", to: "/messages" },
  { label: "Profile", to: "/profile" },
];

export default function AppNav({ links = DEFAULT_LINKS }) {
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

        .appnav-pill a {
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
        </nav>
      </div>
    </header>
  );
}
