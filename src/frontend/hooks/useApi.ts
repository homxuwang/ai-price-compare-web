// AI Price Compare Web - API Hooks

import { useState, useEffect, useCallback } from 'react';
import { API_PATHS } from '../../shared/constants';

// 通用 fetch hook
function useFetch<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!url) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Request failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// 获取平台列表
export function usePlatforms() {
  return useFetch<{ platforms: Array<any> }>(API_PATHS.PLATFORMS);
}

// 获取平台详情
export function usePlatform(id: string | undefined) {
  return useFetch<{ platform: any }>(id ? `${API_PATHS.PLATFORMS}/${id}` : null);
}

// 获取模型列表
export function useModels(category?: string) {
  const url = category
    ? `${API_PATHS.MODELS}?category=${category}`
    : API_PATHS.MODELS;
  return useFetch<{ models: Array<any> }>(url);
}

// 获取模型详情
export function useModel(id: string | undefined) {
  return useFetch<{ model: any }>(id ? `${API_PATHS.MODELS}/${id}` : null);
}

// 价格查询
export function usePrices(params: {
  platformId?: string;
  modelId?: string;
  targetCurrency?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params.platformId) searchParams.set('platform_id', params.platformId);
  if (params.modelId) searchParams.set('model_id', params.modelId);
  if (params.targetCurrency) searchParams.set('target_currency', params.targetCurrency);

  const url = `${API_PATHS.PRICES}?${searchParams.toString()}`;
  return useFetch<{ results: Array<any> }>(url);
}

// 价格对比
export function usePriceCompare(modelIds: string[], platformIds?: string[]) {
  const searchParams = new URLSearchParams();
  if (modelIds.length > 0) searchParams.set('model_ids', modelIds.join(','));
  if (platformIds && platformIds.length > 0) {
    searchParams.set('platform_ids', platformIds.join(','));
  }

  const url = modelIds.length > 0
    ? `${API_PATHS.PRICES}/compare?${searchParams.toString()}`
    : null;

  return useFetch<{ comparisons: Array<any> }>(url);
}

// 提交数据
export function useSubmit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(API_PATHS.SUBMIT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        return result.data;
      } else {
        setError(result.error || 'Submit failed');
        return null;
      }
    } catch (err) {
      setError('Network error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return { submit, loading, error, success, reset };
}
