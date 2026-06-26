// AI Price Compare Web - 管理后台页面

import React, { useEffect, useState } from 'react';
import { CATEGORY_LABELS, PRICING_MODE_LABELS } from '../../shared/constants';

interface Submission {
  id: string;
  platformName: string;
  modelName: string;
  modelCategory: string;
  planName: string;
  planPrice: number;
  planCurrency: string;
  planCreditAmount: number;
  pricingMode: string;
  unitDefinitions: Array<{ unitType: string; value: number }>;
  submitterIp: string;
  submitterNote: string;
  status: string;
  adminNotes: string;
  createdAt: string;
  reviewedAt: string;
}

interface AdminStats {
  platforms: number;
  models: number;
  rules: number;
  pendingSubmissions: number;
}

function Admin() {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('pending');

  // 认证
  async function handleAuth() {
    if (!adminKey) {
      setError('请输入管理员密钥');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/stats', {
        headers: { 'X-Admin-Key': adminKey },
      });
      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        setStats(data.data.stats);
        fetchSubmissions();
      } else {
        setError('认证失败');
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  }

  // 获取提交列表
  async function fetchSubmissions() {
    setLoading(true);
    try {
      const url = filter === 'all'
        ? '/api/admin/submissions'
        : `/api/admin/submissions?status=${filter}`;
      
      const response = await fetch(url, {
        headers: { 'X-Admin-Key': adminKey },
      });
      const data = await response.json();

      if (data.success) {
        setSubmissions(data.data.submissions);
      }
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubmissions();
    }
  }, [filter, isAuthenticated]);

  // 审核提交
  async function handleReview(id: string, status: 'approved' | 'rejected', notes?: string) {
    try {
      const response = await fetch(`/api/admin/submissions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': adminKey,
        },
        body: JSON.stringify({ status, notes }),
      });

      const data = await response.json();

      if (data.success) {
        fetchSubmissions();
        // 更新统计
        const statsResponse = await fetch('/api/admin/stats', {
          headers: { 'X-Admin-Key': adminKey },
        });
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to review submission:', err);
    }
  }

  // 删除提交
  async function handleDelete(id: string) {
    if (!confirm('确定要删除这个提交吗？')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/submissions/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Key': adminKey },
      });

      const data = await response.json();

      if (data.success) {
        fetchSubmissions();
      }
    } catch (err) {
      console.error('Failed to delete submission:', err);
    }
  }

  // 未认证时显示登录表单
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-warm-900 mb-6">管理后台</h1>
        
        <div className="card">
          <h2 className="font-medium mb-4">管理员登录</h2>
          <div className="space-y-4">
            <div>
              <label className="label">管理员密钥</label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="input"
                placeholder="输入管理员密钥"
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? '验证中...' : '登录'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-warm-900">管理后台</h1>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary-500">{stats.platforms}</div>
            <div className="text-warm-600">平台</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary-500">{stats.models}</div>
            <div className="text-warm-600">模型</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary-500">{stats.rules}</div>
            <div className="text-warm-600">规则</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-orange-500">{stats.pendingSubmissions}</div>
            <div className="text-warm-600">待审核</div>
          </div>
        </div>
      )}

      {/* 筛选器 */}
      <div className="flex space-x-2">
        {['pending', 'approved', 'rejected', 'all'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-primary-500 text-white'
                : 'bg-warm-100 text-warm-700 hover:bg-warm-200'
            }`}
          >
            {status === 'pending' ? '待审核' :
             status === 'approved' ? '已批准' :
             status === 'rejected' ? '已拒绝' : '全部'}
          </button>
        ))}
      </div>

      {/* 提交列表 */}
      {loading ? (
        <div className="text-center py-8 text-warm-500">加载中...</div>
      ) : submissions.length === 0 ? (
        <div className="card text-center py-8 text-warm-500">暂无提交</div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div key={submission.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium">{submission.platformName}</span>
                    <span className="text-warm-400">→</span>
                    <span className="font-medium">{submission.modelName}</span>
                    <span className="px-2 py-0.5 bg-warm-100 rounded text-sm">
                      {CATEGORY_LABELS[submission.modelCategory]}
                    </span>
                    <span className="px-2 py-0.5 bg-warm-100 rounded text-sm">
                      {PRICING_MODE_LABELS[submission.pricingMode]}
                    </span>
                  </div>

                  {submission.planName && (
                    <div className="text-sm text-warm-600 mb-1">
                      套餐: {submission.planName}
                      {submission.planPrice && ` - ${submission.planPrice} ${submission.planCurrency}`}
                      {submission.planCreditAmount && ` (${submission.planCreditAmount.toLocaleString()} 积分)`}
                    </div>
                  )}

                  <div className="text-sm text-warm-600 mb-1">
                    单位定义: {submission.unitDefinitions.map((ud) => 
                      `${ud.unitType}: ${ud.value}`
                    ).join(', ')}
                  </div>

                  {submission.submitterNote && (
                    <div className="text-sm text-warm-500 italic">
                      备注: {submission.submitterNote}
                    </div>
                  )}

                  <div className="text-xs text-warm-400 mt-2">
                    ID: {submission.id} | 
                    提交时间: {new Date(submission.createdAt).toLocaleString('zh-CN')}
                    {submission.submitterIp && ` | IP: ${submission.submitterIp}`}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center space-x-2 ml-4">
                  {submission.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleReview(submission.id, 'approved')}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                      >
                        批准
                      </button>
                      <button
                        onClick={() => {
                          const notes = prompt('拒绝原因（可选）:');
                          handleReview(submission.id, 'rejected', notes || undefined);
                        }}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        拒绝
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(submission.id)}
                    className="px-3 py-1 bg-warm-200 text-warm-700 rounded text-sm hover:bg-warm-300"
                  >
                    删除
                  </button>
                </div>
              </div>

              {/* 状态标签 */}
              <div className="mt-3">
                <span className={`px-2 py-1 rounded text-xs ${
                  submission.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  submission.status === 'approved' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {submission.status === 'pending' ? '待审核' :
                   submission.status === 'approved' ? '已批准' : '已拒绝'}
                </span>
                {submission.reviewedAt && (
                  <span className="text-xs text-warm-400 ml-2">
                    审核时间: {new Date(submission.reviewedAt).toLocaleString('zh-CN')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Admin;
