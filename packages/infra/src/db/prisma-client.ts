import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "production" ? ["error"] : ["query", "error", "warn"],
});

export type PrismaClientInstance = PrismaClient;

export const getPrismaClient = (): PrismaClientInstance => prisma;

export const withOrganizationContext = async <T>(
  orgId: string,
  callback: (tx: PrismaClientInstance) => Promise<T>,
): Promise<T> => {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw(Prisma.sql`SET LOCAL aisop.current_org_id = ${orgId}::uuid`);
    return callback(tx);
  });
};

export const withSystemContext = async <T>(callback: (tx: PrismaClientInstance) => Promise<T>) => {
  return prisma.$transaction(callback);
};

export const shutdownPrisma = async () => {
  await prisma.$disconnect();
};

