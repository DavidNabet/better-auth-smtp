import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  });
if (process.env.NODE_ENV !== "production" && !globalForPrisma.prisma) {
  db.$use(async (params, next) => {
    const before = Date.now();
    await next(params);
    const after = Date.now();
    console.log(
      `Requete ${params.model}.${params.action} a mis ${after - before}ms`
    );
  });

  globalForPrisma.prisma = db;
}
