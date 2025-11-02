import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { createAuditLogService, generateRequestId } from "@aisop/infra";
import type { PrismaClient } from "@prisma/client";
import { REQUEST } from "@nestjs/core";
import { Inject } from "@nestjs/common";

/**
 * Audit Logging Interceptor
 * 
 * 自動記錄 API 請求的審計日誌
 * 對應任務：T019
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private auditService: ReturnType<typeof createAuditLogService>;

  constructor(@Inject("PrismaClient") private prisma: PrismaClient) {
    this.auditService = createAuditLogService(prisma);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    // 從請求中取得使用者資訊（JWT Guard 應該已經設定）
    const user = (request as any).user;
    const orgId = user?.orgId;
    const userId = user?.userId;

    // 生成請求 ID
    const requestId = generateRequestId();
    (request as any).requestId = requestId;

    // 取得端點和方法
    const endpoint = request.url;
    const method = request.method;

    // 取得請求負載（body）
    const payload = request.body;

    // 取得 promptVersion 和 redactions（如果有的話，通常會在 controller 中設定）
    const promptVersion = (request as any).promptVersion;
    const redactions = (request as any).redactions;

    return next.handle().pipe(
      tap({
        next: async () => {
          // 計算處理時間
          const latencyMs = Date.now() - startTime;

          // 記錄審計日誌（非阻塞）
          if (orgId) {
            this.auditService.logAudit({
              orgId,
              userId,
              endpoint,
              method,
              requestId,
              payload,
              latencyMs,
              promptVersion,
              redactions,
            }).catch((error) => {
              // 審計日誌失敗不應該影響回應
              console.error("Audit log failed:", error);
            });
          }
        },
        error: async (error) => {
          // 即使發生錯誤也要記錄
          const latencyMs = Date.now() - startTime;
          if (orgId) {
            this.auditService.logAudit({
              orgId,
              userId,
              endpoint,
              method,
              requestId,
              payload,
              latencyMs,
              promptVersion,
              redactions,
            }).catch((err) => {
              console.error("Audit log failed:", err);
            });
          }
        },
      })
    );
  }
}

