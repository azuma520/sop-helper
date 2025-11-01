# Quickstart — AI SOP MVP Workflow Enablement

本指南協助開發者在 3 分鐘內完成對話 → 行動 → SOP → PDCA → 匯出 → 週回顧流程的 MVP 端到端演示。

## 1. 環境準備
1. **安裝依賴**：
   ```bash
   pnpm install
   ```
2. **啟動基礎服務**（PostgreSQL、Redis、MinIO/S3 相容服務）：
   ```bash
   docker compose up postgres redis minio grafana --detach
   ```
3. **設定環境變數**（建立 `.env.local` 與 `.env`）：
   ```env
   # 共用
   NODE_ENV=development
   ORG_DEFAULT_ID=00000000-0000-0000-0000-000000000001
   TIMEZONE_DEFAULT=Asia/Taipei

   # LLM
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-4o-mini

   # 資料庫
   POSTGRES_URL=postgres://user:pass@localhost:5432/aisop

   # Redis / BullMQ
   REDIS_URL=redis://localhost:6379

   # S3 匯出
   S3_ENDPOINT=http://localhost:9000
   S3_BUCKET=sop-exports
   S3_ACCESS_KEY=minio
   S3_SECRET_KEY=minio123
   ```
4. **資料庫遷移與種子資料**：
   ```bash
   pnpm db:migrate
   pnpm db:seed:sop-mvp
   ```

## 2. 啟動服務
1. 後端 API：
   ```bash
   pnpm dev:api
   ```
2. 前端 Web：
   ```bash
   pnpm dev:web
   ```
3. Scheduler / Worker：
   ```bash
   pnpm dev:worker
   ```

## 3. 操作流程

### 3.1 建立對話式 SOP 草稿
1. 進入 `http://localhost:3000/conversation`。
2. 以自然語言輸入任務：「安排週會流程，包含準備資料、確認議程、追蹤待辦」。
3. 觀察系統生成 3–5 張行動卡與 SOP 草稿，於 UI 中補充注意事項與常見錯誤並送出審核。

### 3.2 Inbox → Action → Project
1. 在 Inbox 列表中選取新增條目，點擊「轉成行動」。
2. 指派負責人與截止日期，綁定既有 Project（或建立新 Project）。
3. 驗證 Action 於 `Action Library` 中增加使用次數，並在 SOP 草稿中顯示對應關聯。

### 3.3 PDCA 改版
1. 在 SOP 詳情頁點擊「啟動 PDCA」。
2. 填寫 P/D/C/A 問題集，提交後系統生成 Diff 預覽。
3. 確認 Diff，建立 vNext 草稿並送 Reviewer 審核。

### 3.4 Markdown 匯出
1. 當 SOP vNext 被核准，於 SOP 頁面點擊「匯出 Markdown」。
2. 下載檔案檢查 Frontmatter（id/version/tags/last_reviewed）與主體內容。

### 3.5 週五 16:00 回顧排程
1. 於 Worker 主控台執行模擬排程：
   ```bash
   pnpm task:trigger weekly-review --datetime "2025-11-07T16:00:00+08:00"
   ```
2. 檢視 Weekly Review 草稿是否包含 Top Actions / Outcomes / Issues / PDCA / Next Actions 五區塊。
3. 在通知中心確認已收到「本週回顧已生成」訊息。

## 4. 驗證項目
- 對話到 SOP 草稿流程可於 3 分鐘內完成。
- 行動卡與 SOP 保留審核紀錄，並記錄在 AuditLog。
- 匯出 Markdown 確認含有 JSON Frontmatter 與版本資訊。
- 週回顧成功生成並可一鍵轉為 PDCA 或 SOP Diff。
- OpenTelemetry Console/Grafana 可查到相關 Trace/Log。

## 5. 常見問題
- **LLM 呼叫失敗**：確認遮罩後 prompt 是否超過 token 限制；檢查 API Gateway rate limit。
- **BullMQ 排程未觸發**：確認 Redis 連線與 worker 是否啟動；檢視隊列中是否有 stalled job。
- **匯出檔案缺少 Frontmatter**：檢查 SOPVersion 審核流程是否完成，或 Diff 尚未套用。
- **週回顧未收到通知**：確認 Notification Service 的 Email/SMS 模擬器配置，或檢查 retry log。

