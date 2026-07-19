// prisma/seedRatings.js
// Creates synthetic test users and random ratings across your movie catalog,
// so you have real rating volume to validate the recommendation system against.
// Run with: node prisma/seedRatings.js

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

const NUM_USERS = 60;           // number of synthetic test users to create
const RATINGS_PER_USER = 20;    // each user rates ~20 random movies

async function main() {
  console.log("Fetching movie ids...");
  const movies = await prisma.movie.findMany({ select: { id: true } });
  const movieIds = movies.map((m) => m.id);
  console.log(`Found ${movieIds.length} movies to rate from.`);

  const dummyPasswordHash = await bcrypt.hash("testpassword123", 10);

  console.log(`Creating ${NUM_USERS} synthetic users...`);
  const userIds = [];

  for (let i = 1; i <= NUM_USERS; i++) {
    const user = await prisma.user.create({
      data: {
        name: `Test User ${i}`,
        email: `testuser${i}@seed.local`,
        password: dummyPasswordHash,
      },
    });
    userIds.push(user.id);
  }
  console.log(`Created ${userIds.length} users.`);

  console.log("Generating random ratings...");
  const ratingsData = [];

  for (const userId of userIds) {
    const shuffled = [...movieIds].sort(() => 0.5 - Math.random());
    const pickedMovieIds = shuffled.slice(0, RATINGS_PER_USER);

    for (const movieId of pickedMovieIds) {
      ratingsData.push({
        userId,
        movieId,
        score: Math.floor(Math.random() * 5) + 1,
      });
    }
  }

  console.log(`Inserting ${ratingsData.length} ratings...`);
  await prisma.rating.createMany({
    data: ratingsData,
    skipDuplicates: true,
  });

  console.log(`Done! Created ${ratingsData.length} ratings across ${userIds.length} synthetic users.`);
}

main()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });