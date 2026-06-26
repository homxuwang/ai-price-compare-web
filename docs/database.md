# AI Price Compare Web - 数据库设计文档

## 概述

使用 Cloudflare D1 (SQLite 兼容) 作为主数据库。

---

## 表结构

### 1. platforms (平台表)

存储 AI 服务平台信息。

```sql
CREATE TABLE platforms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  website_url TEXT,
  logo_url TEXT,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

**字段说明:**

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| id | INTEGER | 是 | 主键 |
| name | TEXT | 是 | 平台名称 |
| slug | TEXT | 是 | URL 友好的标识符 |
| website_url | TEXT | 否 | 官网地址 |
| logo_url | TEXT | 否 | Logo 图片地址 |
| description | TEXT | 否 | 平台描述 |
| created_at | TEXT | 否 | 创建时间 |
| updated_at | TEXT | 否 | 更新时间 |

---

### 2. models (模型表)

存储 AI 模型信息。

```sql
CREATE TABLE models (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('text', 'image', 'video', 'audio')),
  provider TEXT,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

**字段说明:**

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| id | INTEGER | 是 | 主键 |
| name | TEXT | 是 | 模型名称 |
| slug | TEXT | 是 | URL 友好的标识符 |
| type | TEXT | 是 | 模型类型 (text/image/video/audio) |
| provider | TEXT | 否 | 提供商 |
| description | TEXT | 否 | 模型描述 |
| created_at | TEXT | 否 | 创建时间 |
| updated_at | TEXT | 否 | 更新时间 |

---

### 3. plans (套餐表)

存储各平台的积分套餐信息。

```sql
CREATE TABLE plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  credits INTEGER,
  price REAL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
);
```

**字段说明:**

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| id | INTEGER | 是 | 主键 |
| platform_id | INTEGER | 是 | 所属平台 ID |
| name | TEXT | 是 | 套餐名称 |
| credits | INTEGER | 否 | 积分数量 |
| price | REAL | 否 | 价格 |
| currency | TEXT | 否 | 货币类型 (默认 USD) |
| description | TEXT | 否 | 套餐描述 |
| created_at | TEXT | 否 | 创建时间 |
| updated_at | TEXT | 否 | 更新时间 |

---

### 4. rules (定价规则表)

存储模型的定价规则。

```sql
CREATE TABLE rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform_id INTEGER NOT NULL,
  model_id INTEGER NOT NULL,
  plan_id INTEGER,
  input_price REAL,
  output_price REAL,
  unit TEXT DEFAULT '1K tokens',
  credits_consumed INTEGER DEFAULT 1,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE,
  FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE SET NULL
);
```

**字段说明:**

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| id | INTEGER | 是 | 主键 |
| platform_id | INTEGER | 是 | 平台 ID |
| model_id | INTEGER | 是 | 模型 ID |
| plan_id | INTEGER | 否 | 套餐 ID |
| input_price | REAL | 否 | 输入价格 |
| output_price | REAL | 否 | 输出价格 |
| unit | TEXT | 否 | 计价单位 (默认 1K tokens) |
| credits_consumed | INTEGER | 否 | 消耗积分 (默认 1) |
| notes | TEXT | 否 | 备注 |
| created_at | TEXT | 否 | 创建时间 |
| updated_at | TEXT | 否 | 更新时间 |

---

### 5. submissions (提交表)

存储用户提交的定价信息。

```sql
CREATE TABLE submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform_name TEXT NOT NULL,
  model_name TEXT NOT NULL,
  model_type TEXT NOT NULL CHECK(model_type IN ('text', 'image', 'video', 'audio')),
  plan_name TEXT,
  input_price REAL,
  output_price REAL,
  currency TEXT DEFAULT 'USD',
  unit TEXT DEFAULT '1K tokens',
  credits_consumed INTEGER DEFAULT 1,
  source_url TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  reviewed_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

**字段说明:**

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| id | INTEGER | 是 | 主键 |
| platform_name | TEXT | 是 | 平台名称 |
| model_name | TEXT | 是 | 模型名称 |
| model_type | TEXT | 是 | 模型类型 |
| plan_name | TEXT | 否 | 套餐名称 |
| input_price | REAL | 否 | 输入价格 |
| output_price | REAL | 否 | 输出价格 |
| currency | TEXT | 否 | 货币类型 |
| unit | TEXT | 否 | 计价单位 |
| credits_consumed | INTEGER | 否 | 消耗积分 |
| source_url | TEXT | 否 | 价格来源 URL |
| notes | TEXT | 否 | 备注 |
| status | TEXT | 否 | 状态 (pending/approved/rejected) |
| reviewed_at | TEXT | 否 | 审核时间 |
| created_at | TEXT | 否 | 创建时间 |
| updated_at | TEXT | 否 | 更新时间 |

---

## 索引

```sql
-- platforms
CREATE INDEX idx_platforms_slug ON platforms(slug);

-- models
CREATE INDEX idx_models_slug ON models(slug);
CREATE INDEX idx_models_type ON models(type);

-- plans
CREATE INDEX idx_plans_platform_id ON plans(platform_id);

-- rules
CREATE INDEX idx_rules_platform_id ON rules(platform_id);
CREATE INDEX idx_rules_model_id ON rules(model_id);
CREATE INDEX idx_rules_plan_id ON rules(plan_id);

-- submissions
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_created_at ON submissions(created_at);
```

---

## 关系图

```
┌─────────────┐
│  platforms  │
└──────┬──────┘
       │
       ├───┬─────┐
       │   │     │
       ▼   ▼     ▼
┌──────┐ ┌──────┐ ┌─────────────┐
│ plans│ │rules │ │ submissions │
└──────┘ └──────┘ └─────────────┘
       │
       ▼
┌─────────────┐
│   models    │
└─────────────┘
```

---

## 数据流

### 1. 用户提交价格

```
用户 → POST /api/submit → submissions (status='pending')
```

### 2. 管理员审核

```
管理员 → PUT /api/admin/submissions/:id → submissions (status='approved')
                                          ↓
                              自动创建: platforms, models, plans, rules
```

### 3. 价格查询

```
用户 → GET /api/prices → rules + platforms + models → 返回价格列表
```

### 4. 价格对比

```
用户 → GET /api/prices/compare → rules + platforms + models → 返回对比结果
```

---

## 查询示例

### 查询所有平台及其模型数量

```sql
SELECT 
  p.*,
  COUNT(DISTINCT r.model_id) as model_count
FROM platforms p
LEFT JOIN rules r ON p.id = r.platform_id
GROUP BY p.id;
```

### 查询模型在各平台的价格

```sql
SELECT 
  m.name as model_name,
  p.name as platform_name,
  r.input_price,
  r.output_price,
  r.unit
FROM rules r
JOIN models m ON r.model_id = m.id
JOIN platforms p ON r.platform_id = p.id
WHERE m.id = 1;
```

### 查询待审核提交数量

```sql
SELECT COUNT(*) as pending_count
FROM submissions
WHERE status = 'pending';
```

### 查询价格排名

```sql
SELECT 
  m.name as model_name,
  p.name as platform_name,
  (r.input_price + r.output_price) / 2 as avg_price,
  RANK() OVER (PARTITION BY r.model_id ORDER BY (r.input_price + r.output_price) / 2) as rank
FROM rules r
JOIN models m ON r.model_id = m.id
JOIN platforms p ON r.platform_id = p.id;
```

---

## 数据迁移

### 初始化数据库

```bash
npx wrangler d1 execute ai-price-compare --remote --file=./migrations/0001_init.sql
```

### 导入示例数据

```bash
npx wrangler d1 execute ai-price-compare --remote --file=./migrations/0002_seed.sql
```

### 备份数据库

```bash
npx wrangler d1 export ai-price-compare --output backup.sql
```

### 恢复数据库

```bash
npx wrangler d1 execute ai-price-compare --remote --file=backup.sql
```

---

## 性能优化

### 索引优化

确保常用查询字段有索引:

- `platforms.slug`
- `models.slug`
- `models.type`
- `rules.platform_id`
- `rules.model_id`
- `submissions.status`

### 查询优化

1. 使用 `SELECT` 指定字段，避免 `SELECT *`
2. 使用 `JOIN` 替代子查询
3. 使用 `LIMIT` 限制返回数量
4. 使用 `EXPLAIN` 分析查询计划
