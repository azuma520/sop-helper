## Web App

AI SOP 系統的前端介面，使用 Next.js 16（App Router + TypeScript + Tailwind CSS）實作，支援 `zh-Hant` / `en` 國際化與 `@/*` 匯入別名。

### 開發前提

- Node.js ≥ 20
- 根目錄已啟用 npm workspaces（`apps/*`、`packages/*`、`tests/*`）

### 安裝與啟動

在儲存庫根目錄執行：

```bash
npm install
npm run dev:web
```

預設將在 [http://localhost:3000](http://localhost:3000) 提供開發環境。

常用指令：

| 指令 | 說明 |
|------|------|
| `npm run dev:web` | 啟動網站開發伺服器（根目錄執行）。 |
| `npm --workspace web run build` | 建置正式版。 |
| `npm --workspace web run lint` | 執行 ESLint。 |

### 導覽重點

- App Router 入口：`src/app/page.tsx`
- 全域樣式：`src/app/globals.css`（Tailwind already configured）
- i18n 設定：`next.config.ts`（預設 locale：`zh-Hant`）

### 行動追蹤

所有 UI/UX 相關調整需同步建立/更新行動項目與 reviewer 審核紀錄。詳見 `docs/guardrails/actions.md` 的流程規範。

### 後續工作

- 依 `specs/001-ai-sop-mvp/tasks.md` 實作對話式 SOP UI、PDCA 視圖與週回顧介面。
- 需要與 API (`apps/api`) 協作，確保 Markdown + JSON 輸出與審核留痕一致。
