/**
 * AdminSidebar
 * The "DASHBOARD" heading plus the column of maroon pill buttons on the staff
 * dashboard. Admins see nine sections, moderators see six — that is the only
 * difference between the two screens in the Figma.
 *
 * Usage:
 *   <AdminSidebar role="admin" active={section} onChange={setSection} />
 */

/* 🎛️ EDIT THE SECTION LISTS HERE ------------------------------------------
   `id` is the slug handed to the backend (GET /api/admin/:id), `label` is the
   text on the pill. Keep ids lowercase and hyphenated.                     */
export const SECTIONS = {
  admin: [
    { id: "statistics", label: "Statistics" },
    { id: "mod-activity", label: "Mod activity" },
    { id: "reports", label: "Reports" },
    { id: "users", label: "Users" },
    { id: "appeals", label: "Appeals" },
    { id: "privacy", label: "Privacy" },
    { id: "server-logs", label: "Server logs" },
    { id: "security-logs", label: "Security logs" },
    { id: "settings", label: "Settings" },
  ],
  moderator: [
    { id: "statistics", label: "Statistics" },
    { id: "reports", label: "Reports" },
    { id: "users", label: "Users" },
    { id: "appeals", label: "Appeals" },
    { id: "ratings", label: "Ratings" },
    { id: "settings", label: "Settings" },
  ],
};

export default function AdminSidebar({ role = "admin", active, onChange }) {
  const items = SECTIONS[role] ?? SECTIONS.admin;

  return (
    <nav className="asidebar" aria-label="Dashboard sections">
      <style>{`
        .asidebar {
          display: flex;
          flex-direction: column;
          gap: clamp(7px, 0.9vw, 14px);   /* 🎛️ space between pills */
        }

        .asidebar-title {
          margin: 0 0 clamp(4px, 0.6vw, 10px);
          font-family: var(--pd-mono);
          font-weight: 400;
          font-size: clamp(14px, 1.5vw, 28px);   /* 🎛️ "Dashboard" size */
          letter-spacing: 0.03em;
          text-transform: uppercase;
          color: var(--pd-white);
        }

        .asidebar-item {
          background: var(--pd-maroon);
          border: 2px solid transparent;
          border-radius: 20px;
          padding: clamp(6px, 0.8vw, 13px) clamp(12px, 1.4vw, 22px);   /* 🎛️ pill size */
          cursor: pointer;
          text-align: center;

          font-family: var(--pd-mono);
          font-size: clamp(10px, 1vw, 18px);     /* 🎛️ pill text size */
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--pd-white);
          white-space: nowrap;
          transition: transform 0.15s ease, background-color 0.15s ease;
        }
        .asidebar-item:hover { transform: translateX(3px); }

        /* the open section gets a pale outline so it reads as selected */
        .asidebar-item[aria-current="page"] {
          border-color: var(--pd-pink);
          background: #c9445e;
        }

        @media (max-width: 760px) {
          .asidebar { flex-direction: row; flex-wrap: wrap; }
          .asidebar-title { width: 100%; }
        }
      `}</style>

      <h2 className="asidebar-title">Dashboard</h2>

      {items.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          className="asidebar-item"
          aria-current={active === id ? "page" : undefined}
          onClick={() => onChange?.(id)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
