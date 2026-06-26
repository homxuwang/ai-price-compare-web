// AI Price Compare Web - 提交页面

import React, { useState } from 'react';
import { MODEL_CATEGORIES, CATEGORY_LABELS, UNIT_TYPES, UNIT_TYPE_LABELS } from '../../shared/constants';
import { useSubmit } from '../hooks/useApi';

interface SubmitFormData {
  platformName: string;
  modelName: string;
  modelCategory: string;
  planName: string;
  planPrice: string;
  planCurrency: string;
  planCreditAmount: string;
  pricingMode: string;
  unitDefinitions: Array<{ unitType: string; value: string }>;
  submitterNote: string;
}

function Submit() {
  const { submit, loading, error, success, reset } = useSubmit();

  const [formData, setFormData] = useState<SubmitFormData>({
    platformName: '',
    modelName: '',
    modelCategory: 'text',
    planName: '',
    planPrice: '',
    planCurrency: 'CNY',
    planCreditAmount: '',
    pricingMode: 'plan_credit_based',
    unitDefinitions: [{ unitType: 'per_1k_input_tokens', value: '' }],
    submitterNote: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleUnitDefinitionChange(index: number, field: 'unitType' | 'value', value: string) {
    setFormData((prev) => {
      const newUnitDefinitions = [...prev.unitDefinitions];
      newUnitDefinitions[index] = { ...newUnitDefinitions[index], [field]: value };
      return { ...prev, unitDefinitions: newUnitDefinitions };
    });
  }

  function addUnitDefinition() {
    setFormData((prev) => ({
      ...prev,
      unitDefinitions: [...prev.unitDefinitions, { unitType: 'per_image', value: '' }],
    }));
  }

  function removeUnitDefinition(index: number) {
    setFormData((prev) => ({
      ...prev,
      unitDefinitions: prev.unitDefinitions.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      ...formData,
      planPrice: formData.planPrice ? parseFloat(formData.planPrice) : undefined,
      planCreditAmount: formData.planCreditAmount ? parseFloat(formData.planCreditAmount) : undefined,
      unitDefinitions: formData.unitDefinitions
        .filter((ud) => ud.value)
        .map((ud) => ({
          unitType: ud.unitType,
          value: parseFloat(ud.value),
        })),
    };

    const result = await submit(payload);

    if (result) {
      // 重置表单
      setFormData({
        platformName: '',
        modelName: '',
        modelCategory: 'text',
        planName: '',
        planPrice: '',
        planCurrency: 'CNY',
        planCreditAmount: '',
        pricingMode: 'plan_credit_based',
        unitDefinitions: [{ unitType: 'per_1k_input_tokens', value: '' }],
        submitterNote: '',
      });
    }
  }

  if (success) {
    return (
      <div className="card text-center py-12">
        <div className="text-4xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-warm-900 mb-2">提交成功！</h2>
        <p className="text-warm-600 mb-6">
          您的价格数据已提交，等待管理员审核后将展示给所有用户。
        </p>
        <button onClick={reset} className="btn-primary">
          继续提交
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-warm-900 mb-6">提交新价格</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 平台信息 */}
        <div className="card">
          <h2 className="font-medium mb-4">平台信息</h2>
          <div className="space-y-4">
            <div>
              <label className="label">平台名称 *</label>
              <input
                type="text"
                name="platformName"
                value={formData.platformName}
                onChange={handleChange}
                className="input"
                placeholder="例如: OpenAI"
                required
              />
            </div>
          </div>
        </div>

        {/* 模型信息 */}
        <div className="card">
          <h2 className="font-medium mb-4">模型信息</h2>
          <div className="space-y-4">
            <div>
              <label className="label">模型名称 *</label>
              <input
                type="text"
                name="modelName"
                value={formData.modelName}
                onChange={handleChange}
                className="input"
                placeholder="例如: gpt-4o"
                required
              />
            </div>
            <div>
              <label className="label">模型类别 *</label>
              <select
                name="modelCategory"
                value={formData.modelCategory}
                onChange={handleChange}
                className="input"
                required
              >
                {MODEL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 套餐信息 */}
        <div className="card">
          <h2 className="font-medium mb-4">套餐信息（可选）</h2>
          <div className="space-y-4">
            <div>
              <label className="label">套餐名称</label>
              <input
                type="text"
                name="planName"
                value={formData.planName}
                onChange={handleChange}
                className="input"
                placeholder="例如: 基础套餐"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">价格</label>
                <input
                  type="number"
                  name="planPrice"
                  value={formData.planPrice}
                  onChange={handleChange}
                  className="input"
                  placeholder="99"
                  step="0.01"
                />
              </div>
              <div>
                <label className="label">币种</label>
                <select
                  name="planCurrency"
                  value={formData.planCurrency}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="CNY">CNY</option>
                  <option value="USD">USD</option>
                  <option value="HKD">HKD</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">积分数量</label>
              <input
                type="number"
                name="planCreditAmount"
                value={formData.planCreditAmount}
                onChange={handleChange}
                className="input"
                placeholder="10000"
              />
            </div>
          </div>
        </div>

        {/* 价格模式 */}
        <div className="card">
          <h2 className="font-medium mb-4">价格模式</h2>
          <div className="space-y-4">
            <div>
              <label className="label">计费模式 *</label>
              <select
                name="pricingMode"
                value={formData.pricingMode}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="plan_credit_based">积分换算</option>
                <option value="direct_price_based">直接价格</option>
              </select>
            </div>
          </div>
        </div>

        {/* 单位定义 */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">单位定义</h2>
            <button
              type="button"
              onClick={addUnitDefinition}
              className="text-sm text-primary-500 hover:underline"
            >
              + 添加
            </button>
          </div>
          <div className="space-y-3">
            {formData.unitDefinitions.map((ud, index) => (
              <div key={index} className="flex items-center space-x-2">
                <select
                  value={ud.unitType}
                  onChange={(e) => handleUnitDefinitionChange(index, 'unitType', e.target.value)}
                  className="input flex-1"
                >
                  {UNIT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {UNIT_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={ud.value}
                  onChange={(e) => handleUnitDefinitionChange(index, 'value', e.target.value)}
                  className="input flex-1"
                  placeholder="值"
                  step="0.000001"
                />
                {formData.unitDefinitions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeUnitDefinition(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 备注 */}
        <div className="card">
          <h2 className="font-medium mb-4">备注</h2>
          <textarea
            name="submitterNote"
            value={formData.submitterNote}
            onChange={handleChange}
            className="input"
            rows={3}
            placeholder="例如: 官方定价，2026年6月更新"
          />
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="card bg-red-50 border-red-200 text-red-700">{error}</div>
        )}

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '提交中...' : '提交价格'}
        </button>
      </form>
    </div>
  );
}

export default Submit;
