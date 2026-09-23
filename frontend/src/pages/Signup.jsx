/**
 * Signup — the three-step stamp form, plus the mandatory email-verification
 * pop-up that follows it.
 *
 *   ┌────────────────────────────────────────────────────────────┐
 *   │ POSTDATE!                              HOME  LOG IN  …    │  SiteNav
 *   ├────────────────────────────────────────────────────────────┤
 *   │ (1)─ WHO ARE YOU? ────────▶ (2) PHOTOS ────────▶ (3) TASTE │  FormStepper
 *   │                                                            │  (one long bar)
 *   │  ┌─ stamp card ─┐            WHY WE ASK                    │
 *   │  │  636 x 634   │            ┌──────────┐ ┌────────────┐   │
 *   │  │   (square)   │            │ profile  │ │  profile   │   │  SignupAside
 *   │  │              │            │  card    │ │   page     │   │
 *   │  └──────────────┘            └──────────┘ └────────────┘   │
 *   └────────────────────────────────────────────────────────────┘
 *                          step 3 "Confirm!" succeeds
 *                                     │
 *                                     ▼
 *                     ┌───────────────────────────────┐
 *                     │  VerificationModal — mandatory │
 *                     │  (no ✕, no Esc, no backdrop    │
 *                     │   click — see the note below)  │
 *                     └───────────────┬─────────────────┘
 *                                     │ onVerified
 *                                     ▼
 *                               navigate("/profile")
 *
 * 🎛️ THIS PAGE IS A FIXED LAYOUT, NOT A RESPONSIVE ONE. Everything on it is
 * sized in Figma pixels: `calc(<Figma px> * var(--u))`. --u is "one Figma
 * pixel on your screen" and is the ONLY number you need to change to make the
 * page bigger or smaller. It lives in src/theme.css and is shared with the
 * log-in page, so the two always match.
 *
 * Step state lives here; each step component just reports its own values back
 * up through onContinue / onConfirm. Nothing is sent to the server until the
 * last step, so a user can go back and forth without half-saving a profile.
 *
 * 🔌 VERIFICATION: submitSignup() creates the account for real (Mongo, via
 * backend/controllers/authController.js), then VerificationModal takes over
 * — see its own file for the two calls it makes (sendVerificationCode /
 * verifyCode). It is mandatory here (no onClose is passed), which is what
 * makes the temp code safe to leave wide open: nobody can get into /profile
 * without typing it, even though right now it's always "0000" (no email
 * service is wired up yet — see TEMP_VERIFY_CODE in authController.js).
 * Log-in agrees with this: an account that hasn't verified gets turned away
 * with "Verify your email before logging in" (LoginForm.jsx) rather than
 * being let in.
 * 🧪 When real codes are live: bump codeLength below to match, or delete the
 * prop to use the component's own default of 6. If you also make the modal
 * closable (pass onClose), you'll want a way to re-open it from log-in's
 * "not verified" message, which doesn't exist yet.
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
import VerificationModal from "../components/VerificationModal";

import { submitSignup } from "../services/postdateApi";

function Signup() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [signupData, setSignupData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showVerify, setShowVerify] = useState(false);

  async function handleFinish(tags) {
    const fullSignup = { ...signupData, tags };
    setSubmitting(true);
    setError("");

    try {
      /* 🔌 BACKEND: POST /api/signup — see services/postdateApi.js. */
      await submitSignup(fullSignup);
      /* Account created, but not usable yet — see the 🔌 VERIFICATION note
         above. VerificationModal (rendered below) takes it from here. */
      setShowVerify(true);
    } catch (err) {
      setError(
        err?.response?.status === 409
          ? "An account with that email already exists. Try logging in instead."
          : "We could not create your profile. Check your details and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="signup">
      <style>{`
        .signup {
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

      {/* 🧪 codeLength=4 matches the temp code ("0000") — see the
          🔌 VERIFICATION note above the imports for what to change once the
          backend sends real codes. */}
      <VerificationModal
        open={showVerify}
        codeLength={4}
        onVerified={() => navigate("/profile")}
      />
    </div>
  );
}

export default Signup;
