# Supabase Prisma 官方設定方式

根據 Supabase Dashboard → ORMs → Prisma 的設定，需要兩個連線字串：

## 連線字串設定

### 1. DATABASE_URL（應用程式使用 - Connection Pooling）

用於應用程式的資料庫連線，使用 connection pooling：

```env
DATABASE_URL="postgresql://postgres.owilwlgyeiexxmmbdmns:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

- Port: **6543** (Connection pooling)
- 參數: `pgbouncer=true`
- 用途: 應用程式執行時的資料庫操作

### 2. DIRECT_URL（Prisma Migrations 使用）

用於 Prisma migrations 和 CLI 操作，直接連線：

```env
DIRECT_URL="postgresql://postgres.owilwlgyeiexxmmbdmns:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

- Port: **5432** (Direct connection)
- 用途: Prisma migrations、schema introspection 等操作

## 重要發現

1. **Host 是 `aws-1`** 不是 `aws-0`！
2. 使用 **postgres 用戶**（不是 prisma 用戶）
3. 需要同時設定兩個連線字串

## 下一步

1. 更新 `prisma/schema.prisma` 加入 `directUrl`
2. 更新 `.env` 檔案使用這兩個連線字串
3. 從 Supabase Dashboard 複製實際的連線字串（替換 `[YOUR-PASSWORD]`）

