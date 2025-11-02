# 專案設置指南

本文件說明如何設置 AI SOP Helper 專案的開發環境。

## 前置需求

- **Node.js** >= 20
- **PostgreSQL** >= 14
- **pnpm** (推薦) 或 npm

### 安裝 pnpm (如果尚未安裝)

```bash
npm install -g pnpm
# 或
corepack enable
corepack prepare pnpm@latest --activate
```

## 快速開始

### 1. 安裝依賴

在專案根目錄執行：

```bash
pnpm install
# 或使用 npm
npm install
```

這會安裝所有 workspace 的依賴，包括：
- `apps/api` - NestJS API 服務
- `apps/web` - Next.js Web 應用
- `packages/*` - 共享套件

### 2. 設置資料庫

您有三個選項：

#### 選項 A: Supabase（推薦開發環境）⭐

1. 前往 https://supabase.com 建立免費專案
2. 取得連線字串：Settings → Database → Connection string (URI)
3. 在 `apps/api/.env` 設定：
   ```env
   DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
   ```
4. 詳見 [DATABASE_SETUP_SUPABASE.md](../DATABASE_SETUP_SUPABASE.md)

#### 選項 B: Docker Compose

1. 在專案根目錄執行：
   ```bash
   docker compose up -d postgres
   ```
2. 在 `apps/api/.env` 設定：
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_sop_help_dev?schema=public"
   ```
3. 詳見 [DATABASE_SETUP.md](../DATABASE_SETUP.md)

#### 選項 C: 本地 PostgreSQL

1. 建立資料庫：
   ```sql
   CREATE DATABASE ai_sop_help_dev;
   ```
2. 在 `apps/api/.env` 設定連線字串
3. 詳見 [DATABASE_SETUP.md](../DATABASE_SETUP.md)

#### 2.2 配置環境變數

進入 `apps/api` 目錄，複製環境變數範例檔案：

```bash
cd apps/api
cp .env.example .env
# 或使用開發環境範例
cp .env.development.example .env
```

編輯 `.env` 檔案，設定資料庫連線：

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ai_sop_help_dev?schema=public"
JWT_SECRET="your-secret-key-here"
```

#### 2.3 執行資料庫遷移

```bash
# 從專案根目錄
npm run prisma:migrate

# 或從 apps/api 目錄
cd apps/api
npm run prisma:migrate
```

#### 2.4 生成 Prisma Client

```bash
# 從專案根目錄
npm run prisma:generate

# 或從 apps/api 目錄
cd apps/api
npm run prisma:generate
```

### 3. 啟動開發伺服器

#### API 服務

```bash
# 從專案根目錄
npm run dev:api

# 或從 apps/api 目錄
cd apps/api
npm run start:dev
```

API 將在以下位置可用：
- API: http://localhost:3000/api/v1
- Swagger 文件: http://localhost:3000/api/docs

#### Web 應用 (待實作)

```bash
npm run dev:web
```

## 驗證設置

### 1. 檢查 API 是否正常運作

訪問 http://localhost:3000/api/v1 - 應該看到 "Hello World!" 回應。

### 2. 檢查 Swagger 文件

訪問 http://localhost:3000/api/docs - 應該看到完整的 API 文件。

### 3. 檢查資料庫連線

```bash
cd apps/api
npm run prisma:studio
```

這會開啟 Prisma Studio，可以在瀏覽器中查看資料庫內容。

## 常見問題

### 問題：pnpm 指令找不到

**解決方案**：
1. 安裝 pnpm: `npm install -g pnpm`
2. 或使用 npm 替代所有 pnpm 指令

### 問題：Prisma Client 生成失敗

**解決方案**：
1. 確認 `DATABASE_URL` 環境變數已正確設定
2. 確認資料庫已建立且可連線
3. 執行 `npm run prisma:generate` 前先確認 schema 檔案無誤

### 問題：依賴安裝失敗

**解決方案**：
1. 刪除 `node_modules` 和 `package-lock.json` (或 `pnpm-lock.yaml`)
2. 重新執行 `pnpm install` 或 `npm install`
3. 確認 Node.js 版本 >= 20

### 問題：JWT 認證失敗

**解決方案**：
1. 確認 `.env` 檔案中的 `JWT_SECRET` 已設定
2. 確認 JWT token 格式正確：`Authorization: Bearer <token>`
3. 檢查 token 是否過期

## 下一步

設置完成後，可以開始：

1. **Phase 3**: 實作 User Story 1 - 對話生成 SOP 草稿
2. 閱讀 [API 文件](apps/api/README.md) 了解 API 結構
3. 閱讀 [專案憲法](AI_SOP_Constitution_v2.md) 了解開發原則

## 相關文件

- [API README](apps/api/README.md) - API 服務詳細說明
- [開發憲法](AI_SOP_Constitution_v2.md) - 專案開發原則
- [MVP 規格](specs/001-ai-sop-mvp/spec.md) - 功能規格說明

