/**
 * PDCA Domain Models
 * 
 * 定義 PDCA (Plan-Do-Check-Act) 循環的領域模型與驗證邏輯
 * 對應資料模型：apps/api/prisma/schema.prisma
 */

export type PDCAStatus = "draft" | "in_review" | "closed";

export interface PDCAPhase {
  /** Plan 階段：目標、假設與行動計畫 */
  plan: Record<string, unknown>;
  
  /** Do 階段：執行過程與觀察 */
  do: Record<string, unknown>;
  
  /** Check 階段：結果評估與差異分析 */
  check: Record<string, unknown>;
  
  /** Act 階段：改進決策與後續行動 */
  act: Record<string, unknown>;
}

export interface PDCAActInsight {
  /** 確認的洞察與學習要點 */
  insights: string[];
  /** 相關的 SOP 改進建議 */
  improvementSuggestions?: string[];
  /** 關聯的 Action IDs */
  linkedActionIds?: string[];
  /** Reviewer 審核備註 */
  reviewerNotes?: string;
}

export interface PDCAActActionChange {
  /** 行動變更描述 */
  changes: string[];
  /** 後續假設 */
  hypotheses?: string[];
  /** 追蹤行動項 ID */
  trackedActionIds?: string[];
  /** 預期成果 */
  expectedOutcomes?: string[];
}

export interface PDCA {
  id: string;
  orgId: string;
  sopId: string;
  projectId?: string;
  periodStart: Date;
  periodEnd: Date;
  phasePlan: PDCAPhase["plan"];
  phaseDo: PDCAPhase["do"];
  phaseCheck: PDCAPhase["check"];
  phaseAct: PDCAPhase["act"];
  /** Act 階段確認的洞察與學習（T010A 新增） */
  actAcknowledgeInsight?: PDCAActInsight;
  /** Act 階段的行動變更決策（T010A 新增） */
  actActionChange?: PDCAActActionChange;
  diffJson?: Record<string, unknown>;
  status: PDCAStatus;
  createdById: string;
  reviewedById?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

export interface CreatePDCADto {
  sopId: string;
  projectId?: string;
  periodStart: string; // ISO date string
  periodEnd: string; // ISO date string
  plan: PDCAPhase["plan"];
  do: PDCAPhase["do"];
  check: PDCAPhase["check"];
  act: PDCAPhase["act"];
  actAcknowledgeInsight?: PDCAActInsight;
  actActionChange?: PDCAActActionChange;
}

export interface UpdatePDCADto {
  plan?: PDCAPhase["plan"];
  do?: PDCAPhase["do"];
  check?: PDCAPhase["check"];
  act?: PDCAPhase["act"];
  actAcknowledgeInsight?: PDCAActInsight;
  actActionChange?: PDCAActActionChange;
  status?: PDCAStatus;
}

/**
 * 驗證 PDCA 期間是否有效
 */
export function validatePDCAPeriod(periodStart: Date, periodEnd: Date): boolean {
  return periodEnd >= periodStart;
}

/**
 * 驗證 PDCA 狀態轉換是否合法
 */
export function canTransitionStatus(
  currentStatus: PDCAStatus,
  targetStatus: PDCAStatus
): boolean {
  const validTransitions: Record<PDCAStatus, PDCAStatus[]> = {
    draft: ["in_review"],
    in_review: ["draft", "closed"],
    closed: [], // 封閉後不可再變更
  };

  return validTransitions[currentStatus]?.includes(targetStatus) ?? false;
}

/**
 * 驗證 PDCA 是否可以提交審核
 */
export function canSubmitForReview(pdca: Partial<PDCA>): {
  valid: boolean;
  missingFields: string[];
} {
  const missingFields: string[] = [];

  if (!pdca.phasePlan) missingFields.push("phasePlan");
  if (!pdca.phaseDo) missingFields.push("phaseDo");
  if (!pdca.phaseCheck) missingFields.push("phaseCheck");
  if (!pdca.phaseAct) missingFields.push("phaseAct");

  // Act phase 的新欄位在提交審核時建議填寫
  // 但為保持向後相容，設為可選

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}

