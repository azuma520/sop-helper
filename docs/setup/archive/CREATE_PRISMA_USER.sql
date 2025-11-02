-- 根據 Supabase 官方文檔創建 Prisma 專用用戶
-- 執行位置：Supabase Dashboard → SQL Editor

-- 創建專用的 Prisma 用戶
CREATE USER "prisma" WITH PASSWORD 'your_strong_password_here' BYPASSRLS CREATEDB;

-- 擴展 prisma 的權限到 postgres（必要，用於在 Dashboard 中查看變更）
GRANT "prisma" TO "postgres";

-- 授予必要權限
GRANT USAGE ON SCHEMA public TO prisma;
GRANT CREATE ON SCHEMA public TO prisma;
GRANT ALL ON ALL TABLES IN SCHEMA public TO prisma;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO prisma;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO prisma;

-- 設定預設權限
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO prisma;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO prisma;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO prisma;

