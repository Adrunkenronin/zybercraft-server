/**
 * WebSocket client for real-time updates from the server
 */

import { create } from "zustand";

interface ServerMessage {
  type: 'log' | 'stats' | 'players';
  data: any;
}

interface WebSocketState {
  connected: boolean;
  logs: string[];
  stats: {
    cpuUsage: number;
    memoryUsage: { used: number; total: number };
    tps: number;
    playersOnline: number;
    maxPlayers: number;
  };
  connect: () => void;
  disconnect: () => void;
  addLog: (log: string) => void;
  updateStats: (stats: Partial<WebSocketState['stats']>) => void;
  clearLogs: () => void;
}

let socket: WebSocket | null = null;

export const useWebSocketStore = create<WebSocketState>((set) => ({
  connected: false,
  logs: [],
  stats: {
    cpuUsage: 0,
    memoryUsage: { used: 0, total: 0 },
    tps: 0,
    playersOnline: 0,
    maxPlayers: 20
  },
  
  connect: () => {
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      return;
    }
    
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/zybercraft`;
    
    socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      set({ connected: true });
      console.log('WebSocket connected');
    };
    
    socket.onclose = () => {
      set({ connected: false });
      console.log('WebSocket disconnected');
      
      // Attempt to reconnect after a delay
      setTimeout(() => {
        set((state) => {
          if (!state.connected) {
            state.connect();
          }
          return state;
        });
      }, 5000);
    };
    
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as ServerMessage;
        
        switch (message.type) {
          case 'log':
            set((state) => ({
              logs: [...state.logs, message.data].slice(-100) // Keep only the latest 100 logs
            }));
            break;
            
          case 'stats':
            set((state) => ({
              stats: { ...state.stats, ...message.data }
            }));
            break;
            
          default:
            console.log('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  },
  
  disconnect: () => {
    if (socket) {
      socket.close();
      socket = null;
      set({ connected: false });
    }
  },
  
  addLog: (log: string) => {
    set((state) => ({
      logs: [...state.logs, log].slice(-100) // Keep only the latest 100 logs
    }));
  },
  
  updateStats: (stats: Partial<WebSocketState['stats']>) => {
    set((state) => ({
      stats: { ...state.stats, ...stats }
    }));
  },
  
  clearLogs: () => {
    set({ logs: [] });
  }
}));

// Auto-connect when this module is imported
useWebSocketStore.getState().connect();

// Handle page visibility changes to reconnect if needed
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !useWebSocketStore.getState().connected) {
      useWebSocketStore.getState().connect();
    }
  });
}
