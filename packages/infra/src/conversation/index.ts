/**
 * Conversation LLM Service
 * 
 * 提供對話解析的 LLM 整合服務
 * 對應任務：T015
 */

import { maskPayloadForLLM, type Redaction } from "../masking";
import type {
  ConversationParseRequest,
  ConversationParseResponse,
  ActionDraft,
  SOPDraft,
  SOPFrontmatter,
} from "@aisop/domain";

const PROMPT_VERSION = "v1.0.0";

/**
 * LLM Prompt 模板
 * 用於將使用者輸入轉換為結構化的 SOP 草稿
 */
function buildConversationPrompt(
  maskedText: string,
  context?: ConversationParseRequest["context"]
): string {
  const contextInfo = context
    ? `
上下文資訊：
- Project ID: ${context.projectId || "無"}
- 現有標籤: ${JSON.stringify(context.existingTags || {})}
`
    : "";

  return `你是一個專業的 SOP（標準作業程序）分析師。請將使用者的任務描述拆解成結構化的 SOP 草稿。

使用者輸入（已遮罩敏感資訊）：
${maskedText}
${contextInfo}

請按照以下格式輸出 JSON：

{
  "title": "SOP 標題",
  "description": "SOP 描述",
  "actionDrafts": [
    {
      "title": "步驟 1 標題",
      "description": "步驟 1 詳細說明",
      "order": 1,
      "suggestedOwner": "建議的負責人（如果需要）",
      "suggestedDueDate": "建議截止日期（ISO 8601，如果需要）",
      "suggestedTags": {
        "domain": "標籤",
        "role": "標籤"
      },
      "aiReasoning": "為什麼建議這個步驟",
      "aiConfidence": 0.9
    }
  ],
  "notes": ["注意事項 1", "注意事項 2"],
  "commonMistakes": ["常見錯誤 1", "常見錯誤 2"]
}

要求：
1. 生成 3-5 個行動卡草稿（actionDrafts）
2. 每個行動卡必須有清晰的標題和描述
3. 建議標籤時使用以下命名空間：domain, role, phase, tool, risk, scope, free
4. AI 信心度應該在 0-1 之間
5. 如果任務描述少於 3 個步驟，請補充必要的檢查或驗證步驟

請只輸出 JSON，不要有其他文字。`;
}

/**
 * LLM Service 介面
 */
export interface ConversationLLMService {
  parseConversation(
    request: ConversationParseRequest,
    maskedText: string,
    redactions: Redaction[]
  ): Promise<{
    sopDraft: Partial<SOPDraft>;
    promptVersion: string;
    redactions: Redaction[];
  }>;
}

/**
 * Mock LLM Service（開發用）
 * 在沒有 OpenAI API Key 時使用
 */
class MockConversationLLMService implements ConversationLLMService {
  async parseConversation(
    request: ConversationParseRequest,
    maskedText: string,
    redactions: Redaction[]
  ): Promise<{
    sopDraft: Partial<SOPDraft>;
    promptVersion: string;
    redactions: Redaction[];
  }> {
    // 模擬處理時間
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 產生臨時 ID
    const draftId = `draft-${Date.now()}`;
    const actionDrafts: ActionDraft[] = [];

    // 簡單解析：根據關鍵字拆解步驟
    const text = maskedText.toLowerCase();
    let order = 1;

    if (text.includes("備份") || text.includes("backup")) {
      actionDrafts.push({
        draftId: `${draftId}-action-1`,
        title: "檢查資料庫連線",
        description: "確認資料庫連線正常，並驗證連線權限",
        order: order++,
        suggestedOwner: "系統管理員",
        aiConfidence: 0.8,
        reviewStatus: "pending",
      });
      actionDrafts.push({
        draftId: `${draftId}-action-2`,
        title: "執行備份指令",
        description: "執行資料庫備份命令，並確認備份檔案產生",
        order: order++,
        suggestedOwner: "系統管理員",
        aiConfidence: 0.8,
        reviewStatus: "pending",
      });
      actionDrafts.push({
        draftId: `${draftId}-action-3`,
        title: "驗證備份完整性",
        description: "檢查備份檔案大小和完整性",
        order: order++,
        suggestedOwner: "系統管理員",
        aiConfidence: 0.75,
        reviewStatus: "pending",
      });
    } else {
      // 預設範例
      actionDrafts.push({
        draftId: `${draftId}-action-1`,
        title: "步驟 1: 準備工作",
        description: "準備所需的工具和資源",
        order: order++,
        aiConfidence: 0.7,
        reviewStatus: "pending",
      });
      actionDrafts.push({
        draftId: `${draftId}-action-2`,
        title: "步驟 2: 執行任務",
        description: "按照規劃執行主要任務",
        order: order++,
        aiConfidence: 0.7,
        reviewStatus: "pending",
      });
      actionDrafts.push({
        draftId: `${draftId}-action-3`,
        title: "步驟 3: 驗證結果",
        description: "檢查執行結果是否符合預期",
        order: order++,
        aiConfidence: 0.7,
        reviewStatus: "pending",
      });
    }

    const now = new Date().toISOString();
    const frontmatter: SOPFrontmatter = {
      title: request.text.substring(0, 50) || "新 SOP",
      version: "0.1.0",
      status: "draft",
      createdBy: request.userId,
      createdAt: now,
      tags: request.context?.existingTags,
    };

    const sopDraft: Partial<SOPDraft> = {
      draftId,
      title: frontmatter.title,
      description: `由對話產生的 SOP：${request.text.substring(0, 100)}`,
      frontmatter,
      markdownContent: `# ${frontmatter.title}\n\n${actionDrafts.map((a, i) => `## ${i + 1}. ${a.title}\n\n${a.description || ""}`).join("\n\n")}`,
      jsonContent: {
        title: frontmatter.title,
        actions: actionDrafts.map((a) => ({
          title: a.title,
          description: a.description,
          order: a.order,
        })),
      },
      actionDrafts,
      notes: ["這是一個自動生成的草稿，請審核後使用"],
      reviewStatus: "pending",
      sourceConversationId: request.context?.inboxItemId,
      maskedInput: maskedText,
      promptVersion: PROMPT_VERSION,
    };

    return {
      sopDraft,
      promptVersion: PROMPT_VERSION,
      redactions,
    };
  }
}

/**
 * OpenAI LLM Service（實際使用）
 */
class OpenAIConversationLLMService implements ConversationLLMService {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = "gpt-4o-mini") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async parseConversation(
    request: ConversationParseRequest,
    maskedText: string,
    redactions: Redaction[]
  ): Promise<{
    sopDraft: Partial<SOPDraft>;
    promptVersion: string;
    redactions: Redaction[];
  }> {
    const prompt = buildConversationPrompt(maskedText, request.context);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content:
                "你是一個專業的 SOP（標準作業程序）分析師。你必須嚴格按照 JSON 格式輸出，不要包含任何其他文字或說明。",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error("OpenAI API returned empty content");
      }

      // 解析 JSON 回應
      const llmOutput = JSON.parse(content);

      // 轉換為 SOPDraft 格式
      const now = new Date().toISOString();
      const draftId = `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const actionDrafts: ActionDraft[] = (llmOutput.actionDrafts || []).map(
        (action: any, index: number) => ({
          draftId: `${draftId}-action-${index + 1}`,
          title: action.title || `步驟 ${index + 1}`,
          description: action.description,
          order: action.order || index + 1,
          suggestedOwner: action.suggestedOwner,
          suggestedDueDate: action.suggestedDueDate,
          suggestedTags: action.suggestedTags,
          aiReasoning: action.aiReasoning,
          aiConfidence: action.aiConfidence || 0.7,
          reviewStatus: "pending" as const,
          sourceConversationId: request.context?.inboxItemId,
        })
      );

      const frontmatter: SOPFrontmatter = {
        title: llmOutput.title || request.text.substring(0, 50),
        version: "0.1.0",
        status: "draft",
        createdBy: request.userId,
        createdAt: now,
        description: llmOutput.description,
        tags: llmOutput.suggestedTags || request.context?.existingTags,
        notes: llmOutput.notes || [],
        commonMistakes: llmOutput.commonMistakes || [],
      };

      // 生成 Markdown 內容
      const markdownContent = generateSOPMarkdown(frontmatter, actionDrafts, llmOutput);

      const sopDraft: Partial<SOPDraft> = {
        draftId,
        title: frontmatter.title,
        description: llmOutput.description,
        frontmatter,
        markdownContent,
        jsonContent: {
          title: frontmatter.title,
          description: llmOutput.description,
          actions: actionDrafts.map((a) => ({
            title: a.title,
            description: a.description,
            order: a.order,
            suggestedOwner: a.suggestedOwner,
            suggestedTags: a.suggestedTags,
          })),
          notes: llmOutput.notes || [],
          commonMistakes: llmOutput.commonMistakes || [],
        },
        actionDrafts,
        notes: llmOutput.notes,
        commonMistakes: llmOutput.commonMistakes,
        reviewStatus: "pending",
        sourceConversationId: request.context?.inboxItemId,
        maskedInput: maskedText,
        promptVersion: PROMPT_VERSION,
      };

      return {
        sopDraft,
        promptVersion: PROMPT_VERSION,
        redactions,
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error(`LLM processing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * 生成 SOP Markdown 內容
 */
function generateSOPMarkdown(
  frontmatter: SOPFrontmatter,
  actionDrafts: ActionDraft[],
  llmOutput: any
): string {
  const lines: string[] = [];

  // Frontmatter（會在外部處理，這裡只包含內容）
  lines.push(`# ${frontmatter.title}\n`);

  if (frontmatter.description) {
    lines.push(`${frontmatter.description}\n`);
  }

  // 行動步驟
  lines.push("## 執行步驟\n");
  actionDrafts
    .sort((a, b) => a.order - b.order)
    .forEach((action) => {
      lines.push(`### ${action.order}. ${action.title}`);
      if (action.description) {
        lines.push(`\n${action.description}\n`);
      }
    });

  // 注意事項
  if (llmOutput.notes && llmOutput.notes.length > 0) {
    lines.push("\n## 注意事項\n");
    llmOutput.notes.forEach((note: string) => {
      lines.push(`- ${note}`);
    });
    lines.push("");
  }

  // 常見錯誤
  if (llmOutput.commonMistakes && llmOutput.commonMistakes.length > 0) {
    lines.push("\n## 常見錯誤\n");
    llmOutput.commonMistakes.forEach((mistake: string) => {
      lines.push(`- ${mistake}`);
    });
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * 建立 Conversation LLM Service
 */
export function createConversationLLMService(): ConversationLLMService {
  const provider = process.env.TAGGING_LLM_PROVIDER || "mock";
  const apiKey = process.env.OPENAI_API_KEY || "";

  if (provider === "openai" && apiKey) {
    return new OpenAIConversationLLMService(apiKey);
  }

  // 預設使用 Mock Service
  console.warn(
    "Conversation LLM Service: Using mock service. Set OPENAI_API_KEY and TAGGING_LLM_PROVIDER=openai to use OpenAI."
  );
  return new MockConversationLLMService();
}

