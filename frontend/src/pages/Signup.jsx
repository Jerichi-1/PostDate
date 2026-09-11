import { useEffect, useState } from "react";
import api from "../api";
import Navbar from "../components/Navbar";

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
      </main>
    </div>
  );
}

export default Signup;