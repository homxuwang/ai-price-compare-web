-- AI Price Compare Web - 示例数据

-- 插入平台
INSERT INTO platforms (id, name, url, default_currency, notes) VALUES
('platform-openai', 'OpenAI', 'https://openai.com', 'USD', 'OpenAI 官方平台'),
('platform-anthropic', 'Anthropic', 'https://anthropic.com', 'USD', 'Claude 开发商'),
('platform-google', 'Google AI', 'https://ai.google.dev', 'USD', 'Google AI 平台');

-- 插入套餐
INSERT INTO plans (id, platform_id, name, price, currency, credit_amount, billing_cycle) VALUES
('plan-openai-free', 'platform-openai', 'Free Tier', 0, 'USD', 0, 'monthly'),
('plan-openai-pay', 'platform-openai', 'Pay-as-you-go', 0, 'USD', NULL, 'custom'),
('plan-anthropic', 'platform-anthropic', 'Claude Pro', 20, 'USD', NULL, 'monthly'),
('plan-google-free', 'platform-google', 'Free Tier', 0, 'USD', 0, 'monthly');

-- 插入模型
INSERT INTO models (id, name, category, provider, description) VALUES
('model-gpt-4o', 'GPT-4o', 'text', 'OpenAI', '多模态旗舰模型'),
('model-gpt-4o-mini', 'GPT-4o Mini', 'text', 'OpenAI', '轻量级文本模型'),
('model-claude-3.5', 'Claude 3.5 Sonnet', 'text', 'Anthropic', '高效文本模型'),
('model-gemini-1.5', 'Gemini 1.5 Pro', 'text', 'Google', '长上下文模型'),
('model-dall-e-3', 'DALL-E 3', 'image', 'OpenAI', '图片生成模型'),
('model-gpt-image-1', 'GPT Image 1', 'image', 'OpenAI', '新一代图片模型');

-- 插入价格规则
INSERT INTO rules (id, platform_id, model_id, pricing_mode, currency, unit_definitions, status) VALUES
('rule-openai-gpt4o', 'platform-openai', 'model-gpt-4o', 'direct_price_based', 'USD',
 '[{"unitType":"per_1k_input_tokens","value":0.0025},{"unitType":"per_1k_output_tokens","value":0.01}]',
 'approved'),
('rule-openai-gpt4o-mini', 'platform-openai', 'model-gpt-4o-mini', 'direct_price_based', 'USD',
 '[{"unitType":"per_1k_input_tokens","value":0.00015},{"unitType":"per_1k_output_tokens","value":0.0006}]',
 'approved'),
('rule-anthropic-claude35', 'platform-anthropic', 'model-claude-3.5', 'direct_price_based', 'USD',
 '[{"unitType":"per_1k_input_tokens","value":0.003},{"unitType":"per_1k_output_tokens","value":0.015}]',
 'approved'),
('rule-google-gemini15', 'platform-google', 'model-gemini-1.5', 'direct_price_based', 'USD',
 '[{"unitType":"per_1k_input_tokens","value":0.00125},{"unitType":"per_1k_output_tokens","value":0.005}]',
 'approved'),
('rule-openai-dall-e-3', 'platform-openai', 'model-dall-e-3', 'direct_price_based', 'USD',
 '[{"unitType":"per_image","value":0.04}]',
 'approved'),
('rule-openai-gpt-image-1', 'platform-openai', 'model-gpt-image-1', 'direct_price_based', 'USD',
 '[{"unitType":"per_image","value":0.04}]',
 'approved');
