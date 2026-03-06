'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { teamsAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

function InviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) { setStatus('error'); setMessage('Invalid invitation link.'); return; }
    if (!user) { router.push(`/login?redirect=/invite?token=${token}`); return; }

    teamsAPI.acceptInvite(token)
      .then(() => {
        setStatus('success');
        setMessage('You have joined the team! Redirecting to dashboard...');
        setTimeout(() => router.push('/dashboard'), 2000);
      })
      .catch((e: any) => {
        setStatus('error');
        setMessage(e.response?.data?.detail || 'Failed to accept invitation.');
      });
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center max-w-sm w-full">
        {status === 'loading' && (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Accepting invitation...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Welcome to the team!</h2>
            <p className="text-gray-500 text-sm">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Invitation failed</h2>
            <p className="text-gray-500 text-sm">{message}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 text-sm text-green-600 hover:underline"
            >
              Go to dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    }>
      <InviteContent />
    </Suspense>
  );
}
