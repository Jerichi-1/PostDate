import { useEffect, useState } from "react";
import api from "./api";

function App() {
  const [status, setStatus] = useState("Checking connection...");

  useEffect(() => {
    api
      .get("/")
      .then(() => setStatus("Connected to backend ✅"))
      .catch(() => setStatus("Could not reach the backend. Is the server running?"));
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>MERN Postdate</h1>
      <p style={styles.status}>{status}</p>
      <p style={styles.hint}>
        Models are ready (User, Post, Profile, Match, Like, Follow, Swipe,
        Message, Notification, Rating, Report). Build out controllers and
        routes, then start wiring up real UI here.
      </p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 480,
    margin: "40px auto",
    fontFamily: "system-ui, sans-serif",
    padding: "0 16px",
    textAlign: "center",
  },
  title: { marginBottom: 8 },
  status: { fontSize: 16, color: "#333" },
  hint: { fontSize: 14, color: "#777", marginTop: 24, lineHeight: 1.5 },
};

export default App;
