/**
 * SiteNav
 * The *logged-out* header: wordmark on the left, plain text links on the
 * right, and a white hairline underneath. Used on the landing page and the
 * signup flow.
 *
 * For the *logged-in* header (the maroon pill with HOME / MESSAGES / PROFILE)
 * use AppNav instead.
 *
 * Usage:
 *   <SiteNav />                          // default links
 *   <SiteNav links={[{ label: "Home", to: "/" }]} />
 */
import { NavLink } from "react-router-dom";
import Wordmark from "./Wordmark";

/* 🎛️ EDIT THE MENU HERE ---------------------------------------------------
   Add, remove or reorder links. `to` must match a <Route path> in App.jsx. */
const DEFAULT_LINKS = [
  { label: "Home", to: "/" },
  { label: "Get started", to: "/signup" },
  { label: "About us", to: "/about" },
];

export default function SiteNav({ links = DEFAULT_LINKS }) {
  return (
    <header className="sitenav">
      <style>{`
        .sitenav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;

          /* 🎛️ Header height + side padding */
          padding: clamp(10px, 1.6vw, 22px) var(--pd-gutter);

          /* the white hairline under the header (Figma "Line 7") */
          border-bottom: 1px solid var(--pd-white);
        }

        .sitenav-links {
          display: flex;
          align-items: center;
          gap: clamp(16px, 3vw, 56px);   /* 🎛️ space between links */
        }

        .sitenav-links a {
          font-family: var(--pd-mono);
          font-weight: 400;
          font-size: clamp(12px, 1.1vw, 20px);  /* 🎛️ link text size */
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-decoration: none;
          color: var(--pd-white);
          white-space: nowrap;
          padding-bottom: 2px;
          border-bottom: 2px solid transparent;
          transition: border-color 0.15s ease;
        }

        /* NavLink adds .active to whichever route is currently open */
        .sitenav-links a:hover,
        .sitenav-links a.active {
          border-bottom-color: var(--pd-white);
        }

        @media (max-width: 560px) {
          .sitenav { justify-content: center; }
        }
      `}</style>

      <Wordmark to="/" />

      <nav className="sitenav-links" aria-label="Main">
        {links.map(({ label, to }) => (
          /* `end` stops "/" from staying highlighted on every sub-page */
          <NavLink key={to} to={to} end={to === "/"}>
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
