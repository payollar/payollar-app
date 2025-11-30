import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

// Create a singleton Prisma client instance
function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    errorFormat: "pretty",
  });
}

// Use singleton pattern to ensure only one Prisma client instance
export const db =
  globalForPrisma.prisma ??
  (globalForPrisma.prisma = createPrismaClient());

// Handle graceful shutdown in development
if (process.env.NODE_ENV !== "production") {
  if (typeof process !== "undefined") {
    process.on("beforeExit", async () => {
      await db.$disconnect();
    });
  }
}

// globalThis.prisma: This global variable ensures that the Prisma client instance is
// reused across hot reloads during development. Without this, each time your application
// reloads, a new instance of the Prisma client would be created, potentially leading
// to connection issues.
