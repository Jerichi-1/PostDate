/**
 * AdminDashboard — the staff console. One component, two roles:
 *
 *   <AdminDashboard role="admin" />       nine sidebar sections
 *   <AdminDashboard role="moderator" />   six sidebar sections
 *
 *   ┌──────────────────────────────────────────────┐
 *   │ POSTDATE!                    ● ACTIVE: 128   │
 *   ├────────────┬─────────────────────────────────┤
 *   │ DASHBOARD  │                                 │
 *   │ (Statistics)│        pink content panel      │
 *   │ (Reports)   │                                │
 *   │ ...        │                                 │
 *   └────────────┴─────────────────────────────────┘
 *
 * The panel renders whatever { columns, rows } the backend sends for the
 * selected section, so new sections need no frontend changes — just an
 * entry in SECTIONS (components/admin/AdminSidebar.jsx) and a matching route.
 */
import { useEffect, useState } from "react";

import Wordmark from "../components/Wordmark";
import AdminSidebar, { SECTIONS } from "../components/admin/AdminSidebar";
import { getActiveCount, getAdminSection } from "../services/postdateApi";

export default function AdminDashboard({ role = "admin" }) {
  const sections = SECTIONS[role] ?? SECTIONS.admin;

  const [section, setSection] = useState(sections[0].id);
  const [data, setData] = useState(null);
  const [activeCount, setActiveCount] = useState(null);
  const [loading, setLoading] = useState(true);

  /* 🔌 BACKEND: GET /api/admin/active-count.
     💡 If you want this to tick live, swap the one-off call for a websocket
        or a setInterval that re-runs getActiveCount(). */
  useEffect(() => {
    let cancelled = false;
    getActiveCount()
      .then((res) => !cancelled && setActiveCount(res.activeCount))
      .catch(() => !cancelled && setActiveCount(null));
    return () => {
      cancelled = true;
    };
  }, []);

  /* 🔌 BACKEND: GET /api/admin/:section — re-runs whenever a pill is clicked. */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getAdminSection(section)
      .then((res) => !cancelled && setData(res))
      .catch(() => !cancelled && setData(null))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [section]);

  const columns = data?.columns ?? [];
  const rows = data?.rows ?? [];

  return (
    <div className="admin">
      <style>{`
        .admin {
          min-height: 100vh;
          background: var(--pd-ink);      /* the dark console background */
          display: flex;
          flex-direction: column;
        }

        .admin-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          padding: clamp(10px, 1.4vw, 22px) var(--pd-gutter);
          border-bottom: 1px solid var(--pd-white);
        }

        .admin-active {
          display: flex;
          align-items: center;
          gap: clamp(7px, 0.8vw, 13px);

          font-family: var(--pd-mono);
          font-size: clamp(11px, 1.05vw, 20px);   /* 🎛️ "active" text size */
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--pd-white);
        }
        .admin-dot {
          width: clamp(12px, 1.3vw, 24px);
          height: clamp(12px, 1.3vw, 24px);
          border-radius: 50%;
          background: var(--pd-pink);
          border: 2px solid var(--pd-ink);
          box-shadow: 0 0 0 1px rgba(232, 180, 184, 0.5);
        }

        .admin-body {
          flex: 1;
          width: 100%;
          max-width: var(--pd-max);
          margin: 0 auto;
          padding: clamp(14px, 2vw, 30px) var(--pd-gutter) clamp(20px, 3vw, 44px);

          /* 🎛️ sidebar width is the first value */
          display: grid;
          grid-template-columns: minmax(150px, 15%) minmax(0, 1fr);
          gap: clamp(14px, 2vw, 30px);
          align-items: stretch;
        }

        /* white hairline between the sidebar and the panel */
        .admin-panel-wrap {
          border-left: 1px solid var(--pd-white);
          padding-left: clamp(14px, 2vw, 30px);
          min-width: 0;
          display: flex;
        }

        .admin-panel {
          flex: 1;
          background: var(--pd-pink);
          border-radius: 20px;
          padding: clamp(14px, 2vw, 32px);
          min-height: clamp(280px, 46vw, 780px);   /* 🎛️ panel height */
          overflow: auto;
        }

        .admin-panel-title {
          margin: 0 0 clamp(10px, 1.4vw, 20px);
          font-family: var(--pd-display);
          font-weight: 700;
          font-size: clamp(18px, 2vw, 36px);
          color: var(--pd-maroon);
        }

        /* ── the generic table the backend data drops into ───────────────── */
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-family: var(--pd-mono);
          font-size: clamp(10px, 1vw, 16px);
          color: var(--pd-ink);
        }
        .admin-table th,
        .admin-table td {
          text-align: left;
          padding: clamp(7px, 0.9vw, 14px) clamp(8px, 1vw, 16px);
          border-bottom: 1px solid rgba(43, 35, 32, 0.18);
        }
        .admin-table th {
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--pd-maroon);
        }
        .admin-table tr:last-child td { border-bottom: none; }

        .admin-empty {
          margin: 0;
          font-family: var(--pd-mono);
          font-size: clamp(11px, 1vw, 16px);
          line-height: 1.6;
          color: var(--pd-ink);
          opacity: 0.8;
        }

        @media (max-width: 760px) {
          .admin-body { grid-template-columns: minmax(0, 1fr); }
          .admin-panel-wrap { border-left: none; border-top: 1px solid var(--pd-white);
                              padding-left: 0; padding-top: clamp(14px, 2vw, 24px); }
        }
      `}</style>

      <header className="admin-header">
        <Wordmark to="/" />

        <p className="admin-active">
          <span className="admin-dot" aria-hidden="true" />
          Active: {activeCount ?? "—"}
        </p>
      </header>

      <div className="admin-body">
        <AdminSidebar role={role} active={section} onChange={setSection} />

        <div className="admin-panel-wrap">
          <section className="admin-panel" aria-live="polite">
            <h1 className="admin-panel-title">
              {sections.find((s) => s.id === section)?.label ?? section}
            </h1>

            {loading && <p className="admin-empty">Loading…</p>}

            {!loading && rows.length === 0 && (
              <p className="admin-empty">
                Nothing here yet. Wire up <code>GET /api/admin/{section}</code> in
                services/postdateApi.js and this table fills itself in.
              </p>
            )}

            {!loading && rows.length > 0 && (
              <table className="admin-table">
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col} scope="col">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i}>
                      {columns.map((col) => (
                        <td key={col}>{String(row[col] ?? "—")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
