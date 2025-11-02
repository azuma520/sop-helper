# 領域模型（Domain Model）說明

## 什麼是領域模型？

領域模型是用程式碼定義的業務概念和規則，用來描述「這個系統中，什麼是重要的東西」。

## 三層架構

在我們的專案中，有三個層次：

```
1. 資料庫層 (Database Schema)
   ↓ 定義資料如何儲存
   
2. 領域模型層 (Domain Model) ← 我們現在要做的
   ↓ 定義業務邏輯和驗證規則
   
3. API 層 (DTOs, Controllers)
   ↓ 定義 API 輸入輸出
```

---

## 實際例子：對比 PDCA 和 Tagging

### 範例 1: PDCA 領域模型（已完成）

**檔案**：`packages/domain/src/pdca.ts`

#### 定義了什麼？

1. **資料結構（型別）**：
   ```typescript
   export interface PDCA {
     id: string;
     orgId: string;
     sopId: string;
     phasePlan: Record<string, unknown>;
     phaseAct: Record<string, unknown>;
     // ... 等等
   }
   ```

2. **業務規則（驗證函數）**：
   ```typescript
   // 驗證期間是否有效
   validatePDCAPeriod(periodStart, periodEnd)
   
   // 驗證狀態轉換是否合法
   canTransitionStatus(currentStatus, targetStatus)
   
   // 檢查是否可以提交審核
   canSubmitForReview(pdca)
   ```

#### 為什麼需要？

- ✅ 資料庫 Schema 只定義「存什麼」
- ✅ 領域模型定義「怎麼用」、「什麼時候可以轉換狀態」
- ✅ 可以在後端邏輯中重用，確保一致性

---

### 範例 2: Tagging 領域模型（已完成）

**檔案**：`packages/domain/src/tagging.ts`

定義了：
- `TagSuggestionRequest` - AI 建議的輸入格式
- `TagSuggestionResponse` - AI 建議的輸出格式
- `validateTagValue()` - 驗證標籤值是否符合規範

---

## 現在需要做的：ActionDraft 和 SOPDraft

### 問題：對話流程中的「草稿」是什麼？

在對話生成 SOP 的流程中：

1. **使用者輸入**：「我想建立一個備份資料庫的流程」
2. **LLM 處理**：拆解成 5 個步驟
3. **產生草稿**：還沒有正式建立，還在審核中
4. **Reviewer 審核**：確認後才正式建立 SOP

### 什麼是 Draft？

**Draft（草稿）** = 還沒正式建立的東西，需要審核

- **ActionDraft** = 行動卡的草稿（還沒正式建立 Action）
- **SOPDraft** = SOP 的草稿（還沒正式建立 SOP）

---

## ActionDraft 應該包含什麼？

根據對話流程，一個 ActionDraft 應該有：

```typescript
interface ActionDraft {
  // 基本資訊
  title: string;           // 「步驟 1: 檢查資料庫連線」
  description?: string;     // 詳細描述
  order: number;            // 在 SOP 中的順序（1, 2, 3...）
  
  // AI 建議（需要審核）
  suggestedOwner?: string;  // AI 建議的負責人
  suggestedDueDate?: Date;  // AI 建議的截止日期
  suggestedTags?: string[]; // AI 建議的標籤
  
  // 審核狀態
  reviewStatus: "pending" | "approved" | "rejected";
  reviewerNotes?: string;
  
  // 來源資訊（用於審計）
  sourceConversationId?: string; // 來自哪個對話
  aiConfidence?: number;          // AI 信心度
}
```

---

## SOPDraft 應該包含什麼？

```typescript
interface SOPDraft {
  // 基本資訊
  title: string;                    // 「資料庫備份 SOP」
  description?: string;              // SOP 描述
  
  // Frontmatter（Markdown 格式）
  frontmatter: {
    version: string;                 // "0.1.0"
    status: "draft";
    tags: string[];
    createdBy: string;
    createdAt: string;
  };
  
  // 內容
  markdownContent: string;           // Markdown 格式的 SOP 內容
  jsonContent: Record<string, any>;  // JSON 格式（結構化）
  
  // 關聯的行動卡草稿
  actionDrafts: ActionDraft[];
  
  // 審核狀態
  reviewStatus: "pending" | "approved" | "rejected";
  reviewerNotes?: string;
}
```

---

## 為什麼要定義領域模型？

### 1. **業務邏輯重用**

例如，驗證 ActionDraft 是否完整：

```typescript
// 在 packages/domain/src/conversation.ts
export function canSubmitActionDraft(draft: ActionDraft): boolean {
  // 必須有標題
  if (!draft.title) return false;
  
  // 必須指定負責人
  if (!draft.suggestedOwner) return false;
  
  return true;
}
```

這個驗證邏輯可以在：
- API Service 中使用
- 前端 UI 中使用（即時驗證）
- 測試中使用

### 2. **型別安全**

TypeScript 會檢查：
- 是否有遺漏必要欄位
- 欄位類型是否正確
- 避免拼字錯誤

### 3. **與資料庫解耦**

資料庫的 `Action` 表可能有很多欄位，但 `ActionDraft` 只需要對話流程需要的部分。

---

## 與資料庫的關係

### 資料庫 (Prisma Schema)

```prisma
model Action {
  id          String
  title       String
  description String?
  ownerId     String
  status      ActionStatus
  // ... 很多欄位
}
```

這是「最終儲存」的格式。

### 領域模型 (Domain Model)

```typescript
interface ActionDraft {
  title: string;
  suggestedOwner?: string;
  reviewStatus: "pending" | "approved" | "rejected";
  // 只有對話流程需要的欄位
}
```

這是「草稿階段」的格式。

### 轉換

當 Draft 審核通過後，才轉換成正式的 `Action`：

```typescript
// 草稿審核通過 → 建立正式 Action
function createActionFromDraft(draft: ActionDraft): Action {
  return {
    title: draft.title,
    ownerId: draft.suggestedOwner!, // 審核後確認
    status: "pending", // 正式建立
    // ...
  };
}
```

---

## 總結

**定義領域模型 = 用 TypeScript 程式碼描述業務概念**

1. ✅ 定義資料結構（interface）
2. ✅ 定義業務規則（驗證函數）
3. ✅ 可以在多處重用
4. ✅ 與資料庫解耦

**在這個任務中**，我們要定義：
- `ActionDraft` - 行動卡草稿的結構和驗證規則
- `SOPDraft` - SOP 草稿的結構和驗證規則

這樣後續的對話處理模組就知道：
- 從 LLM 取得什麼格式的資料
- 如何驗證草稿是否完整
- 如何轉換成正式的 Action 和 SOP

