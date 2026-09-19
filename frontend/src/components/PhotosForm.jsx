import { useRef, useState, useCallback, useEffect } from "react";
import StampCardShell from "./StampCardShell";

/**
 * PhotosForm
 * Step 2 of the signup flow: drag-and-drop (or click-to-browse) photo upload.
 *
 * Usage:
 *   <PhotosForm onContinue={(files) => console.log(files)} />
 *   <PhotosForm step={2} totalSteps={3} minPhotos={1} onContinue={handleNext} />
 */
export default function PhotosForm({ step = 2, totalSteps = 3, minPhotos = 1, onContinue }) {
  const inputRef = useRef(null);
  const [photos, setPhotos] = useState([]); // { id, file, url }
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);

  const isValid = photos.length >= minPhotos;

  // Release object URLs when the component unmounts.
  useEffect(() => {
    return () => {
      photos.forEach((p) => URL.revokeObjectURL(p.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = useCallback((fileList) => {
    const imageFiles = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (!imageFiles.length) return;
    const next = imageFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      url: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...next]);
  }, []);

  const removePhoto = (id) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  const openBrowser = () => inputRef.current?.click();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
  };

  const handleContinue = () => {
    setTouched(true);
    if (!isValid) return;
    onContinue?.(photos.map((p) => p.file));
  };

  return (
    <StampCardShell
      title="Photos"
      step={step}
      totalSteps={totalSteps}
      buttonLabel="Continue"
      onButtonClick={handleContinue}
      error={
        touched && !isValid
          ? `Add at least ${minPhotos} photo${minPhotos > 1 ? "s" : ""} to continue.`
          : null
      }
    >
      <style>{`
        .photos-field-group {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .photos-field-label {
          font-family: 'Space Mono', monospace;
          font-weight: 700;
          font-size: clamp(18px, 3.4vw, 26px);
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: var(--stamp-ink);
        }

        .photos-dropzone {
          position: relative;
          min-height: 300px;
          background: var(--stamp-tan);
          border: 2px dashed transparent;
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 20px;
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .photos-dropzone-active {
          border-color: var(--stamp-maroon);
          background: #E7D6C8;
        }
        .photos-dropzone:focus-visible {
          outline: 2px solid var(--stamp-maroon);
          outline-offset: 3px;
        }

        .photos-hidden-input {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .photos-choose-label {
          font-family: 'Space Mono', monospace;
          font-weight: 700;
          font-size: 16px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--stamp-ink);
          opacity: 0.65;
        }

        .photos-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          width: 100%;
        }
        .photos-thumb {
          position: relative;
          width: 100px;
          height: 100px;
          border-radius: 5px;
          overflow: hidden;
          background: #fff;
        }
        .photos-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .photos-thumb-remove {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: none;
          background: var(--stamp-maroon);
          color: #fff;
          font-size: 14px;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .photos-add-more {
          width: 100px;
          height: 100px;
          border-radius: 5px;
          border: 2px dashed var(--stamp-maroon);
          background: transparent;
          color: var(--stamp-ink);
          font-family: 'Space Mono', monospace;
          font-weight: 700;
          font-size: 11px;
          text-transform: uppercase;
          cursor: pointer;
        }
      `}</style>

      <div className="photos-field-group">
        <span className="photos-field-label">Drag and drop</span>

        <div
          className={`photos-dropzone ${dragging ? "photos-dropzone-active" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={openBrowser}
          role="button"
          tabIndex={0}
          aria-label="Choose photos to upload"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openBrowser();
            }
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="photos-hidden-input"
            tabIndex={-1}
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />

          {photos.length === 0 ? (
            <span className="photos-choose-label">Choose a file</span>
          ) : (
            <div className="photos-grid">
              {photos.map((p) => (
                <div className="photos-thumb" key={p.id}>
                  <img src={p.url} alt="" />
                  <button
                    type="button"
                    className="photos-thumb-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto(p.id);
                    }}
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="photos-add-more"
                onClick={(e) => {
                  e.stopPropagation();
                  openBrowser();
                }}
              >
                + Add more
              </button>
            </div>
          )}
        </div>
      </div>
    </StampCardShell>
  );
}
