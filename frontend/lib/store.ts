// Simple global state management using React Context pattern
// You can replace this with Zustand or Redux if needed

import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  plan: string;
  created_at: string;
}

interface Monitor {
  id: string;
  name: string;
  url: string;
  method: string;
  interval: number;
  timeout: number;
  expected_status: number;
  enabled: boolean;
  status: string;
  last_check: string | null;
  created_at: string;
}

interface AlertChannel {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  created_at: string;
}

interface AppState {
  user: User | null;
  monitors: Monitor[];
  alertChannels: AlertChannel[];
  
  setUser: (user: User | null) => void;
  setMonitors: (monitors: Monitor[]) => void;
  setAlertChannels: (channels: AlertChannel[]) => void;
  
  addMonitor: (monitor: Monitor) => void;
  updateMonitor: (id: string, updates: Partial<Monitor>) => void;
  removeMonitor: (id: string) => void;
  
  addAlertChannel: (channel: AlertChannel) => void;
  removeAlertChannel: (id: string) => void;
  
  reset: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  monitors: [],
  alertChannels: [],

  setUser: (user) => set({ user }),
  
  setMonitors: (monitors) => set({ monitors }),
  
  setAlertChannels: (alertChannels) => set({ alertChannels }),

  addMonitor: (monitor) =>
    set((state) => ({ monitors: [...state.monitors, monitor] })),

  updateMonitor: (id, updates) =>
    set((state) => ({
      monitors: state.monitors.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),

  removeMonitor: (id) =>
    set((state) => ({
      monitors: state.monitors.filter((m) => m.id !== id),
    })),

  addAlertChannel: (channel) =>
    set((state) => ({
      alertChannels: [...state.alertChannels, channel],
    })),

  removeAlertChannel: (id) =>
    set((state) => ({
      alertChannels: state.alertChannels.filter((c) => c.id !== id),
    })),

  reset: () =>
    set({
      user: null,
      monitors: [],
      alertChannels: [],
    }),
}));
