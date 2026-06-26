# AI Price Compare Web - 快速开始

## 30 秒快速体验

```bash
# 克隆项目
git clone https://github.com/your-username/ai-price-compare-web.git
cd ai-price-compare-web

# 一键部署到 Cloudflare
npm run deploy        # Linux/macOS
npm run deploy:win    # Windows
```

---

## 功能特性

- 🔍 **价格查询**: 浏览不同平台上 AI 模型的定价信息
- 📊 **跨平台对比**: 选择多个模型，查看各平台的价格差异
- 💰 **积分换算**: 自动将积分套餐换算成单位价格
- 👥 **众包数据**: 用户可以提交新价格，经审核后展示
- 🔍 **SEO 优化**: 搜索引擎友好的 SSR 渲染
- 📱 **响应式设计**: 支持移动端访问

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + Vite + Tailwind CSS |
| 后端 | Cloudflare Workers |
| 数据库 | Cloudflare D1 |
| 部署 | Cloudflare Pages |

---

## 命令参考

```bash
# 一键部署
npm run deploy            # Linux/macOS
npm run deploy:win        # Windows

# 开发
npm run dev               # 启动前端
npm run worker:dev        # 启动后端

# 数据库
npm run db:init           # 初始化本地数据库
npm run db:seed           # 导入示例数据

# 测试
npm test                  # 运行测试

# 部署
npm run worker:deploy     # 部署到 Cloudflare
```

---

## 部署后

- **访问地址**: `https://ai-price-compare.workers.dev`
- **管理后台**: `https://ai-price-compare.workers.dev/admin`
- **API 地址**: `https://ai-price-compare.workers.dev/api/platforms`

---

## 更多文档

- [配置文档](./docs/configuration.md)
- [部署指南](./docs/deployment.md)
- [API 文档](./docs/api.md)
