import { useState } from "react";
import StampCardShell from "./StampCardShell";

const DEFAULT_TASTE_OPTIONS = [
  "Coffee dates",
  "Late night talks",
  "Hiking",
  "Live music",
  "Home cooking",
  "Board games",
  "Road trips",
  "Bookworm",
  "Dog person",
  "Cat person",
  "Early riser",
  "Night owl",
];

/**
 * YourTasteForm
 * Step 3 of the signup flow: pick a minimum number of interest tags.
 * The mockup's blank tag boxes didn't specify labels, so this ships with a
 * reasonable default set — pass your own via the `options` prop.
 * Sizes are `calc(<Figma px> * var(--u))`, see pages/Signup.jsx. The chips
 * wrap inside the fixed-size stamp card, so roughly 12–16 tags is the limit.
 *
 * Usage:
 *   <YourTasteForm onConfirm={(tags) => console.log(tags)} />
 *   <YourTasteForm step={3} totalSteps={3} minSelected={3} options={myTags} onConfirm={handleFinish} />
 */
export default function YourTasteForm({
  step = 3,
  totalSteps = 3,
  minSelected = 3,
  options = DEFAULT_TASTE_OPTIONS,
  onConfirm,
}) {
  const [selected, setSelected] = useState([]);
  const [touched, setTouched] = useState(false);

  const isValid = selected.length >= minSelected;

  const toggle = (tag) => {
    setSelected((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleConfirm = () => {
    setTouched(true);
    if (!isValid) return;
    onConfirm?.(selected);
  };

  return (
    <StampCardShell
      title="Your taste"
      step={step}
      totalSteps={totalSteps}
      buttonLabel="Confirm!"
      onButtonClick={handleConfirm}
      error={touched && !isValid ? `Pick at least ${minSelected} to continue.` : null}
    >
      <style>{`
        .taste-field-group {
          display: flex;
          flex-direction: column;
          gap: calc(8 * var(--u));
        }
        .taste-field-label {
          font-weight: 700;
          font-size: calc(24 * var(--u));
          line-height: calc(36 * var(--u));
          text-transform: uppercase;
          color: var(--pd-ink);
        }

        .taste-grid {
          display: flex;
          flex-wrap: wrap;
          gap: calc(10 * var(--u));
        }
        .taste-chip {
          font-family: var(--pd-mono);
          font-weight: 700;
          font-size: calc(15 * var(--u));
          line-height: 1;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: var(--pd-ink);
          background: var(--pd-tan);
          border: calc(2 * var(--u)) solid transparent;
          border-radius: calc(5 * var(--u));
          padding: calc(13 * var(--u)) calc(16 * var(--u));
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .taste-chip:hover { background: #E7D6C8; }
        .taste-chip:focus-visible {
          outline: 2px solid var(--pd-maroon);
          outline-offset: 2px;
        }
        .taste-chip-active {
          background: var(--pd-maroon);
          color: var(--pd-cream);
        }

        .taste-count {
          font-size: calc(14 * var(--u));
          letter-spacing: 0.02em;
          color: var(--pd-ink);
          opacity: 0.6;
        }
      `}</style>

      <div className="taste-field-group">
        <span className="taste-field-label">Select min {minSelected}</span>

        <div className="taste-grid" role="group" aria-label="Your taste">
          {options.map((tag) => {
            const active = selected.includes(tag);
            return (
              <button
                type="button"
                key={tag}
                className={`taste-chip ${active ? "taste-chip-active" : ""}`}
                aria-pressed={active}
                onClick={() => toggle(tag)}
              >
                {tag}
              </button>
            );
          })}
        </div>

        <span className="taste-count">
          {selected.length} selected{minSelected ? ` (min ${minSelected})` : ""}
        </span>
      </div>
    </StampCardShell>
  );
}
