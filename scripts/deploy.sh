#!/bin/bash

# AI Price Compare Web - 一键部署到 Cloudflare
# 使用方法: bash deploy.sh

set -e

echo "=========================================="
echo "  AI Price Compare Web - 一键部署脚本"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 检查命令
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}错误: 未找到 $1，请先安装${NC}"
        exit 1
    fi
}

# 步骤显示
step() {
    echo ""
    echo -e "${BLUE}[$1/6] $2${NC}"
}

success() {
    echo -e "${GREEN}✓ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

error() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

# ==========================================
# 步骤 1: 检查环境
# ==========================================
step 1 "检查运行环境..."

check_command "node"
check_command "npm"

# 检查 wrangler，没有则安装
if ! command -v wrangler &> /dev/null; then
    warning "未找到 wrangler，正在安装..."
    npm install -g wrangler
    success "wrangler 安装完成"
fi

echo ""
echo "环境信息:"
echo "  Node.js: $(node --version)"
echo "  npm: $(npm --version)"
echo "  Wrangler: $(wrangler --version)"

# ==========================================
# 步骤 2: 安装依赖
# ==========================================
step 2 "安装项目依赖..."

if [ ! -d "node_modules" ]; then
    npm install
    success "依赖安装完成"
else
    success "依赖已存在，跳过安装"
fi

# ==========================================
# 步骤 3: 登录 Cloudflare
# ==========================================
step 3 "登录 Cloudflare..."

# 检查是否已登录
if wrangler whoami &> /dev/null; then
    success "已登录 Cloudflare"
    echo "  账号: $(wrangler whoami 2>&1 | head -1)"
else
    echo "请在浏览器中完成登录..."
    npx wrangler login
    success "Cloudflare 登录成功"
fi

# ==========================================
# 步骤 4: 创建/绑定 D1 数据库
# ==========================================
step 4 "配置 D1 数据库..."

# 检查是否已有数据库
EXISTING_DB=$(wrangler d1 list 2>/dev/null | grep "ai-price-compare" || true)

if [ -n "$EXISTING_DB" ]; then
    echo "检测到已有数据库:"
    echo "$EXISTING_DB"
    echo ""
    read -p "是否使用已有数据库? (y/n, 默认: y): " USE_EXISTING
    USE_EXISTING=${USE_EXISTING:-y}
    
    if [ "$USE_EXISTING" = "y" ] || [ "$USE_EXISTING" = "Y" ]; then
        # 提取已有数据库 ID
        DATABASE_ID=$(wrangler d1 list 2>/dev/null | grep "ai-price-compare" | awk '{print $1}' | head -1)
        success "使用已有数据库: $DATABASE_ID"
    else
        # 创建新数据库
        echo "正在创建新数据库..."
        DB_OUTPUT=$(wrangler d1 create ai-price-compare-web)
        DATABASE_ID=$(echo "$DB_OUTPUT" | grep -o 'database_id = "[^"]*"' | cut -d'"' -f2)
        success "数据库创建成功: $DATABASE_ID"
    fi
else
    echo "正在创建数据库..."
    DB_OUTPUT=$(wrangler d1 create ai-price-compare)
    DATABASE_ID=$(echo "$DB_OUTPUT" | grep -o 'database_id = "[^"]*"' | cut -d'"' -f2)
    
    if [ -z "$DATABASE_ID" ]; then
        error "数据库创建失败"
    fi
    
    success "数据库创建成功: $DATABASE_ID"
fi

# 更新 wrangler.toml
echo "正在更新配置..."
sed -i "s/database_id = \"[^\"]*\"/database_id = \"$DATABASE_ID\"/" wrangler.toml
success "wrangler.toml 已更新"

# ==========================================
# 步骤 5: 初始化数据库
# ==========================================
step 5 "初始化数据库..."

echo "创建表结构..."
wrangler d1 execute ai-price-compare --remote --file=./migrations/0001_init.sql
success "表结构创建成功"

read -p "是否导入示例数据? (y/n, 默认: y): " IMPORT_DATA
IMPORT_DATA=${IMPORT_DATA:-y}

if [ "$IMPORT_DATA" = "y" ] || [ "$IMPORT_DATA" = "Y" ]; then
    echo "导入示例数据..."
    wrangler d1 execute ai-price-compare --remote --file=./migrations/0002_seed.sql
    success "示例数据导入成功"
fi

# ==========================================
# 步骤 6: 部署到 Cloudflare
# ==========================================
step 6 "部署到 Cloudflare..."

echo "构建生产版本..."
npm run build
success "构建完成"

echo "部署 Worker..."
wrangler deploy
success "部署成功"

# 获取访问地址
WORKER_NAME=$(grep '^name' wrangler.toml | cut -d'"' -f2)
ACCOUNT_ID=$(wrangler whoami 2>&1 | grep -o 'Account ID: [^ ]*' | awk '{print $3}' || echo "")

if [ -n "$ACCOUNT_ID" ]; then
    ACCESS_URL="https://${WORKER_NAME}.${ACCOUNT_ID}.workers.dev"
else
    ACCESS_URL="https://${WORKER_NAME}.workers.dev"
fi

# ==========================================
# 完成
# ==========================================
echo ""
echo "=========================================="
echo -e "${GREEN}  部署成功！${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}访问地址:${NC}"
echo "  $ACCESS_URL"
echo ""
echo -e "${BLUE}管理后台:${NC}"
echo "  $ACCESS_URL/admin"
echo ""
echo -e "${BLUE}API 地址:${NC}"
echo "  $ACCESS_URL/api/platforms"
echo ""
echo -e "${YELLOW}提示:${NC}"
echo "  1. 首次访问可能需要等待几秒钟"
echo "  2. 管理后台需要输入管理员密钥"
echo "  3. 数据已预置 OpenAI、Anthropic、Google 的定价信息"
echo ""
echo -e "${BLUE}常用命令:${NC}"
echo "  查看日志: wrangler tail"
echo "  查看数据库: wrangler d1 execute ai-price-compare --remote --command='SELECT * FROM platforms'"
echo "  重新部署: npm run worker:deploy"
echo ""
echo "=========================================="
