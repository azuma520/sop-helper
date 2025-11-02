/**
 * Tagging Domain Models
 *
 * 定義標籤建議與審核的領域模型
 * 對應資料模型：Tag (apps/api/prisma/schema.prisma)
 */
export type TagNamespace = "domain" | "role" | "phase" | "tool" | "risk" | "scope" | "free";
export interface Tag {
    id: string;
    orgId: string;
    namespace: TagNamespace;
    value: string;
    metadata?: TagMetadata;
    createdAt: Date;
}
export interface TagMetadata {
    /** 標籤顏色（hex） */
    color?: string;
    /** 標籤描述 */
    description?: string;
    /** 使用次數統計 */
    usageCount?: number;
    /** 是否為系統預設標籤 */
    isSystem?: boolean;
}
/**
 * 標籤建議請求
 */
export interface TagSuggestionRequest {
    /** 待分析的文字內容 */
    text: string;
    /** 上下文資訊（SOP、Action 等） */
    context?: {
        entityType?: "sop" | "action" | "project";
        entityId?: string;
        existingTags?: Tag[];
    };
    /** 是否包含自訂標籤建議 */
    includeFreeTags?: boolean;
}
/**
 * AI 建議的標籤候選
 */
export interface TagSuggestion {
    /** 標籤命名空間 */
    namespace: TagNamespace;
    /** 標籤值 */
    value: string;
    /** AI 信心度 (0-1) */
    confidence: number;
    /** 建議理由 */
    reason?: string;
}
/**
 * 標籤建議回應
 */
export interface TagSuggestionResponse {
    /** AI 建議的標籤候選列表 */
    suggestions: TagSuggestion[];
    /** 需要 Reviewer 審核的標籤（低信心度或新標籤） */
    requiresReview: boolean;
    /** 遮罩記錄（用於審計） */
    redactions?: unknown[];
    /** Prompt 版本（用於審計） */
    promptVersion?: string;
}
/**
 * 標籤候選（待審核狀態）
 */
export interface TagCandidate {
    id: string;
    orgId: string;
    namespace: TagNamespace;
    value: string;
    confidence: number;
    reason?: string;
    /** 審核狀態 */
    reviewStatus: "pending" | "approved" | "rejected";
    /** 審核者 ID */
    reviewedById?: string;
    /** 審核時間 */
    reviewedAt?: Date;
    /** 審核備註 */
    reviewNotes?: string;
    /** 關聯的實體（SOP/Action ID） */
    entityType?: "sop" | "action" | "project";
    entityId?: string;
    createdAt: Date;
}
/**
 * 提交標籤審核請求
 */
export interface CommitTagsRequest {
    /** 目標實體 ID（SOP/Action） */
    entityId: string;
    /** 實體類型 */
    entityType: "sop" | "action" | "project";
    /** 要提交的標籤候選 ID 列表 */
    candidateIds: string[];
    /** 是否自動建立新標籤（若標籤不存在） */
    autoCreate?: boolean;
}
/**
 * 標籤審核結果
 */
export interface TagReviewResult {
    /** 已批准的標籤 */
    approved: Tag[];
    /** 被拒絕的標籤 */
    rejected: TagCandidate[];
    /** 新建立的標籤 */
    created: Tag[];
}
/**
 * 驗證標籤命名空間是否有效
 */
export declare function isValidNamespace(namespace: string): namespace is TagNamespace;
/**
 * 驗證標籤值是否符合規範
 */
export declare function validateTagValue(value: string, namespace: TagNamespace): {
    valid: boolean;
    errors: string[];
};
//# sourceMappingURL=tagging.d.ts.map