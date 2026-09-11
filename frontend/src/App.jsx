import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";

import api from "./api";
import "./App.css";

import Navbar from "./components/Navbar";
import Signup from "./pages/signup";

function App() {
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
    <Routes>
      <Route
        path="/"
        element={
          <div className="page-container">
            <Navbar />

            <main>
              <Link to="/signup">CREATE PROFILE</Link>
            </main>
          </div>
        }
      />

      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}

export default App;