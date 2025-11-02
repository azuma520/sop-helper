import { Injectable } from "@nestjs/common";
import { createTaggingLLMService } from "@aisop/infra";
import type {
  TagSuggestionRequest,
  TagSuggestionResponse,
  CommitTagsRequest,
} from "@aisop/domain";

/**
 * Tags Service
 * 
 * 處理標籤建議、儲存與審核邏輯
 */
@Injectable()
export class TagsService {
  private readonly llmService = createTaggingLLMService();

  /**
   * 取得標籤建議
   */
  async suggestTags(request: TagSuggestionRequest): Promise<TagSuggestionResponse> {
    // TODO: 整合 Prisma 查詢現有標籤
    // TODO: 記錄審計日誌（AuditLog）

    return this.llmService.suggestTags(request);
  }

  /**
   * 提交標籤審核並套用
   */
  async commitTags(
    userId: string,
    orgId: string,
    request: CommitTagsRequest
  ): Promise<{ success: boolean; message: string }> {
    // TODO: 實作標籤候選審核邏輯
    // 1. 查詢候選標籤
    // 2. 驗證標籤合法性
    // 3. 建立或更新標籤
    // 4. 關聯到目標實體（SOP/Action）
    // 5. 記錄審計日誌

    return {
      success: true,
      message: "標籤已提交審核",
    };
  }
}

