import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { SOPsService } from "./sops.service";
import { CreateSOPDto, CreateSOPResponseDto } from "./dto/sop.dto";
import { User, RequestUser } from "../common/decorators/user.decorator";

/**
 * SOPs Controller
 * 
 * 處理 SOP 相關 API
 * 對應任務：T017
 */
@ApiTags("SOPs")
@Controller("sops")
@ApiBearerAuth("bearerAuth")
export class SOPsController {
  constructor(private readonly sopsService: SOPsService) {}

  @Post()
  @ApiOperation({ summary: "Create SOP draft from action cards" })
  async createSOP(
    @Body() dto: CreateSOPDto,
    @User() user: RequestUser
  ): Promise<CreateSOPResponseDto> {
    // 從 CreateSOPDto 轉換為 SOPDraft 格式
    // 注意：這是簡化版本，完整版本應從 /conversation/parse 的草稿轉換
    
    // 建立 SOPDraft（簡化版，假設所有 actions 都已審核通過）
    const now = new Date().toISOString();
    const draftId = `draft-${Date.now()}`;
    
    const sopDraft = {
      draftId,
      title: dto.title,
      description: dto.title,
      frontmatter: {
        title: dto.title,
        version: "0.1.0",
        status: "draft" as const,
        createdBy: user.userId,
        createdAt: now,
        tags: dto.tags,
        notes: dto.notes ? [dto.notes] : [],
      },
      markdownContent: `# ${dto.title}\n\n${dto.actions.map((a, i) => `${i + 1}. ${a.title}\n${a.description || ""}`).join("\n\n")}`,
      jsonContent: {
        title: dto.title,
        actions: dto.actions.map((a) => ({
          title: a.title,
          description: a.description,
          order: a.order || 0,
        })),
      },
      actionDrafts: dto.actions.map((action, index) => ({
        draftId: `${draftId}-action-${index + 1}`,
        title: action.title,
        description: action.description,
        order: action.order || index + 1,
        suggestedOwnerId: action.ownerId,
        suggestedDueDate: action.dueAt,
        suggestedTags: action.tags,
        reviewStatus: "approved" as const, // 假設已審核
      })),
      reviewStatus: "pending" as const,
    };

    return this.sopsService.createSOPFromDraft(
      user.userId,
      user.orgId,
      sopDraft as any,
      dto
    );
  }

  @Get()
  @ApiOperation({ summary: "List SOPs with filtering and pagination" })
  @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "projectId", required: false })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "offset", required: false, type: Number })
  async listSOPs(
    @Query("status") status?: string,
    @Query("projectId") projectId?: string,
    @Query("limit") limit?: number,
    @Query("offset") offset?: number,
    @User() user?: RequestUser
  ): Promise<{ items: any[]; total: number }> {
    if (!user) {
      throw new Error("User not found");
    }
    return this.sopsService.findAll(user.orgId, {
      status,
      projectId,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Get SOP detail with latest version" })
  async getSOP(
    @Param("id", ParseUUIDPipe) id: string,
    @User() user: RequestUser
  ): Promise<any> {
    return this.sopsService.findOne(id, user.orgId);
  }
}

