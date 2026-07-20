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
    <div className="page">
      <div className="navbar">
        <h1>My Watchlist</h1>
        <Link to="/movies" style={{ color: "#b3b3b3" }}>&larr; Back to Movies</Link>
      </div>

      {loading && <p style={{ color: "#b3b3b3" }}>Loading...</p>}
      {error && <p className="field-error">{error}</p>}
      {!loading && items.length === 0 && (
        <p className="empty-state">Your watchlist is empty. Go add some movies!</p>
      )}

      <div className="movie-grid">
        {items.map((item) => (
          <div key={item.id}>
            <Link to={`/movies/${item.movie.id}`} className="movie-card">
              <img
                src={item.movie.posterPath ? `${POSTER_BASE_URL}${item.movie.posterPath}` : "https://via.placeholder.com/342x513?text=No+Poster"}
                alt={item.movie.title}
              />
              <p>{item.movie.title}</p>
            </Link>
            <button onClick={() => handleRemove(item.movieId)} className="remove-btn">
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Watchlist;