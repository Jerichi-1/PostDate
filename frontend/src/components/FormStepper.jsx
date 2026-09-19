/**
 * FormStepper
 * Horizontal progress indicator for a multi-step signup flow — sits between
 * the navbar and the form. Pairs with WhoAreYouForm.jsx (same color system).
 *
 * Usage:
 *   const [step, setStep] = useState(1);
 *   <FormStepper currentStep={step} />
 *   <WhoAreYouForm step={step} totalSteps={3} onContinue={() => setStep(step + 1)} />
 *
 * Layout (matches the Figma): the stepper stretches across the full width of
 * the row below it. Step 1 keeps its natural width; every later step (incoming
 * arrow + circle + label) takes an equal share of what's left, so the arrows
 * flex to fill the gaps. That's why the Figma's arrows differ (484px / 423px):
 * the arrow into the longer "YOUR TASTE" label gives up a bit of room.
 *
 * Circle states (per step, based on currentStep):
 *   - upcoming (step number > currentStep): cream circle, dark ink number
 *   - active   (step number === currentStep): maroon circle, cream number
 *   - done     (step number < currentStep): dark ink circle, cream number
 */

const DEFAULT_STEPS = ["Who are you?", "Photos", "Your taste"];

export default function FormStepper({ steps = DEFAULT_STEPS, currentStep = 1, ...rest }) {
  return (
    <nav className="stepper-wrapper" aria-label="Signup progress" {...rest}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700&family=Space+Mono:wght@700&display=swap');

        .stepper-wrapper, .stepper-wrapper *, .stepper-wrapper *::before, .stepper-wrapper *::after {
          box-sizing: border-box;
        }

        .stepper-wrapper {
          --step-maroon: #B33951;
          --step-cream: #FAF3EE;
          --step-ink: #2B2320;

          /* 🎛️ TUNE THE STEPPER HERE ------------------------------- */
          --step-circle: 56px;   /* circle diameter — was 80px, now scaled to match the smaller card */
          --step-max-width: 812px; /* card col 440 + gap 32 + aside 340 (see Signup.jsx) — keep in sync so the stepper ends flush with the aside */
          /* ------------------------------------------------------------ */

          font-family: 'Space Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
          width: 100%;
          max-width: var(--step-max-width);
          margin: 0; /* left-anchored — the page wrapper controls horizontal position, not this component */
          padding: 12px 0; /* no side padding: circle 1 lines up with the card's left edge, last label with the aside's right edge */
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(179, 57, 81, 0.35) transparent;
        }
        .stepper-wrapper::-webkit-scrollbar { height: 6px; }
        .stepper-wrapper::-webkit-scrollbar-track { background: transparent; }
        .stepper-wrapper::-webkit-scrollbar-thumb {
          background: rgba(179, 57, 81, 0.35);
          border-radius: 3px;
        }

        .stepper-track {
          display: flex;
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .stepper-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        /* Step 1 = natural width. Every later step (arrow + circle + label)
           splits the leftover row width equally, which stretches the arrows. */
        .stepper-item:first-child { flex: none; }
        .stepper-item:not(:first-child) { flex: 1 1 0%; }

        .stepper-circle {
          flex: none;
          width: clamp(34px, 7vw, var(--step-circle));
          height: clamp(34px, 7vw, var(--step-circle));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Fraunces', Georgia, serif;
          font-weight: 700;
          font-size: clamp(14px, 2.6vw, 24px); /* 🎛️ number size inside the circle */
          line-height: 1;
          transition: background-color 0.2s ease, color 0.2s ease;
        }

        .stepper-item-upcoming .stepper-circle {
          background: var(--step-cream);
          color: var(--step-ink);
          box-shadow: inset 0 0 0 2px rgba(43, 35, 32, 0.12);
        }
        .stepper-item-active .stepper-circle {
          background: var(--step-maroon);
          color: var(--step-cream);
        }
        .stepper-item-done .stepper-circle {
          background: var(--step-ink);
          color: var(--step-cream);
        }

        .stepper-label {
          font-weight: 700;
          font-size: clamp(10px, 1.3vw, 14px); /* 🎛️ step label size */
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--step-ink);
          white-space: nowrap;
        }

        .stepper-arrow {
          position: relative;
          flex: 1 1 30px;  /* grows to fill whatever room its step has */
          min-width: 20px;
          height: 2px;
          background: var(--step-ink);
          margin-left: 12px; /* breathing room after the previous label */
        }
        .stepper-arrow::after {
          content: "";
          position: absolute;
          right: -1px;
          top: 50%;
          width: 0;
          height: 0;
          border-top: 5px solid transparent;
          border-bottom: 5px solid transparent;
          border-left: 7px solid var(--step-ink);
          transform: translateY(-50%);
        }

        @media (max-width: 520px) {
          .stepper-arrow { margin-left: 8px; }
        }
      `}</style>

      <ol className="stepper-track">
        {steps.map((label, i) => {
          const num = i + 1;
          const state = num < currentStep ? "done" : num === currentStep ? "active" : "upcoming";
          return (
            <li
              key={label}
              className={`stepper-item stepper-item-${state}`}
              aria-current={state === "active" ? "step" : undefined}
            >
              {/* the arrow leads every step except the first, so each step
                  carries its own incoming arrow and can share the row equally */}
              {i > 0 && <span className="stepper-arrow" aria-hidden="true" />}
              <span className="stepper-circle">{num}</span>
              <span className="stepper-label">{label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
