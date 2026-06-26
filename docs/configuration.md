# AI Price Compare Web - 配置文档

## 目录

1. [环境要求](#环境要求)
2. [项目配置](#项目配置)
3. [Cloudflare 配置](#cloudflare-配置)
4. [数据库配置](#数据库配置)
5. [环境变量](#环境变量)
6. [部署配置](#部署配置)
7. [域名配置](#域名配置)
8. [常见问题](#常见问题)

---

## 环境要求

### 必需软件

| 软件 | 版本 | 说明 |
|------|------|------|
| Node.js | >= 18.0.0 | JavaScript 运行时 |
| npm | >= 9.0.0 | 包管理器 |
| Wrangler | >= 3.0.0 | Cloudflare CLI 工具 |

### 可选软件

| 软件 | 说明 |
|------|------|
| Git | 版本控制 |
| VS Code | 代码编辑器 |

### 安装 Node.js

```bash
# 使用 nvm (推荐)
nvm install 20
nvm use 20

# 或直接下载
# https://nodejs.org/
```

### 安装 Wrangler

```bash
npm install -g wrangler
```

---

## 项目配置

### 克隆项目

```bash
git clone https://github.com/your-username/ai-price-compare-web.git
cd ai-price-compare-web
```

### 安装依赖

```bash
npm install
```

### 配置文件说明

| 文件 | 说明 |
|------|------|
| `wrangler.toml` | Cloudflare Workers 配置 |
| `vite.config.ts` | Vite 构建配置 |
| `tailwind.config.js` | Tailwind CSS 配置 |
| `tsconfig.json` | TypeScript 配置 |
| `vitest.config.ts` | 测试配置 |

---

## Cloudflare 配置

### 1. 创建 Cloudflare 账号

访问 [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) 注册账号。

### 2. 登录 Wrangler

```bash
npx wrangler login
```

浏览器会打开 Cloudflare 授权页面，点击授权即可。

### 3. 验证登录

```bash
npx wrangler whoami
```

---

## 数据库配置

### 1. 创建 D1 数据库

```bash
# 创建生产数据库
npx wrangler d1 create ai-price-compare

# 输出示例:
# ✅ Successfully created DB 'ai-price-compare'
# [[d1_databases]]
# binding = "DB"
# database_name = "ai-price-compare"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 2. 更新配置文件

将输出的 `database_id` 更新到 `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "ai-price-compare"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 3. 初始化数据库表

```bash
# 生产环境
npx wrangler d1 execute ai-price-compare --remote --file=./migrations/0001_init.sql

# 本地开发
npx wrangler d1 execute ai-price-compare --local --file=./migrations/0001_init.sql
```

### 4. 导入示例数据 (可选)

```bash
# 生产环境
npx wrangler d1 execute ai-price-compare --remote --file=./migrations/0002_seed.sql

# 本地开发
npx wrangler d1 execute ai-price-compare --local --file=./migrations/0002_seed.sql
```

### 5. 验证数据库

```bash
# 查询平台数据
npx wrangler d1 execute ai-price-compare --remote --command="SELECT * FROM platforms"

# 查询模型数据
npx wrangler d1 execute ai-price-compare --remote --command="SELECT * FROM models"
```

---

## 环境变量

### 本地开发

创建 `.env` 文件:

```bash
cp .env.example .env
```

编辑 `.env`:

```env
# Cloudflare 配置
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token

# D1 数据库
D1_DATABASE_ID=your-database-id

# KV 命名空间
KV_NAMESPACE_ID=your-kv-id

# 管理员密钥
ADMIN_KEY=your-secret-admin-key

# 站点配置
SITE_URL=http://localhost:3000
```

### 生产环境

在 Cloudflare Dashboard 中配置:

1. 进入 Workers & Pages
2. 选择你的项目
3. 进入 Settings > Environment variables
4. 添加生产环境变量

### 变量说明

| 变量 | 必需 | 说明 |
|------|------|------|
| `CLOUDFLARE_ACCOUNT_ID` | 是 | Cloudflare 账号 ID |
| `CLOUDFLARE_API_TOKEN` | 是 | Cloudflare API Token |
| `D1_DATABASE_ID` | 是 | D1 数据库 ID |
| `KV_NAMESPACE_ID` | 否 | KV 命名空间 ID |
| `ADMIN_KEY` | 是 | 管理员密钥 (用于管理后台) |
| `SITE_URL` | 否 | 站点 URL |

---

## 部署配置

### 本地开发

```bash
# 启动前端开发服务器
npm run dev

# 启动后端 API (另一个终端)
npm run worker:dev
```

### 构建生产版本

```bash
npm run build
```

### 部署到 Cloudflare

```bash
npm run worker:deploy
```

### 一键部署

```bash
# Linux/macOS
bash scripts/setup.sh

# Windows
scripts\setup.bat
```

---

## 域名配置

### 1. 添加自定义域名

1. 登录 Cloudflare Dashboard
2. 进入 Workers & Pages
3. 选择你的项目
4. 进入 Custom domains
5. 点击 "Set up a domain"
6. 输入你的域名

### 2. 配置 DNS

如果域名使用 Cloudflare DNS:

```
类型: CNAME
名称: @ 或子域名
目标: your-project.workers.dev
代理状态: 已代理
```

### 3. SSL/TLS

Cloudflare 自动配置 SSL 证书，无需额外设置。

---

## 常见问题

### Q: 如何查看数据库数据?

```bash
# 查询所有平台
npx wrangler d1 execute ai-price-compare --remote --command="SELECT * FROM platforms"

# 查询所有模型
npx wrangler d1 execute ai-price-compare --remote --command="SELECT * FROM models"

# 查询待审核提交
npx wrangler d1 execute ai-price-compare --remote --command="SELECT * FROM submissions WHERE status='pending'"
```

### Q: 如何重置数据库?

```bash
# 删除并重新创建
npx wrangler d1 delete ai-price-compare
npx wrangler d1 create ai-price-compare

# 重新初始化
npx wrangler d1 execute ai-price-compare --remote --file=./migrations/0001_init.sql
npx wrangler d1 execute ai-price-compare --remote --file=./migrations/0002_seed.sql
```

### Q: 如何查看 Worker 日志?

```bash
npx wrangler tail
```

### Q: 如何回滚部署?

在 Cloudflare Dashboard 中:
1. 进入 Workers & Pages
2. 选择你的项目
3. 进入 Deployments
4. 找到要回滚的版本
5. 点击 "Rollback to this deployment"

### Q: 如何配置环境变量?

本地开发: 编辑 `.env` 文件
生产环境: 在 Cloudflare Dashboard > Settings > Environment variables 中配置

### Q: 部署后访问 404 怎么办?

1. 检查 `wrangler.toml` 中的 `assets.directory` 是否正确
2. 确保已运行 `npm run build`
3. 检查 Cloudflare Dashboard 中的部署状态

### Q: 如何启用分析?

1. 在 Cloudflare Dashboard 中进入 Workers & Pages
2. 选择你的项目
3. 进入 Analytics
4. 启用 Web Analytics

---

## 相关资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Vite 文档](https://vitejs.dev/)
- [React 文档](https://react.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
