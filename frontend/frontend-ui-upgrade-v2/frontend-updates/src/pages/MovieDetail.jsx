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
      window.scrollTo(0, 0);

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

  if (loading) return <p className="page" style={{ color: "#9e9e9e", paddingTop: 40 }}>Loading...</p>;
  if (error) return <p className="page field-error" style={{ paddingTop: 40 }}>{error}</p>;
  if (!movie) return null;

  const genreList = movie.genres ? movie.genres.split(",").map((g) => g.trim()) : [];

  return (
    <div>
      <div className="detail-hero">
        <Link to="/movies" style={{ color: "#9e9e9e", fontSize: 14 }}>&larr; Back to Movies</Link>

        <div className="detail-container" style={{ marginTop: 20 }}>
          <img
            src={movie.posterPath ? `${POSTER_BASE_URL}${movie.posterPath}` : "https://via.placeholder.com/342x513?text=No+Poster"}
            alt={movie.title}
            className="detail-poster"
          />

          <div className="detail-info">
            <h1>{movie.title}</h1>

            <div className="detail-meta">
              <span className="gold">&#9733; {movie.voteAverage}</span>
              <span>&middot;</span>
              <span>{movie.releaseDate}</span>
            </div>

            <div className="detail-genres">
              {genreList.map((g) => (
                <span key={g} className="genre-pill">{g}</span>
              ))}
            </div>

            <p className="detail-overview">{movie.overview}</p>

            <div className="star-rating">
              <p>Rate this movie</p>
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

            <div className="action-row">
              <button onClick={handleAddToWatchlist} className="btn">
                + Add to Watchlist
              </button>
            </div>
            {watchlistMessage && <p className="status-message">{watchlistMessage}</p>}
          </div>
        </div>
      </div>

      <div className="page section-title-wrap">
        <h2 className="section-heading">Similar Movies</h2>
        <div className="movie-grid">
          {recommendations.map((rec) => (
            <Link key={rec.id} to={`/movies/${rec.id}`} className="movie-card">
              <div className="movie-poster-wrap">
                <img
                  src={rec.posterPath ? `${POSTER_BASE_URL}${rec.posterPath}` : "https://via.placeholder.com/342x513?text=No+Poster"}
                  alt={rec.title}
                />
                {rec.voteAverage != null && (
                  <span className="rating-badge">&#9733; {rec.voteAverage.toFixed(1)}</span>
                )}
              </div>
              <p className="movie-card-title">{rec.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;
