# 公開 Repository 安全檢查清單

在將專案設為公開前，請確認以下項目：

## ✅ 已確認的安全措施

### 1. .gitignore 設定
- ✅ `.env` 檔案已被忽略
- ✅ `.env.local`, `.env.*.local` 已被忽略
- ✅ 各種環境變數檔案已被忽略
- ✅ `node_modules/` 已被忽略
- ✅ 資料庫檔案已被忽略

### 2. 敏感資訊檢查

請確認以下檔案**沒有**包含真實的敏感資訊：

- [ ] `apps/api/env.example` - 只有 placeholder，沒有真實密碼
- [ ] `apps/api/.env` - 已確認在 .gitignore 中
- [ ] `apps/api/.env.local` - 已確認在 .gitignore 中
- [ ] 任何包含 `DATABASE_URL` 的檔案（應該是 placeholder）
- [ ] 任何包含 `OPENAI_API_KEY` 的檔案（應該是空字串或 placeholder）
- [ ] 任何包含 `JWT_SECRET` 的檔案（應該是 "change-me..." 而不是真實 secret）

## ⚠️ 注意事項

### 推送前檢查

在推送程式碼到公開 repository 前，執行：

```bash
# 檢查是否有 .env 檔案被追蹤
git ls-files | findstr /i ".env"

# 應該只看到 env.example，不應該看到 .env 或 .env.local

# 檢查是否有敏感資訊在程式碼中（搜尋常見的模式）
git grep -i "password.*=" -- "*.ts" "*.js" "*.json"
git grep -i "api.*key.*=" -- "*.ts" "*.js"
git grep -i "secret.*=" -- "*.ts" "*.js"

# 檢查是否有資料庫連線字串（應該只有 placeholder）
git grep -i "postgresql://" -- "*.ts" "*.js" "*.md"
```

### 如果不小心推送了敏感資訊

如果發現已經推送了敏感資訊：

1. **立即處理**：
   ```bash
   # 從 git 歷史中移除敏感檔案
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch apps/api/.env" \
     --prune-empty --tag-name-filter cat -- --all
   ```

2. **更換所有暴露的憑證**：
   - 更換資料庫密碼
   - 更換 JWT Secret
   - 更換 API Keys
   - 更換 Supabase 密碼

3. **強制推送**（警告：這會改寫歷史）：
   ```bash
   git push origin --force --all
   ```

## 📝 最佳實踐

1. **使用環境變數**：所有敏感資訊都應該放在環境變數中
2. **使用 .env.example**：提供範例檔案，但不包含真實值
3. **定期檢查**：定期執行安全檢查
4. **使用 GitHub Secret Scanning**：GitHub 會自動掃描公開 repository 中的敏感資訊

## 🔒 額外安全建議

1. **Supabase 專案設定**：
   - 如果使用 Supabase，確認專案設為 Private（Supabase 層級）
   - 定期輪換資料庫密碼

2. **API Keys**：
   - 使用不同的 API Key 用於開發和生產環境
   - 設定 API Key 的使用限制（IP、domain 等）

3. **監控**：
   - 啟用 Supabase 的訪問日誌
   - 監控異常的 API 使用

## ✅ 確認清單

推送前請確認：

- [ ] 所有 `.env` 檔案都在 .gitignore 中
- [ ] `env.example` 中沒有真實的密碼或 key
- [ ] 程式碼中沒有硬編碼的敏感資訊
- [ ] 資料庫連線字串只有 placeholder
- [ ] JWT Secret 是 placeholder
- [ ] OpenAI API Key 是空字串或 placeholder
- [ ] 執行過安全檢查命令並確認無敏感資訊

確認以上項目後，就可以安心地設為公開 repository 了！🎉

