// src/routes/watchlistRoutes.js

const express = require("express");
const prisma = require("../prismaClient");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// ---- POST /api/watchlist - add a movie to the logged-in user's watchlist ----
// Body: { movieId: 19995 }
router.post("/", requireAuth, async (req, res) => {
  try {
    const { movieId } = req.body;
    const userId = req.user.userId;

    if (!movieId) {
      return res.status(400).json({ error: "movieId is required" });
    }

    const item = await prisma.watchlistItem.create({
      data: { userId, movieId },
    });

    res.status(201).json(item);
  } catch (err) {
    if (err.code === "P2002") {
      // Prisma's error code for violating a @@unique constraint
      return res.status(409).json({ error: "Movie already in watchlist" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to add to watchlist" });
  }
});

// ---- GET /api/watchlist - get the logged-in user's full watchlist ----
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const items = await prisma.watchlistItem.findMany({
      where: { userId },
      include: { movie: true },
      orderBy: { addedAt: "desc" },
    });

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch watchlist" });
  }
});

// ---- DELETE /api/watchlist/:movieId - remove a movie from the watchlist ----
router.delete("/:movieId", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const movieId = parseInt(req.params.movieId);

    await prisma.watchlistItem.delete({
      where: { userId_movieId: { userId, movieId } },
    });

    res.json({ message: "Removed from watchlist" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove from watchlist (maybe it wasn't there)" });
  }
});

module.exports = router;