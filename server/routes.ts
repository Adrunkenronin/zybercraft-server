import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { eaglercraftServer } from "./eaglercraftServer";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Create WebSocket server for Eaglercraft connections
  const wss = new WebSocketServer({ server: httpServer, path: '/mc' });
  
  // Handle WebSocket connections
  wss.on('connection', (ws: WebSocket) => {
    eaglercraftServer.handleConnection(ws);
  });
  
  // API routes for the dashboard
  app.get('/api/server/stats', async (req, res) => {
    try {
      const stats = await storage.getServerStats();
      return res.json(stats);
    } catch (error) {
      console.error('Error getting server stats:', error);
      return res.status(500).json({ message: 'Failed to get server stats' });
    }
  });
  
  app.get('/api/server/players', async (req, res) => {
    try {
      const players = await storage.getPlayers();
      return res.json(players);
    } catch (error) {
      console.error('Error getting players:', error);
      return res.status(500).json({ message: 'Failed to get players' });
    }
  });
  
  app.get('/api/server/config', async (req, res) => {
    try {
      const config = await storage.getAllConfig();
      return res.json(config);
    } catch (error) {
      console.error('Error getting config:', error);
      return res.status(500).json({ message: 'Failed to get config' });
    }
  });
  
  app.post('/api/server/config', async (req, res) => {
    try {
      const updateSchema = z.object({
        key: z.string(),
        value: z.string()
      });
      
      const { key, value } = updateSchema.parse(req.body);
      const updatedConfig = await storage.setConfig(key, value);
      
      eaglercraftServer.logToConsole('INFO', `Config updated: ${key}=${value}`);
      return res.json(updatedConfig);
    } catch (error) {
      console.error('Error updating config:', error);
      return res.status(500).json({ message: 'Failed to update config' });
    }
  });
  
  app.get('/api/server/logs', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const logs = await storage.getLogs(limit);
      return res.json(logs);
    } catch (error) {
      console.error('Error getting logs:', error);
      return res.status(500).json({ message: 'Failed to get logs' });
    }
  });
  
  app.get('/api/world/stats', async (req, res) => {
    try {
      const stats = await storage.getWorldStats();
      return res.json(stats);
    } catch (error) {
      console.error('Error getting world stats:', error);
      return res.status(500).json({ message: 'Failed to get world stats' });
    }
  });
  
  app.post('/api/server/control', async (req, res) => {
    try {
      const actionSchema = z.object({
        action: z.enum(['start', 'stop', 'restart'])
      });
      
      const { action } = actionSchema.parse(req.body);
      
      switch (action) {
        case 'start':
          await eaglercraftServer.start();
          break;
        case 'stop':
          await eaglercraftServer.stop();
          break;
        case 'restart':
          await eaglercraftServer.restart();
          break;
      }
      
      return res.json({ success: true, message: `Server ${action} initiated` });
    } catch (error) {
      console.error(`Error controlling server: ${error}`);
      return res.status(500).json({ message: 'Failed to control server' });
    }
  });
  
  app.post('/api/server/command', async (req, res) => {
    try {
      const commandSchema = z.object({
        command: z.string()
      });
      
      const { command } = commandSchema.parse(req.body);
      eaglercraftServer.executeCommand(command);
      
      return res.json({ success: true, message: 'Command executed' });
    } catch (error) {
      console.error(`Error executing command: ${error}`);
      return res.status(500).json({ message: 'Failed to execute command' });
    }
  });

  return httpServer;
}
