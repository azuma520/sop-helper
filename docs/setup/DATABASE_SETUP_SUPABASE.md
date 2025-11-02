# Supabase 資料庫設置指南

本指南說明如何使用 Supabase 作為開發環境的資料庫。

## 為什麼選擇 Supabase？

- ✅ **免費方案**：免費額度足夠開發使用（500MB 資料庫、2GB 頻寬）
- ✅ **PostgreSQL**：完全相容，使用標準 PostgreSQL 協定
- ✅ **管理介面**：提供完整的 Web UI 管理資料庫
- ✅ **自動備份**：每日自動備份
- ✅ **SSL 連線**：預設啟用 SSL
- ✅ **API 支援**：未來如需 REST API 可直接使用

## 設置步驟

### 1. 建立 Supabase 專案

1. 前往 https://supabase.com
2. 點擊 "Start your project"
3. 使用 GitHub 或 Email 註冊帳號
4. 點擊 "New Project"
5. 填寫專案資訊：
   - **Name**: `ai-sop-helper-dev` (或任何您喜歡的名稱)
   - **Database Password**: 設定一個強密碼（請記住，稍後需要）
   - **Region**: 選擇離您最近的區域（建議 `Southeast Asia (Singapore)`）
6. 等待專案建立完成（約 2-3 分鐘）

### 2. 取得資料庫連線資訊

1. 進入專案後，點擊左側選單的 **Settings**（齒輪圖示）
2. 點擊 **Database**
3. 在 **Connection string** 區段，選擇 **URI** 標籤
4. 複製連線字串，格式如下：

```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

或使用 **Connection pooling** 模式（推薦，適合 serverless）：

```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

### 3. 設定環境變數

在 `apps/api/.env` 中設定：

```env
# Supabase Database URL
# 方式 1: 使用 Connection pooling (推薦，支援連線池)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# 方式 2: 使用 Direct connection (無連線池限制，但有限制連線數)
# DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# 其他設定
JWT_SECRET="change-me-in-production"
JWT_EXPIRES_IN="24h"
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="*"
TAGGING_LLM_PROVIDER="mock"
```

### 4. 執行資料庫遷移

```bash
cd apps/api

# 執行遷移（這會建立所有資料表）
npm run prisma:migrate
```

### 5. 驗證設置

#### 5.1 使用 Prisma Studio（本地）

```bash
npm run prisma:studio
```

應該可以看到 Supabase 資料庫中的所有資料表。

#### 5.2 使用 Supabase Dashboard

1. 進入 Supabase 專案
2. 點擊左側選單的 **Table Editor**
3. 應該可以看到所有建立的資料表：
   - organizations
   - users
   - inbox_items
   - actions
   - projects
   - sops
   - sop_versions
   - pdca
   - weekly_reviews
   - tags
   - audit_logs

#### 5.3 測試連線

```bash
cd apps/api

# 使用 Prisma 測試連線
npx prisma db pull
```

如果成功，會看到資料庫結構。

## Supabase 特有功能

### 使用 Supabase Dashboard

1. **Table Editor**: 視覺化編輯資料表
2. **SQL Editor**: 執行 SQL 查詢
3. **Database**: 查看資料表結構、索引、外鍵
4. **Logs**: 查看資料庫日誌

### 直接查詢資料庫

在 Supabase Dashboard → SQL Editor 中可以執行 SQL：

```sql
-- 查看所有資料表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 查看 pdca 表結構（包含新欄位）
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pdca';
```

## 注意事項

### 1. 連線模式選擇

**Connection Pooling** (port 6543) - 推薦：
- ✅ 支援連線池，適合頻繁連線
- ✅ 有連線數限制，但透過 pooler 管理
- ⚠️ 某些特殊 SQL 功能可能受限

**Direct Connection** (port 5432)：
- ✅ 完整 PostgreSQL 功能
- ⚠️ 有連線數限制（免費方案約 60 個連線）
- ⚠️ 不適合高併發

### 2. 密碼管理

- Supabase 的資料庫密碼只在建立專案時顯示一次
- 如果忘記密碼，可以：
  1. Settings → Database → Database Password
  2. 點擊 "Reset database password"

### 3. SSL 連線

Supabase 預設要求 SSL 連線，Prisma 會自動處理。

如果遇到 SSL 錯誤，可以在 `DATABASE_URL` 中加入：

```env
DATABASE_URL="postgresql://...?sslmode=require"
```

### 4. 免費方案限制

- 資料庫大小：500MB
- 頻寬：2GB/月
- 連線數：有限制（使用 pooler 可以緩解）
- 備份保留：7 天

對於開發環境來說，這些限制通常足夠使用。

## 遷移到其他環境

如果未來需要遷移到本地或其他雲端資料庫：

```bash
# 1. 使用 Prisma Migrate 同步結構（已執行）

# 2. 匯出資料（如果需要）
# 在 Supabase Dashboard → SQL Editor 執行：
pg_dump -h [HOST] -U postgres -d postgres > backup.sql

# 3. 在新的資料庫執行遷移
npm run prisma:migrate
```

## 疑難排解

### 問題：無法連線到 Supabase

**檢查項目**：
1. 確認 `DATABASE_URL` 是否正確（包含密碼）
2. 確認使用正確的 port（pooling: 6543, direct: 5432）
3. 檢查 Supabase 專案狀態（Dashboard 確認專案是否暫停）

### 問題：遷移失敗

**可能原因**：
1. SSL 設定問題 - 在 URL 中加入 `?sslmode=require`
2. 連線逾時 - 檢查網路連線
3. 權限問題 - 確認使用正確的密碼

**解決方案**：
```bash
# 清除並重新遷移（開發環境）
npx prisma migrate reset
npm run prisma:migrate
```

### 問題：連線數過多

**解決方案**：
使用 Connection Pooling 模式（port 6543）

## 與團隊共享

1. 在 Supabase Dashboard → Settings → Team
2. 邀請團隊成員加入專案
3. 每個成員會看到相同的資料庫連線資訊

或者，在 `.env.example` 中記錄 Supabase 專案的連線範例，讓團隊成員可以快速設置。

## 下一步

資料庫設置完成後：

1. ✅ 執行 `npm run prisma:migrate`
2. ✅ 驗證資料表已建立
3. ✅ 測試 API 連線
4. 🚀 開始 Phase 3 開發

## 參考資源

- [Supabase 官方文件](https://supabase.com/docs)
- [Supabase PostgreSQL 文件](https://supabase.com/docs/guides/database)
- [Connection Pooling 說明](https://supabase.com/docs/guides/database/connecting-to-postgres)

