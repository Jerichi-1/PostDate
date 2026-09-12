import { useState } from "react";

/**
 *
 *
 *
 */

//temporary need to plug into backed
const GENDER_OPTIONS = [
  { value: "", label: "Select one" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "nonbinary", label: "Non-binary" },
  { value: "self-describe", label: "Prefer to self-describe" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

export default function Signupform({ step = 1, totalSteps = 3, onContinue }) {
  const [values, setValues] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    birthdate: "",
    gender: "",
    bio: "",
  });
  const [touched, setTouched] = useState(false);

  const update = (field) => (e) =>
    setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const isValid =
    values.firstName.trim() && values.lastName.trim() && values.birthdate.trim();

  const handleContinue = () => {
    setTouched(true);
    if (!isValid) return;
    onContinue?.(values);
  };

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
          font-family: 'Space Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
          height: 100px;
          max-width: 640px;
          margin: 0 auto;
          padding: 22px;
          transform: scaleY(0.9);
        }

        .stamp-card {
          position: relative;
          background: var(--stamp-cream);
          border-radius: 6px;
          padding: 22px;
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
          padding: 26px;
        }

        .stamp-border {
          position: absolute;
          inset: 0;
          border: 2px dashed var(--stamp-maroon);
          border-radius: 3px;
          pointer-events: none;
        }

        .stamp-header {
          margin: -26px -26px 26px -26px;
          padding: 20px 26px;
          background: var(--stamp-maroon);
          border-radius: 3px 3px 0 0;
        }
        .stamp-header h1 {
          margin: 0;
          font-family: 'Fraunces', Georgia, serif;
          font-weight: 700;
          font-size: clamp(24px, 6vw, 34px);
          line-height: 1.15;
          color: #FFFFFF;
          text-transform: uppercase;
        }

        .stamp-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .stamp-field-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stamp-field-label {
          font-family: 'Space Mono', monospace;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--stamp-ink);
        }

        .stamp-field-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .stamp-field-row input { flex: 1 1 140px; }

        .stamp-wrapper input,
        .stamp-wrapper select,
        .stamp-wrapper textarea {
          font-family: 'Space Mono', monospace;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: var(--stamp-ink);
          background: var(--stamp-tan);
          border: 2px solid transparent;
          border-radius: 5px;
          padding: 11px 14px;
          width: 100%;
        }
        .stamp-wrapper input::placeholder,
        .stamp-wrapper textarea::placeholder {
          color: #FFFFFF;
          opacity: 0.95;
        }
        .stamp-wrapper input:focus-visible,
        .stamp-wrapper select:focus-visible,
        .stamp-wrapper textarea:focus-visible {
          outline: none;
          border-color: var(--stamp-maroon);
        }
        .stamp-input-invalid { border-color: var(--stamp-maroon) !important; }

        .stamp-half { max-width: 260px; }

        .stamp-select-wrap { position: relative; max-width: 180px; }
        .stamp-select-wrap select {
          appearance: none;
          -webkit-appearance: none;
          padding-right: 34px;
          cursor: pointer;
        }
        .stamp-select-wrap::after {
          content: "";
          position: absolute;
          right: 14px;
          top: 50%;
          width: 0;
          height: 0;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-top: 9px solid var(--stamp-maroon);
          transform: translateY(-35%);
          pointer-events: none;
        }

        .stamp-wrapper textarea {
          min-height: 96px;
          resize: vertical;
          text-transform: none;
        }
        .stamp-wrapper textarea::placeholder { text-transform: none; }

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
          margin: 26px -26px -26px -26px;
          padding: 16px 26px;
          background: var(--stamp-maroon);
          border-radius: 0 0 3px 3px;
          display: flex;
          justify-content: flex-end;
        }

        .stamp-continue-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: var(--stamp-cream);
          color: var(--stamp-ink);
          border: none;
          border-radius: 5px;
          padding: 12px 22px;
          font-family: 'Space Mono', monospace;
          font-weight: 700;
          font-size: 18px;
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
        .stamp-arrow { font-size: 18px; }

        @media (max-width: 480px) {
          .stamp-header h1 { font-size: 22px; }
          .stamp-field-row { flex-direction: column; }
          .stamp-half, .stamp-select-wrap { max-width: 100%; }
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
            <h1>Who are you?</h1>
          </header>

          <div className="stamp-body">
            <div className="stamp-field-group">
              <span className="stamp-field-label">Full name</span>
              <div className="stamp-field-row">
                <input
                  type="text"
                  placeholder="First name"
                  aria-label="First name"
                  value={values.firstName}
                  onChange={update("firstName")}
                  className={touched && !values.firstName.trim() ? "stamp-input-invalid" : ""}
                />
                <input
                  type="text"
                  placeholder="Middle name"
                  aria-label="Middle name"
                  value={values.middleName}
                  onChange={update("middleName")}
                />
                <input
                  type="text"
                  placeholder="Last name"
                  aria-label="Last name"
                  value={values.lastName}
                  onChange={update("lastName")}
                  className={touched && !values.lastName.trim() ? "stamp-input-invalid" : ""}
                />
              </div>
            </div>

            <div className="stamp-field-group">
              <label className="stamp-field-label" htmlFor="stamp-birthdate">
                Birthdate
              </label>
              <input
                id="stamp-birthdate"
                type="text"
                placeholder="MM/DD/YY"
                value={values.birthdate}
                onChange={update("birthdate")}
                className={`stamp-half ${
                  touched && !values.birthdate.trim() ? "stamp-input-invalid" : ""
                }`}
              />
            </div>

            <div className="stamp-field-group">
              <label className="stamp-field-label" htmlFor="stamp-gender">
                Gender
              </label>
              <div className="stamp-select-wrap">
                <select id="stamp-gender" value={values.gender} onChange={update("gender")}>
                  {GENDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="stamp-field-group">
              <label className="stamp-field-label" htmlFor="stamp-bio">
                Short bio
              </label>
              <textarea
                id="stamp-bio"
                placeholder="A couple sentences about you..."
                value={values.bio}
                onChange={update("bio")}
                rows={4}
              />
            </div>

            <div className="stamp-meta-row">
              {touched && !isValid && (
                <span className="stamp-error">Fill in the highlighted fields to continue.</span>
              )}
              <span className="stamp-step">
                {step}/{totalSteps}
              </span>
            </div>
          </div>

          <footer className="stamp-footer">
            <button type="button" className="stamp-continue-btn" onClick={handleContinue}>
              Continue
              <span className="stamp-arrow" aria-hidden="true">→</span>
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}

