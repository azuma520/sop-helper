# 快速開始指南

這是專案設置的快速開始指南。詳細說明請參考其他設置文件。

## 前置需求

- Node.js 18+
- pnpm (推薦) 或 npm
- Supabase 帳號（開發環境資料庫）

## 5 分鐘快速設置

### 1. 安裝依賴

```bash
pnpm install
```

### 2. 設置 Supabase 資料庫

參考：[Supabase 設置指南](./DATABASE_SETUP_SUPABASE.md)

快速步驟：
1. 前往 https://supabase.com 建立專案
2. 在 Dashboard → ORMs → Prisma 取得連線字串
3. 設定 `.env` 檔案（見下方）

### 3. 設定環境變數

在 `apps/api/` 目錄建立 `.env` 檔案：

```env
# Connection Pooling (應用程式使用)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct Connection (Prisma Migrations 使用)
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-[REGION].pooler.supabase.com:5432/postgres"

# JWT Authentication
JWT_SECRET="dev-secret-key-change-in-production"
JWT_EXPIRES_IN="24h"

# Server
PORT=3000
NODE_ENV="development"

# CORS
CORS_ORIGIN="*"

# LLM / AI Services
TAGGING_LLM_PROVIDER="mock"
OPENAI_API_KEY=""
```

### 4. 生成 Prisma Client

```bash
cd apps/api
npm run prisma:generate
```

### 5. 啟動 API

```bash
npm run start:dev
```

API 會在 http://localhost:3000 啟動。

## 完整設置

如需詳細說明，請參考：
- [完整設置指南](./SETUP.md)
- [設置檢查清單](./SETUP_CHECKLIST.md)

## 問題排查

如果遇到連線問題，請參考：
- [Supabase + Prisma 官方設定](./SUPABASE_PRISMA_OFFICIAL_SETUP.md)
- [資料庫設置指南](./DATABASE_SETUP.md)

## 相關文件

- [Supabase 設置指南](./DATABASE_SETUP_SUPABASE.md) - Supabase 專用設置
- [Supabase 快速開始](./QUICK_START_SUPABASE.md) - Supabase 5 分鐘設置

