import { Module } from "@nestjs/common";
import { SOPsController } from "./sops.controller";
import { SOPsService } from "./sops.service";
import { PrismaModule } from "../common/prisma/prisma.module";

/**
 * SOPs Module
 * 
 * SOP 管理模組
 */
@Module({
  imports: [PrismaModule],
  controllers: [SOPsController],
  providers: [SOPsService],
  exports: [SOPsService],
})
export class SOPsModule {}

