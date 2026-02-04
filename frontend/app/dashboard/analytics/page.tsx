'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { analyticsAPI } from '@/lib/api';
import { Activity, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<any>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [overviewRes, incidentsRes] = await Promise.all([
        analyticsAPI.overview(),
        analyticsAPI.incidents(7),
      ]);
      setOverview(overviewRes.data);
      setIncidents(incidentsRes.data.incidents || []);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
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
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Performance overview and insights</p>
        </div>

        {/* Overview Stats */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Monitors"
              value={overview.total_monitors}
              icon={<Activity className="h-6 w-6 text-blue-600" />}
              subtitle={`${overview.active_monitors} active`}
            />
            <StatCard
              title="Overall Uptime"
              value={`${overview.overall_uptime}%`}
              icon={<TrendingUp className="h-6 w-6 text-green-600" />}
              subtitle="Last 24 hours"
            />
            <StatCard
              title="Total Checks"
              value={overview.total_checks_24h}
              icon={<Clock className="h-6 w-6 text-purple-600" />}
              subtitle="Last 24 hours"
            />
            <StatCard
              title="Status"
              value={`${overview.monitors_up}/${overview.total_monitors}`}
              icon={<AlertCircle className="h-6 w-6 text-orange-600" />}
              subtitle="Monitors online"
            />
          </div>
        )}

        {/* Status Distribution */}
        {overview && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Monitor Status Distribution
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <StatusBox
                label="Online"
                count={overview.monitors_up}
                color="green"
              />
              <StatusBox
                label="Degraded"
                count={overview.monitors_degraded}
                color="yellow"
              />
              <StatusBox
                label="Offline"
                count={overview.monitors_down}
                color="red"
              />
            </div>
          </div>
        )}

        {/* Recent Incidents */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Incidents (7 days)
            </h2>
          </div>

          {incidents.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No incidents
              </h3>
              <p className="text-gray-600">
                All systems have been running smoothly!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {incidents.slice(0, 10).map((incident, i) => (
                <IncidentRow key={i} incident={incident} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon, subtitle }: any) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        {icon}
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      {subtitle && (
        <p className="text-sm text-gray-500">{subtitle}</p>
      )}
    </div>
  );
}

function StatusBox({ label, count, color }: any) {
  const colors = {
    green: 'bg-green-100 border-green-200 text-green-800',
    yellow: 'bg-yellow-100 border-yellow-200 text-yellow-800',
    red: 'bg-red-100 border-red-200 text-red-800',
  };

  return (
    <div className={`${colors[color as keyof typeof colors]} border-2 rounded-lg p-4 text-center`}>
      <p className="text-3xl font-bold mb-1">{count}</p>
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

function IncidentRow({ incident }: any) {
  const statusColors = {
    down: 'bg-red-100 text-red-800',
    degraded: 'bg-yellow-100 text-yellow-800',
  };

  const duration = incident.duration_seconds;
  const durationText = duration < 60
    ? `${duration}s`
    : duration < 3600
    ? `${Math.floor(duration / 60)}m`
    : `${Math.floor(duration / 3600)}h`;

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-900">{incident.monitor_name}</h3>
          <p className="text-sm text-gray-500">
            {new Date(incident.started_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[incident.status as keyof typeof statusColors]}`}>
            {incident.status.toUpperCase()}
          </span>
          <span className="text-sm text-gray-600">
            {durationText}
          </span>
          {incident.ongoing && (
            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
              Ongoing
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
