import { Injectable, BadRequestException } from "@nestjs/common";
import { createConversationLLMService } from "@aisop/infra";
import { maskPayloadForLLM } from "@aisop/infra";
import type {
  ConversationParseRequest,
  ConversationParseResponse,
  SOPDraft,
} from "@aisop/domain";
import { validateSOPDraft } from "@aisop/domain";

/**
 * Conversation Service
 * 
 * 處理對話解析與 SOP 草稿生成邏輯
 * 對應任務：T015
 */
@Injectable()
export class ConversationService {
  private readonly llmService = createConversationLLMService();

  /**
   * 解析對話並生成 SOP 草稿
   */
  async parseConversation(
    request: ConversationParseRequest
  ): Promise<ConversationParseResponse> {
    const startTime = Date.now();

    // 1. 遮罩敏感資訊
    const { masked, redactions } = maskPayloadForLLM(request.text);

    // 2. 調用 LLM 服務
    const llmResult = await this.llmService.parseConversation(
      request,
      masked,
      redactions
    );

    // 3. 驗證生成的草稿
    const validation = validateSOPDraft(llmResult.sopDraft as Partial<SOPDraft>);
    if (!validation.valid) {
      throw new BadRequestException(
        `生成的 SOP 草稿驗證失敗: ${validation.errors.join(", ")}`
      );
    }

    // 4. 計算處理時間
    const processingTimeMs = Date.now() - startTime;

    // 5. 構建回應
    const response: ConversationParseResponse = {
      sopDraft: llmResult.sopDraft as SOPDraft,
      summary: `已解析 ${llmResult.sopDraft.actionDrafts?.length || 0} 個行動步驟`,
      processingTimeMs,
      promptVersion: llmResult.promptVersion,
      redactions: llmResult.redactions,
    };

    return response;
  }
}

