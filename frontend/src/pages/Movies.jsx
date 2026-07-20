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

    const timeoutId = setTimeout(fetchMovies, 400);
    return () => clearTimeout(timeoutId);
  }, [search]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  return (
    <div className="page">
      <div className="navbar">
        <h1>MovieMatch</h1>
        <div className="navbar-links">
          <Link to="/watchlist">My Watchlist</Link>
          <button onClick={handleLogout}>Log Out</button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search movies..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      {loading && <p style={{ color: "#b3b3b3" }}>Loading...</p>}
      {error && <p className="field-error">{error}</p>}

      <div className="movie-grid">
        {movies.map((movie) => (
          <Link key={movie.id} to={`/movies/${movie.id}`} className="movie-card">
            <img
              src={movie.posterPath ? `${POSTER_BASE_URL}${movie.posterPath}` : "https://via.placeholder.com/342x513?text=No+Poster"}
              alt={movie.title}
            />
            <p>{movie.title}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Movies;