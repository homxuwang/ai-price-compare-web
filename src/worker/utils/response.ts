// AI Price Compare Web - 响应工具函数

import type { ApiResponse } from '../../shared/types';

// 成功响应
export function successResponse<T>(
  data: T,
  message?: string,
  headers: Record<string, string> = {}
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

// 错误响应
export function errorResponse(
  error: string,
  status: number = 400,
  headers: Record<string, string> = {}
): Response {
  const response: ApiResponse<null> = {
    success: false,
    error,
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

// 分页响应
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  headers: Record<string, string> = {}
): Response {
  const response = {
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}
