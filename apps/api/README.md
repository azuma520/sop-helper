## API Service

AI SOP 系統的後端服務，採用 [NestJS](https://nestjs.com/) 11 與 TypeScript 實作，負責對話解析、SOP/PDCA 管理與週回顧工作流 API。

### 開發前提

- Node.js ≥ 20（建議使用 `.nvmrc` 後續加入專案管理）
- npm workspaces（已在根 `package.json` 定義 `apps/*`、`packages/*`、`tests/*`）

### 安裝相依

於儲存庫根目錄：

```bash
npm install
```

### 常用指令

| 指令 | 說明 |
|------|------|
| `npm run dev:api` | 啟動 NestJS 開發伺服器（根目錄執行，會透過 workspace 代理 `apps/api`）。 |
| `npm --workspace api-service run start:dev` | 在 API workspace 內啟動 watch mode。 |
| `npm --workspace api-service run test` | 執行單元測試。 |
| `npm --workspace api-service run test:e2e` | 執行 e2e 測試。 |
| `npm --workspace api-service run lint` | 使用 ESLint 檢查並嘗試修復程式。 |

更多指令可於 `apps/api/package.json` 的 `scripts` 欄位查詢。

### 行動追蹤

所有開發或維運任務須同步建立/更新對應的行動項與審核紀錄，詳見 `docs/guardrails/actions.md`。請在提交前確認行動項狀態已更新。

### 架構連結

- Nest CLI 設定：`apps/api/nest-cli.json`
- TypeScript 設定：`apps/api/tsconfig.json`
- E2E 測試設定：`apps/api/test/jest-e2e.json`

### 後續步驟

- 依據 `specs/001-ai-sop-mvp/tasks.md` 進行下一階段任務（資料庫 schema、遮罩、觀測等）。
- 將 API Gateway、RBAC、BullMQ 工作流整合於此專案，並確保所有輸出符合 Markdown + JSON 結構透明原則。
