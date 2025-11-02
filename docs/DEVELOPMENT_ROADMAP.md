# 開發路線圖

## ✅ 已完成階段

### Phase 1: Setup (基礎設置) ✅
- Monorepo 結構建立
- NestJS API 與 Next.js Web 骨架
- 共享套件與配置

### Phase 2: Foundational (核心基礎) ✅
- ✅ PostgreSQL Schema 與 Migration（12 個資料表）
- ✅ Prisma Client 設置
- ✅ PII 遮罩模組
- ✅ OpenTelemetry 觀測
- ✅ BullMQ + node-cron 排程基礎
- ✅ API Gateway / AuthN (JWT, RBAC, Rate Limit)
- ✅ OpenAPI / Swagger 整合
- ✅ 標籤建議系統

---

## 🎯 下一步：Phase 3 - User Story 1 (MVP 核心功能)

### 目標
**3 分鐘內由對話產出可審核的 SOP 草稿和行動卡**

### 為什麼這是優先級 P1？
- 這是整個 MVP 的核心價值
- 沒有這個流程就無法啟動 PAI 與 PDCA 循環
- 是後續所有功能的基礎

---

## 📋 Phase 3 任務清單

### 1. 測試先行 ⚠️
- [ ] **T013** 撰寫 Contract Tests (`tests/contract/conversation.dredd.yml`)
  - 驗證 `/conversation/parse` 及 `/sops` 創建流程
  
- [ ] **T014** 撰寫 E2E Tests (`tests/e2e/conversation.spec.ts`)
  - Playwright：對話→行動卡→審核→匯出草稿

### 2. 後端實作

#### 核心對話處理
- [ ] **T015** 建立 `apps/api/src/conversation` 模組
  - 串接遮罩 (`packages/infra/masking`)
  - 提示模板設計
  - OpenAI GPT-4o mini 整合
  - 輸出結構化行動

#### 領域模型定義
- [ ] **T016** 在 `packages/domain` 定義型別
  - `ActionDraft` 型別與驗證邏輯
  - `SOPDraft` 型別與驗證邏輯
  - 審核欄位定義
  - Frontmatter 片段定義

#### SOP 建立流程
- [ ] **T017** 更新 `apps/api/src/sops`
  - 接收 draft actions
  - 建立 SOP 與 `SOPActionLink`
  - 寫入審核記錄

- [ ] **T017A** 擴充 `apps/api/src/pdca`
  - PATCH 支援 `act_acknowledge_insight`、`act_action_change`
  - 產生 Diff 與審核紀錄

#### 審計與狀態管理
- [ ] **T019** 建立 `packages/infra/audit`
  - 在對話 & SOP API 進入點記錄 `AuditLog`
  - 含 `prompt_version`、`redactions`

- [ ] **T019A** 確保所有自動產出以 `draft` 狀態儲存
  - 需要 Reviewer 審核才能升級

### 3. 前端 UI

- [ ] **T018** 建置 `apps/web/app/conversation` UI
  - 模板引導
  - 常見錯誤提示
  - Reviewer 審核工作流

- [ ] **T018A** 新增對話→卡片預覽側欄
  - 顯示待送出 Action/SOP/PDCA 草稿
  - 允許單筆審核

- [ ] **T018B** 導入 UX 優化
  - 語氣包（tone pack）
  - 快捷鍵（Enter / Ctrl+Enter）
  - 預設填入 Owner/Due/Tags

### 4. 文件與追蹤

- [ ] **T020** 補齊 `docs/conversation-flow.md`
  - 記錄最小可用流程
  - 範例
  - 審核清單

- [ ] **T020A** 事件追蹤設定
  - 意圖命中／誤判／覆核結果
  - 寫入 telemetry 與 PDCA 資料來源

---

## 🚀 開發順序建議

### 第一階段：後端核心（2-3 天）
1. **T016** - 定義領域模型（`ActionDraft`, `SOPDraft`）
2. **T015** - 建立 conversation 模組（LLM 整合）
3. **T017** - 更新 SOP API（建立 SOP 與行動卡）
4. **T019** - 審計記錄模組

### 第二階段：測試（1-2 天）
5. **T013** - Contract tests
6. **T014** - E2E tests

### 第三階段：前端 UI（2-3 天）
7. **T018** - 對話 UI
8. **T018A** - 卡片預覽側欄
9. **T018B** - UX 優化

### 第四階段：完善與文件（1 天）
10. **T019A** - 狀態管理確認
11. **T017A** - PDCA 擴充
12. **T020** - 文件撰寫
13. **T020A** - 事件追蹤

---

## 📊 成功指標

### MVP 驗證標準
- ✅ 3 分鐘內完成對話→行動卡→SOP 草稿流程
- ✅ 產出 3-5 張行動卡
- ✅ 所有輸出為 Markdown + JSON 格式
- ✅ 具備審核留痕
- ✅ 所有自動產出為 `draft` 狀態

### 技術指標
- API p95 < 800ms
- LLM round-trip < 3s
- 端到端延遲 < 2 秒

---

## 🔗 相關資源

- [User Story 1 規格](./specs/001-ai-sop-mvp/spec.md#user-story-1---對話生成-sop-草稿-priority-p1)
- [任務清單](./specs/001-ai-sop-mvp/tasks.md#phase-3-user-story-1---對話生成-sop-草稿-priority-p1--mvp)
- [開發憲法](../AI_SOP_Constitution_v2.md)

---

## 💡 開發原則提醒

根據開發憲法，開發時需注意：

1. **行動優先** - 所有對話輸入與系統生成結果都轉成行動項
2. **最小可用** - 優先完成能在 3 分鐘演示的流程
3. **持續演化** - 記錄需要更新 PDCA 與週回顧的資料
4. **結構透明** - Markdown + Frontmatter + JSON 結構
5. **人類審核** - AI 建議需 Reviewer 審核後才入庫

---

**下一步行動**：開始實作 **T016**（定義領域模型），這是所有後續開發的基礎。

