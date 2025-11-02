import { IsString, IsOptional, IsObject, IsBoolean } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class TagSuggestionRequestDto {
  @ApiProperty({ description: "待分析的文字內容" })
  @IsString()
  text!: string;

  @ApiPropertyOptional({ description: "上下文資訊" })
  @IsOptional()
  @IsObject()
  context?: {
    entityType?: "sop" | "action" | "project";
    entityId?: string;
    existingTags?: unknown[];
  };

  @ApiPropertyOptional({ description: "是否包含自訂標籤建議", default: true })
  @IsOptional()
  @IsBoolean()
  includeFreeTags?: boolean;
}

export class TagSuggestionResponseDto {
  @ApiProperty({ description: "AI 建議的標籤候選列表" })
  suggestions!: Array<{
    namespace: string;
    value: string;
    confidence: number;
    reason?: string;
  }>;

  @ApiProperty({ description: "是否需要審核" })
  requiresReview!: boolean;

  @ApiPropertyOptional({ description: "遮罩記錄" })
  redactions?: unknown[];

  @ApiPropertyOptional({ description: "Prompt 版本" })
  promptVersion?: string;
}

export class CommitTagsRequestDto {
  @ApiProperty({ description: "目標實體 ID" })
  @IsString()
  entityId!: string;

  @ApiProperty({ description: "實體類型", enum: ["sop", "action", "project"] })
  @IsString()
  entityType!: "sop" | "action" | "project";

  @ApiProperty({ description: "標籤候選 ID 列表", type: [String] })
  @IsString({ each: true })
  candidateIds!: string[];

  @ApiPropertyOptional({ description: "是否自動建立新標籤", default: false })
  @IsOptional()
  @IsBoolean()
  autoCreate?: boolean;
}

