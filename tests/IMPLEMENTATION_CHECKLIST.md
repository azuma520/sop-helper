# 實作檢查清單

## ✅ 已完成項目

### T016: 領域模型定義
- ✅ `ActionDraft` 與 `SOPDraft` 型別定義
- ✅ 驗證函數（`validateActionDraft`, `validateSOPDraft`）
- ✅ Frontmatter 生成函數
- ✅ 審核狀態管理

### T015: Conversation 模組
- ✅ LLM 服務（Mock & OpenAI）
- ✅ 對話解析 API (`POST /conversation/parse`)
- ✅ 敏感資訊遮罩
- ✅ Prompt 版本追蹤

### T017: SOP API
- ✅ SOP 查詢 API (`GET /sops`, `GET /sops/:id`)
- ✅ `createSOPFromDraft` 服務方法
- ✅ 事務處理確保資料一致性
- ✅ SOPVersion 建立
- ✅ SOPActionLink 建立

### T019: 審計記錄
- ✅ Audit Log Service (`packages/infra/src/audit`)
- ✅ Audit Interceptor（全局攔截器）
- ✅ 自動記錄 API 請求
- ✅ Prompt version 與 redactions 記錄

## ⚠️ 待完成項目

### 1. SOP API - 從草稿建立 SOP 端點

**位置**: `apps/api/src/sops/sops.controller.ts`

**問題**: `POST /sops` 端點尚未實作，目前直接拋出錯誤

**需要實作**:
```typescript
@Post()
async createSOP(
  @Body() dto: CreateSOPDto,
  @User() user: RequestUser
): Promise<CreateSOPResponseDto> {
  // 需要：
  // 1. 從 dto 建立 SOPDraft（或接收完整的 SOPDraft）
  // 2. 呼叫 sopsService.createSOPFromDraft()
  // 3. 返回結果
}
```

**建議**: 
- 方案 A: 接受完整的 `SOPDraft` JSON（來自前端）
- 方案 B: 接受簡化的 `CreateSOPDto`，內部轉換為 `SOPDraft`

### 2. SOP Service - Owner ID 驗證

**位置**: `apps/api/src/sops/sops.service.ts:95`

**問題**: 未驗證 `ownerId` 是否存在於該組織

**需要實作**:
```typescript
// 在建立 Action 前驗證
const owner = await tx.user.findFirst({
  where: {
    id: ownerId,
    orgId: orgId,
  },
});

if (!owner) {
  throw new BadRequestException(`Owner ${ownerId} not found in organization`);
}
```

### 3. Tags Service - Prisma 整合

**位置**: `apps/api/src/tags/tags.service.ts:22-23`

**問題**: 未查詢現有標籤，未記錄審計日誌

**需要實作**:
- 查詢現有標籤（避免重複建立）
- 整合審計日誌記錄（已由 Interceptor 處理，但可在這裡額外記錄）

### 4. Tags Service - 標籤審核邏輯

**位置**: `apps/api/src/tags/tags.service.ts:36-41`

**問題**: `commitTags` 方法僅返回 mock 回應

**需要實作**:
- 查詢候選標籤
- 驗證標籤合法性
- 建立或更新標籤記錄
- 關聯到目標實體（SOP/Action）
- 記錄審計日誌

### 5. JWT Strategy - 使用者驗證

**位置**: `apps/api/src/common/auth/jwt.strategy.ts:24`

**問題**: 未驗證使用者是否存在並取得組織上下文

**需要實作**:
```typescript
async validate(payload: JwtPayload): Promise<RequestUser> {
  // 1. 從資料庫查詢使用者
  const user = await this.prisma.user.findUnique({
    where: { id: payload.sub },
    include: { org: true },
  });
  
  // 2. 驗證使用者存在
  if (!user) {
    throw new UnauthorizedException();
  }
  
  // 3. 返回使用者資訊
  return {
    userId: user.id,
    orgId: user.orgId,
    role: user.role,
    email: user.email,
  };
}
```

**注意**: 需要在 JWT Strategy 中注入 Prisma Client

### 6. Audit Interceptor - 錯誤處理改進

**位置**: `apps/api/src/common/interceptors/audit.interceptor.ts`

**問題**: 
- 未處理請求失敗時的錯誤資訊記錄
- 未記錄錯誤狀態碼

**建議改進**:
- 記錄錯誤訊息到 audit log
- 記錄 HTTP 狀態碼
- 考慮添加錯誤類型分類

### 7. Conversation Service - 錯誤處理

**位置**: `apps/api/src/conversation/conversation.service.ts:42`

**問題**: 使用 `Error` 而非 NestJS 的例外類別

**建議改進**:
```typescript
import { BadRequestException } from '@nestjs/common';

// 改為
throw new BadRequestException(
  `生成的 SOP 草稿驗證失敗: ${validation.errors.join(", ")}`
);
```

### 8. SOP Service - 錯誤處理

**位置**: `apps/api/src/sops/sops.service.ts:37`

**問題**: 使用 `Error` 而非 NestJS 的例外類別

**建議改進**:
```typescript
import { BadRequestException } from '@nestjs/common';

// 改為
throw new BadRequestException("所有行動卡必須先審核通過才能建立 SOP");
```

## 🔍 其他檢查項目

### 環境變數驗證
- ✅ `.env.example` 已建立
- ⚠️ 缺少環境變數驗證（啟動時檢查必要變數）

### 資料庫連線
- ✅ Prisma Client 已配置
- ✅ Migration 已建立
- ⚠️ 缺少連線健康檢查端點

### API 文件
- ✅ Swagger/OpenAPI 已配置
- ⚠️ 部分 DTO 缺少詳細註解

### 測試
- ✅ 測試腳本已建立 (`tests/api-test.js`)
- ⚠️ 缺少單元測試（`.spec.ts` 檔案）
- ⚠️ 缺少 E2E 測試

### 日誌記錄
- ✅ Audit Log 已實作
- ⚠️ 缺少結構化日誌（Winston 已安裝但未使用）

## 📝 優先級建議

### 高優先級（阻擋功能）
1. ✅ **完成**: JWT Strategy 使用者驗證（必要，否則認證不工作）
2. ✅ **完成**: SOP Service Owner ID 驗證（資料完整性）
3. ⚠️ **待實作**: SOP Controller `POST /sops` 端點（功能不完整）

### 中優先級（功能完善）
4. Tags Service 完整實作
5. 錯誤處理改進（使用 NestJS 例外類別）
6. 環境變數驗證

### 低優先級（優化）
7. 健康檢查端點
8. 結構化日誌
9. 單元測試與 E2E 測試

