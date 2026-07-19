// prisma/seed.js
// Run with: node prisma/seed.js
// Reads movies_export.json and similarities_export.json (must be in this same folder)
// and bulk-inserts them into Postgres via Prisma.

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

// Insert in batches - inserting 96,000+ rows in one query can be slow/fail,
// so we break it into chunks of 2000 at a time.
function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function main() {
  // ---- Load the exported JSON files ----
  const moviesPath = path.join(__dirname, "movies_export.json");
  const similaritiesPath = path.join(__dirname, "similarities_export.json");

  const movies = JSON.parse(fs.readFileSync(moviesPath, "utf-8"));
  const similarities = JSON.parse(fs.readFileSync(similaritiesPath, "utf-8"));

  console.log(`Loaded ${movies.length} movies and ${similarities.length} similarity entries from JSON.`);

  // ---- Insert movies first (similarities reference movie ids as foreign keys) ----
  console.log("Inserting movies...");
  const movieChunks = chunkArray(movies, 500);
  let movieCount = 0;

  for (const chunk of movieChunks) {
    await prisma.movie.createMany({
      data: chunk,
      skipDuplicates: true, // in case you re-run this script
    });
    movieCount += chunk.length;
    console.log(`  ${movieCount}/${movies.length} movies inserted...`);
  }

  // ---- Insert similarities ----
  console.log("Inserting similarities...");
  const simChunks = chunkArray(similarities, 2000);
  let simCount = 0;

  for (const chunk of simChunks) {
    await prisma.movieSimilarity.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    simCount += chunk.length;
    console.log(`  ${simCount}/${similarities.length} similarity rows inserted...`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  