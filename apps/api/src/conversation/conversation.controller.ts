import { Controller, Post, Body, Req } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { Request } from "express";
import { ConversationService } from "./conversation.service";
import {
  ConversationParseRequestDto,
  ConversationParseResponseDto,
} from "./dto/conversation.dto";
import { User, RequestUser } from "../common/decorators/user.decorator";

/**
 * Conversation Controller
 * 
 * 處理對話解析 API
 * 對應任務：T015
 */
@ApiTags("Conversation")
@Controller("conversation")
@ApiBearerAuth("bearerAuth")
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post("parse")
  @ApiOperation({ summary: "Convert natural language input into structured action draft" })
  async parseConversation(
    @Body() dto: ConversationParseRequestDto,
    @User() user: RequestUser,
    @Req() req: Request
  ): Promise<ConversationParseResponseDto> {
    // 審計日誌會由 AuditInterceptor 自動記錄
    
    const result = await this.conversationService.parseConversation({
      text: dto.text,
      orgId: user.orgId,
      userId: user.userId,
      context: dto.context
        ? {
            inboxItemId: dto.context.inboxItemId,
            projectId: dto.context.projectId,
            existingTags: dto.context.existingTags as any,
            userPreferences: dto.context.userPreferences,
          }
        : undefined,
    });

    // 設定 promptVersion 和 redactions 到 request，讓 AuditInterceptor 可以記錄
    (req as any).promptVersion = result.promptVersion;
    (req as any).redactions = result.redactions;

    return result;
  }
}

