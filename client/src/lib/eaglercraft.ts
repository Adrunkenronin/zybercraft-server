/**
 * Client-side interface for interacting with the Eaglercraft server
 */

import { apiRequest } from './queryClient';

export interface ServerConfig {
  id: number;
  key: string;
  value: string;
}

export interface Player {
  id: number;
  username: string;
  lastLogin: string;
  lastIp: string;
  isOp: boolean;
  playTime: number;
  banned: boolean;
}

export interface ServerStats {
  status: 'online' | 'offline' | 'starting' | 'stopping';
  uptime: number;
  version: string;
  cpuUsage: number;
  memoryUsage: {
    used: number;
    total: number;
  };
  tps: number;
  players: {
    online: number;
    max: number;
  };
}

export interface WorldStats {
  id: number;
  seed: string;
  size: number;
  spawnX: number;
  spawnY: number;
  spawnZ: number;
  loadedChunks: number;
}

export interface ServerLog {
  id: number;
  timestamp: string;
  level: string;
  message: string;
}

// Server control functions
export async function controlServer(action: 'start' | 'stop' | 'restart'): Promise<void> {
  await apiRequest('POST', '/api/server/control', { action });
}

export async function executeCommand(command: string): Promise<void> {
  await apiRequest('POST', '/api/server/command', { command });
}

// Config functions
export async function updateServerConfig(key: string, value: string): Promise<ServerConfig> {
  const res = await apiRequest('POST', '/api/server/config', { key, value });
  return await res.json();
}

// Format uptime from seconds to a human-readable string
export function formatUptime(uptime: number): string {
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  
  let result = '';
  if (days > 0) result += `${days}d `;
  if (hours > 0 || days > 0) result += `${hours}h `;
  result += `${minutes}m`;
  
  return result;
}

// Format bytes to human-readable size
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Format timestamp to readable time
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}
