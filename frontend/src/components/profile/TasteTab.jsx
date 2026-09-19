import { useEffect, useState } from "react";
import { saveProfileTags } from "../../services/postdateApi";

/**
 * TasteTab — the "Your taste" panel.
 *
 * Read mode: the chips are just labels; the selected ones carry a maroon
 * outline. Hit EDIT and the chips become toggle buttons; hit ✔ to save.
 *
 * Usage:
 *   <TasteTab tags={profile.tags} />
 *
 * `tags` is [{ label: string, selected: boolean }, ...]
 */
export default function TasteTab({ tags = [] }) {
  const [chips, setChips] = useState(tags);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  /* keep local state in step when the parent finishes loading the profile */
  useEffect(() => setChips(tags), [tags]);

  function toggle(index) {
    if (!editing) return;
    setChips((prev) =>
      prev.map((chip, i) =>
        i === index ? { ...chip, selected: !chip.selected } : chip
      )
    );
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      /* 🔌 BACKEND: PUT /api/profile/tags — see services/postdateApi.js */
      await saveProfileTags(chips.filter((c) => c.selected).map((c) => c.label));
      setEditing(false);
      setMessage("Saved");
    } catch {
      setMessage("Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="taste">
      <style>{`
        .taste {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: clamp(16px, 2.5vw, 34px);
          height: 100%;
        }

        .taste-chips {
          display: flex;
          flex-wrap: wrap;
          gap: clamp(8px, 1.1vw, 18px);   /* 🎛️ space between chips */
          align-content: flex-start;
        }

        .taste-chip {
          background: var(--pd-tan);
          border: 4px solid transparent;   /* transparent keeps the size stable */
          border-radius: 5px;
          padding: clamp(9px, 1.2vw, 20px) clamp(12px, 1.6vw, 26px);  /* 🎛️ chip size */

          font-family: var(--pd-mono);
          font-size: clamp(10px, 1vw, 17px);   /* 🎛️ chip text size */
          letter-spacing: 0.03em;
          color: var(--pd-ink);
          text-align: left;
        }
        /* a picked chip gets the maroon outline from the mockup */
        .taste-chip-on { border-color: var(--pd-maroon); }

        .taste-chip-editable { cursor: pointer; }
        .taste-chip-editable:hover { border-color: rgba(179, 57, 81, 0.45); }

        .taste-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: clamp(8px, 1.1vw, 18px);
        }

        .taste-note {
          margin-right: auto;
          font-family: var(--pd-mono);
          font-size: clamp(10px, 0.9vw, 14px);
          color: var(--pd-ink);
          opacity: 0.75;
        }

        /* the two pill buttons: green ✔ to save, salmon EDIT to start editing */
        .taste-btn {
          background: var(--pd-cream);
          border-radius: 30px;
          border: 5px solid var(--pd-salmon);
          padding: clamp(6px, 0.8vw, 12px) clamp(18px, 3vw, 54px);
          cursor: pointer;

          font-family: var(--pd-mono);
          font-size: clamp(12px, 1.3vw, 24px);   /* 🎛️ button text size */
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--pd-maroon);
          transition: transform 0.15s ease;
        }
        .taste-btn:hover { transform: translateY(-2px); }
        .taste-btn:disabled { opacity: 0.55; cursor: default; transform: none; }

        .taste-btn-save {
          border-color: var(--pd-green);
          color: var(--pd-ink);
          padding-left: clamp(14px, 1.8vw, 26px);
          padding-right: clamp(14px, 1.8vw, 26px);
        }
      `}</style>

      <div className="taste-chips">
        {chips.length === 0 && (
          <p className="taste-note">No interests picked yet. Hit edit to add some.</p>
        )}

        {chips.map((chip, i) =>
          editing ? (
            <button
              key={chip.label}
              type="button"
              aria-pressed={chip.selected}
              onClick={() => toggle(i)}
              className={`taste-chip taste-chip-editable${
                chip.selected ? " taste-chip-on" : ""
              }`}
            >
              {chip.label}
            </button>
          ) : (
            <span
              key={chip.label}
              className={`taste-chip${chip.selected ? " taste-chip-on" : ""}`}
            >
              {chip.label}
            </span>
          )
        )}
      </div>

      <div className="taste-actions">
        {message && <span className="taste-note">{message}</span>}

        {/* Always on screen like the mockup, but it only does something once
            you are actually editing — nothing to save otherwise. */}
        <button
          type="button"
          className="taste-btn taste-btn-save"
          onClick={handleSave}
          disabled={!editing || saving}
          title={editing ? "Save interests" : "Hit edit first"}
        >
          {saving ? "…" : "✔"}
          <span className="visually-hidden">Save interests</span>
        </button>

        <button
          type="button"
          className="taste-btn"
          onClick={() => (editing ? setEditing(false) : setEditing(true))}
        >
          {editing ? "Cancel" : "Edit"}
        </button>
      </div>
    </div>
  );
}
