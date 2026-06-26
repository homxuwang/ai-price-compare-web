# AI Price Compare Web - 部署指南

## 快速部署 (5 分钟)

### 前提条件

- [Cloudflare 账号](https://dash.cloudflare.com/sign-up) (免费)
- Node.js 18+ 安装

### 一键部署

**Linux/macOS:**

```bash
# 克隆项目
git clone https://github.com/your-username/ai-price-compare-web.git
cd ai-price-compare-web

# 运行部署脚本
bash scripts/setup.sh
```

**Windows:**

```bash
# 克隆项目
git clone https://github.com/your-username/ai-price-compare-web.git
cd ai-price-compare-web

# 运行部署脚本
scripts\setup.bat
```

### 手动部署

```bash
# 1. 安装依赖
npm install

# 2. 登录 Cloudflare
npx wrangler login

# 3. 创建数据库
npx wrangler d1 create ai-price-compare

# 4. 更新 wrangler.toml 中的 database_id

# 5. 初始化数据库
npm run db:init

# 6. 导入示例数据
npm run db:seed

# 7. 构建
npm run build

# 8. 部署
npm run worker:deploy
```

---

## 详细部署步骤

### 步骤 1: 环境准备

#### 安装 Node.js

```bash
# 使用 nvm (推荐)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# 验证安装
node --version  # 应显示 v20.x.x
npm --version   # 应显示 10.x.x
```

#### 安装 Wrangler

```bash
npm install -g wrangler
wrangler --version
```

### 步骤 2: Cloudflare 配置

#### 创建账号

1. 访问 [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. 填写邮箱和密码
3. 完成验证

#### 登录

```bash
npx wrangler login
```

浏览器会自动打开，点击 "Allow" 授权。

#### 获取 Account ID

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择任意域名 (或创建一个)
3. 在右侧边栏找到 "Account ID"
4. 复制保存

### 步骤 3: 创建数据库

```bash
# 创建 D1 数据库
npx wrangler d1 create ai-price-compare

# 输出示例:
# ✅ Successfully created DB 'ai-price-compare'
# 
# [[d1_databases]]
# binding = "DB"
# database_name = "ai-price-compare"  
# database_id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

**重要:** 记录输出的 `database_id`，后面需要使用。

### 步骤 4: 更新配置

编辑 `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "ai-price-compare"
database_id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"  # 替换为你的 ID
```

### 步骤 5: 初始化数据库

```bash
# 创建表结构
npm run db:init

# 导入示例数据 (可选，但推荐)
npm run db:seed
```

### 步骤 6: 本地测试

```bash
# 终端 1: 启动前端
npm run dev

# 终端 2: 启动后端
npm run worker:dev
```

访问 http://localhost:3000 测试。

### 步骤 7: 构建和部署

```bash
# 构建生产版本
npm run build

# 部署到 Cloudflare
npm run worker:deploy
```

部署完成后会显示访问 URL，类似:
```
https://ai-price-compare.your-subdomain.workers.dev
```

---

## 配置自定义域名

### 方法 1: 使用 Cloudflare DNS

1. 登录 Cloudflare Dashboard
2. 进入 Workers & Pages
3. 选择你的项目
4. 点击 "Custom domains"
5. 输入域名 (如 `price.yourdomain.com`)
6. 点击 "Add domain"

### 方法 2: 手动配置

1. 在 Cloudflare Dashboard 中添加域名
2. 获取 Workers URL (如 `ai-price-compare.your-subdomain.workers.dev`)
3. 添加 CNAME 记录:

```
类型: CNAME
名称: price (或 @)
目标: ai-price-compare.your-subdomain.workers.dev
代理状态: 已代理
```

---

## 环境变量配置

### 本地开发

创建 `.env` 文件:

```env
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
D1_DATABASE_ID=your-database-id
ADMIN_KEY=your-admin-key
```

### 生产环境

在 Cloudflare Dashboard 中配置:

1. 进入 Workers & Pages > 你的项目
2. 点击 Settings
3. 选择 Environment variables
4. 添加变量:

| 变量 | 值 | 环境 |
|------|-----|------|
| ADMIN_KEY | your-admin-key | Production |

---

## 数据库管理

### 查看数据

```bash
# 查看所有平台
npx wrangler d1 execute ai-price-compare --remote --command="SELECT * FROM platforms"

# 查看待审核提交
npx wrangler d1 execute ai-price-compare --remote --command="SELECT COUNT(*) as pending FROM submissions WHERE status='pending'"
```

### 备份数据

```bash
# 导出数据库
npx wrangler d1 export ai-price-compare --output backup.sql
```

### 恢复数据

```bash
# 导入数据库
npx wrangler d1 execute ai-price-compare --remote --file=backup.sql
```

---

## 监控和日志

### 查看实时日志

```bash
npx wrangler tail
```

### 查看分析

1. 登录 Cloudflare Dashboard
2. 进入 Workers & Pages
3. 选择你的项目
4. 点击 Analytics

### 设置告警

1. 进入 Workers & Pages > 你的项目
2. 点击 Triggers
3. 配置 Cron Triggers (定时任务)

---

## 故障排除

### 问题: 部署失败

```bash
# 检查配置
npx wrangler whoami
npx wrangler d1 list

# 重新部署
npm run build
npm run worker:deploy
```

### 问题: 数据库连接失败

```bash
# 验证数据库
npx wrangler d1 execute ai-price-compare --remote --command="SELECT 1"

# 检查 wrangler.toml 中的 database_id
cat wrangler.toml
```

### 问题: 404 错误

1. 确认已运行 `npm run build`
2. 检查 `wrangler.toml` 中的 `assets.directory`
3. 查看 Cloudflare Dashboard 中的部署状态

### 问题: 样式丢失

1. 确认 Tailwind CSS 配置正确
2. 检查 `tailwind.config.js` 中的 `content` 配置
3. 重新构建: `npm run build`

---

## 成本估算

### 免费额度

| 服务 | 免费额度 | 说明 |
|------|----------|------|
| Workers | 100,000 请求/天 | 超出后 $0.50/百万请求 |
| D1 | 5 GB 存储 | 超出后 $0.75/GB/月 |
| KV | 10 GB 存储 | 超出后 $0.50/GB/月 |

### 预估成本

- **个人项目**: $0 (免费额度内)
- **小型团队**: $5-20/月
- **中型项目**: $20-100/月

---

## 相关命令

```bash
# 开发
npm run dev              # 启动前端开发服务器
npm run worker:dev       # 启动后端 API

# 构建
npm run build            # 构建生产版本
npm run preview          # 预览生产版本

# 测试
npm test                 # 运行测试
npm run test:watch       # 监听模式测试

# 部署
npm run worker:deploy    # 部署到 Cloudflare
npx wrangler tail        # 查看实时日志

# 数据库
npm run db:init          # 初始化数据库
npm run db:seed          # 导入示例数据
```
