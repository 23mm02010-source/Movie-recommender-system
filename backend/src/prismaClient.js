// src/prismaClient.js
// Single shared Prisma instance - reused across the app instead of
// creating a new DB connection pool per request.

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = prisma;
