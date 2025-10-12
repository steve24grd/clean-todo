import { PrismaClient } from "@prisma/client";

// Singleton Prisma Client with graceful shutdown
let prisma: PrismaClient | undefined;

export function getPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient();

    // Graceful shutdown in dev/server restarts
    const cleanup = async () => {
      try {
        await prisma?.$disconnect();
      } catch (_) {
        // ignore
      }
    };
    process.on("beforeExit", cleanup);
    process.on("SIGINT", async () => {
      await cleanup();
      process.exit(0);
    });
    process.on("SIGTERM", async () => {
      await cleanup();
      process.exit(0);
    });
  }
  return prisma;
}

