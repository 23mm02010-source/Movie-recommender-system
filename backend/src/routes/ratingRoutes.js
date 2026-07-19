// src/routes/ratingRoutes.js

const express = require("express");
const prisma = require("../prismaClient");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes below use requireAuth - meaning a valid JWT must be sent,
// or the request gets rejected before even reaching our logic.

// ---- POST /api/ratings - rate a movie (or update your existing rating) ----
// Body: { movieId: 19995, score: 4 }
router.post("/", requireAuth, async (req, res) => {
  try {
    const { movieId, score } = req.body;
    const userId = req.user.userId; // came from the decoded JWT, set by requireAuth

    if (!movieId || !score) {
      return res.status(400).json({ error: "movieId and score are required" });
    }
    if (score < 1 || score > 5) {
      return res.status(400).json({ error: "score must be between 1 and 5" });
    }

    // upsert = "update if it exists, otherwise create" -
    // handles both a first-time rating and changing an existing one
    const rating = await prisma.rating.upsert({
      where: {
        userId_movieId: { userId, movieId }, // uses the @@unique we defined in schema.prisma
      },
      update: { score },
      create: { userId, movieId, score },
    });

    res.status(201).json(rating);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save rating" });
  }
});

// ---- GET /api/ratings/me - get all of the logged-in user's ratings ----
router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const ratings = await prisma.rating.findMany({
      where: { userId },
      include: { movie: true }, // pulls in the movie details alongside each rating
      orderBy: { createdAt: "desc" },
    });

    res.json(ratings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch ratings" });
  }
});

// ---- DELETE /api/ratings/:movieId - remove your rating for a movie ----
router.delete("/:movieId", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const movieId = parseInt(req.params.movieId);

    await prisma.rating.delete({
      where: { userId_movieId: { userId, movieId } },
    });

    res.json({ message: "Rating removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove rating (maybe it didn't exist)" });
  }
});

module.exports = router;