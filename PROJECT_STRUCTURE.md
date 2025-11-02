# 專案結構說明

## 目錄結構

```
SOP helper/
├── apps/                    # 應用程式
│   ├── api/                # NestJS API 服務
│   └── web/                # Next.js Web 應用
├── packages/               # 共享套件
│   ├── domain/            # 領域模型
│   ├── infra/             # 基礎設施（DB, logging, masking）
│   ├── telemetry/         # OpenTelemetry
│   └── workflows/         # 工作流程（BullMQ, cron）
├── docs/                   # 文件
│   ├── setup/             # 設置相關文件
│   │   └── archive/       # 歸檔的設置文件
│   ├── guardrails/        # 開發規範
│   └── runbook/           # 運維手冊
├── specs/                  # 規格文件
│   └── 001-ai-sop-mvp/   # MVP 規格
├── tests/                  # 測試
└── config/                 # 共享配置
```

## 文件說明

### 環境變數

- **`.env`** - 本地開發環境變數（已加入 .gitignore）
- **`.env.example`** - 環境變數範例（提交到 Git）
- **`.env.local`** - 本地環境變數（已加入 .gitignore，通常用於 Next.js）

**注意**：在 NestJS 專案中使用 `.env` 即可，`.env.local` 是 Next.js 的慣例。

### 設置文件

設置相關文件已整理到 `docs/setup/`：

- `QUICK_START.md` - 快速開始指南
- `SETUP.md` - 完整設置指南
- `SETUP_CHECKLIST.md` - 設置檢查清單
- `DATABASE_SETUP.md` - 資料庫設置指南
- `DATABASE_SETUP_SUPABASE.md` - Supabase 設置指南
- `SUPABASE_PRISMA_OFFICIAL_SETUP.md` - Prisma 官方設定
- `archive/` - 歸檔的臨時/參考文件

### 規格文件

- `specs/001-ai-sop-mvp/` - MVP 規格與任務清單
- `openapi.yaml` - API 規格（OpenAPI 3.0）

### 配置文件

- `package.json` - 根目錄 package.json（monorepo 管理）
- `pnpm-workspace.yaml` - pnpm workspace 配置
- `tsconfig.base.json` - 共享 TypeScript 配置
- `prettier.config.mjs` - Prettier 配置

## 忽略的文件

以下文件/目錄已被 `.gitignore` 忽略：

- `node_modules/` - 依賴套件
- `.env` - 環境變數（包含敏感資訊）
- `.env.local` - 本地環境變數
- `dist/`, `build/` - 編譯輸出
- `.vscode/`, `.idea/` - IDE 配置
- `*.log` - 日誌文件
- `coverage/` - 測試覆蓋率報告

## 開發工作流程

1. **設置環境**：參考 `docs/setup/QUICK_START.md`
2. **開發功能**：在 `apps/` 和 `packages/` 中開發
3. **測試**：執行 `npm test`
4. **API 文檔**：啟動 API 後訪問 `/api/docs`

## 相關連結

- [快速開始](./docs/setup/QUICK_START.md)
- [完整設置指南](./docs/setup/SETUP.md)
- [MVP 規格](./specs/001-ai-sop-mvp/spec.md)

