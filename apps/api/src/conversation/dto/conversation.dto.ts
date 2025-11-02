import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsObject, IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

/**
 * 對話解析請求的上下文資訊
 */
export class ConversationContextDto {
  @ApiPropertyOptional({ description: "相關的 InboxItem ID" })
  @IsOptional()
  @IsString()
  inboxItemId?: string;

  @ApiPropertyOptional({ description: "相關的 Project ID" })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ description: "現有的標籤" })
  @IsOptional()
  @IsObject()
  existingTags?: Record<string, unknown>;

  @ApiPropertyOptional({ description: "使用者偏好" })
  @IsOptional()
  @IsObject()
  userPreferences?: Record<string, unknown>;
}

/**
 * 對話解析請求 DTO
 */
export class ConversationParseRequestDto {
  @ApiProperty({ description: "使用者輸入的文字" })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiPropertyOptional({ description: "上下文資訊" })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConversationContextDto)
  context?: ConversationContextDto;
}

/**
 * 對話解析回應 DTO
 */
export class ConversationParseResponseDto {
  @ApiProperty({ description: "解析出的 SOP 草稿" })
  sopDraft: {
    draftId: string;
    title: string;
    description?: string;
    frontmatter: {
      title: string;
      version: string;
      status: string;
      createdBy: string;
      createdAt: string;
      tags?: Record<string, unknown>;
      notes?: string[];
      commonMistakes?: string[];
    };
    markdownContent: string;
    jsonContent: Record<string, unknown>;
    actionDrafts: Array<{
      draftId: string;
      title: string;
      description?: string;
      order: number;
      suggestedOwner?: string;
      suggestedDueDate?: string;
      suggestedTags?: Record<string, unknown>;
      aiReasoning?: string;
      aiConfidence?: number;
      reviewStatus: string;
    }>;
    notes?: string[];
    commonMistakes?: string[];
    reviewStatus: string;
    sourceConversationId?: string;
    promptVersion?: string;
  };

  @ApiPropertyOptional({ description: "AI 處理的摘要" })
  summary?: string;

  @ApiPropertyOptional({ description: "處理時間（毫秒）" })
  processingTimeMs?: number;

  @ApiProperty({ description: "Prompt 版本" })
  promptVersion: string;
}

