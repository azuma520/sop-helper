/**
 * Audit Logging Infrastructure
 * 
 * 提供審計日誌記錄功能
 * 對應任務：T019
 */

import type { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

/**
 * 審計日誌輸入參數
 */
export interface AuditLogInput {
  /** 組織 ID */
  orgId: string;
  
  /** 使用者 ID（可選） */
  userId?: string;
  
  /** API 端點 */
  endpoint: string;
  
  /** HTTP 方法 */
  method: string;
  
  /** 請求 ID（用於追蹤） */
  requestId: string;
  
  /** 請求負載（會計算 hash） */
  payload?: unknown;
  
  /** 請求處理時間（毫秒） */
  latencyMs: number;
  
  /** Prompt 版本（用於 LLM 相關操作） */
  promptVersion?: string;
  
  /** 遮罩記錄（用於 LLM 相關操作） */
  redactions?: unknown[];
}

/**
 * 建立審計日誌服務
 */
export function createAuditLogService(prisma: PrismaClient) {
  /**
   * 記錄審計日誌
   */
  async function logAudit(input: AuditLogInput): Promise<void> {
    try {
      // 計算 payload hash（如果提供）
      let payloadHash: string | undefined;
      if (input.payload) {
        const payloadString =
          typeof input.payload === "string"
            ? input.payload
            : JSON.stringify(input.payload);
        payloadHash = createHash("sha256").update(payloadString).digest("hex");
      }

      // 寫入審計日誌
      await prisma.auditLog.create({
        data: {
          orgId: input.orgId,
          userId: input.userId,
          endpoint: input.endpoint,
          method: input.method,
          requestId: input.requestId,
          payloadHash,
          latencyMs: input.latencyMs,
          promptVersion: input.promptVersion,
          redactions: input.redactions ? (input.redactions as any) : undefined,
        },
      });
    } catch (error) {
      // 審計日誌失敗不應該影響主要業務流程
      console.error("Failed to log audit:", error);
    }
  }

  return {
    logAudit,
  };
}

/**
 * 生成請求 ID
 */
export function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

