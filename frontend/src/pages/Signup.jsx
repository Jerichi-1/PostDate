/**
 * Signup — the three-step stamp form.
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
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--pd-pink);
        }

        .signup-main {
          flex: 1;
          width: 100%;
          max-width: var(--pd-max);
          margin: 0 auto;
          padding: clamp(14px, 2vw, 34px) var(--pd-gutter) clamp(28px, 4vw, 60px);
        }

        /* 🎛️ TUNE THE PAGE LAYOUT HERE ---------------------------------- */
        .signup-layout {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: center;
          gap: 32px;              /* space between the card and the aside   */
          max-width: 850px;       /* raise this if the columns feel cramped */
          margin: 0 auto;
          padding-top: clamp(12px, 2vw, 28px);
        }
        .signup-form-col {
          flex: 0 1 440px;        /* matches StampCardShell's --stamp-width */
          min-width: 300px;
        }
        .signup-layout > .aside-wrapper {
          flex: 1 1 300px;
          max-width: 340px;       /* matches SignupAside's --aside-width    */
        }

        .signup-error {
          max-width: 850px;
          margin: 16px auto 0;
          font-family: var(--pd-mono);
          font-size: clamp(11px, 1vw, 15px);
          color: var(--pd-maroon);
          text-align: center;
        }
      `}</style>

      <SiteNav />

      <main className="signup-main">
        <FormStepper currentStep={step} />

        <div className="signup-layout">
          <div className="signup-form-col">
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
      </main>

      <SiteFooter />
    </div>
  );
}

export default Signup;
