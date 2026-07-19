// src/api/client.js
// One shared axios instance - every page imports this instead of
// configuring the base URL and auth header separately each time.

// src/api/client.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// This runs before every single request made with `api`.
// It checks if we have a saved JWT token, and if so, attaches it
// automatically - so individual page components don't need to
// remember to add the Authorization header every time.