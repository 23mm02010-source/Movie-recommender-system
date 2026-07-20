// src/pages/Movies.jsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w342";
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/original";

function Movies() {
  const [movies, setMovies] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch a featured movie once on load, for the hero banner
  useEffect(() => {
    async function fetchFeatured() {
      try {
        const response = await api.get("/movies", { params: { page: 1, limit: 1 } });
        setFeatured(response.data.results[0]);
      } catch (err) {
        // Non-critical if this fails - just skip the hero banner
      }
    }
    fetchFeatured();
  }, []);

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
    <div>
      <div className="navbar">
        <div className="navbar-brand">
          <span className="logo-mark">&#9670;</span>
          <h1>Movie<span>Match</span></h1>
        </div>
        <div className="navbar-links">
          <Link to="/watchlist">My Watchlist</Link>
          <button onClick={handleLogout}>Log Out</button>
        </div>
      </div>

      {featured && !search && (
        <div className="hero">
          <div
            className="hero-backdrop"
            style={{ backgroundImage: `url(${BACKDROP_BASE_URL}${featured.posterPath})` }}
          />
          <div className="hero-gradient" />
          <div className="hero-content">
            <span className="hero-badge">Featured</span>
            <h2>{featured.title}</h2>
            <p>{featured.overview}</p>
            <Link to={`/movies/${featured.id}`} className="btn">
              &#9654; View Details
            </Link>
          </div>
        </div>
      )}

      <div className="page">
        <h2 className="section-heading">Browse Movies</h2>

        <input
          type="text"
          placeholder="Search movies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        {error && <p className="field-error">{error}</p>}

        {loading ? (
          <div className="skeleton-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        ) : (
          <div className="movie-grid">
            {movies.map((movie) => (
              <Link key={movie.id} to={`/movies/${movie.id}`} className="movie-card">
                <div className="movie-poster-wrap">
                  <img
                    src={movie.posterPath ? `${POSTER_BASE_URL}${movie.posterPath}` : "https://via.placeholder.com/342x513?text=No+Poster"}
                    alt={movie.title}
                  />
                  {movie.voteAverage != null && (
                    <span className="rating-badge">&#9733; {movie.voteAverage.toFixed(1)}</span>
                  )}
                  <div className="card-overlay">
                    <span>{movie.genres}</span>
                  </div>
                </div>
                <p className="movie-card-title">{movie.title}</p>
                <p className="movie-card-sub">{movie.releaseDate?.slice(0, 4)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Movies;
