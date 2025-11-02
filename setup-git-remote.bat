@echo off
REM Git Remote 設定腳本
REM 請先到 GitHub 建立 repository，然後執行此腳本

echo ========================================
echo Git Remote 設定
echo ========================================
echo.

REM 檢查是否已經有 remote
git remote -v >nul 2>&1
if %errorlevel% equ 0 (
    echo 目前已有的 remote:
    git remote -v
    echo.
    set /p REMOVE_EXISTING="是否要移除現有的 remote? (y/n): "
    if /i "%REMOVE_EXISTING%"=="y" (
        git remote remove origin
        echo 已移除舊的 remote
        echo.
    ) else (
        echo 取消操作
        exit /b
    )
)

echo 請提供你的 GitHub repository URL
echo 格式範例: https://github.com/azuma520/sop-helper.git
echo 或 SSH 格式: git@github.com:azuma520/sop-helper.git
echo.
set /p REPO_URL="請輸入 repository URL: "

if "%REPO_URL%"=="" (
    echo 錯誤: 未輸入 URL
    exit /b 1
)

git remote add origin %REPO_URL%

echo.
echo ========================================
echo Remote 設定完成！
echo ========================================
echo.
echo 目前的 remote 設定:
git remote -v
echo.
echo 下一步: 執行以下命令推送程式碼
echo   git push -u origin 001-ai-sop-mvp
echo.

pause

