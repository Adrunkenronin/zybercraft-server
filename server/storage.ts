import { 
  users, 
  players, 
  serverConfig, 
  serverLogs, 
  worldStats,
  type User, 
  type InsertUser,
  type Player,
  type InsertPlayer,
  type ServerConfig,
  type InsertServerConfig,
  type ServerLog,
  type InsertServerLog,
  type WorldStats,
  type InsertWorldStats,
  type ServerStats
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Player methods
  getPlayer(id: number): Promise<Player | undefined>;
  getPlayerByUsername(username: string): Promise<Player | undefined>;
  getPlayers(): Promise<Player[]>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: number, player: Partial<Player>): Promise<Player | undefined>;
  
  // Config methods
  getConfig(key: string): Promise<string | undefined>;
  setConfig(key: string, value: string): Promise<ServerConfig>;
  getAllConfig(): Promise<ServerConfig[]>;
  
  // Logs methods
  getLogs(limit?: number): Promise<ServerLog[]>;
  createLog(log: InsertServerLog): Promise<ServerLog>;
  
  // World stats methods
  getWorldStats(): Promise<WorldStats | undefined>;
  updateWorldStats(stats: Partial<WorldStats>): Promise<WorldStats | undefined>;
  
  // Server stats
  getServerStats(): Promise<ServerStats>;
  updateServerStats(stats: Partial<ServerStats>): Promise<ServerStats>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private players: Map<number, Player>;
  private configs: Map<string, ServerConfig>;
  private logs: ServerLog[];
  private worldStats?: WorldStats;
  private serverStats: ServerStats;
  
  private userCurrentId: number;
  private playerCurrentId: number;
  private configCurrentId: number;
  private logCurrentId: number;
  private worldStatsId: number;

  constructor() {
    this.users = new Map();
    this.players = new Map();
    this.configs = new Map();
    this.logs = [];
    this.worldStats = {
      id: 1,
      seed: Math.floor(Math.random() * 10000000000000000).toString(),
      size: 642700000, // 642.7 MB in bytes
      spawnX: 128,
      spawnY: 64,
      spawnZ: -245,
      loadedChunks: 167
    };
    
    this.serverStats = {
      status: 'online',
      uptime: 0,
      version: '1.5.2',
      cpuUsage: 27,
      memoryUsage: {
        used: 1288490188, // ~1.2GB
        total: 2147483648, // 2GB
      },
      tps: 19.7,
      players: {
        online: 0,
        max: 20
      }
    };
    
    this.userCurrentId = 1;
    this.playerCurrentId = 1;
    this.configCurrentId = 1;
    this.logCurrentId = 1;
    this.worldStatsId = 1;
    
    // Initialize with default values
    this.setConfig('gameMode', 'survival');
    this.setConfig('difficulty', 'normal');
    this.setConfig('maxPlayers', '20');
    this.setConfig('pvp', 'true');
    this.setConfig('spawnProtection', '16');
    
    // Add initial log
    this.createLog({
      level: 'INFO',
      message: 'Server initialized'
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Player methods
  async getPlayer(id: number): Promise<Player | undefined> {
    return this.players.get(id);
  }
  
  async getPlayerByUsername(username: string): Promise<Player | undefined> {
    return Array.from(this.players.values()).find(
      (player) => player.username === username,
    );
  }
  
  async getPlayers(): Promise<Player[]> {
    return Array.from(this.players.values());
  }
  
  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = this.playerCurrentId++;
    const player: Player = { 
      ...insertPlayer, 
      id,
      lastLogin: new Date(),
      playTime: 0,
      banned: false
    };
    this.players.set(id, player);
    
    // Update server stats
    this.serverStats.players.online = this.players.size;
    
    return player;
  }
  
  async updatePlayer(id: number, playerUpdate: Partial<Player>): Promise<Player | undefined> {
    const player = this.players.get(id);
    if (!player) return undefined;
    
    const updatedPlayer = { ...player, ...playerUpdate };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }
  
  // Config methods
  async getConfig(key: string): Promise<string | undefined> {
    const config = this.configs.get(key);
    return config?.value;
  }
  
  async setConfig(key: string, value: string): Promise<ServerConfig> {
    const existingConfig = Array.from(this.configs.values()).find(cfg => cfg.key === key);
    
    if (existingConfig) {
      const updatedConfig = { ...existingConfig, value };
      this.configs.set(key, updatedConfig);
      return updatedConfig;
    } else {
      const id = this.configCurrentId++;
      const config: ServerConfig = { id, key, value };
      this.configs.set(key, config);
      return config;
    }
  }
  
  async getAllConfig(): Promise<ServerConfig[]> {
    return Array.from(this.configs.values());
  }
  
  // Logs methods
  async getLogs(limit: number = 100): Promise<ServerLog[]> {
    return this.logs.slice(-limit).reverse();
  }
  
  async createLog(insertLog: InsertServerLog): Promise<ServerLog> {
    const id = this.logCurrentId++;
    const log: ServerLog = {
      ...insertLog,
      id,
      timestamp: new Date()
    };
    this.logs.push(log);
    
    // Keep logs to a reasonable size
    if (this.logs.length > 1000) {
      this.logs.shift();
    }
    
    return log;
  }
  
  // World stats methods
  async getWorldStats(): Promise<WorldStats | undefined> {
    return this.worldStats;
  }
  
  async updateWorldStats(statsUpdate: Partial<WorldStats>): Promise<WorldStats | undefined> {
    if (!this.worldStats) return undefined;
    
    this.worldStats = { ...this.worldStats, ...statsUpdate };
    return this.worldStats;
  }
  
  // Server stats
  async getServerStats(): Promise<ServerStats> {
    return this.serverStats;
  }
  
  async updateServerStats(statsUpdate: Partial<ServerStats>): Promise<ServerStats> {
    this.serverStats = { ...this.serverStats, ...statsUpdate };
    return this.serverStats;
  }
}

export const storage = new MemStorage();
