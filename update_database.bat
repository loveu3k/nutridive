@echo off
chcp 65001 >nul
echo ===============================================================================
echo     NutriDive - 马来西亚 NPRA 官方药品数据库同步工具
echo ===============================================================================
echo.
echo 请选择更新模式：
echo.
echo [1] 安全比对检查模式 (Dry-Run: 只下载并比对官方数据变动，不修改任何现有文件)
echo [2] 自动同步更新模式 (自动抓取官方最新数据并更新数据库)
echo [3] 退出
echo.
set /p mode="请输入选项 (1/2/3): "

if "%mode%"=="1" (
    echo.
    echo [*] 正在执行数据变动比对 (Dry Run)...
    python scripts/sync.py --dry-run
) else if "%mode%"=="2" (
    echo.
    echo [*] 正在执行数据同步更新...
    python scripts/sync.py
) else (
    echo [*] 操作已取消。
)

echo.
pause
