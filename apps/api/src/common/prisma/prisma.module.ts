import { Module, Global } from "@nestjs/common";
import { getPrismaClient } from "@aisop/infra";

/**
 * Prisma Module
 * 
 * 提供 Prisma Client 作為 NestJS Provider
 */
@Global()
@Module({
  providers: [
    {
      provide: "PrismaClient",
      useFactory: () => getPrismaClient(),
    },
  ],
  exports: ["PrismaClient"],
})
export class PrismaModule {}

