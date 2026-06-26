# AI Price Compare Web

免费、开源的 AI 模型价格对比平台。

## 功能特性

- 🔍 **价格查询**: 浏览不同平台上 AI 模型的定价信息
- 📊 **跨平台对比**: 选择多个模型，查看各平台的价格差异
- 💰 **积分换算**: 自动将积分套餐换算成单位价格
- 👥 **众包数据**: 用户可以提交新价格，经审核后展示
- 🔍 **SEO 优化**: 搜索引擎友好的 SSR 渲染
- 📱 **响应式设计**: 支持移动端访问
- 🛡️ **管理后台**: 管理员审核用户提交

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | React 18 + Vite | 现代化前端框架 |
| UI | Tailwind CSS | 实用优先的 CSS 框架 |
| 后端 | Cloudflare Workers | 边缘计算 |
| 数据库 | Cloudflare D1 | SQLite 兼容数据库 |
| 缓存 | Cloudflare KV | 键值存储 |
| 部署 | Cloudflare Pages | 全球 CDN |

## 快速开始

### 一键部署 (推荐)

```bash
# Linux/macOS
bash scripts/setup.sh

# Windows
scripts\setup.bat
```

### 手动部署

```bash
# 1. 克隆项目
git clone https://github.com/your-username/ai-price-compare-web.git
cd ai-price-compare-web

# 2. 安装依赖
npm install

# 3. 登录 Cloudflare
npx wrangler login

# 4. 创建 D1 数据库
npx wrangler d1 create ai-price-compare

# 5. 更新 wrangler.toml 中的 database_id

# 6. 初始化数据库
npm run db:init

# 7. 导入示例数据
npm run db:seed

# 8. 启动开发服务器
npm run dev          # 前端
npm run worker:dev   # 后端
```

## 文档

- [快速开始](./docs/quick-start.md) - 30 秒快速体验
- [配置文档](./docs/configuration.md) - 详细的环境配置
- [部署指南](./docs/deployment.md) - 完整的部署流程
- [API 文档](./docs/api.md) - RESTful API 接口
- [数据库设计](./docs/database.md) - D1 数据库表结构
- [开发指南](./docs/development.md) - 本地开发环境

## 项目结构

```
ai-price-compare-web/
├── src/
│   ├── worker/          # Cloudflare Workers 后端
│   │   ├── index.ts     # Worker 入口
│   │   ├── routes/      # API 路由
│   │   └── utils/       # 工具函数
│   ├── frontend/        # React 前端
│   │   ├── pages/       # 页面组件
│   │   ├── components/  # 公共组件
│   │   └── hooks/       # 自定义 Hooks
│   └── shared/          # 前后端共享代码
├── migrations/          # 数据库迁移
├── tests/               # 测试文件
├── scripts/             # 部署脚本
├── docs/                # 文档
└── public/              # 静态资源
```

## API 接口

### 公开 API

- `GET /api/platforms` - 获取所有平台
- `GET /api/platforms/:id` - 获取平台详情
- `GET /api/models` - 获取所有模型
- `GET /api/models/:id` - 获取模型详情
- `GET /api/prices` - 价格查询
- `GET /api/prices/compare` - 价格对比
- `POST /api/submit` - 提交新价格

### 管理 API

需要 `X-Admin-Key` header 认证:

- `GET /api/admin/submissions` - 获取提交列表
- `PUT /api/admin/submissions/:id` - 审核提交
- `DELETE /api/admin/submissions/:id` - 删除提交
- `GET /api/admin/stats` - 获取统计数据

## 开发命令

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

# 数据库
npm run db:init          # 初始化数据库
npm run db:seed          # 导入示例数据
```

## SEO 特性

- 服务器端渲染 (SSR) - 搜索引擎可抓取
- 结构化数据 (JSON-LD)
- 动态 Meta 标签
- 自动生成的站点地图
- 语义化 URL

## 成本

- **免费额度内**: $0
- **超出后**: 约 $5-20/月

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request!

## 相关项目

- [Chrome 扩展版](https://github.com/homxuwang/AIPriceCompareTool)
