/**
 * Home — the landing page.
 *
 * Composition (matches the Figma board):
 *
 *   ┌───────────────────────────────────────────────┐
 *   │ POSTDATE!              HOME  GET STARTED  ... │  SiteNav
 *   ├───────────────────────────────────────────────┤
 *   │  BRING TRUST            ┌──────────────┐      │
 *   │  AND CONNECTION         │  phone card  │      │  hero row 1
 *   │  IN ONE PLACE           │   [EXPLORE]  │      │
 *   │                         └──────────────┘      │
 *   │  ┌─ stamp ─┐                  • 10,000+  ▄ ▄  │  hero row 2
 *   │  │ steps   │                  • 92% ...  █ █  │
 *   │  └─────────┘                  ───────────────  │
 *   │  (Create Profile)                             │
 *   ├───────────────────────────────────────────────┤
 *   │                   footer                      │  SiteFooter
 *   └───────────────────────────────────────────────┘
 *
 * The maroon clouds and corner stripes live in <HeroBackdrop /> behind it all.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import HeroBackdrop from "../components/HeroBackdrop";
import StepStamp from "../components/StepStamp";
import phones from "../assets/Phones.png";

import { getLandingStats } from "../services/postdateApi";

/* 🎛️ EDIT THE HEADLINE HERE ------------------------------------------------
   One array entry per line. Line breaks are deliberate — the Figma sets it
   as three lines, so keep it to three unless you resize the type below.    */
const HEADLINE = ["Bring trust", "and connection", "in one place"];

/* 🎛️ BAR CHART ------------------------------------------------------------
   Heights are percentages of the chart box. Decorative by default; to drive
   them from real numbers, map over the `stats` state instead.             */
const BARS = [86, 74, 100];

export default function Home() {
  /* 🔌 BACKEND: the three bullet stats.
     getLandingStats() lives in services/postdateApi.js — that's the only
     file that needs editing when the /api/stats route goes live. */
  const [stats, setStats] = useState([]);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getLandingStats()
      .then((data) => !cancelled && setStats(data))
      .catch(() => !cancelled && setStatsError(true));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="home">
      <style>{`
        .home {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--pd-pink);
        }

        /* Everything except the footer sits in here so the clouds can be
           absolutely positioned against it. */
        .home-stage {
          position: relative;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .home-stage > * { position: relative; z-index: 1; }

        .home-hero {
          flex: 1;
          width: 100%;
          max-width: var(--pd-max);
          margin: 0 auto;
          padding: clamp(24px, 4vw, 72px) var(--pd-gutter) clamp(32px, 5vw, 90px);

          /* 🎛️ THE TWO-COLUMN GRID --------------------------------------
             Row 1: headline | phone card
             Row 2: stamp    | stats + chart                              */
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: clamp(28px, 6vw, 110px) clamp(24px, 4vw, 64px);
          align-items: start;
        }

        /* ── headline ──────────────────────────────────────────────────── */
        .home-headline {
          margin: clamp(10px, 4vw, 70px) 0 0;
          font-family: var(--pd-display);
          font-weight: 700;
          font-size: clamp(26px, 4.3vw, 76px);   /* 🎛️ headline size */
          line-height: 1.12;
          letter-spacing: 0.01em;
          text-transform: uppercase;
          color: var(--pd-white);
        }

        /* ── phone card + explore button ───────────────────────────────── */
        .home-card {
          position: relative;
          justify-self: end;
          width: min(100%, 520px);        /* 🎛️ card size */
          aspect-ratio: 480 / 444;        /* matches Phones.png */
          border-radius: clamp(14px, 1.8vw, 28px);
          overflow: hidden;
          box-shadow: 0 18px 40px -26px rgba(43, 35, 32, 0.55);
        }
        .home-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .home-explore {
          position: absolute;
          left: 50%;                      /* 🎛️ button position on the card */
          bottom: 9%;
          transform: translateX(-38%);

          background: var(--pd-cream);
          color: var(--pd-ink);
          border: 3px solid var(--pd-maroon);
          border-radius: 8px;
          padding: clamp(7px, 0.9vw, 13px) clamp(16px, 2.4vw, 38px);

          font-family: var(--pd-mono);
          font-size: clamp(12px, 1.25vw, 21px);   /* 🎛️ button text size */
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          white-space: nowrap;
          cursor: pointer;
          box-shadow: 0 5px 0 -1px rgba(43, 35, 32, 0.28);
          transition: transform 0.15s ease;
        }
        .home-explore:hover { transform: translate(-38%, -2px); }

        /* ── stamp column ──────────────────────────────────────────────── */
        .home-stamp-col {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: clamp(12px, 1.6vw, 24px);
        }

        .home-cta {
          /* 🎛️ the "Create Profile" pill */
          align-self: center;
          background: var(--pd-cream);
          color: var(--pd-ink);
          border: 4px solid var(--pd-maroon);
          border-radius: 999px;
          padding: clamp(7px, 0.9vw, 13px) clamp(18px, 2.4vw, 36px);

          font-family: var(--pd-mono);
          font-size: clamp(12px, 1.2vw, 20px);
          letter-spacing: 0.06em;
          text-decoration: none;
          white-space: nowrap;
          transition: transform 0.15s ease;
        }
        .home-cta:hover { transform: translateY(-2px); }

        /* ── stats + chart ─────────────────────────────────────────────── */
        .home-figures {
          align-self: end;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: end;
          gap: clamp(12px, 2vw, 34px);

          /* the white rule the bars stand on */
          border-bottom: 1px solid var(--pd-white);
          padding-bottom: 4px;
        }

        .home-stats {
          margin: 0;
          padding-left: 1.1em;
          list-style: disc;

          font-family: var(--pd-mono);
          font-size: clamp(11px, 1.15vw, 19px);   /* 🎛️ stat text size */
          line-height: 1.5;
          color: var(--pd-cream);
        }
        .home-stats li { margin-bottom: 0.15em; }
        .home-stats li::marker { font-size: 0.85em; }

        .home-chart {
          display: flex;
          align-items: flex-end;
          gap: clamp(6px, 0.9vw, 16px);
          height: clamp(90px, 13vw, 210px);       /* 🎛️ chart height */
        }
        .home-bar {
          width: clamp(14px, 1.7vw, 30px);        /* 🎛️ bar width */
          background: var(--pd-salmon);
          border-radius: 6px 6px 0 0;
        }

        /* ── responsive ────────────────────────────────────────────────── */
        @media (max-width: 860px) {
          .home-hero { grid-template-columns: minmax(0, 1fr); }
          .home-card { justify-self: center; }
          .home-stamp-col { align-items: center; }

          /* Stacked, the stats would land half on the cloud and half on the
             pink, so the cream text loses contrast. Giving the block its own
             maroon backing keeps it readable at every width. */
          .home-figures {
            align-self: auto;
            background: var(--pd-maroon);
            border-radius: var(--pd-radius);
            padding: clamp(12px, 3.5vw, 20px) clamp(12px, 3.5vw, 20px) 4px;
          }
        }
      `}</style>

      <div className="home-stage">
        <HeroBackdrop />

        <SiteNav />

        <main className="home-hero">
          {/* row 1, left */}
          <h1 className="home-headline">
            {HEADLINE.map((line, i) => (
              <span key={line} style={{ display: "block" }}>
                {line}
                {i < HEADLINE.length - 1 ? "" : ""}
              </span>
            ))}
          </h1>

          {/* row 1, right */}
          <div className="home-card">
            <img src={phones} alt="" />
            {/* 🔌 BACKEND / ROUTING: point this at the browse page once it
                exists — e.g. to="/discover". */}
            <Link className="home-explore" to="/discover">
              Explore
            </Link>
          </div>

          {/* row 2, left */}
          <div className="home-stamp-col">
            <StepStamp />
            <Link className="home-cta" to="/signup">
              Create Profile
            </Link>
          </div>

          {/* row 2, right */}
          <div className="home-figures">
            <ul className="home-stats">
              {statsError && <li>Stats are unavailable right now.</li>}
              {stats.map(({ display, label }) => (
                <li key={label}>
                  {display} {label}
                </li>
              ))}
            </ul>

            <div className="home-chart" aria-hidden="true">
              {BARS.map((height, i) => (
                <span
                  key={i}
                  className="home-bar"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
