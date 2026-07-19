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
      // Remove it from local state immediately, instead of re-fetching everything
      setItems((prev) => prev.filter((item) => item.movieId !== movieId));
    } catch (err) {
      alert("Failed to remove from watchlist");
    }
  }

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1>My Watchlist</h1>
        <Link to="/movies">&larr; Back to Movies</Link>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && items.length === 0 && <p>Your watchlist is empty. Go add some movies!</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 16,
        }}
      >
        {items.map((item) => (
          <div key={item.id}>
            <Link to={`/movies/${item.movie.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <img
                src={item.movie.posterPath ? `${POSTER_BASE_URL}${item.movie.posterPath}` : "https://via.placeholder.com/342x513?text=No+Poster"}
                alt={item.movie.title}
                style={{ width: "100%", borderRadius: 8 }}
              />
              <p style={{ fontSize: 14, marginTop: 6 }}>{item.movie.title}</p>
            </Link>
            <button
              onClick={() => handleRemove(item.movieId)}
              style={{ width: "100%", padding: 6, marginTop: 4 }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Watchlist;