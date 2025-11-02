# 修正連線字串問題

## 問題

錯誤訊息：`Can't reach database server at aws-0-ap-southeast-1.pooler.supabase.com:5432`

這表示連線字串中的 host 可能不正確。根據 Supabase 文檔，可能需要：

1. **使用正確的 host**：根據專案資訊，host 應該從專案設定中取得
2. **確認連線方式**：可能需要使用 direct connection 或不同的 pooler URL

## 解決方案

### 步驟 1: 從 Supabase Dashboard 取得正確連線字串

1. 前往：https://supabase.com/dashboard/project/owilwlgyeiexxmmbdmns/settings/database
2. 找到 **Connection string** 區段
3. 選擇 **Session mode**（不是 Connection pooling）
4. **重要**：確認複製的連線字串中的 host 是正確的

### 步驟 2: 更新 .env 檔案

將用戶名從 `postgres` 改為 `prisma`，並使用從 Dashboard 取得的完整連線字串：

```env
DATABASE_URL="postgresql://prisma.owilwlgyeiexxmmbdmns:Prisma2024!Secure@[正確的host]:5432/postgres?sslmode=require"
```

### 步驟 3: 可能的 host 格式

根據 Supabase 專案，host 可能是：
- `aws-0-ap-southeast-1.pooler.supabase.com` (pooler)
- `db.owilwlgyeiexxmmbdmns.supabase.co` (direct connection)
- 或其他格式（需要從 Dashboard 確認）

## 下一步

請從 Supabase Dashboard 複製完整的 Session mode 連線字串，然後將用戶名部分改為 `prisma`，密碼改為 `Prisma2024!Secure`。

