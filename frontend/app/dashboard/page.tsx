'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { authAPI, monitorsAPI, analyticsAPI, alertChannelsAPI } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import CreateMonitorModal from '@/components/CreateMonitorModal';
import SetupWizard from '@/components/SetupWizard';
import { Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const { user, setUser, isAuthenticated, setLoading } = useAuthStore();
  const [monitors, setMonitors] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoadingState] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alertChannels, setAlertChannels] = useState<any[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [showAIBanner, setShowAIBanner] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (!user) {
        const userResponse = await authAPI.me();
        setUser(userResponse);
        if (!userResponse.onboarding_completed) {
          setShowWizard(true);
        }
      }
      const monitorsResponse = await monitorsAPI.list();
      setMonitors(monitorsResponse);
      const overviewResponse = await analyticsAPI.overview();
      setOverview(overviewResponse);
    } catch (error) {
      toast.error('Failed to load dashboard');
      router.push('/login');
    } finally {
      setLoadingState(false);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {showWizard && (
        <SetupWizard onComplete={() => { setShowWizard(false); loadData(); }} />
      )}
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name || 'there'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's what's happening with your monitors
          </p>
        </div>

        {/* AI Banner */}
        {showAIBanner && (monitors.length === 0 || monitors.some(m => m.status === 'down' || m.status === 'degraded')) && (() => {
          const downMonitor = monitors.find(m => m.status === 'down' || m.status === 'degraded');
          return (
            <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700/40 px-4 py-3">
              <span className="text-yellow-600 dark:text-yellow-400 text-lg leading-none mt-0.5">✦</span>
              <p className="flex-1 text-sm text-yellow-800 dark:text-yellow-300">
                AI가 장애 원인을 자동으로 분석합니다. 체크 히스토리에서 AI 분석 결과를 확인하세요.
                {downMonitor && (
                  <Link
                    href={`/dashboard/monitors/${downMonitor.id}?tab=history`}
                    className="ml-2 font-medium underline underline-offset-2 hover:text-yellow-900 dark:hover:text-yellow-100 transition"
                  >
                    결과 보기 →
                  </Link>
                )}
              </p>
              <button
                onClick={() => setShowAIBanner(false)}
                className="text-yellow-500 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-200 transition text-lg leading-none"
                aria-label="닫기"
              >
                ×
              </button>
            </div>
          );
        })()}

        {/* Stats */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Monitors"
              value={overview.total_monitors}
              icon={<Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
              color="blue"
            />
            <StatCard
              title="Online"
              value={overview.monitors_up}
              icon={<CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />}
              color="green"
            />
            <StatCard
              title="Offline"
              value={overview.monitors_down}
              icon={<AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />}
              color="red"
            />
            <StatCard
              title="Overall Uptime"
              value={`${overview.overall_uptime}%`}
              icon={<Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
              color="purple"
            />
          </div>
        )}

        {/* Monitors List */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Monitors
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium"
            >
              + Add Monitor
            </button>
          </div>

          {monitors.length === 0 ? (
            <div className="px-6 py-10">
              <div className="max-w-lg mx-auto">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                  Get started in 3 steps
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
                  You&apos;ll be monitoring your first API in under 60 seconds.
                </p>
                <div className="space-y-4">
                  <div
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-start gap-4 p-4 rounded-lg border-2 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800 cursor-pointer hover:border-green-400 transition"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Create your first monitor</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                        Enter an API URL and we&apos;ll start checking it automatically.
                      </p>
                    </div>
                    <span className="ml-auto text-green-600 font-medium text-sm whitespace-nowrap">
                      Start →
                    </span>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 opacity-50">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Set up alerts</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                        Get notified via Email, Slack, Telegram, Discord, or Webhook.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 opacity-50">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Relax</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                        We&apos;ll watch your APIs 24/7 and alert you the moment something breaks.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {monitors.length <= 2 && alertChannels.length === 0 && (
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-green-50 dark:bg-green-950">
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Getting started</p>
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs">✓</div>
                      <span className="text-sm text-green-700 dark:text-green-400 font-medium">Monitor created</span>
                    </div>
                    <div
                      onClick={() => window.location.href = '/dashboard/alerts'}
                      className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
                    >
                      <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">2</div>
                      <span className="text-sm text-green-700 dark:text-green-400 font-medium underline">Set up alerts →</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-40">
                      <div className="w-6 h-6 rounded-full bg-gray-300 text-white flex items-center justify-center text-xs font-bold">3</div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Relax</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {monitors.map((monitor) => (
                  <MonitorRow key={monitor.id} monitor={monitor} />
                ))}
              </div>
            </>
          )}
        </div>

        <CreateMonitorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={loadData}
        />
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
    red: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800',
    purple: 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800',
  };

  return (
    <div className={`${colors[color as keyof typeof colors]} rounded-lg border p-6`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</span>
        {icon}
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function MonitorRow({ monitor }: any) {
  const router = useRouter();
  const isHeartbeat = monitor.monitor_type === 'heartbeat';

  const statusColors: any = {
    up: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300',
    down: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300',
    degraded: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300',
    pending: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
  };
  const statusIcons: any = {
    up: <CheckCircle className="h-4 w-4" />,
    down: <AlertCircle className="h-4 w-4" />,
    degraded: <AlertCircle className="h-4 w-4" />,
    pending: <Clock className="h-4 w-4" />,
  };

  const formatLastPing = (lastPingAt: string | null) => {
    if (!lastPingAt) return 'No ping yet';
    const diff = Math.floor((Date.now() - new Date(lastPingAt + 'Z').getTime()) / 1000 / 60);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div
      onClick={() => router.push(`/dashboard/monitors/${monitor.id}`)}
      className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {monitor.name}
            </h3>
            {isHeartbeat && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
                💓 Heartbeat
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isHeartbeat
              ? `Last ping: ${formatLastPing(monitor.last_ping_at)} · Every ${monitor.heartbeat_interval ?? '?'}m`
              : monitor.url
            }
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {monitor.last_status ? (
            <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${statusColors[monitor.last_status] || statusColors.pending}`}>
              {statusIcons[monitor.last_status] || statusIcons.pending}
              <span className="capitalize ml-1">{monitor.last_status}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span>No ping yet</span>
            </span>
          )}
          {!isHeartbeat && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Every {monitor.interval}s
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
