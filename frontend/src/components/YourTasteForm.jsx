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
          gap: 16px;
        }
        .taste-field-label {
          font-family: 'Space Mono', monospace;
          font-weight: 700;
          font-size: clamp(18px, 3.4vw, 26px);
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: var(--stamp-ink);
        }

        .taste-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .taste-chip {
          font-family: 'Space Mono', monospace;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: var(--stamp-ink);
          background: var(--stamp-tan);
          border: 2px solid transparent;
          border-radius: 5px;
          padding: 13px 18px;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .taste-chip:hover { background: #E7D6C8; }
        .taste-chip:focus-visible {
          outline: 2px solid var(--stamp-maroon);
          outline-offset: 2px;
        }
        .taste-chip-active {
          background: var(--stamp-maroon);
          color: var(--stamp-cream);
        }

        .taste-count {
          font-size: 12px;
          letter-spacing: 0.02em;
          color: var(--stamp-ink);
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
