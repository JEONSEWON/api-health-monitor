'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { monitorsAPI, analyticsAPI } from '@/lib/api';
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Activity,
  Trash2,
  Edit,
  Pause,
  Play
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function MonitorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const monitorId = params.id as string;

  const [monitor, setMonitor] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [checks, setChecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [monitorId]);

  const loadData = async () => {
    try {
      // Get monitor details
      const monitorResponse = await monitorsAPI.get(monitorId);
      setMonitor(monitorResponse.data);

      // Get analytics
      const analyticsResponse = await analyticsAPI.monitor(monitorId, 7);
      setAnalytics(analyticsResponse.data);

      // Get recent checks
      const checksResponse = await monitorsAPI.checks(monitorId, { 
        page: 1, 
        page_size: 20,
        hours: 24 
      });
      setChecks(checksResponse.data.checks);
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
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!monitor) return null;

  const statusColors = {
    up: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    down: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle },
    degraded: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle },
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
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {monitor.name}
              </h1>
              <p className="text-sm text-gray-500 mt-1">{monitor.url}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {monitor.is_active ? (
              <button
                onClick={handlePause}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
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
              onClick={handleDelete}
              className="flex items-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
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
              • checked {formatDistanceToNow(new Date(monitor.last_checked_at), { addSuffix: true })}
            </span>
          )}
        </div>

        {/* Stats */}
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

        {/* Configuration */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Configuration</h2>
          </div>
          <div className="px-6 py-4 grid grid-cols-2 gap-4">
            <ConfigItem label="Method" value={monitor.method} />
            <ConfigItem label="Interval" value={`${monitor.interval}s`} />
            <ConfigItem label="Timeout" value={`${monitor.timeout}s`} />
            <ConfigItem label="Expected Status" value={monitor.expected_status} />
          </div>
        </div>

        {/* Recent Checks */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Checks</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {checks.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No checks yet
              </div>
            ) : (
              checks.map((check) => (
                <CheckRow key={check.id} check={check} />
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function ConfigItem({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  );
}

function CheckRow({ check }: any) {
  const statusColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    degraded: 'text-yellow-600',
  };

  return (
    <div className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
      <div className="flex items-center space-x-4">
        <span className={`font-medium ${statusColors[check.status as keyof typeof statusColors]}`}>
          {check.status.toUpperCase()}
        </span>
        {check.status_code && (
          <span className="text-gray-500 text-sm">Status: {check.status_code}</span>
        )}
        {check.response_time && (
          <span className="text-gray-500 text-sm">{check.response_time}ms</span>
        )}
      </div>
      <span className="text-sm text-gray-500">
        {formatDistanceToNow(new Date(check.checked_at), { addSuffix: true })}
      </span>
    </div>
  );
}
