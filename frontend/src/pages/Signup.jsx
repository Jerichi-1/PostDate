/**
 * Signup — the three-step stamp form.
 *
 *   ┌────────────────────────────────────────────────────────────┐
 *   │ POSTDATE!                              HOME  GET STARTED … │  SiteNav
 *   ├────────────────────────────────────────────────────────────┤
 *   │ (1)─ WHO ARE YOU? ────────▶ (2) PHOTOS ────────▶ (3) TASTE │  FormStepper
 *   │                                                            │  (one long bar)
 *   │  ┌─ stamp card ─┐            WHY WE ASK                    │
 *   │  │  636 x 634   │            ┌──────────┐ ┌────────────┐   │
 *   │  │   (square)   │            │ profile  │ │  profile   │   │  SignupAside
 *   │  │              │            │  card    │ │   page     │   │
 *   │  └──────────────┘            └──────────┘ └────────────┘   │
 *   └────────────────────────────────────────────────────────────┘
 *
 * 🎛️ THIS PAGE IS A FIXED LAYOUT, NOT A RESPONSIVE ONE. Everything on it is
 * sized in Figma pixels: `calc(<Figma px> * var(--u))`. --u is "one Figma
 * pixel on your screen" and is the ONLY number you need to change to make the
 * whole page bigger or smaller. It is set a few lines down.
 *
 * Step state lives here; each step component just reports its own values back
 * up through onContinue / onConfirm. Nothing is sent to the server until the
 * last step, so a user can go back and forth without half-saving a profile.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import FormStepper from "../components/FormStepper";
import WhoAreYouForm from "../components/WhoAreYouForm";
import PhotosForm from "../components/PhotosForm";
import YourTasteForm from "../components/YourTasteForm";
import SignupAside from "../components/SignupAside";

import { submitSignup } from "../services/postdateApi";

function Signup() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [signupData, setSignupData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleFinish(tags) {
    const fullSignup = { ...signupData, tags };
    setSubmitting(true);
    setError("");

    try {
      /* 🔌 BACKEND: POST /api/signup — see services/postdateApi.js.
         It already handles turning the photos into multipart form data. */
      await submitSignup(fullSignup);
      navigate("/profile");
    } catch {
      setError("We could not create your profile. Check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="signup">
      <style>{`
        .signup {
          /* 🎛️ THE ONE DIAL ------------------------------------------------
             --u = the size of ONE FIGMA PIXEL on your screen.
               0.8px → the 1920px-wide Figma fits a 1536px-wide laptop window
                       (a 1920x1080 laptop at 125% display scaling — yours)
               1px   → exact Figma size, for a full 1920px-wide window
             Raise it and the whole page grows, lower it and it shrinks.      */
          --u: 0.8px;

          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--pd-pink);
        }

        .signup-main {
          flex: 1;
          padding-bottom: calc(60 * var(--u));
        }

        /* One block, centred on the page. Figma: stamp left edge (x=96) to the
           aside's right edge (x=1806) = 1710 wide. The stepper fills all of it. */
        .signup-stage {
          width: calc(1710 * var(--u));
          margin: 0 auto;
        }

        /* Figma: stepper circles start 29px under the header line */
        .signup-stepper {
          padding-top: calc(29 * var(--u));
        }

        /* Row 2: the two big boxes. Card hugs the left, aside hugs the right. */
        .signup-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-top: calc(27 * var(--u));
        }
        .signup-card-slot {
          flex: none;
          margin-top: calc(9 * var(--u));   /* Figma: card top sits 9px below the aside's top */
        }

        .signup-error {
          margin: calc(16 * var(--u)) 0 0;
          font-family: var(--pd-mono);
          font-size: calc(16 * var(--u));
          color: var(--pd-maroon);
          text-align: center;
        }
      `}</style>

      <SiteNav />

      <main className="signup-main">
        <div className="signup-stage">
          <div className="signup-stepper">
            <FormStepper currentStep={step} />
          </div>

          <div className="signup-row">
            <div className="signup-card-slot">
              {step === 1 && (
                <WhoAreYouForm
                  step={1}
                  onContinue={(data) => {
                    setSignupData((prev) => ({ ...prev, ...data }));
                    setStep(2);
                  }}
                />
              )}

              {step === 2 && (
                <PhotosForm
                  step={2}
                  onContinue={(photos) => {
                    setSignupData((prev) => ({ ...prev, photos }));
                    setStep(3);
                  }}
                />
              )}

              {step === 3 && (
                <YourTasteForm
                  step={3}
                  onConfirm={handleFinish}
                  buttonLabel={submitting ? "Sending…" : undefined}
                />
              )}
            </div>

            <SignupAside step={step} />
          </div>

          {error && <p className="signup-error">{error}</p>}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export default Signup;
