# AI Price Compare Web - API 文档

## 基础信息

- **基础 URL**: `https://your-domain.workers.dev/api`
- **请求格式**: JSON
- **响应格式**: JSON
- **认证方式**: 部分接口需要 `X-Admin-Key` header

---

## 公开 API

### 1. 获取所有平台

```
GET /api/platforms
```

**响应:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "OpenAI",
      "slug": "openai",
      "website_url": "https://openai.com",
      "logo_url": "https://...",
      "description": "OpenAI 是领先的人工智能研究公司",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 2. 获取平台详情

```
GET /api/platforms/:id
```

**参数:**

- `id` (路径参数): 平台 ID

**响应:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "OpenAI",
    "slug": "openai",
    "website_url": "https://openai.com",
    "logo_url": "https://...",
    "description": "OpenAI 是领先的人工智能研究公司",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 3. 获取所有模型

```
GET /api/models
```

**查询参数:**

- `type` (可选): 模型类型 (text/image/video/audio)

**响应:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "GPT-4o",
      "slug": "gpt-4o",
      "type": "text",
      "provider": "OpenAI",
      "description": "最强大的多模态模型",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 4. 获取模型详情

```
GET /api/models/:id
```

**参数:**

- `id` (路径参数): 模型 ID

**响应:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "GPT-4o",
    "slug": "gpt-4o",
    "type": "text",
    "provider": "OpenAI",
    "description": "最强大的多模态模型",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 5. 价格查询

```
GET /api/prices
```

**查询参数:**

- `platform_id` (可选): 平台 ID
- `model_id` (可选): 模型 ID

**响应:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "platform_id": 1,
      "platform_name": "OpenAI",
      "model_id": 1,
      "model_name": "GPT-4o",
      "plan_name": "标准套餐",
      "input_price": 0.005,
      "output_price": 0.015,
      "currency": "USD",
      "unit": "1K tokens",
      "credits_consumed": 1,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 6. 价格对比

```
GET /api/prices/compare
```

**查询参数:**

- `model_ids` (必填): 模型 ID 列表，逗号分隔

**响应:**

```json
{
  "success": true,
  "data": {
    "models": [
      {
        "id": 1,
        "name": "GPT-4o",
        "type": "text"
      }
    ],
    "prices": [
      {
        "platform_id": 1,
        "platform_name": "OpenAI",
        "model_id": 1,
        "model_name": "GPT-4o",
        "input_price": 0.005,
        "output_price": 0.015,
        "unit_price": 0.01,
        "currency": "USD"
      }
    ],
    "ranking": [
      {
        "model_id": 1,
        "model_name": "GPT-4o",
        "platform_id": 1,
        "platform_name": "OpenAI",
        "unit_price": 0.01,
        "rank": 1
      }
    ]
  }
}
```

---

## 提交 API

### 7. 提交新价格

```
POST /api/submit
```

**请求体:**

```json
{
  "platform_name": "OpenAI",
  "model_name": "GPT-4o",
  "model_type": "text",
  "plan_name": "标准套餐",
  "input_price": 0.005,
  "output_price": 0.015,
  "currency": "USD",
  "unit": "1K tokens",
  "credits_consumed": 1,
  "source_url": "https://openai.com/pricing",
  "notes": "官方价格页面"
}
```

**响应:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "pending",
    "message": "提交成功，等待管理员审核"
  }
}
```

---

## 管理 API

需要 `X-Admin-Key` header 认证。

### 8. 获取提交列表

```
GET /api/admin/submissions
```

**Headers:**

- `X-Admin-Key`: 管理员密钥

**查询参数:**

- `status` (可选): 状态筛选 (pending/approved/rejected)

**响应:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "platform_name": "OpenAI",
      "model_name": "GPT-4o",
      "model_type": "text",
      "plan_name": "标准套餐",
      "input_price": 0.005,
      "output_price": 0.015,
      "currency": "USD",
      "unit": "1K tokens",
      "credits_consumed": 1,
      "source_url": "https://openai.com/pricing",
      "notes": "官方价格页面",
      "status": "pending",
      "reviewed_at": null,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 9. 审核提交

```
PUT /api/admin/submissions/:id
```

**Headers:**

- `X-Admin-Key`: 管理员密钥

**参数:**

- `id` (路径参数): 提交 ID

**请求体:**

```json
{
  "status": "approved",
  "notes": "审核通过"
}
```

**响应:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "approved",
    "message": "审核成功"
  }
}
```

### 10. 删除提交

```
DELETE /api/admin/submissions/:id
```

**Headers:**

- `X-Admin-Key`: 管理员密钥

**参数:**

- `id` (路径参数): 提交 ID

**响应:**

```json
{
  "success": true,
  "data": {
    "message": "删除成功"
  }
}
```

### 11. 获取统计数据

```
GET /api/admin/stats
```

**Headers:**

- `X-Admin-Key`: 管理员密钥

**响应:**

```json
{
  "success": true,
  "data": {
    "platforms": 10,
    "models": 50,
    "rules": 200,
    "submissions": {
      "total": 100,
      "pending": 10,
      "approved": 80,
      "rejected": 10
    }
  }
}
```

---

## 其他 API

### 12. 获取站点地图

```
GET /sitemap.xml
```

**响应:** XML 格式的站点地图

### 13. 获取 robots.txt

```
GET /robots.txt
```

**响应:** robots.txt 文件内容

---

## 错误响应

所有错误响应格式:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "资源不存在"
  }
}
```

### 错误码

| 错误码 | HTTP 状态码 | 说明 |
|--------|-------------|------|
| `NOT_FOUND` | 404 | 资源不存在 |
| `VALIDATION_ERROR` | 400 | 参数验证失败 |
| `UNAUTHORIZED` | 401 | 未授权 |
| `FORBIDDEN` | 403 | 禁止访问 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |

---

## 请求示例

### 使用 curl

```bash
# 获取所有平台
curl https://your-domain.workers.dev/api/platforms

# 获取模型详情
curl https://your-domain.workers.dev/api/models/1

# 价格对比
curl "https://your-domain.workers.dev/api/prices/compare?model_ids=1,2,3"

# 提交新价格
curl -X POST https://your-domain.workers.dev/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "platform_name": "OpenAI",
    "model_name": "GPT-4o",
    "model_type": "text",
    "plan_name": "标准套餐",
    "input_price": 0.005,
    "output_price": 0.015,
    "currency": "USD",
    "unit": "1K tokens",
    "credits_consumed": 1,
    "source_url": "https://openai.com/pricing"
  }'

# 管理员获取提交列表
curl https://your-domain.workers.dev/api/admin/submissions \
  -H "X-Admin-Key: your-admin-key"
```

### 使用 JavaScript

```javascript
// 获取所有平台
const response = await fetch('https://your-domain.workers.dev/api/platforms');
const data = await response.json();
console.log(data);

// 价格对比
const compareResponse = await fetch(
  'https://your-domain.workers.dev/api/prices/compare?model_ids=1,2,3'
);
const compareData = await compareResponse.json();
console.log(compareData);
```
