import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsObject,
  ValidateNested,
  IsUUID,
} from "class-validator";
import { Type } from "class-transformer";

/**
 * 建立 SOP 的行動卡 DTO
 */
export class CreateActionDto {
  @ApiProperty({ description: "行動卡標題" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: "行動卡描述" })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: "負責人 ID" })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  ownerId: string;

  @ApiPropertyOptional({ description: "截止日期（ISO 8601）" })
  @IsString()
  @IsOptional()
  dueAt?: string;

  @ApiPropertyOptional({ description: "標籤" })
  @IsObject()
  @IsOptional()
  tags?: Record<string, unknown>;

  @ApiPropertyOptional({ description: "順序（用於 SOP 中的排序）" })
  @IsOptional()
  order?: number;
}

/**
 * 建立 SOP 請求 DTO
 */
export class CreateSOPDto {
  @ApiProperty({ description: "SOP 標題" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: "專案 ID" })
  @IsString()
  @IsUUID()
  @IsOptional()
  projectId?: string;

  @ApiProperty({ description: "行動卡列表", type: [CreateActionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActionDto)
  actions: CreateActionDto[];

  @ApiPropertyOptional({ description: "標籤" })
  @IsObject()
  @IsOptional()
  tags?: Record<string, unknown>;

  @ApiPropertyOptional({ description: "備註" })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * 建立 SOP 回應 DTO
 */
export class CreateSOPResponseDto {
  @ApiProperty({ description: "SOP ID" })
  id: string;

  @ApiProperty({ description: "SOP 標題" })
  title: string;

  @ApiPropertyOptional({ description: "專案 ID" })
  projectId?: string;

  @ApiProperty({ description: "狀態" })
  status: string;

  @ApiPropertyOptional({ description: "標籤" })
  tags?: Record<string, unknown>;

  @ApiPropertyOptional({ description: "備註" })
  notes?: string;

  @ApiProperty({ description: "建立時間" })
  createdAt: string;

  @ApiProperty({ description: "建立的行動卡 ID 列表" })
  actionIds: string[];
}

