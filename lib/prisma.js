import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

// Create a singleton Prisma client instance with improved connection handling
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

// Handle connection errors and reconnect
// Only run in Node.js runtime (not Edge Runtime)
if (typeof process !== "undefined" && typeof process.on === "function") {
  // Handle graceful shutdown
  const gracefulShutdown = async () => {
    try {
      await db.$disconnect();
    } catch (error) {
      console.error("Error during database disconnect:", error);
    }
  };

  process.on("beforeExit", gracefulShutdown);
  process.on("SIGINT", gracefulShutdown);
  process.on("SIGTERM", gracefulShutdown);

  // Handle uncaught exceptions and reconnect
  process.on("unhandledRejection", async (reason) => {
    if (reason && typeof reason === "object" && "kind" in reason) {
      const prismaError = reason;
      if (prismaError.kind === "Closed") {
        console.warn("Prisma connection closed, attempting to reconnect...");
        try {
          await db.$connect();
        } catch (error) {
          console.error("Failed to reconnect to database:", error);
        }
      }
    }
  });
}

// Add connection health check helper with retry logic
export async function checkDatabaseConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await db.$queryRaw`SELECT 1`;
      return { connected: true };
    } catch (error) {
      if (error && typeof error === "object" && "kind" in error && error.kind === "Closed" && i < retries - 1) {
        console.warn(`Database connection closed, retrying... (${i + 1}/${retries})`);
        try {
          await db.$connect();
          await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
        } catch (connectError) {
          console.error("Failed to reconnect:", connectError);
        }
      } else if (i === retries - 1) {
        console.error("Database connection check failed after retries:", error);
        return { connected: false, error };
      }
    }
  }
  return { connected: false, error: "Max retries reached" };
}

// Helper function to execute queries with automatic reconnection
export async function executeWithRetry(queryFn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await queryFn();
    } catch (error) {
      if (error && typeof error === "object" && "kind" in error && error.kind === "Closed" && i < retries - 1) {
        console.warn(`Connection closed, reconnecting... (${i + 1}/${retries})`);
        try {
          await db.$connect();
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (connectError) {
          console.error("Failed to reconnect:", connectError);
        }
      } else {
        throw error;
      }
    }
  }
  throw new Error("Max retries reached");
}

// globalThis.prisma: This global variable ensures that the Prisma client instance is
// reused across hot reloads during development. Without this, each time your application
// reloads, a new instance of the Prisma client would be created, potentially leading
// to connection issues.
