'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { monitorsAPI, analyticsAPI, alertChannelsAPI } from '@/lib/api';
import AssertionsPanel from '@/components/AssertionsPanel';
import RegexTestPanel from '@/components/RegexTestPanel';
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Clock,
  Activity,
  Trash2,
  Edit,
  Pause,
  Play,
  Bell,
  Plus,
  X,
  Link,
  Globe
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function MonitorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const monitorId = params.id as string;

  const user = useAuthStore((state) => state.user);
  const [monitor, setMonitor] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [customDomain, setCustomDomain] = useState('');
  const [customDomainSaving, setCustomDomainSaving] = useState(false);
  const [percentiles, setPercentiles] = useState<any>(null);
  const [checks, setChecks] = useState<any[]>([]);
  const [checksTotal, setChecksTotal] = useState(0);
  const [checksPage, setChecksPage] = useState(1);
  const [checksLoadingMore, setChecksLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allChannels, setAllChannels] = useState<any[]>([]);
  const [linkedChannels, setLinkedChannels] = useState<any[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'assertions' | 'alerts' | 'history'>(
    (searchParams.get('tab') as any) || 'overview'
  );
  const [editForm, setEditForm] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [monitorId]);

  const loadData = async () => {
    try {
      // Get monitor details
      const monitorResponse = await monitorsAPI.get(monitorId);
      setMonitor(monitorResponse);
      setCustomDomain(monitorResponse.custom_domain || '');

      // Get analytics
      const analyticsResponse = await analyticsAPI.monitor(monitorId, 7);
      setAnalytics(analyticsResponse);

      // Load percentiles
      try {
        const percResponse = await analyticsAPI.percentiles(monitorId, 24);
        setPercentiles(percResponse);
      } catch {}

      // Get alert channels
      const [allCh, monitorData] = await Promise.all([
        alertChannelsAPI.list(),
        monitorsAPI.get(monitorId),
      ]);
      setAllChannels(allCh);
      setLinkedChannels(monitorData.alert_channels || []);

      // Get recent checks
      const checksResponse = await monitorsAPI.checks(monitorId, {
        page: 1,
        page_size: 20,
      });
      setChecks(checksResponse.checks);
      setChecksTotal(checksResponse.total);
      setChecksPage(1);
    } catch (error) {
      toast.error('Failed to load monitor');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    try {
      await monitorsAPI.pause(monitorId);
      toast.success('Monitor paused');
      loadData();
    } catch (error) {
      toast.error('Failed to pause monitor');
    }
  };

  const handleResume = async () => {
    try {
      await monitorsAPI.resume(monitorId);
      toast.success('Monitor resumed');
      loadData();
    } catch (error) {
      toast.error('Failed to resume monitor');
    }
  };

  const handleLinkChannel = async (channelId: string) => {
    try {
      await alertChannelsAPI.linkToMonitor(monitorId, channelId);
      toast.success('Alert channel linked!');
      loadData();
    } catch (error) {
      toast.error('Failed to link channel');
    }
  };

  const handleUnlinkChannel = async (channelId: string) => {
    try {
      await alertChannelsAPI.unlinkFromMonitor(monitorId, channelId);
      toast.success('Alert channel unlinked');
      loadData();
    } catch (error) {
      toast.error('Failed to unlink channel');
    }
  };

  const handleEdit = () => {
    setEditForm({
      name: monitor.name,
      url: monitor.url,
      method: monitor.method,
      interval: monitor.interval,
      timeout: monitor.timeout,
      expected_status: monitor.expected_status,
      keyword: monitor.keyword || '',
      keyword_present: monitor.keyword_present ?? true,
      use_regex: monitor.use_regex ?? false,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    setEditLoading(true);
    try {
      const payload: any = {
        name: editForm.name,
        url: editForm.url,
        method: editForm.method,
        interval: Number(editForm.interval),
        timeout: Number(editForm.timeout),
        expected_status: Number(editForm.expected_status),
      };
      if (editForm.keyword) {
        payload.keyword = editForm.keyword;
        payload.keyword_present = editForm.keyword_present;
        payload.use_regex = editForm.use_regex;
      } else {
        payload.keyword = null;
        payload.keyword_present = true;
      }
      await monitorsAPI.update(monitorId, payload);
      toast.success('Monitor updated!');
      setShowEditModal(false);
      loadData();
    } catch (error) {
      toast.error('Failed to update monitor');
    } finally {
      setEditLoading(false);
    }
  };

  const handleTestChannel = async (channelId: string) => {
    try {
      await alertChannelsAPI.test(channelId);
      toast.success('Test alert sent!');
    } catch (error) {
      toast.error('Failed to send test alert');
    }
  };

  const handleCopyStatusUrl = () => {
    const url = `${window.location.origin}/status/${monitorId}`;
    navigator.clipboard.writeText(url);
    toast.success('Status page URL copied!');
  };

  const handleLoadMoreChecks = async () => {
    setChecksLoadingMore(true);
    try {
      const nextPage = checksPage + 1;
      const checksResponse = await monitorsAPI.checks(monitorId, {
        page: nextPage,
        page_size: 20,
      });
      setChecks(prev => [...prev, ...checksResponse.checks]);
      setChecksTotal(checksResponse.total);
      setChecksPage(nextPage);
    } catch (error) {
      toast.error('Failed to load more checks');
    } finally {
      setChecksLoadingMore(false);
    }
  };

  const handleSaveCustomDomain = async () => {
    setCustomDomainSaving(true);
    try {
      const { API_URL: apiBase, getAccessToken } = await import('@/lib/api');
      const token = getAccessToken();
      const res = await fetch(`${apiBase}/api/v1/monitors/${monitorId}/custom-domain`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_domain: customDomain.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to save');
      setCustomDomain(data.custom_domain || '');
      toast.success(data.custom_domain ? 'Custom domain saved!' : 'Custom domain removed');
    } catch (e: any) {
      toast.error(e.message || 'Failed to save custom domain');
    } finally {
      setCustomDomainSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this monitor?')) return;

    try {
      await monitorsAPI.delete(monitorId);
      toast.success('Monitor deleted');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to delete monitor');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="h-4 w-72 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
          <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!monitor) return null;

  const statusColors = {
    up: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-300', icon: CheckCircle },
    down: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-300', icon: AlertCircle },
    degraded: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-300', icon: AlertCircle },
  };

  const status = monitor.last_status || 'unknown';
  const StatusIcon = statusColors[status as keyof typeof statusColors]?.icon || Activity;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {monitor.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{monitor.url}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {monitor.is_active ? (
              <button
                onClick={handlePause}
                className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-900 dark:text-white"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </button>
            ) : (
              <button
                onClick={handleResume}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Play className="h-4 w-4 mr-2" />
                Resume
              </button>
            )}
            <button
              onClick={handleCopyStatusUrl}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-900 dark:text-white"
            >
              <Link className="h-4 w-4 mr-2" />
              Status Page
            </button>
            <button
              onClick={handleEdit}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-900 dark:text-white"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center px-4 py-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`
          inline-flex items-center space-x-2 px-4 py-2 rounded-lg
          ${statusColors[status as keyof typeof statusColors]?.bg || 'bg-gray-100'}
          ${statusColors[status as keyof typeof statusColors]?.text || 'text-gray-800'}
        `}>
          <StatusIcon className="h-5 w-5" />
          <span className="font-medium capitalize">{status}</span>
          {monitor.last_checked_at && (
            <span className="text-sm">
              • checked {formatDistanceToNow(new Date(monitor.last_checked_at + "Z"), { addSuffix: true })}
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'assertions', label: 'Assertions' },
            { key: 'alerts', label: `Alerts${linkedChannels.length > 0 ? ` (${linkedChannels.length})` : ''}` },
            { key: 'history', label: `History (${checksTotal})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
                activeTab === tab.key
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                  title="Uptime (7 days)"
                  value={`${analytics.uptime_percentage}%`}
                  icon={<CheckCircle className="h-6 w-6 text-green-600" />}
                />
                <StatCard
                  title="Avg Response Time"
                  value={`${analytics.avg_response_time}ms`}
                  icon={<Clock className="h-6 w-6 text-blue-600" />}
                />
                <StatCard
                  title="Total Checks"
                  value={analytics.total_checks}
                  icon={<Activity className="h-6 w-6 text-purple-600" />}
                />
                <StatCard
                  title="Incidents"
                  value={analytics.incidents}
                  icon={<AlertCircle className="h-6 w-6 text-red-600" />}
                />
              </div>
            )}

            {/* Response Time Percentiles */}
            {percentiles && percentiles.sample_size > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Response Time Percentiles</h2>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Last 24h · {percentiles.sample_size} samples</span>
                </div>
                <div className="px-6 py-4 grid grid-cols-3 gap-4">
                  {[
                    { label: 'p50 (Median)', value: percentiles.p50, color: 'text-green-600 dark:text-green-400' },
                    { label: 'p95', value: percentiles.p95, color: 'text-yellow-600 dark:text-yellow-400' },
                    { label: 'p99', value: percentiles.p99, color: 'text-red-500 dark:text-red-400' },
                  ].map((p) => (
                    <div key={p.label} className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{p.label}</p>
                      <p className={`text-2xl font-bold ${p.color}`}>{p.value}<span className="text-sm font-normal text-gray-400 ml-1">ms</span></p>
                    </div>
                  ))}
                </div>
                <div className="px-6 pb-4 flex gap-6 text-xs text-gray-500 dark:text-gray-400">
                  <span>Min: <strong className="text-gray-700 dark:text-gray-300">{percentiles.min}ms</strong></span>
                  <span>Avg: <strong className="text-gray-700 dark:text-gray-300">{percentiles.avg}ms</strong></span>
                  <span>Max: <strong className="text-gray-700 dark:text-gray-300">{percentiles.max}ms</strong></span>
                </div>
              </div>
            )}

            {/* Recent AI Analysis Preview */}
            {(() => {
              const recentFailed = checks.find(c => c.ai_analysis && (c.status === 'down' || c.status === 'degraded'));
              if (!recentFailed) return null;
              const ai = recentFailed.ai_analysis;
              const isRecent = (new Date().getTime() - new Date(recentFailed.checked_at + 'Z').getTime()) < 60 * 60 * 1000;
              return (
                <div className={`rounded-xl border-2 p-5 ${isRecent ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30' : 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30'}`}>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-lg">⚡</span>
                    <span className="font-bold text-gray-900 dark:text-white text-base">AI Analysis</span>
                    {isRecent && (
                      <span className="text-xs font-semibold bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-700">
                        Active incident
                      </span>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                      {formatDistanceToNow(new Date(recentFailed.checked_at + 'Z'), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{ai.summary}</p>
                  {ai.possible_causes?.length > 0 && (
                    <div className="mb-1.5">
                      <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wide">Possible causes </span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">{ai.possible_causes.join(' · ')}</span>
                    </div>
                  )}
                  {ai.recommended_actions?.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wide">Recommended actions </span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">{ai.recommended_actions.join(' · ')}</span>
                    </div>
                  )}
                  <button
                    onClick={() => setActiveTab('history')}
                    className="mt-3 text-xs text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    View full history →
                  </button>
                </div>
              );
            })()}

            {/* Configuration */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Configuration</h2>
              </div>
              <div className="px-6 py-4 grid grid-cols-2 gap-4 dark:bg-gray-800">
                <ConfigItem label="Method" value={monitor.method} />
                <ConfigItem label="Interval" value={`${monitor.interval}s`} />
                <ConfigItem label="Timeout" value={`${monitor.timeout}s`} />
                <ConfigItem label="Expected Status" value={monitor.expected_status} />
              </div>
            </div>

            {/* Custom Domain for Status Page */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <Globe className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Custom Domain</h2>
                {!['pro', 'business'].includes(user?.plan || '') && (
                  <span className="ml-2 text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium">Pro / Business</span>
                )}
              </div>
              <div className="px-6 py-5 space-y-4">
                {['pro', 'business'].includes(user?.plan || '') ? (
                  <>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Point a CNAME from your domain to <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">cname.vercel-dns.com</code>, then add the domain in your Vercel project settings.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customDomain}
                        onChange={(e) => setCustomDomain(e.target.value)}
                        placeholder="status.yourcompany.com"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleSaveCustomDomain}
                        disabled={customDomainSaving}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition disabled:opacity-50"
                      >
                        {customDomainSaving ? 'Saving...' : 'Save'}
                      </button>
                      {customDomain && (
                        <button
                          onClick={() => { setCustomDomain(''); }}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                          title="Clear"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {monitor.custom_domain && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Active: <a href={`https://${monitor.custom_domain}`} target="_blank" rel="noopener noreferrer" className="underline">{monitor.custom_domain}</a>
                      </p>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Upgrade to <strong>Pro</strong> or <strong>Business</strong> to use a custom domain for your public status page (e.g. <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">status.yourcompany.com</code>).
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── ASSERTIONS TAB ── */}
        {activeTab === 'assertions' && (
          <div className="space-y-6">
            <AssertionsPanel monitorId={monitorId} monitorUrl={monitor?.url} />
            <RegexTestPanel
              initialPattern={monitor.keyword || ''}
              initialPresent={monitor.keyword_present ?? true}
              monitorId={monitorId}
              onSaved={loadData}
            />
          </div>
        )}

        {/* ── ALERTS TAB ── */}
        {activeTab === 'alerts' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Alert Channels</h2>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{linkedChannels.length} connected</span>
            </div>
            <div className="px-6 py-4 space-y-3">
              {linkedChannels.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No alert channels connected yet.</p>
              ) : (
                linkedChannels.map((ch: any) => (
                  <div key={ch.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{ch.type}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {ch.config?.email || ch.config?.webhook_url || ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTestChannel(ch.id)}
                        className="px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-600 dark:text-gray-400"
                      >
                        Test
                      </button>
                      <button
                        onClick={() => handleUnlinkChannel(ch.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
              {allChannels.filter(ch => !linkedChannels.find((l: any) => l.id === ch.id)).length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Add channel:</p>
                  <div className="flex flex-wrap gap-2">
                    {allChannels
                      .filter(ch => !linkedChannels.find((l: any) => l.id === ch.id))
                      .map((ch: any) => (
                        <button
                          key={ch.id}
                          onClick={() => handleLinkChannel(ch.id)}
                          className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm hover:border-green-500 transition text-gray-700 dark:text-gray-300"
                        >
                          <Plus className="h-3 w-3" />
                          {ch.type} {ch.config?.email ? `(${ch.config.email})` : ''}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === 'history' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Check History</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">{checks.length} / {checksTotal}</span>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {checks.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  No checks yet
                </div>
              ) : (
                checks.map((check) => (
                  <CheckRow key={check.id} check={check} />
                ))
              )}
            </div>
            {checks.length < checksTotal && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleLoadMoreChecks}
                  disabled={checksLoadingMore}
                  className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-500 transition disabled:opacity-50"
                >
                  {checksLoadingMore ? 'Loading...' : `Load more (${checksTotal - checks.length} remaining)`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Edit Modal */}
      {showEditModal && editForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Monitor</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
                <input
                  type="url"
                  value={editForm.url}
                  onChange={e => setEditForm({ ...editForm, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              {/* Method + Expected Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Method</label>
                  <select
                    value={editForm.method}
                    onChange={e => setEditForm({ ...editForm, method: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {['GET','POST','PUT','DELETE','HEAD','OPTIONS','PATCH'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Status</label>
                  <input
                    type="number"
                    value={editForm.expected_status}
                    onChange={e => setEditForm({ ...editForm, expected_status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              {/* Interval + Timeout */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interval (seconds)</label>
                  <select
                    value={editForm.interval}
                    onChange={e => setEditForm({ ...editForm, interval: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value={60}>1 min</option>
                    <option value={300}>5 min</option>
                    <option value={600}>10 min</option>
                    <option value={1800}>30 min</option>
                    <option value={3600}>60 min</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timeout (seconds)</label>
                  <input
                    type="number"
                    value={editForm.timeout}
                    min={5}
                    max={120}
                    onChange={e => setEditForm({ ...editForm, timeout: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              {/* Keyword (Silent Failure Detection) */}
              <div className="border border-orange-200 dark:border-orange-800 rounded-lg p-3 bg-orange-50 dark:bg-orange-950">
                <label className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-1">
                  Silent Failure Detection (optional)
                </label>
                <input
                  type="text"
                  placeholder="Keyword to check in response body"
                  value={editForm.keyword}
                  onChange={e => setEditForm({ ...editForm, keyword: e.target.value })}
                  className="w-full px-3 py-2 border border-orange-300 dark:border-orange-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 mb-2"
                />
                {editForm.keyword && (
                  <div className="flex items-center gap-4 mt-1">
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.use_regex ?? false}
                        onChange={e => setEditForm({ ...editForm, use_regex: e.target.checked })}
                        className="rounded"
                      />
                      Use Regex
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.keyword_present}
                        onChange={e => setEditForm({ ...editForm, keyword_present: e.target.checked })}
                        className="rounded"
                      />
                      Should be present
                    </label>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-900 dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={editLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</span>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function ConfigItem({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className="font-medium text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function CheckRow({ check }: any) {
  const ai = check.ai_analysis;
  const isFailed = check.status === 'down' || check.status === 'degraded';
  const isWithinHour = (new Date().getTime() - new Date(check.checked_at + 'Z').getTime()) < 60 * 60 * 1000;
  const [showAI, setShowAI] = useState(!!ai && isFailed && isWithinHour);

  const statusColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    degraded: 'text-yellow-600',
  };

  return (
    <div className="px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className={`font-medium ${statusColors[check.status as keyof typeof statusColors]}`}>
            {check.status.toUpperCase()}
          </span>
          {check.status_code && (
            <span className="text-gray-500 dark:text-gray-400 text-sm">Status: {check.status_code}</span>
          )}
          {check.response_time && (
            <span className="text-gray-500 dark:text-gray-400 text-sm">{check.response_time}ms</span>
          )}
          {ai && (
            <button
              onClick={() => setShowAI(v => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800 transition border border-purple-200 dark:border-purple-700"
            >
              ⚡ AI Analysis {showAI ? '▲' : '▼'}
            </button>
          )}
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatDistanceToNow(new Date(check.checked_at + 'Z'), { addSuffix: true })}
        </span>
      </div>
      {ai && showAI && (
        <div className="mt-3 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-sm space-y-2">
          <p className="font-semibold text-purple-900 dark:text-purple-200">{ai.summary}</p>
          {ai.possible_causes?.length > 0 && (
            <div>
              <span className="text-purple-700 dark:text-purple-400 text-xs font-semibold uppercase tracking-wide">Possible causes </span>
              <span className="text-gray-700 dark:text-gray-300 text-xs">{ai.possible_causes.join(' · ')}</span>
            </div>
          )}
          {ai.recommended_actions?.length > 0 && (
            <div>
              <span className="text-purple-700 dark:text-purple-400 text-xs font-semibold uppercase tracking-wide">Recommended actions </span>
              <span className="text-gray-700 dark:text-gray-300 text-xs">{ai.recommended_actions.join(' · ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
