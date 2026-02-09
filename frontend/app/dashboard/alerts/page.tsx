'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import CreateAlertChannelModal from '@/components/CreateAlertChannelModal';
import { alertChannelsAPI } from '@/lib/api';
import { Bell, Mail, MessageSquare, Hash, Webhook, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AlertChannelsPage() {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      const response = await alertChannelsAPI.list();
      setChannels(response);
    } catch (error) {
      toast.error('Failed to load alert channels');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this alert channel?')) return;

    try {
      await alertChannelsAPI.delete(id);
      toast.success('Channel deleted');
      loadChannels();
    } catch (error) {
      toast.error('Failed to delete channel');
    }
  };

  const channelIcons = {
    email: Mail,
    slack: MessageSquare,
    telegram: MessageSquare,
    discord: Hash,
    webhook: Webhook,
  };

  const channelColors = {
    email: 'bg-blue-100 text-blue-600',
    slack: 'bg-purple-100 text-purple-600',
    telegram: 'bg-cyan-100 text-cyan-600',
    discord: 'bg-indigo-100 text-indigo-600',
    webhook: 'bg-gray-100 text-gray-600',
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Alert Channels</h1>
            <p className="text-gray-600 mt-1">
              Configure how you want to be notified
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Channel
          </button>
        </div>

        {/* Channels List */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {channels.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No alert channels
              </h3>
              <p className="text-gray-600 mb-4">
                Add your first channel to receive notifications
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Add Channel
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {channels.map((channel) => {
                const Icon = channelIcons[channel.type as keyof typeof channelIcons] || Bell;
                const colorClass = channelColors[channel.type as keyof typeof channelColors] || 'bg-gray-100 text-gray-600';

                return (
                  <div key={channel.id} className="px-6 py-4 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${colorClass}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 capitalize">
                            {channel.type}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {getChannelDescription(channel)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`
                          px-3 py-1 rounded-full text-xs font-medium
                          ${channel.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                        `}>
                          {channel.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => handleDelete(channel.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            💡 How to use alert channels
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Create an alert channel (email, Slack, etc.)</li>
            <li>• Go to a monitor's detail page</li>
            <li>• Attach the channel to the monitor</li>
            <li>• Receive alerts when the monitor status changes!</li>
          </ul>
        </div>

        {/* Modal */}
        <CreateAlertChannelModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={loadChannels}
        />
      </div>
    </DashboardLayout>
  );
}

function getChannelDescription(channel: any): string {
  const { type, config } = channel;
  
  if (type === 'email') {
    return config.email;
  } else if (type === 'slack') {
    return 'Slack webhook';
  } else if (type === 'telegram') {
    return `Chat ID: ${config.chat_id}`;
  } else if (type === 'discord') {
    return 'Discord webhook';
  } else if (type === 'webhook') {
    return config.url;
  }
  
  return 'Configured';
}
