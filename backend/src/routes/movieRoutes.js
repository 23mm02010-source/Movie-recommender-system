// src/routes/movieRoutes.js

const express = require("express");
const prisma = require("../prismaClient");

const router = express.Router();

// ---- GET /api/movies - browse movies, with pagination + optional search ----
// Example: /api/movies?page=1&limit=20&search=avatar
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";

    const movies = await prisma.movie.findMany({
      where: search
        ? { title: { contains: search, mode: "insensitive" } }
        : undefined,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { voteAverage: "desc" },
    });

    res.json({ page, limit, results: movies });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch movies" });
  }
});

// ---- GET /api/movies/:id - single movie's full details ----
router.get("/:id", async (req, res) => {
  try {
    const movieId = parseInt(req.params.id);

    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    res.json(movie);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch movie" });
  }
});

// ---- GET /api/movies/:id/recommendations - content-based recommendations ----
// Reads the precomputed MovieSimilarity rows for this movie, ordered by rank,
// then fetches the full movie details for each recommended id.
router.get("/:id/recommendations", async (req, res) => {
  try {
    const movieId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit) || 10;

    const similarEntries = await prisma.movieSimilarity.findMany({
      where: { sourceMovieId: movieId },
      orderBy: { rank: "asc" },
      take: limit,
      include: { targetMovie: true }, // pulls the actual movie details in the same query
    });

    if (similarEntries.length === 0) {
      return res.status(404).json({ error: "No recommendations found for this movie" });
    }

    const recommendations = similarEntries.map((entry) => ({
      ...entry.targetMovie,
      similarityScore: entry.score,
    }));

    res.json({ movieId, recommendations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

module.exports = router;