# GitHub Repository 設定指南

## 自動化設定步驟

由於 GitHub API 的限制，部分設定需要手動在網頁上完成。以下是詳細步驟：

## 1. 設定預設分支

### 步驟：
1. 前往：https://github.com/azuma520/sop-helper/settings/branches
2. 在 "Default branch" 區域，點擊分支名稱旁邊的切換圖示
3. 選擇 `001-ai-sop-mvp`
4. 點擊 "Update"
5. 確認變更

### 或者使用 GitHub CLI（如果已安裝）：
```bash
gh repo edit azuma520/sop-helper --default-branch 001-ai-sop-mvp
```

## 2. 加入 Topics

**Topics 是什麼？** Topics 就像專案的標籤，幫助其他人更容易找到你的專案。例如：搜尋 "nestjs" 時，有加上 `nestjs` topic 的專案會出現在搜尋結果中。詳細說明請參考：[Topics 完整說明](./GITHUB_TOPICS_EXPLANATION.md)

### 步驟：
1. 前往：https://github.com/azuma520/sop-helper
2. 在 repository 主頁面找到 **About** 區域（在 repository 名稱下方）
3. 點擊 Topics 右側的齒輪圖示 ⚙️
4. 在 "Topics" 欄位中輸入（每輸入一個後按 Enter）：
   - `ai` - AI 相關專案
   - `sop` - 標準作業程序
   - `nestjs` - 後端框架
   - `nextjs` - 前端框架
   - `typescript` - 程式語言
   - `monorepo` - 單一倉庫架構
5. 點擊 "Save changes" 或按 Enter 儲存

## 3. 啟用 Secret Scanning

### 步驟：
1. 前往：https://github.com/azuma520/sop-helper/settings/security_analysis
2. 找到 "Secret scanning" 區域
3. 啟用以下選項（如果可用）：
   - ✅ "Secret scanning" - 掃描所有分支的 secrets
   - ✅ "Push protection" - 在推送時阻止包含 secrets 的 commits（可選）
4. 點擊 "Save" 或相關的啟用按鈕

### 注意事項：
- Secret scanning 功能在公開 repository 中自動啟用
- 對於私有 repository，可能需要 GitHub Advanced Security（付費功能）
- 如果看不到此選項，可能是因為：
  - Repository 是私有的且沒有 Advanced Security
  - 組織層級的設定限制

## 4. 其他建議設定

### Repository 描述（已在建立時設定）：
- ✅ Description: `AI SOP 系統 — 對話生成 SOP、PDCA、標籤、匯出、週回顧的 MVP 專案`

### 啟用其他安全功能（可選）：
1. **Dependabot alerts**：
   - Settings → Security → Code security and analysis
   - 啟用 "Dependabot alerts"

2. **Code scanning**（如果有 GitHub Advanced Security）：
   - Settings → Security → Code security and analysis
   - 啟用 "Code scanning"

3. **Branch protection rules**（推薦）：
   - Settings → Branches
   - 為 `001-ai-sop-mvp` 或 `main` 分支設定保護規則：
     - ✅ Require pull request reviews before merging
     - ✅ Require status checks to pass before merging
     - ✅ Require conversation resolution before merging

## 快速連結

- **Repository 設定**: https://github.com/azuma520/sop-helper/settings
- **分支設定**: https://github.com/azuma520/sop-helper/settings/branches
- **安全設定**: https://github.com/azuma520/sop-helper/settings/security_analysis
- **About/Topics**: 在 repository 主頁面點擊 About 區域的 ⚙️ 圖示

## 驗證設定

設定完成後，可以檢查：

1. **預設分支**：
   - 前往 repository 主頁面
   - 確認顯示的分支是 `001-ai-sop-mvp`

2. **Topics**：
   - 在 repository 主頁面的 About 區域查看
   - 應該看到：`ai`, `sop`, `nestjs`, `nextjs`, `typescript`, `monorepo`

3. **Secret Scanning**：
   - Settings → Security → Secret scanning
   - 確認顯示為 "Enabled"

