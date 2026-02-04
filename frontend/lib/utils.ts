import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date to human readable
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format datetime with time
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Calculate uptime percentage
export function calculateUptime(checks: any[]): number {
  if (!checks || checks.length === 0) return 100;
  
  const successful = checks.filter(c => c.success).length;
  return Math.round((successful / checks.length) * 100);
}

// Format response time
export function formatResponseTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// Get status color
export function getStatusColor(status: string): string {
  switch (status) {
    case 'up':
    case 'healthy':
      return 'text-green-600 bg-green-50';
    case 'down':
    case 'error':
      return 'text-red-600 bg-red-50';
    case 'degraded':
    case 'warning':
      return 'text-yellow-600 bg-yellow-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

// Get status badge
export function getStatusBadge(status: string): string {
  switch (status) {
    case 'up':
    case 'healthy':
      return '🟢';
    case 'down':
    case 'error':
      return '🔴';
    case 'degraded':
    case 'warning':
      return '🟡';
    default:
      return '⚪';
  }
}

// Validate URL
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Get plan limits
export function getPlanLimits(plan: string): {
  monitors: number;
  checks_per_day: number;
  team_members: number;
} {
  const plans: Record<string, any> = {
    free: {
      monitors: 5,
      checks_per_day: 1440, // Every minute
      team_members: 1,
    },
    starter: {
      monitors: 25,
      checks_per_day: 14400,
      team_members: 3,
    },
    pro: {
      monitors: 100,
      checks_per_day: 43200,
      team_members: 10,
    },
    enterprise: {
      monitors: -1, // Unlimited
      checks_per_day: -1,
      team_members: -1,
    },
  };

  return plans[plan] || plans.free;
}

// Truncate text
export function truncate(text: string, length: number = 50): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

// Get relative time (e.g., "2 hours ago")
export function getRelativeTime(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  
  return formatDate(date);
}
