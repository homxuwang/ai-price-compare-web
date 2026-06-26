@echo off
chcp 65001 >nul

echo ==========================================
echo   AI Price Compare Web - 一键部署脚本
echo ==========================================
echo.

:: 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未找到 Node.js
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)

:: 检查 npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未找到 npm
    pause
    exit /b 1
)

:: 检查 wrangler
where wrangler >nul 2>nul
if %errorlevel% neq 0 (
    echo 正在安装 wrangler...
    npm install -g wrangler
)

echo [信息] 版本信息:
node --version
npm --version
wrangler --version
echo.

:: 步骤 1: 安装依赖
echo [步骤 1/6] 安装依赖...
call npm install
if %errorlevel% neq 0 (
    echo 错误: 依赖安装失败
    pause
    exit /b 1
)
echo [完成] 依赖安装完成
echo.

:: 步骤 2: 登录 Cloudflare
echo [步骤 2/6] 登录 Cloudflare...
echo 请在浏览器中完成登录
call npx wrangler login
if %errorlevel% neq 0 (
    echo 错误: Cloudflare 登录失败
    pause
    exit /b 1
)
echo [完成] Cloudflare 登录完成
echo.

:: 步骤 3: 创建 D1 数据库
echo [步骤 3/6] 创建 D1 数据库...
set /p DB_NAME="请输入数据库名称 (默认: ai-price-compare): "
if "%DB_NAME%"=="" set DB_NAME=ai-price-compare

echo 正在创建数据库: %DB_NAME%
call npx wrangler d1 create %DB_NAME%
echo.

:: 步骤 4: 初始化数据库
echo [步骤 4/6] 初始化数据库表结构...
call npx wrangler d1 execute %DB_NAME% --remote --file=./migrations/0001_init.sql
if %errorlevel% neq 0 (
    echo 错误: 数据库初始化失败
    pause
    exit /b 1
)
echo [完成] 数据库初始化完成
echo.

:: 步骤 5: 导入示例数据
echo [步骤 5/6] 导入示例数据...
set /p IMPORT_DATA="是否导入示例数据? (y/n, 默认: y): "
if "%IMPORT_DATA%"=="" set IMPORT_DATA=y

if "%IMPORT_DATA%"=="y" (
    call npx wrangler d1 execute %DB_NAME% --remote --file=./migrations/0002_seed.sql
    echo [完成] 示例数据导入完成
) else (
    echo 跳过示例数据导入
)
echo.

:: 步骤 6: 完成
echo ==========================================
echo   部署配置完成！
echo ==========================================
echo.
echo 下一步操作:
echo.
echo 1. 本地开发:
echo    npm run dev          # 启动前端 (http://localhost:3000)
echo    npm run worker:dev   # 启动后端 API
echo.
echo 2. 构建和部署:
echo    npm run build        # 构建生产版本
echo    npm run worker:deploy # 部署到 Cloudflare
echo.
echo 3. 管理后台:
echo    访问: https://your-domain/admin
echo.
echo ==========================================

pause
