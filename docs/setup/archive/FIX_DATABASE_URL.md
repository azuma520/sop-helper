# 修正 Supabase 連線字串

## 問題

目前出現 "Tenant or user not found" 錯誤，通常是因為：
1. Connection pooling (pgbouncer) 模式對 Prisma 有限制
2. 需要使用 Session mode 或 Transaction mode

## 解決方案

### 方法 1: 使用 Session mode（推薦）

在 Supabase Dashboard：
1. Settings → Database
2. Connection string → 選擇 **Session mode**（不是 Connection pooling）
3. 複製連線字串

格式應該類似：
```
postgresql://postgres.owilwlgyeiexxmmbdmns:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

注意：
- Port 是 **5432**（不是 6543）
- 沒有 `?pgbouncer=true`

### 方法 2: 使用 Direct Connection（如果有）

如果有 Direct connection 選項，使用那個（通常是 port 5432）。

## 正確的 .env 格式

```env
# 使用 Session mode（port 5432）
DATABASE_URL="postgresql://postgres.owilwlgyeiexxmmbdmns:nika01130626@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"

# 或使用 Transaction mode（也是 port 5432）
# DATABASE_URL="postgresql://postgres.owilwlgyeiexxmmbdmns:nika01130626@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true&sslmode=require"
```

## 測試連線

```bash
cd apps/api
node test-db-connection.js
```

