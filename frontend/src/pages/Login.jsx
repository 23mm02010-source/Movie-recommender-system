// src/pages/Login.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

function Login() {
  const [isSignup, setIsSignup] = useState(false); // toggles between Login and Signup forms
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault(); // stops the page from refreshing on form submit
    setError("");
    setLoading(true);

    try {
      const endpoint = isSignup ? "/auth/signup" : "/auth/login";
      const payload = isSignup ? { name, email, password } : { email, password };

      const response = await api.post(endpoint, payload);

      // Save the token so the axios interceptor can attach it to future requests
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/movies"); // redirect to the movie browsing page after login
    } catch (err) {
      const message = err.response?.data?.error || "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", fontFamily: "sans-serif" }}>
      <h2>{isSignup ? "Sign Up" : "Log In"}</h2>

      <form onSubmit={handleSubmit}>
        {isSignup && (
          <div style={{ marginBottom: 12 }}>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: "100%", padding: 8 }}
            />
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={loading} style={{ width: "100%", padding: 10 }}>
          {loading ? "Please wait..." : isSignup ? "Sign Up" : "Log In"}
        </button>
      </form>

      <p style={{ marginTop: 16, textAlign: "center" }}>
        {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          onClick={() => setIsSignup(!isSignup)}
          style={{ background: "none", border: "none", color: "blue", cursor: "pointer" }}
        >
          {isSignup ? "Log In" : "Sign Up"}
        </button>
      </p>
    </div>
  );
}

export default Login;