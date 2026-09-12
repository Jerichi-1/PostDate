import { useEffect, useState } from "react";
import api from "../api";
import Navbar from "../components/Navbar";
import SignupForm from "../components/Signupform";

function Signup() {
  const [status, setStatus] = useState("Checking connection...");

  useEffect(() => {
    api
      .get("/")
      .then(() => setStatus("Connected to backend ✅"))
      .catch(() =>
        setStatus("Could not reach the backend. Is the server running?")
      );
  }, []);

  return (
    <div className="page-container">
      <Navbar />

      <main>
        <div className="signupformwrapper">
          <style>{`
            .signupformwrapper {
              height: 40px;
              position: relative;
              right: 360px;
              top: 80px;
            }
          `}</style>

        <SignupForm
          onContinue={(data) => console.log(data)}
        />
        </div>
      </main>
    </div>
  );
}

export default Signup;