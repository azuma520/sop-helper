# Supabase 設定簡單版

## 🎯 我們專案需要的設定

我們**不需要** `@supabase/supabase-js`，而是直接用 PostgreSQL 連線。

## 📝 步驟

### 步驟 1: 取得連線資訊

1. 前往：https://supabase.com/dashboard/project/owilwlgyeiexxmmbdmns/settings/database
2. 找到 **Connection string** 區段
3. 選擇 **URI** 標籤
4. 選擇 **Connection pooling**（port 6543）

您會看到：
```
postgresql://postgres.owilwlgyeiexxmmbdmns:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 步驟 2: 取得/重置密碼

如果忘記密碼，在同一個頁面：
- 找到 **Database Password** 區段
- 點擊 **Reset database password**
- 設定新密碼（請記住！）

### 步驟 3: 建立 `.env` 檔案

在 `apps/api/` 目錄建立 `.env` 檔案：

```env
DATABASE_URL="postgresql://postgres.owilwlgyeiexxmmbdmns:您的密碼@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
JWT_SECRET="dev-secret-key-change-in-production"
JWT_EXPIRES_IN="24h"
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="*"
TAGGING_LLM_PROVIDER="mock"
```

**將 `您的密碼` 替換為步驟 2 設定的密碼**

### 步驟 4: 完成！

```bash
cd apps/api
npm run prisma:generate
npm run start:dev
```

## ❓ 常見問題

**Q: 為什麼不需要 `createClient` 和 `supabaseKey`？**

A: 因為我們使用 Prisma ORM，它直接連線 PostgreSQL，不透過 Supabase 的 REST API。我們只需要 PostgreSQL 連線字串（`DATABASE_URL`）。

**Q: `supabaseKey` 是什麼？**

A: 那是 Supabase 的 API Key，用於前端直接使用 Supabase Client。我們的後端用 NestJS + Prisma，所以不需要。

**Q: 資料庫已經建立好了嗎？**

A: ✅ 是的！我已經幫您執行完 migration，所有資料表都建立好了。您可以在 Supabase Dashboard → Table Editor 看到。

