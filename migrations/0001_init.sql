-- AI Price Compare Web 数据库初始化

-- 平台/网站
CREATE TABLE IF NOT EXISTS platforms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT,
  logo_url TEXT,
  default_currency TEXT DEFAULT 'USD',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 套餐
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  platform_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  currency TEXT NOT NULL,
  credit_amount REAL,
  billing_cycle TEXT DEFAULT 'one_time',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
);

-- 模型
CREATE TABLE IF NOT EXISTS models (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('text', 'image', 'video', 'audio')),
  provider TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 价格规则
CREATE TABLE IF NOT EXISTS rules (
  id TEXT PRIMARY KEY,
  platform_id TEXT NOT NULL,
  model_id TEXT NOT NULL,
  pricing_mode TEXT NOT NULL CHECK(pricing_mode IN ('plan_credit_based', 'direct_price_based')),
  currency TEXT NOT NULL,
  unit_definitions TEXT NOT NULL, -- JSON 数组
  notes TEXT,
  status TEXT DEFAULT 'approved' CHECK(status IN ('pending', 'approved', 'rejected')),
  submitted_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE,
  FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
);

-- 用户提交记录
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  platform_name TEXT NOT NULL,
  model_name TEXT NOT NULL,
  model_category TEXT NOT NULL,
  plan_name TEXT,
  plan_price REAL,
  plan_currency TEXT,
  plan_credit_amount REAL,
  pricing_mode TEXT NOT NULL,
  unit_definitions TEXT NOT NULL, -- JSON
  submitter_ip TEXT,
  submitter_note TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_rules_platform ON rules(platform_id);
CREATE INDEX IF NOT EXISTS idx_rules_model ON rules(model_id);
CREATE INDEX IF NOT EXISTS idx_rules_status ON rules(status);
CREATE INDEX IF NOT EXISTS idx_plans_platform ON plans(platform_id);
CREATE INDEX IF NOT EXISTS idx_models_category ON models(category);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
