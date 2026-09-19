/**
 * SettingsTab — the dark panel behind the gear tab.
 *
 * The Figma only blocks this out with the words "settings stuff", so that is
 * what renders by default. Pass children to drop the real controls in without
 * touching any styling:
 *
 *   <SettingsTab>
 *     <label>...</label>
 *     <button>Delete account</button>
 *   </SettingsTab>
 */
export default function SettingsTab({ children }) {
  return (
    <div className="settings">
      <style>{`
        .settings {
          height: 100%;
          display: grid;
          place-items: center;

          font-family: var(--pd-mono);
          color: var(--pd-white);
        }

        /* 🎛️ the placeholder wording and size — delete once real settings land */
        .settings-placeholder {
          margin: 0;
          font-size: clamp(24px, 4.5vw, 84px);
          line-height: 1.25;
          text-align: center;
          opacity: 0.9;
        }

        /* styling that real settings content inherits */
        .settings-content {
          width: 100%;
          align-self: start;
          display: flex;
          flex-direction: column;
          gap: clamp(10px, 1.4vw, 20px);
          font-size: clamp(11px, 1vw, 17px);
        }
      `}</style>

      {children ? (
        <div className="settings-content">{children}</div>
      ) : (
        <p className="settings-placeholder">
          settings
          <br />
          stuff
        </p>
      )}
    </div>
  );
}
