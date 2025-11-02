/**
 * Conversation Domain Models
 *
 * 定義對話生成 SOP 草稿流程的領域模型與驗證邏輯
 * 對應任務：T016
 *
 * 這些模型用於：
 * - LLM 輸出結構化資料
 * - 草稿審核流程
 * - 轉換為正式的 Action 和 SOP
 */
import type { TagNamespace } from "./tagging";
/**
 * 草稿審核狀態
 */
export type DraftReviewStatus = "pending" | "approved" | "rejected";
/**
 * AI 建議的行動卡草稿
 * 用於對話流程中，LLM 分析任務描述後產生的行動步驟
 */
export interface ActionDraft {
    /** 草稿 ID（臨時 ID，用於前端追蹤） */
    draftId: string;
    /** 行動卡標題（必填） */
    title: string;
    /** 行動卡描述 */
    description?: string;
    /** 在 SOP 中的順序（從 1 開始） */
    order: number;
    /** AI 建議的負責人（需要審核確認） */
    suggestedOwner?: string;
    /** AI 建議的負責人 ID（需要審核確認） */
    suggestedOwnerId?: string;
    /** AI 建議的截止日期（需要審核確認） */
    suggestedDueDate?: Date | string;
    /** AI 建議的標籤（需要審核確認） */
    suggestedTags?: Record<TagNamespace, string | string[]>;
    /** AI 建議的理由或說明 */
    aiReasoning?: string;
    /** AI 信心度 (0-1) */
    aiConfidence?: number;
    /** 審核狀態（預設為 pending） */
    reviewStatus: DraftReviewStatus;
    /** 審核者備註 */
    reviewerNotes?: string;
    /** 審核時間 */
    reviewedAt?: Date;
    /** 來源對話 ID（用於追蹤） */
    sourceConversationId?: string;
    /** 是否已提交審核 */
    submitted?: boolean;
}
/**
 * SOP 草稿的 Frontmatter 結構
 * 對應 Markdown Frontmatter 格式
 */
export interface SOPFrontmatter {
    /** SOP 標題 */
    title: string;
    /** 版本號（SemVer 格式，如 "0.1.0"） */
    version: string;
    /** 狀態 */
    status: "draft" | "in_review" | "approved" | "archived";
    /** 標籤 */
    tags?: Record<TagNamespace, string | string[]>;
    /** 建立者 ID */
    createdBy: string;
    /** 建立時間（ISO 8601 格式） */
    createdAt: string;
    /** 專案 ID（可選） */
    projectId?: string;
    /** 描述 */
    description?: string;
    /** 注意事項 */
    notes?: string[];
    /** 常見錯誤 */
    commonMistakes?: string[];
    /** 相關資源連結 */
    resources?: string[];
}
/**
 * AI 生成的 SOP 草稿
 * 包含完整的 SOP 結構，包括 Markdown 和 JSON 格式
 */
export interface SOPDraft {
    /** 草稿 ID（臨時 ID，用於前端追蹤） */
    draftId: string;
    /** SOP 標題（必填） */
    title: string;
    /** SOP 描述 */
    description?: string;
    /** Frontmatter 結構（對應 Markdown Frontmatter） */
    frontmatter: SOPFrontmatter;
    /** Markdown 格式的 SOP 內容 */
    markdownContent: string;
    /** JSON 格式的 SOP 內容（結構化） */
    jsonContent: Record<string, unknown>;
    /** 關聯的行動卡草稿列表 */
    actionDrafts: ActionDraft[];
    /** 注意事項（來自對話補充） */
    notes?: string[];
    /** 常見錯誤清單（來自對話補充） */
    commonMistakes?: string[];
    /** 審核狀態（預設為 pending） */
    reviewStatus: DraftReviewStatus;
    /** 審核者備註 */
    reviewerNotes?: string;
    /** 審核時間 */
    reviewedAt?: Date;
    /** 來源對話 ID（用於追蹤） */
    sourceConversationId?: string;
    /** AI 處理的原始輸入（遮罩後） */
    maskedInput?: string;
    /** Prompt 版本（用於審計） */
    promptVersion?: string;
    /** 是否已提交審核 */
    submitted?: boolean;
}
/**
 * 對話解析請求
 * 使用者輸入的對話內容
 */
export interface ConversationParseRequest {
    /** 使用者輸入的文字 */
    text: string;
    /** 組織 ID */
    orgId: string;
    /** 使用者 ID */
    userId: string;
    /** 上下文資訊（可選） */
    context?: {
        /** 相關的 InboxItem ID */
        inboxItemId?: string;
        /** 相關的 Project ID */
        projectId?: string;
        /** 現有的標籤 */
        existingTags?: Record<TagNamespace, string | string[]>;
        /** 使用者偏好 */
        userPreferences?: Record<string, unknown>;
    };
}
/**
 * 對話解析回應
 * LLM 分析後的結構化輸出
 */
export interface ConversationParseResponse {
    /** 解析出的 SOP 草稿 */
    sopDraft: SOPDraft;
    /** AI 處理的摘要 */
    summary?: string;
    /** 處理時間（毫秒） */
    processingTimeMs?: number;
    /** Prompt 版本 */
    promptVersion: string;
    /** 遮罩記錄（用於審計） */
    redactions?: unknown[];
}
/**
 * 提交草稿審核請求
 */
export interface SubmitDraftRequest {
    /** SOP 草稿 ID */
    sopDraftId: string;
    /** 要提交的行動卡草稿 ID 列表（可選，預設全部） */
    actionDraftIds?: string[];
    /** 審核者 ID（可選，預設使用系統預設） */
    reviewerId?: string;
    /** 提交備註 */
    notes?: string;
}
/**
 * 審核草稿請求
 */
export interface ReviewDraftRequest {
    /** 草稿 ID（SOP 或 Action） */
    draftId: string;
    /** 草稿類型 */
    draftType: "sop" | "action";
    /** 審核結果 */
    reviewStatus: "approved" | "rejected";
    /** 審核者 ID */
    reviewerId: string;
    /** 審核備註 */
    notes?: string;
    /** 修正建議（如果是 rejected） */
    corrections?: Record<string, unknown>;
}
/**
 * 驗證 ActionDraft 是否完整
 */
export declare function validateActionDraft(draft: Partial<ActionDraft>): {
    valid: boolean;
    errors: string[];
};
/**
 * 驗證 SOPDraft 是否完整
 */
export declare function validateSOPDraft(draft: Partial<SOPDraft>): {
    valid: boolean;
    errors: string[];
};
/**
 * 檢查草稿是否可以提交審核
 */
export declare function canSubmitDraft(draft: SOPDraft | ActionDraft): {
    canSubmit: boolean;
    reasons: string[];
};
/**
 * 檢查草稿是否可以審核
 */
export declare function canReviewDraft(draft: SOPDraft | ActionDraft): boolean;
/**
 * 驗證 Frontmatter 格式
 */
export declare function validateFrontmatter(frontmatter: Partial<SOPFrontmatter>): {
    valid: boolean;
    errors: string[];
};
/**
 * 生成 Frontmatter Markdown 字串
 */
export declare function generateFrontmatterMarkdown(frontmatter: SOPFrontmatter): string;
//# sourceMappingURL=conversation.d.ts.map