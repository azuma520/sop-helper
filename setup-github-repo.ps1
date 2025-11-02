# GitHub Repository 設定輔助腳本
# 此腳本提供快速連結和設定指引

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GitHub Repository 設定輔助" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$repo = "azuma520/sop-helper"
$repoUrl = "https://github.com/$repo"

Write-Host "Repository: $repoUrl" -ForegroundColor Green
Write-Host ""

Write-Host "請按照以下步驟設定：" -ForegroundColor Yellow
Write-Host ""

# 1. 預設分支
Write-Host "1. 設定預設分支" -ForegroundColor White
Write-Host "   前往: $repoUrl/settings/branches" -ForegroundColor Gray
Write-Host "   將預設分支設為: 001-ai-sop-mvp" -ForegroundColor Gray
Write-Host ""

# 2. Topics
Write-Host "2. 加入 Topics" -ForegroundColor White
Write-Host "   前往: $repoUrl" -ForegroundColor Gray
Write-Host "   點擊 About 區域的 ⚙️ 圖示，加入以下 topics：" -ForegroundColor Gray
$topics = @("ai", "sop", "nestjs", "nextjs", "typescript", "monorepo")
foreach ($topic in $topics) {
    Write-Host "     - $topic" -ForegroundColor Cyan
}
Write-Host ""

# 3. Secret Scanning
Write-Host "3. 啟用 Secret Scanning" -ForegroundColor White
Write-Host "   前往: $repoUrl/settings/security_analysis" -ForegroundColor Gray
Write-Host "   啟用 'Secret scanning' 選項" -ForegroundColor Gray
Write-Host "   注意: 如果是私有 repository，可能需要 GitHub Advanced Security" -ForegroundColor Yellow
Write-Host ""

# 快速連結
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "快速連結" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "主頁面:       $repoUrl" -ForegroundColor Green
Write-Host "分支設定:     $repoUrl/settings/branches" -ForegroundColor Green
Write-Host "安全設定:     $repoUrl/settings/security_analysis" -ForegroundColor Green
Write-Host "所有設定:     $repoUrl/settings" -ForegroundColor Green
Write-Host ""

# 詢問是否要開啟瀏覽器
$open = Read-Host "是否要在瀏覽器中開啟這些連結? (y/n)"
if ($open -eq "y" -or $open -eq "Y") {
    Write-Host ""
    Write-Host "正在開啟連結..." -ForegroundColor Yellow
    
    # 開啟主頁面
    Start-Process "$repoUrl"
    Start-Sleep -Seconds 1
    
    # 開啟分支設定
    Start-Process "$repoUrl/settings/branches"
    Start-Sleep -Seconds 1
    
    # 開啟安全設定
    Start-Process "$repoUrl/settings/security_analysis"
    
    Write-Host "已開啟瀏覽器！" -ForegroundColor Green
}

Write-Host ""
Write-Host "設定完成後，可以執行以下命令驗證：" -ForegroundColor Yellow
Write-Host "  git ls-remote --heads origin" -ForegroundColor Gray
Write-Host ""

