# Secret Scanning 位置說明

## Secret Scanning 在哪裡？

從你的截圖來看，你目前在 **Advanced Security** 頁面，但 Secret Scanning 不在這個頁面。

## 正確的位置

Secret Scanning 通常在以下位置之一：

### 方式 1：Code security and analysis 頁面
1. 前往：https://github.com/azuma520/sop-helper/settings/security_analysis
2. 找到 **"Secret scanning"** 區塊
3. 啟用 Secret scanning

### 方式 2：直接在 Security 分類下
1. Settings → Security
2. 在左側選單找到 **"Secret scanning"**（應該在 Advanced Security 下方）

## 關於 Secret Scanning

### 公開 Repository
如果 repository 是**公開的**（Public），Secret Scanning 通常會**自動啟用**，不需要手動設定。

### 私有 Repository
如果是**私有的**（Private），Secret Scanning 可能需要：
- GitHub Advanced Security（付費功能）
- 企業版帳號

## 目前的頁面（Advanced Security）可以做什麼？

從你目前的 Advanced Security 頁面，建議啟用：

### 高優先級（推薦啟用）
1. ✅ **Dependabot alerts** - 接收依賴套件的安全漏洞警報
2. ✅ **Dependency graph** - 了解專案的依賴關係

### 中優先級（可選）
3. **Dependabot security updates** - 自動修復安全漏洞
4. **Private vulnerability reporting** - 允許社群私下回報漏洞

### 低優先級（進階功能）
5. **Code scanning (CodeQL)** - 程式碼靜態分析（需要設定 workflow）

## 如何找到 Secret Scanning

### 步驟 1：確認 Repository 是否為公開
- 如果是公開的，Secret Scanning 應該已經自動啟用
- 可以前往：https://github.com/azuma520/sop-helper/settings

### 步驟 2：尋找 Secret Scanning
在 Settings 左側選單的 Security 區塊下：
- Advanced Security（你現在在這裡）
- **Secret scanning** ← 應該在附近
- Deploy keys
- Secrets and variables

### 步驟 3：如果找不到
可能是因為：
- Repository 是公開的，已自動啟用（不需要設定）
- Repository 是私有的，需要 Advanced Security（可能需要付費）

## 檢查是否已啟用

### 方法 1：檢查 Settings 頁面
前往：https://github.com/azuma520/sop-helper/settings/security_analysis

如果看到 "Secret scanning" 顯示為 **Enabled**，表示已經啟用了。

### 方法 2：如果是公開 Repository
公開 repository 的 Secret Scanning **預設就是啟用的**，不需要額外設定。

## 總結

**目前 Advanced Security 頁面建議啟用**：
- ✅ Dependabot alerts（建議）
- ✅ Dependency graph（建議）

**Secret Scanning**：
- 如果是公開 repository → 已經自動啟用 ✓
- 如果是私有 repository → 可能需要 Advanced Security（付費功能）
- 或前往：Settings → Security → Secret scanning 檢查

