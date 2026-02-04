'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { alertChannelsAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface CreateAlertChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateAlertChannelModal({ isOpen, onClose, onSuccess }: CreateAlertChannelModalProps) {
  const [type, setType] = useState('email');
  const [isLoading, setIsLoading] = useState(false);

  // Email
  const [email, setEmail] = useState('');

  // Slack
  const [slackWebhook, setSlackWebhook] = useState('');

  // Telegram
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');

  // Discord
  const [discordWebhook, setDiscordWebhook] = useState('');

  // Webhook
  const [webhookUrl, setWebhookUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let config: any = {};

      if (type === 'email') {
        config = { email };
      } else if (type === 'slack') {
        config = { webhook_url: slackWebhook };
      } else if (type === 'telegram') {
        config = { bot_token: telegramBotToken, chat_id: telegramChatId };
      } else if (type === 'discord') {
        config = { webhook_url: discordWebhook };
      } else if (type === 'webhook') {
        config = { url: webhookUrl };
      }

      await alertChannelsAPI.create({ type, config });
      toast.success('Alert channel created!');
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create channel');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setType('email');
    setEmail('');
    setSlackWebhook('');
    setTelegramBotToken('');
    setTelegramChatId('');
    setDiscordWebhook('');
    setWebhookUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Add Alert Channel</h2>
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Channel Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-600"
              >
                <option value="email">Email</option>
                <option value="slack">Slack</option>
                <option value="telegram">Telegram</option>
                <option value="discord">Discord</option>
                <option value="webhook">Custom Webhook</option>
              </select>
            </div>

            {/* Email Fields */}
            {type === 'email' && (
              <div>
                <label className="block text-sm font-medium mb-2">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-600"
                  placeholder="you@example.com"
                />
              </div>
            )}

            {/* Slack Fields */}
            {type === 'slack' && (
              <div>
                <label className="block text-sm font-medium mb-2">Webhook URL *</label>
                <input
                  type="url"
                  required
                  value={slackWebhook}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-600"
                  placeholder="https://hooks.slack.com/services/..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get from Slack: Incoming Webhooks
                </p>
              </div>
            )}

            {/* Telegram Fields */}
            {type === 'telegram' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Bot Token *</label>
                  <input
                    type="text"
                    required
                    value={telegramBotToken}
                    onChange={(e) => setTelegramBotToken(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-600"
                    placeholder="123456:ABC-DEF1234ghIkl..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Chat ID *</label>
                  <input
                    type="text"
                    required
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-600"
                    placeholder="-1001234567890"
                  />
                </div>
              </>
            )}

            {/* Discord Fields */}
            {type === 'discord' && (
              <div>
                <label className="block text-sm font-medium mb-2">Webhook URL *</label>
                <input
                  type="url"
                  required
                  value={discordWebhook}
                  onChange={(e) => setDiscordWebhook(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-600"
                  placeholder="https://discord.com/api/webhooks/..."
                />
              </div>
            )}

            {/* Webhook Fields */}
            {type === 'webhook' && (
              <div>
                <label className="block text-sm font-medium mb-2">Webhook URL *</label>
                <input
                  type="url"
                  required
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-600"
                  placeholder="https://your-server.com/webhook"
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Channel'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
