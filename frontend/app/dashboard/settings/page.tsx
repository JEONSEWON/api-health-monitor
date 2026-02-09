'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/lib/store';
import { subscriptionAPI } from '@/lib/api';
import { Crown, CheckCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const response = await subscriptionAPI.get();
      setSubscription(response);
    } catch (error) {
      // No subscription yet
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: string) => {
    try {
      const response = await subscriptionAPI.checkout(plan);
      window.location.href = response.checkout_url;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create checkout');
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;

    try {
      await subscriptionAPI.cancel();
      toast.success('Subscription cancelled');
      loadSubscription();
    } catch (error) {
      toast.error('Failed to cancel subscription');
    }
  };

  const plans = [
    {
      name: 'Free',
      price: '$0',
      features: ['3 monitors', '5-minute checks', 'Email alerts', 'Public status page'],
    },
    {
      name: 'Starter',
      price: '$5',
      features: ['20 monitors', '1-minute checks', 'All alert channels', 'Analytics'],
      popular: true,
    },
    {
      name: 'Pro',
      price: '$15',
      features: ['100 monitors', '30-second checks', 'Team sharing', 'Priority support'],
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and subscription</p>
        </div>

        {/* Current Plan */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 capitalize">{user?.plan}</p>
              {subscription && (
                <p className="text-sm text-gray-500 mt-1">
                  Status: {subscription.status}
                </p>
              )}
            </div>
            {user?.plan !== 'free' && (
              <button
                onClick={handleCancel}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>

        {/* Pricing Plans */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upgrade Your Plan</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <PlanCard
                key={plan.name}
                plan={plan}
                currentPlan={user?.plan || 'free'}
                onUpgrade={handleUpgrade}
              />
            ))}
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-3">
            <InfoRow label="Email" value={user?.email || ''} />
            <InfoRow label="Name" value={user?.name || 'Not set'} />
            <InfoRow
              label="Member since"
              value={user ? new Date(user.created_at).toLocaleDateString() : ''}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function PlanCard({ plan, currentPlan, onUpgrade }: any) {
  const isCurrent = plan.name.toLowerCase() === currentPlan;

  return (
    <div className={`
      bg-white rounded-lg border-2 p-6
      ${plan.popular ? 'border-green-600 shadow-lg' : 'border-gray-200'}
    `}>
      {plan.popular && (
        <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
          POPULAR
        </span>
      )}
      <h3 className="text-2xl font-bold text-gray-900 mt-4">{plan.name}</h3>
      <div className="mt-4 mb-6">
        <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
        <span className="text-gray-600">/month</span>
      </div>
      <ul className="space-y-3 mb-6">
        {plan.features.map((feature: string, i: number) => (
          <li key={i} className="flex items-center text-gray-700">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      {isCurrent ? (
        <button
          disabled
          className="w-full py-2 border-2 border-gray-300 text-gray-500 rounded-lg font-medium"
        >
          Current Plan
        </button>
      ) : (
        <button
          onClick={() => onUpgrade(plan.name.toLowerCase())}
          className={`
            w-full py-2 rounded-lg font-medium transition
            ${plan.popular
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'border-2 border-green-600 text-green-600 hover:bg-green-50'
            }
          `}
        >
          {currentPlan === 'free' ? 'Upgrade' : 'Switch Plan'}
        </button>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
