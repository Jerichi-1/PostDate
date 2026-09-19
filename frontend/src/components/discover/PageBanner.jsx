/**
 * PageBanner
 * The big rounded maroon banner used as a page title inside the app (the
 * Figma's "HOME" pill above the search bar). Reused wherever a page needs
 * the same treatment.
 *
 * Usage:
 *   <PageBanner>Home</PageBanner>
 */
export default function PageBanner({ children }) {
  return (
    <div className="pbanner">
      <style>{`
        .pbanner {
          background: var(--pd-maroon);
          border-radius: var(--pd-radius);
          padding: clamp(14px, 2vw, 24px) clamp(20px, 3vw, 40px);  /* 🎛️ banner size */
          max-width: 938px;   /* 🎛️ matches the Figma's banner width */

          font-family: var(--pd-mono);
          font-weight: 700;
          font-size: clamp(22px, 3.4vw, 56px);   /* 🎛️ heading text size */
          line-height: 1.15;
          color: var(--pd-white);
        }
      `}</style>
      {children}
    </div>
  );
}
