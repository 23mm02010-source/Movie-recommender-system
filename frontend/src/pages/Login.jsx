// src/pages/Login.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  function validate() {
    const errors = {};

    if (isSignup && name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!EMAIL_REGEX.test(email)) {
      errors.email = "Enter a valid email address";
    }

    if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setLoading(true);
    try {
      const endpoint = isSignup ? "/auth/signup" : "/auth/login";
      const payload = isSignup ? { name, email, password } : { email, password };

      const response = await api.post(endpoint, payload);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/movies");
    } catch (err) {
      const message = err.response?.data?.error || "Something went wrong";
      setServerError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <h2>{isSignup ? "Sign Up" : "Log In"}</h2>

      <form onSubmit={handleSubmit} noValidate>
        {isSignup && (
          <>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
            />
            {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
          </>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
        />
        {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
        />
        {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}

        {serverError && <p className="field-error">{serverError}</p>}

        <button type="submit" disabled={loading} className="btn" style={{ width: "100%", marginTop: 8 }}>
          {loading ? "Please wait..." : isSignup ? "Sign Up" : "Log In"}
        </button>
      </form>

      <p style={{ marginTop: 20, textAlign: "center", color: "#b3b3b3" }}>
        {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
        <button onClick={() => setIsSignup(!isSignup)} className="auth-toggle-btn">
          {isSignup ? "Log In" : "Sign Up"}
        </button>
      </p>
    </div>
  );
}

export default Login;