// src/pages/Movies.jsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w342";

function Movies() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Runs whenever `search` changes (and once on first load).
  // We fetch fresh results from the backend each time the search term changes.
  useEffect(() => {
    async function fetchMovies() {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/movies", {
          params: { page: 1, limit: 30, search },
        });
        setMovies(response.data.results);
      } catch (err) {
        setError("Failed to load movies");
      } finally {
        setLoading(false);
      }
    }

    // Small delay so we don't fire an API call on every single keystroke -
    // wait 400ms after the user stops typing before searching.
    const timeoutId = setTimeout(fetchMovies, 400);
    return () => clearTimeout(timeoutId);
  }, [search]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1>Movie Recommender</h1>
        <div>
          <Link to="/watchlist" style={{ marginRight: 16 }}>My Watchlist</Link>
          <button onClick={handleLogout}>Log Out</button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search movies..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 20, fontSize: 16 }}
      />

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 16,
        }}
      >
        {movies.map((movie) => (
          <Link
            key={movie.id}
            to={`/movies/${movie.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div>
              <img
                src={movie.posterPath ? `${POSTER_BASE_URL}${movie.posterPath}` : "https://via.placeholder.com/342x513?text=No+Poster"}
                alt={movie.title}
                style={{ width: "100%", borderRadius: 8 }}
              />
              <p style={{ fontSize: 14, marginTop: 6 }}>{movie.title}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Movies;