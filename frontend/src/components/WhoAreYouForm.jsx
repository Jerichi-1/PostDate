import { useState } from "react";
import StampCardShell from "./StampCardShell";

/**
 * WhoAreYouForm
 * Step 1 of the signup flow: name, birthdate, gender, short bio.
 * Chrome (dots, border, header/footer, button) lives in StampCardShell —
 * this file only owns the fields and their validation.
 *
 * Usage:
 *   <WhoAreYouForm onContinue={(data) => console.log(data)} />
 *   <WhoAreYouForm step={1} totalSteps={3} onContinue={handleNext} />
 */

const GENDER_OPTIONS = [
  { value: "", label: "Select one" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "nonbinary", label: "Non-binary" },
  { value: "self-describe", label: "Prefer to self-describe" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

export default function WhoAreYouForm({ step = 1, totalSteps = 3, onContinue }) {
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
    <StampCardShell
      title="Who are you?"
      step={step}
      totalSteps={totalSteps}
      buttonLabel="Continue"
      onButtonClick={handleContinue}
      error={touched && !isValid ? "Fill in the highlighted fields to continue." : null}
    >
      <style>{`
        .whoareyou-field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .whoareyou-field-label {
          font-family: 'Space Mono', monospace;
          font-weight: 700;
          font-size: 12px; /* 🎛️ field label size */
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--stamp-ink);
        }
        .whoareyou-field-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .whoareyou-field-row input { flex: 1 1 90px; } /* 🎛️ min width before name inputs wrap to a new line */

        .stamp-wrapper input,
        .stamp-wrapper select,
        .stamp-wrapper textarea {
          font-family: 'Space Mono', monospace;
          font-weight: 700;
          font-size: 12px; /* 🎛️ input text size */
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: var(--stamp-ink);
          background: var(--stamp-tan);
          border: 2px solid transparent;
          border-radius: 5px;
          padding: 9px 11px; /* 🎛️ input height/roominess */
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
        .whoareyou-input-invalid { border-color: var(--stamp-maroon) !important; }

        .whoareyou-half { max-width: 180px; } /* 🎛️ birthdate field width */

        .whoareyou-select-wrap { position: relative; max-width: 150px; } /* 🎛️ gender field width */
        .whoareyou-select-wrap select {
          appearance: none;
          -webkit-appearance: none;
          padding-right: 30px;
          cursor: pointer;
        }
        .whoareyou-select-wrap::after {
          content: "";
          position: absolute;
          right: 12px;
          top: 50%;
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid var(--stamp-maroon);
          transform: translateY(-35%);
          pointer-events: none;
        }

        .stamp-wrapper textarea {
          min-height: 72px; /* 🎛️ bio box height */
          resize: vertical;
          text-transform: none;
        }
        .stamp-wrapper textarea::placeholder { text-transform: none; }

        @media (max-width: 480px) {
          .whoareyou-field-row { flex-direction: column; }
          .whoareyou-half, .whoareyou-select-wrap { max-width: 100%; }
        }
      `}</style>

      <div className="whoareyou-field-group">
        <span className="whoareyou-field-label">Full name</span>
        <div className="whoareyou-field-row">
          <input
            type="text"
            placeholder="First name"
            aria-label="First name"
            value={values.firstName}
            onChange={update("firstName")}
            className={touched && !values.firstName.trim() ? "whoareyou-input-invalid" : ""}
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
            className={touched && !values.lastName.trim() ? "whoareyou-input-invalid" : ""}
          />
        </div>
      </div>

      <div className="whoareyou-field-group">
        <label className="whoareyou-field-label" htmlFor="stamp-birthdate">
          Birthdate
        </label>
        <input
          id="stamp-birthdate"
          type="text"
          placeholder="MM/DD/YY"
          value={values.birthdate}
          onChange={update("birthdate")}
          className={`whoareyou-half ${
            touched && !values.birthdate.trim() ? "whoareyou-input-invalid" : ""
          }`}
        />
      </div>

      <div className="whoareyou-field-group">
        <label className="whoareyou-field-label" htmlFor="stamp-gender">
          Gender
        </label>
        <div className="whoareyou-select-wrap">
          <select id="stamp-gender" value={values.gender} onChange={update("gender")}>
            {GENDER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="whoareyou-field-group">
        <label className="whoareyou-field-label" htmlFor="stamp-bio">
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
    </StampCardShell>
  );
}
