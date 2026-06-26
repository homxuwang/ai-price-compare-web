# AI Price Compare Web - 开发指南

## 环境搭建

### 1. 安装必要软件

```bash
# Node.js (推荐使用 nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Wrangler (Cloudflare CLI)
npm install -g wrangler

# 验证安装
node --version
npm --version
wrangler --version
```

### 2. 克隆项目

```bash
git clone https://github.com/your-username/ai-price-compare-web.git
cd ai-price-compare-web
```

### 3. 安装依赖

```bash
npm install
```

### 4. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 Cloudflare 配置。

### 5. 初始化数据库

```bash
# 登录 Cloudflare
npx wrangler login

# 创建 D1 数据库
npx wrangler d1 create ai-price-compare

# 更新 wrangler.toml 中的 database_id

# 初始化数据库
npm run db:init

# 导入示例数据
npm run db:seed
```

---

## 开发流程

### 启动开发服务器

```bash
# 终端 1: 启动前端
npm run dev

# 终端 2: 启动后端
npm run worker:dev
```

前端地址: http://localhost:3000
后端地址: http://localhost:8787

### 项目结构

```
src/
├── worker/              # Cloudflare Workers 后端
│   ├── index.ts         # Worker 入口
│   ├── routes/          # API 路由
│   ├── db/              # 数据库操作
│   └── utils/           # 工具函数
├── frontend/            # React 前端
│   ├── pages/           # 页面组件
│   ├── components/      # 公共组件
│   ├── hooks/           # 自定义 Hooks
│   └── styles/          # 样式文件
└── shared/              # 前后端共享代码
    ├── types.ts         # 类型定义
    └── constants.ts     # 常量定义
```

---

## 代码规范

### TypeScript

```typescript
// 使用严格模式
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### React 组件

```typescript
// 使用函数组件和 Hooks
import React, { useState, useEffect } from 'react';

interface Props {
  title: string;
  onSubmit: (data: FormData) => void;
}

export const MyComponent: React.FC<Props> = ({ title, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  
  return (
    <div>
      <h1>{title}</h1>
      {/* ... */}
    </div>
  );
};
```

### API 路由

```typescript
// 使用 Hono 框架
import { Hono } from 'hono';

const app = new Hono();

app.get('/api/platforms', async (c) => {
  const platforms = await getPlatforms();
  return c.json({ success: true, data: platforms });
});

export default app;
```

---

## 测试

### 运行测试

```bash
# 运行所有测试
npm test

# 监听模式
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

### 编写测试

```typescript
// tests/calc.test.ts
import { describe, it, expect } from 'vitest';
import { calculateUnitPrice } from '../src/worker/utils/calc';

describe('calculateUnitPrice', () => {
  it('should calculate unit price correctly', () => {
    const result = calculateUnitPrice({
      input_price: 0.005,
      output_price: 0.015,
      credits_consumed: 1
    });
    
    expect(result).toBe(0.01);
  });
});
```

---

## 构建和部署

### 构建生产版本

```bash
npm run build
```

### 部署到 Cloudflare

```bash
npm run worker:deploy
```

### 本地预览

```bash
npm run preview
```

---

## 调试

### 前端调试

1. 使用浏览器开发者工具
2. 使用 React Developer Tools 扩展
3. 查看控制台日志

### 后端调试

```bash
# 查看实时日志
npx wrangler tail

# 本地调试
npm run worker:dev
```

### 数据库调试

```bash
# 查询数据
npx wrangler d1 execute ai-price-compare --remote --command="SELECT * FROM platforms"

# 导出数据
npx wrangler d1 export ai-price-compare --output debug.sql
```

---

## 常见问题

### Q: 前端无法连接后端

检查:
1. 后端是否启动 (`npm run worker:dev`)
2. 端口是否正确 (默认 8787)
3. CORS 配置是否正确

### Q: 数据库连接失败

检查:
1. 是否已登录 Cloudflare (`npx wrangler whoami`)
2. `wrangler.toml` 中的 `database_id` 是否正确
3. 数据库是否已初始化

### Q: 构建失败

检查:
1. Node.js 版本是否 >= 18
2. 依赖是否完整 (`npm install`)
3. TypeScript 类型是否正确

### Q: 部署后 404

检查:
1. 是否已运行 `npm run build`
2. `wrangler.toml` 中的 `assets.directory` 是否正确
3. Cloudflare Dashboard 中的部署状态

---

## 贡献指南

### 提交 PR

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### Commit 规范

使用 [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建/工具相关

### 代码审查

所有 PR 需要至少一个维护者审查后才能合并。
