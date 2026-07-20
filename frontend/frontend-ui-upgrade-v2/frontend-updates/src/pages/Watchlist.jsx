// src/pages/Watchlist.jsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w342";

function Watchlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWatchlist();
  }, []);

  async function fetchWatchlist() {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/watchlist");
      setItems(response.data);
    } catch (err) {
      setError("Failed to load watchlist");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(movieId) {
    try {
      await api.delete(`/watchlist/${movieId}`);
      setItems((prev) => prev.filter((item) => item.movieId !== movieId));
    } catch (err) {
      alert("Failed to remove from watchlist");
    }
  }

  return (
    <div>
      <div className="navbar">
        <div className="navbar-brand">
          <span className="logo-mark">&#9670;</span>
          <h1>Movie<span>Match</span></h1>
        </div>
        <div className="navbar-links">
          <Link to="/movies">&larr; Back to Movies</Link>
        </div>
      </div>

      <div className="page" style={{ paddingTop: 20 }}>
        <h2 className="section-heading">My Watchlist</h2>

        {loading && <p style={{ color: "#9e9e9e" }}>Loading...</p>}
        {error && <p className="field-error">{error}</p>}
        {!loading && items.length === 0 && (
          <p className="empty-state">Your watchlist is empty &mdash; go add some movies!</p>
        )}

        <div className="movie-grid">
          {items.map((item) => (
            <div key={item.id}>
              <Link to={`/movies/${item.movie.id}`} className="movie-card">
                <div className="movie-poster-wrap">
                  <img
                    src={item.movie.posterPath ? `${POSTER_BASE_URL}${item.movie.posterPath}` : "https://via.placeholder.com/342x513?text=No+Poster"}
                    alt={item.movie.title}
                  />
                  {item.movie.voteAverage != null && (
                    <span className="rating-badge">&#9733; {item.movie.voteAverage.toFixed(1)}</span>
                  )}
                </div>
                <p className="movie-card-title">{item.movie.title}</p>
              </Link>
              <button onClick={() => handleRemove(item.movieId)} className="remove-btn">
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Watchlist;
