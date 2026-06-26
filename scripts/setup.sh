#!/bin/bash

# AI Price Compare Web - 一键部署脚本
# 使用方法: bash setup.sh

set -e

echo "=========================================="
echo "  AI Price Compare Web - 一键部署脚本"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}错误: 未找到 $1${NC}"
        echo "请先安装 $1"
        exit 1
    fi
}

# 检查必要工具
echo -e "${YELLOW}检查必要工具...${NC}"
check_command "node"
check_command "npm"
check_command "wrangler"

echo -e "${GREEN}✓ 所有必要工具已安装${NC}"
echo ""

# 显示版本信息
echo -e "${YELLOW}版本信息:${NC}"
node --version
npm --version
wrangler --version
echo ""

# 步骤 1: 安装依赖
echo -e "${YELLOW}步骤 1/6: 安装依赖...${NC}"
npm install
echo -e "${GREEN}✓ 依赖安装完成${NC}"
echo ""

# 步骤 2: 登录 Cloudflare
echo -e "${YELLOW}步骤 2/6: 登录 Cloudflare...${NC}"
echo "请在浏览器中完成登录"
npx wrangler login
echo -e "${GREEN}✓ Cloudflare 登录完成${NC}"
echo ""

# 步骤 3: 创建 D1 数据库
echo -e "${YELLOW}步骤 3/6: 创建 D1 数据库...${NC}"
echo "请输入数据库名称 (默认: ai-price-compare):"
read -r DB_NAME
DB_NAME=${DB_NAME:-ai-price-compare}

echo "正在创建数据库: $DB_NAME"
DB_OUTPUT=$(npx wrangler d1 create $DB_NAME)
echo "$DB_OUTPUT"

# 提取 database_id
DATABASE_ID=$(echo "$DB_OUTPUT" | grep -o 'database_id = "[^"]*"' | cut -d'"' -f2)

if [ -z "$DATABASE_ID" ]; then
    echo -e "${RED}错误: 无法获取 database_id${NC}"
    echo "请手动更新 wrangler.toml 中的 database_id"
else
    echo -e "${GREEN}✓ 数据库创建成功${NC}"
    echo "Database ID: $DATABASE_ID"
    
    # 更新 wrangler.toml
    echo "正在更新 wrangler.toml..."
    sed -i "s/database_id = \"your-database-id-here\"/database_id = \"$DATABASE_ID\"/" wrangler.toml
    echo -e "${GREEN}✓ wrangler.toml 已更新${NC}"
fi
echo ""

# 步骤 4: 初始化数据库
echo -e "${YELLOW}步骤 4/6: 初始化数据库表结构...${NC}"
npx wrangler d1 execute $DB_NAME --remote --file=./migrations/0001_init.sql
echo -e "${GREEN}✓ 数据库初始化完成${NC}"
echo ""

# 步骤 5: 导入示例数据
echo -e "${YELLOW}步骤 5/6: 导入示例数据...${NC}"
echo "是否导入示例数据? (y/n, 默认: y):"
read -r IMPORT_DATA
IMPORT_DATA=${IMPORT_DATA:-y}

if [ "$IMPORT_DATA" = "y" ] || [ "$IMPORT_DATA" = "Y" ]; then
    npx wrangler d1 execute $DB_NAME --remote --file=./migrations/0002_seed.sql
    echo -e "${GREEN}✓ 示例数据导入完成${NC}"
else
    echo "跳过示例数据导入"
fi
echo ""

# 步骤 6: 生成管理员密钥
echo -e "${YELLOW}步骤 6/6: 生成管理员密钥...${NC}"
ADMIN_KEY=$(openssl rand -hex 32 2>/dev/null || head -c 64 /dev/urandom | base64 | tr -d '\n/+=' | head -c 64)
echo "生成的管理员密钥: $ADMIN_KEY"
echo "请妥善保管此密钥，登录管理后台时需要使用"

# 更新 wrangler.toml
sed -i "s/ADMIN_KEY = \"your-secret-admin-key\"/ADMIN_KEY = \"$ADMIN_KEY\"/" wrangler.toml
echo -e "${GREEN}✓ 管理员密钥已配置${NC}"
echo ""

# 完成
echo "=========================================="
echo -e "${GREEN}  部署配置完成！${NC}"
echo "=========================================="
echo ""
echo "下一步操作:"
echo ""
echo "1. 本地开发:"
echo "   npm run dev          # 启动前端 (http://localhost:3000)"
echo "   npm run worker:dev   # 启动后端 API"
echo ""
echo "2. 构建和部署:"
echo "   npm run build        # 构建生产版本"
echo "   npm run worker:deploy # 部署到 Cloudflare"
echo ""
echo "3. 管理后台:"
echo "   访问: https://your-domain/admin"
echo "   密钥: $ADMIN_KEY"
echo ""
echo "4. 查看数据库:"
echo "   npx wrangler d1 execute $DB_NAME --remote --command='SELECT * FROM platforms'"
echo ""
echo "=========================================="
