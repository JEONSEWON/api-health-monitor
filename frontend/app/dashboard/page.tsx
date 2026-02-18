'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { authAPI, monitorsAPI, analyticsAPI } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import CreateMonitorModal from '@/components/CreateMonitorModal';
import { Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const { user, setUser, isAuthenticated, setLoading } = useAuthStore();
  const [monitors, setMonitors] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoadingState] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Load user and data
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get user info if not loaded
      if (!user) {
        const userResponse = await authAPI.me();
        setUser(userResponse);
      }

      // Get monitors
      const monitorsResponse = await monitorsAPI.list();
      setMonitors(monitorsResponse);

      // Get analytics overview
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
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || 'there'}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your monitors
          </p>
        </div>

        {/* Stats */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Monitors"
              value={overview.total_monitors}
              icon={<Activity className="h-6 w-6 text-blue-600" />}
              color="blue"
            />
            <StatCard
              title="Online"
              value={overview.monitors_up}
              icon={<CheckCircle className="h-6 w-6 text-green-600" />}
              color="green"
            />
            <StatCard
              title="Offline"
              value={overview.monitors_down}
              icon={<AlertCircle className="h-6 w-6 text-red-600" />}
              color="red"
            />
            <StatCard
              title="Overall Uptime"
              value={`${overview.overall_uptime}%`}
              icon={<Clock className="h-6 w-6 text-purple-600" />}
              color="purple"
            />
          </div>
        )}

        {/* Monitors List */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
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
            <div className="px-6 py-12 text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No monitors yet
              </h3>
              <p className="text-gray-600 mb-4">
                Get started by creating your first monitor
              </p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Create Monitor
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {monitors.map((monitor) => (
                <MonitorRow key={monitor.id} monitor={monitor} />
              ))}
            </div>
          )}
        </div>

        {/* Create Monitor Modal */}
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
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    purple: 'bg-purple-50 border-purple-200',
  };

  return (
    <div className={`${colors[color as keyof typeof colors]} rounded-lg border p-6`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        {icon}
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function MonitorRow({ monitor }: any) {
  const router = useRouter();
  
  const statusColors = {
    up: 'bg-green-100 text-green-800',
    down: 'bg-red-100 text-red-800',
    degraded: 'bg-yellow-100 text-yellow-800',
  };

  const statusIcons = {
    up: <CheckCircle className="h-4 w-4" />,
    down: <AlertCircle className="h-4 w-4" />,
    degraded: <AlertCircle className="h-4 w-4" />,
  };

  return (
    <div 
      onClick={() => router.push(`/dashboard/monitors/${monitor.id}`)}
      className="px-6 py-4 hover:bg-gray-50 transition cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            {monitor.name}
          </h3>
          <p className="text-xs text-gray-500">{monitor.url}</p>
        </div>
        <div className="flex items-center space-x-4">
          {monitor.last_status && (
            <span className={`
              flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium
              ${statusColors[monitor.last_status as keyof typeof statusColors]}
            `}>
              {statusIcons[monitor.last_status as keyof typeof statusIcons]}
              <span className="capitalize">{monitor.last_status}</span>
            </span>
          )}
          <span className="text-xs text-gray-500">
            Every {monitor.interval}s
          </span>
        </div>
      </div>
    </div>
  );
}
