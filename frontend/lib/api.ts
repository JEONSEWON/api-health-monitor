// API Client for API Health Monitor

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-health-monitor-production.up.railway.app';

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }
}

export function getAccessToken(): string | null {
  if (!accessToken && typeof window !== 'undefined') {
    accessToken = localStorage.getItem('access_token');
  }
  return accessToken;
}

export function getRefreshToken(): string | null {
  if (!refreshToken && typeof window !== 'undefined') {
    refreshToken = localStorage.getItem('refresh_token');
  }
  return refreshToken;
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}

// API request helper with auto token refresh
async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = getAccessToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If 401 and we have refresh token, try to refresh
  if (response.status === 401 && getRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry with new token
      headers['Authorization'] = `Bearer ${getAccessToken()}`;
      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });
    } else {
      // Refresh failed, clear tokens and redirect to login
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Authentication failed');
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
}

async function refreshAccessToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  try {
    const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    });

    if (response.ok) {
      const data = await response.json();
      setTokens(data.access_token, refresh);
      return true;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }
  
  return false;
}

// Auth API
export const authAPI = {
  register: (email: string, password: string, name?: string) =>
    apiRequest('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    apiRequest('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => apiRequest('/api/v1/auth/me'),
};

// Monitors API
export const monitorsAPI = {
  list: () => apiRequest('/api/v1/monitors/'),
  
  get: (id: string) => apiRequest(`/api/v1/monitors/${id}/`),
  
  create: (data: {
    name: string;
    url: string;
    method?: string;
    interval?: number;
    timeout?: number;
    expected_status?: number;
  }) =>
    apiRequest('/api/v1/monitors/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest(`/api/v1/monitors/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/api/v1/monitors/${id}/`, {
      method: 'DELETE',
    }),

  toggle: (id: string, enabled: boolean) =>
    apiRequest(`/api/v1/monitors/${id}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    }),

  checkNow: (id: string) =>
    apiRequest(`/api/v1/monitors/${id}/check-now`, {
      method: 'POST',
    }),

  checks: (id: string, params?: { page?: number; page_size?: number; hours?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.page_size) query.set('page_size', params.page_size.toString());
    if (params?.hours) query.set('hours', params.hours.toString());
    return apiRequest(`/api/v1/monitors/${id}/checks?${query.toString()}`);
  },

  pause: (id: string) =>
    apiRequest(`/api/v1/monitors/${id}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ enabled: false }),
    }),

  resume: (id: string) =>
    apiRequest(`/api/v1/monitors/${id}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ enabled: true }),
    }),
};

// Alert Channels API
export const alertChannelsAPI = {
  list: () => apiRequest('/api/v1/alert-channels/'),
  
  create: (data: {
    name: string;
    type: string;
    config: Record<string, any>;
  }) =>
    apiRequest('/api/v1/alert-channels/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/api/v1/alert-channels/${id}`, {
      method: 'DELETE',
    }),

  test: (id: string) =>
    apiRequest(`/api/v1/alert-channels/${id}/test`, {
      method: 'POST',
    }),

  linkToMonitor: (monitorId: string, channelId: string) =>
    apiRequest(`/api/v1/monitors/${monitorId}/alert-channels/${channelId}`, {
      method: 'POST',
    }),

  unlinkFromMonitor: (monitorId: string, channelId: string) =>
    apiRequest(`/api/v1/monitors/${monitorId}/alert-channels/${channelId}`, {
      method: 'DELETE',
    }),
};

// Analytics API
export const analyticsAPI = {
  overview: () => apiRequest('/api/v1/analytics/overview'),
  
  monitorStats: (monitorId: string, days: number = 7) =>
    apiRequest(`/api/v1/analytics/monitors/${monitorId}?days=${days}`),
  
  monitor: (monitorId: string, days: number = 7) =>
    apiRequest(`/api/v1/analytics/monitors/${monitorId}?days=${days}`),
  
  incidents: (days: number = 7) =>
    apiRequest(`/api/v1/analytics/incidents?days=${days}`),
};

// Subscription API
export const subscriptionAPI = {
  current: () => apiRequest('/api/v1/subscriptions/current'),
  
  get: () => apiRequest('/api/v1/subscriptions/current'),
  
  createCheckout: (variantId: string) =>
    apiRequest('/api/v1/subscriptions/checkout', {
      method: 'POST',
      body: JSON.stringify({ variant_id: variantId }),
    }),
  
  checkout: (plan: string) =>
    apiRequest('/api/v1/subscriptions/checkout', {
      method: 'POST',
      body: JSON.stringify({ variant_id: plan }),
    }),

  cancel: () =>
    apiRequest('/api/v1/subscriptions/cancel', {
      method: 'POST',
    }),

  billingPortal: () =>
    apiRequest('/api/v1/subscriptions/billing-portal', {
      method: 'POST',
    }),
};

// Public API (no auth)
export const publicApi = {
  statusPage: (username: string) =>
    fetch(`${API_URL}/api/v1/public/${username}/status`).then(r => r.json()),
};

// Legacy aliases for backward compatibility
export const auth = authAPI;
export const monitors = monitorsAPI;
export const alertChannels = alertChannelsAPI;
export const analytics = analyticsAPI;
export const subscriptions = subscriptionAPI;

export default {
  authAPI,
  monitorsAPI,
  alertChannelsAPI,
  analyticsAPI,
  subscriptionAPI,
  publicApi,
};
