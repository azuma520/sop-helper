# 資料庫設置指南

本文件說明在不同環境下如何設置 PostgreSQL 資料庫。

## 開發環境選項

根據專案文件，開發環境有幾個選項：

> 💡 **推薦**：如果您不想安裝 Docker 或本地 PostgreSQL，可以使用 [Supabase](https://supabase.com) 免費方案。詳見 [DATABASE_SETUP_SUPABASE.md](./DATABASE_SETUP_SUPABASE.md) 或 [apps/api/QUICK_START_SUPABASE.md](./apps/api/QUICK_START_SUPABASE.md)。

### 選項 1: Docker Compose（推薦）⭐

這是專案 `quickstart.md` 推薦的方式，最簡單且一致性高。

#### 1.1 建立 `docker-compose.yml`

在專案根目錄建立 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: ai-sop-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ai_sop_help_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis (未來需要，用於 BullMQ)
  redis:
    image: redis:7-alpine
    container_name: ai-sop-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

#### 1.2 啟動服務

```bash
# 啟動 PostgreSQL (和 Redis)
docker compose up -d postgres

# 檢查狀態
docker compose ps

# 查看日誌
docker compose logs postgres
```

#### 1.3 設定環境變數

在 `apps/api/.env` 中設定：

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_sop_help_dev?schema=public"
```

#### 優點：
- ✅ 環境一致，團隊成員都使用相同版本
- ✅ 一鍵啟動，不需要手動安裝 PostgreSQL
- ✅ 容易清理（`docker compose down -v`）
- ✅ 包含 Redis，未來可直接使用

---

### 選項 2: 本地安裝 PostgreSQL

如果您的電腦已經安裝 PostgreSQL，可以直接使用。

#### 2.1 建立資料庫

使用 `psql` 或任何 PostgreSQL 客戶端工具：

```sql
CREATE DATABASE ai_sop_help_dev;
```

或使用命令列：

```bash
createdb -U postgres ai_sop_help_dev
```

#### 2.2 設定環境變數

根據您的 PostgreSQL 設定調整連線字串：

```env
DATABASE_URL="postgresql://你的使用者名稱:你的密碼@localhost:5432/ai_sop_help_dev?schema=public"
```

例如：
```env
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/ai_sop_help_dev?schema=public"
```

#### 2.3 驗證連線

```bash
psql -U postgres -d ai_sop_help_dev -c "SELECT version();"
```

#### 優點：
- ✅ 直接使用系統服務
- ✅ 效能較好（無容器開銷）

#### 缺點：
- ⚠️ 需要手動安裝和管理 PostgreSQL
- ⚠️ 版本可能與團隊其他成員不同

---

### 選項 3: 雲端資料庫（進階）

#### 3.1 Supabase（免費方案）

1. 前往 https://supabase.com 註冊
2. 建立新專案
3. 取得連線字串（Settings → Database → Connection string）

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

#### 3.2 Neon（免費方案）

1. 前往 https://neon.tech 註冊
2. 建立新專案
3. 取得連線字串

```env
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require"
```

#### 優點：
- ✅ 不需要本地安裝
- ✅ 有免費方案
- ✅ 自動備份

#### 缺點：
- ⚠️ 需要網路連線
- ⚠️ 可能有延遲
- ⚠️ 開發時不太方便

---

## 推薦方案（開發環境）

**推薦使用 Docker Compose（選項 1）**，因為：

1. 專案的 `quickstart.md` 已經建議這個方式
2. 環境一致性高，所有開發者使用相同配置
3. 一鍵啟動，減少設置時間
4. 包含 Redis，未來 BullMQ 可以直接使用

## 設置步驟（Docker Compose）

### 完整流程：

```bash
# 1. 確保已安裝 Docker 和 Docker Compose
docker --version
docker compose version

# 2. 在專案根目錄啟動 PostgreSQL
docker compose up -d postgres

# 3. 確認資料庫已啟動
docker compose ps

# 4. 設置環境變數
cd apps/api
cp env.example .env
# 編輯 .env，設定 DATABASE_URL

# 5. 執行資料庫遷移
npm run prisma:migrate

# 6. (可選) 使用 Prisma Studio 查看資料庫
npm run prisma:studio
```

### 常用指令：

```bash
# 啟動服務
docker compose up -d postgres

# 停止服務
docker compose stop postgres

# 停止並刪除容器（保留資料）
docker compose down

# 停止並刪除容器和資料（完全清理）
docker compose down -v

# 查看日誌
docker compose logs postgres

# 進入 PostgreSQL 容器
docker compose exec postgres psql -U postgres -d ai_sop_help_dev
```

## 驗證資料庫設置

執行遷移後，驗證資料庫結構：

```bash
cd apps/api

# 使用 Prisma Studio（視覺化）
npm run prisma:studio

# 或使用 psql
psql postgresql://postgres:postgres@localhost:5432/ai_sop_help_dev -c "\dt"
```

應該看到以下資料表：
- organizations
- users
- inbox_items
- actions
- projects
- sops
- sop_versions
- pdca (包含新的 act_acknowledge_insight 和 act_action_change 欄位)
- weekly_reviews
- tags
- audit_logs

## 生產環境

根據 `docs/deployment-profile.md`：

- **Staging**: Postgres RDS (small)
- **Prod**: RDS (多區可用)

生產環境請使用雲端管理的 PostgreSQL（如 AWS RDS、Azure Database、Google Cloud SQL），確保：
- 高可用性
- 自動備份
- 監控告警
- 安全性（SSL、VPC）

## 疑難排解

### 問題：無法連線到資料庫

**檢查項目**：
1. PostgreSQL 服務是否運行中？
   ```bash
   # Docker
   docker compose ps
   
   # 本地
   # Windows: services.msc 檢查 PostgreSQL 服務
   # macOS/Linux: brew services list 或 systemctl status postgresql
   ```

2. 連線字串是否正確？
   - 檢查 `DATABASE_URL` 格式
   - 確認使用者名稱、密碼、資料庫名稱

3. 埠號是否被佔用？
   ```bash
   # 檢查 5432 埠
   # Windows
   netstat -ano | findstr :5432
   
   # macOS/Linux
   lsof -i :5432
   ```

### 問題：遷移失敗

**檢查項目**：
1. 資料庫是否存在？
   ```sql
   SELECT datname FROM pg_database WHERE datname = 'ai_sop_help_dev';
   ```

2. 使用者是否有足夠權限？
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE ai_sop_help_dev TO postgres;
   ```

3. 清理並重新遷移（**警告：會刪除所有資料**）
   ```bash
   # 重置資料庫（開發環境）
   cd apps/api
   npm run prisma:migrate reset
   ```

## 下一步

資料庫設置完成後，繼續：
1. ✅ 驗證 Prisma Client 已生成
2. ✅ 執行資料庫遷移
3. ✅ 測試 API 啟動
4. 🚀 開始 Phase 3 開發

