# Supabase 連線設定說明

## 兩種連線方式

Supabase 提供兩種連線方式，用途不同：

### 方式 1: Supabase JavaScript Client（前端/簡化後端）

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://owilwlgyeiexxmmbdmns.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY  // 公開的 anon key
const supabase = createClient(supabaseUrl, supabaseKey)

// 使用方式
const { data, error } = await supabase
  .from('users')
  .select('*')
```

**用途**：
- ✅ 前端應用直接連線 Supabase
- ✅ 簡單的 CRUD 操作
- ✅ 使用 Supabase 的內建功能（Auth, Storage, Realtime）

**我們專案不適用**，因為：
- ❌ 我們使用 Prisma ORM 來管理資料庫
- ❌ 需要更複雜的資料庫操作和遷移
- ❌ 需要直接 SQL 控制

---

### 方式 2: PostgreSQL 直接連線（我們使用的方式）✅

```env
DATABASE_URL="postgresql://postgres.owilwlgyeiexxmmbdmns:[密碼]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**用途**：
- ✅ 使用 Prisma ORM 管理資料庫
- ✅ 執行 SQL migrations
- ✅ 完整的資料庫控制權
- ✅ 與任何 PostgreSQL 工具相容

---

## 我們專案需要的設定

### 1. 取得資料庫連線字串

前往 Supabase Dashboard：
- **URL**: https://supabase.com/dashboard/project/owilwlgyeiexxmmbdmns/settings/database
- 在 **Connection string** 區段
- 選擇 **URI** 標籤
- 選擇 **Connection pooling**（port 6543，推薦）

您會看到類似這樣的連線字串：

```
postgresql://postgres.owilwlgyeiexxmmbdmns:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 2. 取得密碼

如果您忘記密碼：
1. 在同一個頁面（Settings → Database）
2. 找到 **Database Password** 區段
3. 點擊 **Reset database password**
4. 設定新密碼（請記住！）

### 3. 建立 `.env` 檔案

在 `apps/api/` 目錄建立 `.env` 檔案：

```env
# Database - Supabase PostgreSQL Connection
# 將 [YOUR-PASSWORD] 替換為您的資料庫密碼
DATABASE_URL="postgresql://postgres.owilwlgyeiexxmmbdmns:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"

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

**重要**：
- 將 `[YOUR-PASSWORD]` 替換為您建立 Supabase 專案時設定的資料庫密碼
- 如果忘記密碼，使用「Reset database password」功能

### 4. 驗證連線

```bash
cd apps/api

# 生成 Prisma Client
npm run prisma:generate

# 使用 Prisma Studio 測試連線（可選）
npm run prisma:studio

# 或直接啟動 API
npm run start:dev
```

---

## 常見問題

### Q: 為什麼不需要 `supabaseKey`？

**A**: 因為我們使用 Prisma ORM，它直接連線到 PostgreSQL，不透過 Supabase 的 REST API。Prisma 只需要標準的 PostgreSQL 連線字串（`DATABASE_URL`）。

### Q: `supabaseKey` 是什麼時候用的？

**A**: 如果您：
- 在前端直接使用 Supabase Client
- 想要使用 Supabase 的內建 Auth、Storage、Realtime 功能
- 不想寫後端 API

但在我們的架構中，後端使用 NestJS + Prisma，所以不需要。

### Q: 連線字串中的密碼在哪裡？

**A**: 密碼是您建立 Supabase 專案時設定的。如果忘記了：
1. 前往 Settings → Database
2. 點擊 **Reset database password**
3. 設定新密碼後，更新 `.env` 檔案中的 `DATABASE_URL`

### Q: 為什麼要用 Connection Pooling？

**A**: 
- ✅ 更好的連線管理
- ✅ 避免連線數過多
- ✅ 適合 Serverless/頻繁連線的應用
- ⚠️ 某些特殊 SQL 功能可能受限（但對我們專案足夠）

如果遇到問題，也可以使用 **Direct connection**（port 5432）。

---

## 完整範例

假設您的資料庫密碼是 `myPassword123`，`.env` 檔案應該長這樣：

```env
DATABASE_URL="postgresql://postgres.owilwlgyeiexxmmbdmns:myPassword123@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
```

**注意**：請不要將真實密碼提交到 Git！`.env` 檔案應該在 `.gitignore` 中。

