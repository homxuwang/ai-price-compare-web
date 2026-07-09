// AI Price Compare Web - 管理后台页面

import React, { useEffect, useState } from 'react';
import { CATEGORY_LABELS, PRICING_MODE_LABELS } from '../../shared/constants';
import Loading from '../components/Loading';
import Sheet from '../components/Sheet';

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
      <div className="mx-auto max-w-md">
        <div className="mb-8">
          <span className="eyebrow">// 受限区域 · ADMIN</span>
          <h1 className="mt-3 font-mono text-3xl font-semibold text-chalk">管理后台</h1>
        </div>

        <Sheet className="p-6">
          <h2 className="font-mono text-sm uppercase tracking-blueprint text-dim">管理员登录</h2>
          <div className="mt-5 space-y-4">
            <div>
              <label className="label">管理员密钥 · Access Key</label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                className="input"
                placeholder="输入管理员密钥"
              />
            </div>
            {error && (
              <div className="border border-coral/60 bg-coral/5 px-3 py-2 font-mono text-sm text-coral">
                {error}
              </div>
            )}
            <button onClick={handleAuth} disabled={loading} className="btn-primary w-full disabled:opacity-40">
              {loading ? '验证中…' : '登录 →'}
            </button>
          </div>
        </Sheet>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="eyebrow">// 审核台 · REVIEW</span>
        <h1 className="mt-3 font-mono text-3xl font-semibold text-chalk">管理后台</h1>
      </div>

      {/* 统计: 标题栏 */}
      {stats && (
        <div className="grid grid-cols-2 divide-x divide-line border border-line md:grid-cols-4 [&>*:nth-child(-n+2)]:border-b [&>*:nth-child(-n+2)]:border-line md:[&>*]:border-b-0">
          {[
            { k: 'Platforms 平台', v: stats.platforms, tone: 'text-cyan' },
            { k: 'Models 模型', v: stats.models, tone: 'text-cyan' },
            { k: 'Rules 规则', v: stats.rules, tone: 'text-cyan' },
            { k: 'Pending 待审核', v: stats.pendingSubmissions, tone: 'text-coral' },
          ].map((s) => (
            <div key={s.k} className="p-5">
              <div className="tb-key">{s.k}</div>
              <div className={`mt-2 font-mono text-2xl font-semibold tabular-nums ${s.tone}`}>{s.v}</div>
            </div>
          ))}
        </div>
      )}

      {/* 筛选器 */}
      <div className="flex flex-wrap border border-line">
        {['pending', 'approved', 'rejected', 'all'].map((status) => {
          const active = filter === status;
          const label =
            status === 'pending' ? '待审核' : status === 'approved' ? '已批准' : status === 'rejected' ? '已拒绝' : '全部';
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`border-r border-line px-4 py-2.5 font-mono text-sm uppercase tracking-wide transition-colors last:border-r-0 ${
                active ? 'bg-cyan/10 text-cyan' : 'text-dim hover:bg-panel-2 hover:text-chalk'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 提交列表 */}
      {loading ? (
        <Loading text="加载中…" />
      ) : submissions.length === 0 ? (
        <div className="border border-dashed border-line bg-panel px-4 py-10 text-center font-mono text-sm uppercase tracking-blueprint text-dim">
          — 暂无提交 · NO SUBMISSIONS —
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => {
            const statusTone =
              submission.status === 'pending'
                ? 'border-cyan text-cyan'
                : submission.status === 'approved'
                ? 'border-mint text-mint'
                : 'border-coral text-coral';
            const statusLabel =
              submission.status === 'pending' ? '待审核' : submission.status === 'approved' ? '已批准' : '已拒绝';
            return (
              <Sheet key={submission.id} corners={false} className="p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2 font-mono">
                      <span className="text-chalk">{submission.platformName}</span>
                      <span className="text-cyan">→</span>
                      <span className="text-chalk">{submission.modelName}</span>
                      <span className="border border-line px-2 py-0.5 text-[11px] uppercase tracking-wide text-dim">
                        {CATEGORY_LABELS[submission.modelCategory]}
                      </span>
                      <span className="border border-line px-2 py-0.5 text-[11px] uppercase tracking-wide text-dim">
                        {PRICING_MODE_LABELS[submission.pricingMode]}
                      </span>
                    </div>

                    {submission.planName && (
                      <div className="mb-1 font-mono text-sm text-dim">
                        套餐: <span className="text-chalk">{submission.planName}</span>
                        {submission.planPrice && ` · ${submission.planPrice} ${submission.planCurrency}`}
                        {submission.planCreditAmount && ` (${submission.planCreditAmount.toLocaleString()} 积分)`}
                      </div>
                    )}

                    <div className="mb-1 font-mono text-sm text-dim">
                      单位定义:{' '}
                      <span className="tabular-nums text-chalk">
                        {submission.unitDefinitions.map((ud) => `${ud.unitType}: ${ud.value}`).join(', ')}
                      </span>
                    </div>

                    {submission.submitterNote && (
                      <div className="font-sans text-sm italic text-dim">备注: {submission.submitterNote}</div>
                    )}

                    <div className="mt-2 font-mono text-[10px] uppercase tracking-wide text-line">
                      ID {submission.id} · {new Date(submission.createdAt).toLocaleString('zh-CN')}
                      {submission.submitterIp && ` · IP ${submission.submitterIp}`}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex flex-none items-center gap-2">
                    {submission.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleReview(submission.id, 'approved')}
                          className="border border-mint px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-mint transition-colors hover:bg-mint hover:text-ground"
                        >
                          批准
                        </button>
                        <button
                          onClick={() => {
                            const notes = prompt('拒绝原因（可选）:');
                            handleReview(submission.id, 'rejected', notes || undefined);
                          }}
                          className="border border-coral px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-coral transition-colors hover:bg-coral hover:text-ground"
                        >
                          拒绝
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(submission.id)}
                      className="border border-line px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-dim transition-colors hover:border-chalk hover:text-chalk"
                    >
                      删除
                    </button>
                  </div>
                </div>

                {/* 状态标签 */}
                <div className="mt-4 flex items-center gap-3 border-t border-dashed border-line pt-3">
                  <span className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-blueprint ${statusTone}`}>
                    {statusLabel}
                  </span>
                  {submission.reviewedAt && (
                    <span className="font-mono text-[10px] uppercase tracking-wide text-line">
                      审核于 {new Date(submission.reviewedAt).toLocaleString('zh-CN')}
                    </span>
                  )}
                </div>
              </Sheet>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Admin;
