/**
 * Tagging Infrastructure
 * 
 * 提供標籤建議的基礎設施實作（LLM 整合、標籤儲存、審核流程）
 */

import { maskPayloadForLLM, type Redaction } from "../masking";
import {
  type TagSuggestionRequest,
  type TagSuggestionResponse,
  type TagSuggestion,
  type TagNamespace,
  isValidNamespace,
} from "@aisop/domain";

/**
 * LLM 標籤建議服務介面
 */
export interface ITaggingLLMService {
  /**
   * 基於文字內容建議標籤
   * @param request 標籤建議請求
   * @returns 標籤建議回應
   */
  suggestTags(request: TagSuggestionRequest): Promise<TagSuggestionResponse>;
}

/**
 * 標籤建議提示模板
 */
const TAG_SUGGESTION_PROMPT = `你是一個專業的標籤分類助手。請分析以下文字內容，並建議適當的標籤。

標籤命名空間說明：
- domain: 業務領域（如：ops, engineering, product）
- role: 角色（如：pm, developer, designer）
- phase: 階段（如：plan, execute, review）
- tool: 工具（如：notion, jira, github）
- risk: 風險等級（如：low, medium, high）
- scope: 範圍（如：individual, team, org）
- free: 自由標籤（任意文字）

請以 JSON 格式回傳，格式如下：
{
  "suggestions": [
    {
      "namespace": "domain",
      "value": "ops",
      "confidence": 0.9,
      "reason": "內容涉及營運流程"
    }
  ]
}

文字內容：
{{TEXT}}

請只回傳 JSON，不要包含其他文字。`;

/**
 * Mock LLM 標籤建議服務（MVP 階段）
 * 
 * TODO: 整合 OpenAI GPT-4o mini 或其他 LLM 服務
 */
export class MockTaggingLLMService implements ITaggingLLMService {
  async suggestTags(request: TagSuggestionRequest): Promise<TagSuggestionResponse> {
    // 遮罩敏感資訊
    const { masked, redactions } = maskPayloadForLLM(request.text);

    // Mock 回應（實際應調用 LLM API）
    const suggestions: TagSuggestion[] = [];

    // 簡單關鍵字匹配（實際應使用 LLM）
    const lowerText = masked.toLowerCase();

    if (lowerText.includes("sop") || lowerText.includes("流程")) {
      suggestions.push({
        namespace: "domain",
        value: "ops",
        confidence: 0.8,
        reason: "內容涉及流程管理",
      });
    }

    if (lowerText.includes("review") || lowerText.includes("審核")) {
      suggestions.push({
        namespace: "phase",
        value: "review",
        confidence: 0.85,
        reason: "內容涉及審核階段",
      });
    }

    // 檢查是否需要審核（信心度 < 0.7 或新標籤）
    const requiresReview = suggestions.some((s) => s.confidence < 0.7);

    return {
      suggestions,
      requiresReview,
      redactions,
      promptVersion: "v1.0.0",
    };
  }
}

/**
 * OpenAI 標籤建議服務（待實作）
 */
export class OpenAITaggingLLMService implements ITaggingLLMService {
  constructor(
    private apiKey: string,
    private model: string = "gpt-4o-mini"
  ) {}

  async suggestTags(request: TagSuggestionRequest): Promise<TagSuggestionResponse> {
    // 遮罩敏感資訊
    const { masked, redactions } = maskPayloadForLLM(request.text);

    // TODO: 調用 OpenAI API
    // const prompt = TAG_SUGGESTION_PROMPT.replace("{{TEXT}}", masked);
    // const response = await openai.chat.completions.create({ ... });

    // 暫時回傳 mock 資料
    const service = new MockTaggingLLMService();
    return service.suggestTags({ ...request, text: masked });
  }
}

/**
 * 標籤建議服務工廠
 */
export function createTaggingLLMService(): ITaggingLLMService {
  const provider = process.env.TAGGING_LLM_PROVIDER || "mock";

  switch (provider) {
    case "openai":
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OPENAI_API_KEY environment variable is required");
      }
      return new OpenAITaggingLLMService(apiKey);
    case "mock":
    default:
      return new MockTaggingLLMService();
  }
}

