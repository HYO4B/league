import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
  });
}

export const prisma: PrismaClient = process.env.DATABASE_URL
  ? (globalForPrisma.prisma ?? createPrismaClient())
  : (new Proxy(
      {},
      {
        get() {
          throw new Error("DATABASE_URL is not set. Configure it in Vercel Environment Variables.");
        }
      }
    ) as unknown as PrismaClient);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
