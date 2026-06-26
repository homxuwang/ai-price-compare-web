@echo off
chcp 65001 >nul

echo ==========================================
echo   AI Price Compare Web - 一键部署脚本
echo ==========================================
echo.

:: 步骤 1: 检查环境
echo [1/6] 检查运行环境...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未找到 Node.js
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未找到 npm
    pause
    exit /b 1
)

where wrangler >nul 2>nul
if %errorlevel% neq 0 (
    echo 未找到 wrangler，正在安装...
    call npm install -g wrangler
)

echo ✓ 环境检查通过
echo    Node.js: 
call node --version
echo    npm:
call npm --version
echo.

:: 步骤 2: 安装依赖
echo [2/6] 安装项目依赖...

if not exist "node_modules" (
    call npm install
    echo ✓ 依赖安装完成
) else (
    echo ✓ 依赖已存在，跳过安装
)
echo.

:: 步骤 3: 登录 Cloudflare
echo [3/6] 登录 Cloudflare...
echo 请在浏览器中完成登录
call npx wrangler login
if %errorlevel% neq 0 (
    echo 错误: Cloudflare 登录失败
    pause
    exit /b 1
)
echo ✓ Cloudflare 登录成功
echo.

:: 步骤 4: 创建数据库
echo [4/6] 配置 D1 数据库...

set /p DB_NAME="数据库名称 (默认: ai-price-compare): "
if "%DB_NAME%"=="" set DB_NAME=ai-price-compare

echo 正在创建数据库: %DB_NAME%
call npx wrangler d1 create %DB_NAME%
if %errorlevel% neq 0 (
    echo 警告: 数据库可能已存在，继续执行...
)
echo ✓ 数据库配置完成
echo.

:: 步骤 5: 初始化数据库
echo [5/6] 初始化数据库...

echo 创建表结构...
call npx wrangler d1 execute %DB_NAME% --remote --file=./migrations/0001_init.sql
if %errorlevel% neq 0 (
    echo 错误: 数据库初始化失败
    pause
    exit /b 1
)
echo ✓ 表结构创建成功

set /p IMPORT_DATA="是否导入示例数据? (y/n, 默认: y): "
if "%IMPORT_DATA%"=="" set IMPORT_DATA=y

if "%IMPORT_DATA%"=="y" (
    echo 导入示例数据...
    call npx wrangler d1 execute %DB_NAME% --remote --file=./migrations/0002_seed.sql
    echo ✓ 示例数据导入成功
) else (
    echo 跳过示例数据导入
)
echo.

:: 步骤 6: 部署
echo [6/6] 部署到 Cloudflare...

echo 构建生产版本...
call npm run build
if %errorlevel% neq 0 (
    echo 错误: 构建失败
    pause
    exit /b 1
)
echo ✓ 构建完成

echo 部署 Worker...
call npx wrangler deploy
if %errorlevel% neq 0 (
    echo 错误: 部署失败
    pause
    exit /b 1
)
echo ✓ 部署成功

:: 完成
echo.
echo ==========================================
echo   部署成功！
echo ==========================================
echo.
echo 访问地址:
echo   https://ai-price-compare.workers.dev
echo.
echo 管理后台:
echo   https://ai-price-compare.workers.dev/admin
echo.
echo 常用命令:
echo   查看日志: npx wrangler tail
echo   查看数据库: npx wrangler d1 execute ai-price-compare --remote --command="SELECT * FROM platforms"
echo   重新部署: npm run worker:deploy
echo.
echo ==========================================

pause
