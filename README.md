# AI SOP Helper

> 讓個人工作者以對話記錄、反思並優化工作流程，將職能模組化、可複製、可迭代的 AI 輔助 SOP 系統。

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-ea2845.svg)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Private-red.svg)](LICENSE)

## 📋 目錄

- [關於專案](#-關於專案)
- [主要功能](#-主要功能)
- [快速開始](#-快速開始)
- [使用範例](#-使用範例)
- [技術架構](#️-技術架構)
- [API 文檔](#-api-文檔)
- [開發指南](#-開發指南)
- [專案結構](#-專案結構)
- [安全性](#-安全性)
- [開發進度](#-開發進度)
- [貢獻](#-貢獻)
- [授權](#-授權)

## 📖 關於專案

AI SOP Helper 是一個整合 SOP（標準作業程序）、PAI（Project–Action–Inbox）、PDCA 循環與週回顧機制的系統，協助個人工作者透過 AI 輔助將工作知識轉化為可重複、可分享、可進化的 SOP。

### 解決的問題

- ❌ 工作流程知識散落在對話、筆記、郵件中，難以系統化管理
- ❌ 每次重複任務都要重新思考步驟，浪費時間
- ❌ 缺乏持續改進機制，無法累積經驗

### 我們的解決方案

- ✅ **對話生成 SOP** - 透過自然語言對話，3 分鐘內產出可審核的 SOP 草稿
- ✅ **行動優先** - 所有輸入先成為 Action，確保知識可追蹤、可執行
- ✅ **持續演化** - 透過 PDCA 循環與週回顧機制，持續優化工作流程
- ✅ **結構透明** - Markdown + Frontmatter 格式，人類可讀、機器可處理
- ✅ **人類審核為中心** - AI 建議，人類確認，確保品質與可控性

## ✨ 主要功能

### 🎯 MVP 階段功能

- ✅ **對話生成 SOP 草稿** - 透過對話將任務描述轉換為結構化的 SOP
- ✅ **行動卡管理** - 追蹤、審核、管理行動項目
- ✅ **PDCA 循環** - 支援 Plan/Do/Check/Act 改進流程
- ✅ **AI 標籤建議** - 自動建議並審核標籤分類
- ✅ **審計記錄** - 完整的操作與決策記錄
- 🚧 週回顧自動化（開發中）
- 🚧 Markdown 匯出（開發中）

### 🚀 即將推出

- PAI 流程整合（Inbox → Action → Project）
- PDCA Diff 生成與版本管理
- 週五 16:00 自動回顧排程
- Markdown + Frontmatter 匯出

## 🚀 快速開始

### 前置需求

- **Node.js** >= 20 LTS
- **PostgreSQL** >= 14（或使用 [Supabase](https://supabase.com/)）
- **npm** 或 **pnpm**

### 安裝步驟

1. **複製專案**
   ```bash
   git clone https://github.com/azuma520/sop-helper.git
   cd sop-helper
   ```

2. **安裝依賴**
   ```bash
   npm install
   # 或使用 pnpm
   pnpm install
   ```

3. **設置資料庫**（推薦使用 Supabase）
   
   前往 [Supabase](https://supabase.com/) 建立專案並取得連線字串，或參考 [Supabase 設置指南](./docs/setup/DATABASE_SETUP_SUPABASE.md)

4. **設定環境變數**
   ```bash
   cd apps/api
   cp env.example .env
   # 編輯 .env 設定 DATABASE_URL、JWT_SECRET 等
   ```

5. **生成 Prisma Client 並執行遷移**
   ```bash
   cd apps/api
   npm run prisma:generate
   npm run prisma:migrate
   ```

6. **啟動開發伺服器**
   ```bash
   # 終端 1: API 服務
   cd apps/api
   npm run start:dev
   
   # 終端 2: Web 應用
   cd apps/web
   npm run dev
   ```

7. **訪問應用**
   - 📖 API 文檔：http://localhost:3000/api/docs
   - 🌐 Web 應用：http://localhost:3000

詳細設置請參考：[快速開始指南](./docs/setup/QUICK_START.md)

## 💡 使用範例

### 對話生成 SOP

透過 API 或 Web UI，輸入任務描述：

```bash
curl -X POST http://localhost:3000/api/v1/conversation/parse \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "text": "我需要建立一個資料庫備份的 SOP，包含檢查連線、執行備份、驗證完整性三個步驟"
  }'
```

系統會在 3 分鐘內回傳：
- 3-5 張可審核的行動卡
- 完整的 SOP 草稿（Markdown 格式）
- AI 建議的標籤分類

### 查詢 SOP 列表

```bash
curl -X GET "http://localhost:3000/api/v1/sops?limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Web UI 使用

1. 開啟對話介面
2. 輸入任務描述
3. AI 解析並生成行動卡
4. 審核並調整行動卡
5. 確認後建立 SOP

## 🏗️ 技術架構

### 技術棧

**Backend**
- [NestJS](https://nestjs.com/) - 企業級 Node.js 框架
- [Prisma](https://www.prisma.io/) - 現代 ORM
- [PostgreSQL](https://www.postgresql.org/) - 關聯式資料庫
- [OpenAI GPT-4o mini](https://platform.openai.com/) - LLM 整合
- [BullMQ](https://docs.bullmq.io/) - 工作佇列與排程
- [OpenTelemetry](https://opentelemetry.io/) - 可觀測性

**Frontend**
- [Next.js 14](https://nextjs.org/) - React 框架（App Router）
- [Tailwind CSS](https://tailwindcss.com/) - 樣式框架

**Infrastructure**
- [Supabase](https://supabase.com/) - 資料庫託管（開發環境）
- Monorepo 架構（npm workspaces）

### 專案結構

```
SOP helper/
├── apps/
│   ├── api/          # NestJS REST API
│   └── web/          # Next.js Web 應用
├── packages/
│   ├── domain/       # 領域模型與型別定義
│   ├── infra/        # 基礎設施（DB、遮罩、審計）
│   ├── telemetry/    # OpenTelemetry 觀測
│   └── workflows/    # BullMQ 排程與工作流
├── specs/            # 規格文件
├── docs/             # 開發文件
└── tests/            # 測試腳本
```

詳細說明請參考：[專案結構文件](./PROJECT_STRUCTURE.md)

## 📚 API 文檔

啟動 API 服務後，訪問 Swagger UI：

```
http://localhost:3000/api/docs
```

### 主要 API 端點

| 方法 | 端點 | 說明 |
|------|------|------|
| `POST` | `/api/v1/conversation/parse` | 對話解析，生成 SOP 草稿 |
| `GET` | `/api/v1/sops` | 查詢 SOP 列表 |
| `POST` | `/api/v1/sops` | 建立 SOP |
| `GET` | `/api/v1/sops/:id` | 取得 SOP 詳情 |
| `POST` | `/api/v1/tags/suggest` | 取得標籤建議 |

詳細 API 規格請參考：[OpenAPI 規格](./specs/001-ai-sop-mvp/contracts/openapi.yaml)

## 🛠️ 開發指南

### 開發原則

本專案遵循 [開發憲法](./AI_SOP_Constitution_v2.md) 定義的核心原則：

1. **行動優先** - 所有輸入先成為 Action，整理隨後
2. **最小可用** - 先記錄，不追求完美格式
3. **持續演化** - PDCA 與週回顧推動改進
4. **結構透明** - Markdown + Frontmatter 儲存
5. **認知節能** - 互動設計以「少想一步」為準
6. **人類審核為中心** - AI 建議，人類確認

### 執行測試

```bash
# API 測試腳本
node tests/api-test.js

# 單元測試
cd apps/api
npm test

# E2E 測試
npm run test:e2e

# 測試覆蓋率
npm run test:cov
```

### 開發工作流程

1. 從 `specs/001-ai-sop-mvp/tasks.md` 查看待完成任務
2. 建立功能分支
3. 開發並測試
4. 提交 Pull Request
5. Code Review 後合併

詳細開發指南請參考：[開發文件](./docs/)

## 🔒 安全性

### 資料保護

- ✅ PII（個人識別資訊）自動遮罩
- ✅ 環境變數敏感資訊保護（`.gitignore`）
- ✅ Row Level Security (RLS) 資料隔離
- ✅ API 請求審計記錄
- ✅ Secret Scanning（公開 repository 自動啟用）

### 安全最佳實踐

- 所有敏感資訊使用環境變數
- `.env` 檔案已加入 `.gitignore`
- 資料庫連線使用 SSL/TLS
- JWT Token 認證機制

詳細安全檢查清單請參考：[安全檢查清單](./docs/setup/SECURITY_CHECKLIST.md)

## 📊 開發進度

### ✅ Phase 2: Foundational (已完成)

- [x] 資料庫 Schema 與 Migration
- [x] Prisma Client 設置
- [x] PII 遮罩模組
- [x] OpenTelemetry 觀測
- [x] BullMQ 排程基礎
- [x] API Gateway / AuthN (JWT, RBAC, Rate Limit)
- [x] OpenAPI / Swagger 整合
- [x] 標籤建議系統

### 🚧 Phase 3: User Story 1 (進行中)

- [x] 定義領域模型（ActionDraft, SOPDraft）
- [x] Conversation 模組（LLM 整合）
- [x] SOP API（從草稿建立 SOP）
- [x] 審計記錄模組
- [ ] 前端對話 UI
- [ ] 審核工作流

詳細任務請參考：[任務清單](./specs/001-ai-sop-mvp/tasks.md)

## 🤝 貢獻

歡迎貢獻！請先閱讀：

1. [開發憲法](./AI_SOP_Constitution_v2.md) - 了解開發原則
2. [MVP 規格](./specs/001-ai-sop-mvp/spec.md) - 了解功能需求
3. [任務清單](./specs/001-ai-sop-mvp/tasks.md) - 查看待完成項目

### 開發流程

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權

本專案為私有專案，版權所有。

## 📞 聯絡與支援

- 🐛 **問題回報**：請使用 [GitHub Issues](https://github.com/azuma520/sop-helper/issues)
- 💬 **討論**：歡迎開啟 [Discussions](https://github.com/azuma520/sop-helper/discussions)
- 📧 **Email**: kyoe33@gmail.com

## 🔗 相關連結

- 📘 [快速開始指南](./docs/setup/QUICK_START.md) - 5 分鐘快速設置
- 📗 [完整設置指南](./docs/setup/SETUP.md) - 詳細的開發環境設置
- 🗄️ [資料庫設置](./docs/setup/DATABASE_SETUP_SUPABASE.md) - Supabase 設置說明
- 📁 [專案結構](./PROJECT_STRUCTURE.md) - 專案目錄結構說明
- 📜 [開發憲法](./AI_SOP_Constitution_v2.md) - 核心開發原則
- 📋 [MVP 規格](./specs/001-ai-sop-mvp/spec.md) - 功能規格與使用者故事
- 📝 [任務清單](./specs/001-ai-sop-mvp/tasks.md) - 詳細開發任務
- 🔌 [API 文件](./apps/api/README.md) - API 服務說明

---

**Made with ❤️ by [azuma520](https://github.com/azuma520)**
