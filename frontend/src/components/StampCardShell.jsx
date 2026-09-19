/**
 * StampCardShell
 * The shared "postage stamp" chrome used by every step of the signup flow:
 * perforated edge, dashed inner border, maroon header/footer bands, and the
 * bottom-right step counter + action button. Each step (WhoAreYouForm,
 * PhotosForm, YourTasteForm, ...) renders its own fields as children inside
 * this shell, so the chrome only has to be maintained in one place.
 *
 * Usage:
 *   <StampCardShell title="Photos" step={2} totalSteps={3}
 *     buttonLabel="Continue" onButtonClick={handleNext} error={errorMsg}>
 *     ...step-specific fields...
 *   </StampCardShell>
 */
export default function StampCardShell({
  title,
  step = 1,
  totalSteps = 3,
  buttonLabel = "Continue",
  onButtonClick,
  error,
  children,
}) {
  return (
    <div className="stamp-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700&family=Space+Mono:wght@400;700&display=swap');

        .stamp-wrapper, .stamp-wrapper *, .stamp-wrapper *::before, .stamp-wrapper *::after {
          box-sizing: border-box;
        }

        .stamp-wrapper {
          --stamp-cream: #FAF3EE;
          --stamp-dot: #E8B4B8;
          --stamp-maroon: #B33951;
          --stamp-tan: #EDE0D4;
          --stamp-ink: #2B2320;

          /* 🎛️ TUNE THE CARD HERE ------------------------------------- */
          --stamp-width: 400px;   /* overall card width — this is the #1 dial */
          --stamp-pad: 18px;      /* space between the card edge and its content */
          --stamp-gap: 14px;      /* vertical space between each field group */
          /* ------------------------------------------------------------ */

          font-family: 'Space Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
          max-width: var(--stamp-width);
          margin: 0 auto;
          padding: 22px;
        }

        .stamp-card {
          position: relative;
          background: var(--stamp-cream);
          border-radius: 6px;
          padding: var(--stamp-pad);
          box-shadow: 0 18px 40px -22px rgba(43, 35, 32, 0.4);
        }

        .stamp-perf {
          position: absolute;
          pointer-events: none;
          background-image: radial-gradient(circle, var(--stamp-dot) 46%, transparent 47%);
          background-size: 30px 30px;
          background-repeat: round;
        }
        .stamp-perf-top,
        .stamp-perf-bottom {
          left: 0;
          right: 0;
          height: 30px;
        }
        .stamp-perf-top { top: -15px; }
        .stamp-perf-bottom { bottom: -15px; }
        .stamp-perf-left,
        .stamp-perf-right {
          top: 0;
          bottom: 0;
          width: 30px;
        }
        .stamp-perf-left { left: -15px; }
        .stamp-perf-right { right: -15px; }

        .stamp-inner {
          position: relative;
          padding: var(--stamp-pad);
        }

        .stamp-border {
          position: absolute;
          inset: 0;
          border: 2px dashed var(--stamp-maroon);
          border-radius: 3px;
          pointer-events: none;
        }

        .stamp-header {
          margin: calc(var(--stamp-pad) * -1) calc(var(--stamp-pad) * -1) var(--stamp-pad) calc(var(--stamp-pad) * -1);
          padding: 14px var(--stamp-pad);
          background: var(--stamp-maroon);
          border-radius: 3px 3px 0 0;
        }
        .stamp-header h1 {
          margin: 0;
          font-family: 'Fraunces', Georgia, serif;
          font-weight: 700;
          font-size: clamp(20px, 5vw, 28px); /* 🎛️ header text size */
          line-height: 1.15;
          color: #FFFFFF;
          text-transform: uppercase;
        }

        .stamp-body {
          display: flex;
          flex-direction: column;
          gap: var(--stamp-gap);
        }

        .stamp-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .stamp-error {
          font-size: 12px;
          color: var(--stamp-maroon);
          letter-spacing: 0.02em;
        }
        .stamp-step {
          margin-left: auto;
          font-weight: 700;
          font-size: 20px;
          color: var(--stamp-ink);
        }

        .stamp-footer {
          margin: var(--stamp-gap) calc(var(--stamp-pad) * -1) calc(var(--stamp-pad) * -1) calc(var(--stamp-pad) * -1);
          padding: 12px var(--stamp-pad);
          background: var(--stamp-maroon);
          border-radius: 0 0 3px 3px;
          display: flex;
          justify-content: flex-end;
        }

        .stamp-continue-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: var(--stamp-cream);
          color: var(--stamp-ink);
          border: none;
          border-radius: 5px;
          padding: 10px 18px;
          font-family: 'Space Mono', monospace;
          font-weight: 700;
          font-size: 15px; /* 🎛️ button text size */
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .stamp-continue-btn:hover { transform: translateX(2px); }
        .stamp-continue-btn:focus-visible {
          outline: 2px solid #FFFFFF;
          outline-offset: 3px;
        }
        .stamp-arrow { font-size: 15px; }

        @media (max-width: 480px) {
          .stamp-header h1 { font-size: 20px; }
        }
      `}</style>

      <div className="stamp-card">
        <span className="stamp-perf stamp-perf-top" aria-hidden="true" />
        <span className="stamp-perf stamp-perf-bottom" aria-hidden="true" />
        <span className="stamp-perf stamp-perf-left" aria-hidden="true" />
        <span className="stamp-perf stamp-perf-right" aria-hidden="true" />

        <div className="stamp-inner">
          <span className="stamp-border" aria-hidden="true" />

          <header className="stamp-header">
            <h1>{title}</h1>
          </header>

          <div className="stamp-body">
            {children}

            <div className="stamp-meta-row">
              {error && <span className="stamp-error">{error}</span>}
              <span className="stamp-step">
                {step}/{totalSteps}
              </span>
            </div>
          </div>

          <footer className="stamp-footer">
            <button type="button" className="stamp-continue-btn" onClick={onButtonClick}>
              {buttonLabel}
              <span className="stamp-arrow" aria-hidden="true">→</span>
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
