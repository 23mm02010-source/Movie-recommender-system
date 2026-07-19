// src/pages/MovieDetail.jsx

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";

const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w342";

function MovieDetail() {
  const { id } = useParams(); // reads the ":id" part of the URL, e.g. "19995"

  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingMessage, setRatingMessage] = useState("");
  const [watchlistMessage, setWatchlistMessage] = useState("");

  // Re-runs every time `id` changes (e.g. clicking a recommended movie
  // navigates to a new /movies/:id, and this refetches for the new id).
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      setSelectedRating(0);
      setRatingMessage("");
      setWatchlistMessage("");

      try {
        const [movieRes, recsRes] = await Promise.all([
          api.get(`/movies/${id}`),
          api.get(`/movies/${id}/recommendations`),
        ]);
        setMovie(movieRes.data);
        setRecommendations(recsRes.data.recommendations);
      } catch (err) {
        setError("Failed to load movie");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  async function handleRate(score) {
    setSelectedRating(score);
    try {
      await api.post("/ratings", { movieId: parseInt(id), score });
      setRatingMessage("Rating saved!");
    } catch (err) {
      setRatingMessage("Failed to save rating");
    }
  }

  async function handleAddToWatchlist() {
    try {
      await api.post("/watchlist", { movieId: parseInt(id) });
      setWatchlistMessage("Added to watchlist!");
    } catch (err) {
      const message = err.response?.data?.error || "Failed to add to watchlist";
      setWatchlistMessage(message);
    }
  }

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;
  if (error) return <p style={{ padding: 24, color: "red" }}>{error}</p>;
  if (!movie) return null;

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <Link to="/movies">&larr; Back to Movies</Link>

      <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
        <img
          src={movie.posterPath ? `${POSTER_BASE_URL}${movie.posterPath}` : "https://via.placeholder.com/342x513?text=No+Poster"}
          alt={movie.title}
          style={{ width: 280, borderRadius: 8 }}
        />

        <div>
          <h1>{movie.title}</h1>
          <p style={{ color: "#555" }}>{movie.genres}</p>
          <p>{movie.releaseDate} &middot; Rating: {movie.voteAverage}</p>
          <p style={{ marginTop: 12, maxWidth: 600 }}>{movie.overview}</p>

          <div style={{ marginTop: 20 }}>
            <p style={{ marginBottom: 4 }}>Rate this movie:</p>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                style={{
                  fontSize: 24,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: star <= selectedRating ? "gold" : "#ccc",
                }}
              >
                &#9733;
              </button>
            ))}
            {ratingMessage && <p style={{ fontSize: 14, color: "green" }}>{ratingMessage}</p>}
          </div>

          <button onClick={handleAddToWatchlist} style={{ marginTop: 12, padding: "8px 16px" }}>
            + Add to Watchlist
          </button>
          {watchlistMessage && <p style={{ fontSize: 14 }}>{watchlistMessage}</p>}
        </div>
      </div>

      <h2 style={{ marginTop: 40 }}>Similar Movies</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 16,
        }}
      >
        {recommendations.map((rec) => (
          <Link
            key={rec.id}
            to={`/movies/${rec.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <img
              src={rec.posterPath ? `${POSTER_BASE_URL}${rec.posterPath}` : "https://via.placeholder.com/342x513?text=No+Poster"}
              alt={rec.title}
              style={{ width: "100%", borderRadius: 8 }}
            />
            <p style={{ fontSize: 13, marginTop: 4 }}>{rec.title}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default MovieDetail;
