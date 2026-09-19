/**
 * SignupAside
 * The right-hand column next to the stamp card on each signup step: a short
 * "why we ask" blurb plus a static preview of what the resulting profile
 * card / profile page will look like.
 *
 * The copy differs per step, so pass `step` and it'll pick a sensible
 * default explanation — or override with your own via the `copy` prop.
 *
 * Usage:
 *   <SignupAside step={step} />
 *   <SignupAside copy="Custom explanation for this step..." />
 */

const DEFAULT_COPY = {
  1: "We ask for your name, birthdate, and a short bio so matches know who they're talking to before the first message.",
  2: "Real photos help people recognize you and build trust — profiles with clear photos get noticeably better responses.",
  3: "Your picks shape which matches you see first, and show up as tags on your profile so people know what you're into.",
};

export default function SignupAside({ step = 1, copy }) {
  const bodyText = copy ?? DEFAULT_COPY[step] ?? DEFAULT_COPY[1];

  return (
    <aside className="aside-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700&family=Space+Mono:wght@400;700&display=swap');

        .aside-wrapper, .aside-wrapper *, .aside-wrapper *::before, .aside-wrapper *::after {
          box-sizing: border-box;
        }

        .aside-wrapper {
          --aside-cream: #FAF3EE;
          --aside-maroon: #B33951;
          --aside-tan: #EDE0D4;
          --aside-ink: #2B2320;
          --aside-salmon: #EF8B6F;

          /* 🎛️ TUNE THE ASIDE HERE ------------------------------------ */
          --aside-width: 340px;  /* overall panel width — pairs with StampCardShell's --stamp-width */
          /* ------------------------------------------------------------ */

          font-family: 'Space Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
          max-width: var(--aside-width);
          padding: 18px 4px;
        }

        .aside-heading {
          margin: 0 0 8px;
          font-family: 'Fraunces', Georgia, serif;
          font-weight: 700;
          font-size: clamp(18px, 3vw, 22px); /* 🎛️ "Why we ask" heading size */
          color: var(--aside-cream);
          text-transform: uppercase;
        }

        .aside-body {
          margin: 0;
          font-size: 13px; /* 🎛️ blurb text size */
          line-height: 1.55;
          color: var(--aside-ink);
        }

        .aside-divider {
          height: 1px;
          background: rgba(43, 35, 32, 0.25);
          margin: 16px 0 12px;
        }

        .aside-preview-label {
          display: block;
          margin-bottom: 10px;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--aside-cream);
        }

        .aside-preview-row {
          display: flex;
          gap: 12px;
        }

        .aside-profile-card,
        .aside-profile-page {
          flex: 1 1 0;
          min-width: 0;
          background: #fff;
          border-radius: 8px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .aside-card-label {
          font-weight: 700;
          font-size: 10px;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          color: var(--aside-ink);
        }

        .aside-card-photo {
          flex: 1;
          min-height: 100px; /* 🎛️ profile-card preview swatch height */
          background: var(--aside-salmon);
          border-radius: 6px;
          padding: 8px;
        }
        .aside-card-photo .aside-card-label { color: var(--aside-ink); }

        .aside-swatches {
          display: flex;
          gap: 6px;
        }
        .aside-swatch {
          width: 16px;
          height: 16px;
          border-radius: 50%;
        }

        .aside-avatar {
          align-self: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--aside-salmon);
        }

        .aside-page-body {
          flex: 1;
          min-height: 48px;
          background: var(--aside-tan);
          border-radius: 6px;
        }

        @media (max-width: 640px) {
          .aside-wrapper { max-width: 100%; }
        }
      `}</style>

      <h2 className="aside-heading">Why we ask</h2>
      <p className="aside-body">{bodyText}</p>

      <div className="aside-divider" />

      <span className="aside-preview-label">Preview</span>
      <div className="aside-preview-row">
        <div className="aside-profile-card">
          <span className="aside-card-label">Profile card</span>
          <div className="aside-card-photo" />
          <div className="aside-swatches">
            <span className="aside-swatch" style={{ background: "#2B2320" }} />
            <span className="aside-swatch" style={{ background: "#EFC9CE" }} />
            <span className="aside-swatch" style={{ background: "#B33951" }} />
          </div>
        </div>
        <div className="aside-profile-page">
          <span className="aside-card-label">Profile page</span>
          <div className="aside-avatar" />
          <div className="aside-page-body" />
        </div>
      </div>
    </aside>
  );
}
