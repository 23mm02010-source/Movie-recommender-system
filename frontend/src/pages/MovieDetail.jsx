// src/pages/MovieDetail.jsx

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";

const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w342";

function MovieDetail() {
  const { id } = useParams();

  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingMessage, setRatingMessage] = useState("");
  const [watchlistMessage, setWatchlistMessage] = useState("");

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

  if (loading) return <p className="page" style={{ color: "#b3b3b3" }}>Loading...</p>;
  if (error) return <p className="page field-error">{error}</p>;
  if (!movie) return null;

  return (
    <div className="page" style={{ maxWidth: 1000 }}>
      <Link to="/movies" style={{ color: "#b3b3b3" }}>&larr; Back to Movies</Link>

      <div className="detail-container">
        <img
          src={movie.posterPath ? `${POSTER_BASE_URL}${movie.posterPath}` : "https://via.placeholder.com/342x513?text=No+Poster"}
          alt={movie.title}
          className="detail-poster"
        />

        <div className="detail-info">
          <h1>{movie.title}</h1>
          <p className="detail-genres">{movie.genres}</p>
          <p className="detail-meta">{movie.releaseDate} &middot; TMDB Rating: {movie.voteAverage}</p>
          <p className="detail-overview">{movie.overview}</p>

          <div className="star-rating">
            <p>Rate this movie:</p>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                className={`star-btn ${star <= selectedRating ? "star-filled" : "star-empty"}`}
              >
                &#9733;
              </button>
            ))}
            {ratingMessage && <p className="status-message">{ratingMessage}</p>}
          </div>

          <button onClick={handleAddToWatchlist} className="btn" style={{ marginTop: 16 }}>
            + Add to Watchlist
          </button>
          {watchlistMessage && <p className="status-message">{watchlistMessage}</p>}
        </div>
      </div>

      <h2 className="section-title">Similar Movies</h2>
      <div className="movie-grid">
        {recommendations.map((rec) => (
          <Link key={rec.id} to={`/movies/${rec.id}`} className="movie-card">
            <img
              src={rec.posterPath ? `${POSTER_BASE_URL}${rec.posterPath}` : "https://via.placeholder.com/342x513?text=No+Poster"}
              alt={rec.title}
            />
            <p>{rec.title}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default MovieDetail;
