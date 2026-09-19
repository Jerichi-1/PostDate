import { useRef } from "react";
import { uploadProfilePhotos } from "../../services/postdateApi";

/**
 * PhotosTab — the "Your photos" panel: a small mosaic of the user's pictures.
 * Each photo carries a `span` telling the grid how much room to take:
 *   "tall" = 1 column x 2 rows   "wide" = 2 columns x 1 row   "box" = 1 x 1
 *
 * Usage:
 *   <PhotosTab photos={profile.photos} onChange={setPhotos} />
 */
export default function PhotosTab({ photos = [], onChange }) {
  const fileInput = useRef(null);

  async function handleFiles(event) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    /* 🔌 BACKEND: POST /api/profile/photos — see services/postdateApi.js.
       It returns the updated photo list, which we hand back to the parent. */
    const updated = await uploadProfilePhotos(files);
    onChange?.(updated);
    event.target.value = ""; // lets the same file be picked again later
  }

  return (
    <div className="photos">
      <style>{`
        .photos {
          display: flex;
          flex-direction: column;
          gap: clamp(10px, 1.4vw, 20px);
          height: 100%;
        }

        .photos-grid {
          flex: 1;
          display: grid;
          /* 🎛️ THE MOSAIC — more columns = smaller tiles */
          grid-template-columns: repeat(3, minmax(0, 1fr));
          grid-auto-rows: clamp(60px, 8vw, 130px);
          gap: clamp(8px, 1.1vw, 18px);
        }

        .photos-tile {
          background: var(--pd-grey);
          border-radius: 4px;
          overflow: hidden;
          display: grid;
          place-items: center;

          font-family: var(--pd-mono);
          font-size: clamp(9px, 0.8vw, 13px);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(43, 35, 32, 0.5);
        }
        .photos-tile img { width: 100%; height: 100%; object-fit: cover; }

        /* the three shapes from the mockup */
        .photos-tall { grid-row: span 2; }
        .photos-wide { grid-column: span 2; }
        .photos-box  { grid-column: span 2; }

        .photos-add {
          align-self: flex-start;
          background: var(--pd-cream);
          border: 4px solid var(--pd-maroon);
          border-radius: 30px;
          padding: clamp(6px, 0.8vw, 12px) clamp(16px, 2.2vw, 34px);
          cursor: pointer;

          font-family: var(--pd-mono);
          font-size: clamp(11px, 1.05vw, 18px);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--pd-maroon);
          transition: transform 0.15s ease;
        }
        .photos-add:hover { transform: translateY(-2px); }

        @media (max-width: 720px) {
          .photos-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .photos-wide, .photos-box { grid-column: span 2; }
        }
      `}</style>

      <div className="photos-grid">
        {photos.map(({ id, url, span = "box" }) => (
          <div className={`photos-tile photos-${span}`} key={id}>
            {url ? <img src={url} alt="" /> : <span>Photo</span>}
          </div>
        ))}
      </div>

      {/* A hidden file input keeps the native picker but lets us style the
          button however we like. */}
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="visually-hidden"
      />
      <button
        type="button"
        className="photos-add"
        onClick={() => fileInput.current?.click()}
      >
        Add photos
      </button>
    </div>
  );
}
