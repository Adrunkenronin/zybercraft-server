import WebSocket from 'ws';
import { storage } from './storage';
import { PacketType, parsePacket, createPacket } from './minecraftProtocol';

interface EaglercraftPlayer {
  id: number;
  username: string;
  socket: WebSocket;
  entity: {
    entityId: number;
    x: number;
    y: number;
    z: number;
    yaw: number;
    pitch: number;
  };
  ping: {
    lastPing: number;
    pingId: number;
  };
}

export class EaglercraftServer {
  private players: Map<string, EaglercraftPlayer> = new Map();
  private nextEntityId = 1;
  private keepAliveInterval: NodeJS.Timeout | null = null;
  private serverTick: NodeJS.Timeout | null = null;
  private lastTickTime = Date.now();
  private tps = 20;
  private tickCount = 0;
  private startTime = Date.now();
  private consoleListeners: ((message: string) => void)[] = [];

  constructor() {
    this.initServer();
  }

  private async initServer() {
    // Start server monitoring
    this.keepAliveInterval = setInterval(() => this.sendKeepAlive(), 10000);
    this.serverTick = setInterval(() => this.tick(), 50); // 20 TPS (50ms)
    
    // Initialize world stats if not present
    const worldStats = await storage.getWorldStats();
    if (!worldStats) {
      this.logToConsole('INFO', 'Generating new world...');
      // Initialize world stats
      const worldSeed = Math.floor(Math.random() * 10000000000000000).toString();
      await storage.updateWorldStats({
        seed: worldSeed,
        size: 0,
        spawnX: 0,
        spawnY: 64,
        spawnZ: 0,
        loadedChunks: 0
      });
      this.logToConsole('INFO', `World generated with seed: ${worldSeed}`);
    }
    
    // Update server stats
    await storage.updateServerStats({
      status: 'online',
      uptime: 0,
      version: '1.5.2',
      cpuUsage: 0,
      memoryUsage: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal
      },
      tps: this.tps,
      players: {
        online: 0,
        max: 20
      }
    });
    
    this.logToConsole('INFO', 'Eaglercraft server started');
    this.logToConsole('INFO', `Server running Minecraft 1.5.2`);
  }

  public handleConnection(socket: WebSocket) {
    this.logToConsole('INFO', 'New connection established');
    
    socket.on('message', (data) => {
      this.handleMessage(socket, data as Buffer);
    });
    
    socket.on('close', () => {
      this.handleDisconnect(socket);
    });
    
    socket.on('error', (error) => {
      this.logToConsole('ERROR', `WebSocket error: ${error.message}`);
    });
  }

  private async handleMessage(socket: WebSocket, data: Buffer) {
    const packet = parsePacket(data);
    if (!packet) return;
    
    switch (packet.type) {
      case PacketType.HANDSHAKE:
        this.handleHandshake(socket, packet.data);
        break;
        
      case PacketType.LOGIN:
        await this.handleLogin(socket, packet.data);
        break;
        
      case PacketType.CHAT:
        await this.handleChat(socket, packet.data);
        break;
        
      case PacketType.KEEP_ALIVE:
        // Just acknowledge keep-alive packets
        break;
        
      // Handle other packet types as needed
        
      default:
        // For now, ignore unhandled packet types
        break;
    }
  }

  private handleHandshake(socket: WebSocket, data: any) {
    // For Eaglercraft, just respond with a server hash
    const responsePacket = createPacket(PacketType.HANDSHAKE, {
      connectionHash: '-'
    });
    
    socket.send(responsePacket);
    this.logToConsole('INFO', `Handshake received from ${data.username}`);
  }

  private async handleLogin(socket: WebSocket, data: any) {
    const username = data.username;
    
    // Check if username is valid
    if (!username || typeof username !== 'string' || username.length > 16) {
      this.disconnectPlayer(socket, 'Invalid username');
      return;
    }
    
    // Check if player is already connected
    if (this.getPlayerBySocket(socket) || this.players.has(username)) {
      this.disconnectPlayer(socket, 'Already connected');
      return;
    }
    
    // Create entity ID
    const entityId = this.nextEntityId++;
    
    // Get world spawn
    const worldStats = await storage.getWorldStats();
    const spawnX = worldStats?.spawnX || 0;
    const spawnY = worldStats?.spawnY || 64;
    const spawnZ = worldStats?.spawnZ || 0;
    
    // Get game mode and difficulty
    const gameMode = parseInt(await storage.getConfig('gameMode') === 'creative' ? '1' : '0');
    const difficulty = parseInt(await storage.getConfig('difficulty') === 'peaceful' ? '0' : 
                             await storage.getConfig('difficulty') === 'easy' ? '1' : 
                             await storage.getConfig('difficulty') === 'hard' ? '3' : '2');
    const maxPlayers = parseInt(await storage.getConfig('maxPlayers') || '20');
    
    // Create player
    const player: EaglercraftPlayer = {
      id: entityId,
      username,
      socket,
      entity: {
        entityId,
        x: spawnX,
        y: spawnY,
        z: spawnZ,
        yaw: 0,
        pitch: 0
      },
      ping: {
        lastPing: Date.now(),
        pingId: 0
      }
    };
    
    // Store player
    this.players.set(username, player);
    
    // Update player count in storage
    await storage.updateServerStats({
      players: {
        online: this.players.size,
        max: maxPlayers
      }
    });
    
    // Store player in database
    const existingPlayer = await storage.getPlayerByUsername(username);
    if (existingPlayer) {
      await storage.updatePlayer(existingPlayer.id, {
        lastLogin: new Date(),
        lastIp: 'eaglercraft' // We don't have real IPs for Eaglercraft
      });
    } else {
      await storage.createPlayer({
        username,
        lastIp: 'eaglercraft',
        isOp: false
      });
    }
    
    // Send login success
    const loginPacket = createPacket(PacketType.LOGIN, {
      entityId,
      seed: BigInt(worldStats?.seed || '0'),
      gameMode,
      dimension: 0, // Overworld
      difficulty,
      worldHeight: 256,
      maxPlayers
    });
    
    socket.send(loginPacket);
    
    // Broadcast join message
    this.broadcastMessage(`§e${username} joined the game`);
    this.logToConsole('INFO', `${username} logged in`);
  }

  private async handleChat(socket: WebSocket, data: any) {
    const player = this.getPlayerBySocket(socket);
    if (!player) return;
    
    const message = data.message;
    if (!message || typeof message !== 'string') return;
    
    // Handle commands
    if (message.startsWith('/')) {
      await this.handleCommand(player, message);
      return;
    }
    
    // Regular chat message
    const formattedMessage = `<${player.username}> ${message}`;
    this.broadcastMessage(formattedMessage);
    this.logToConsole('INFO', formattedMessage);
  }

  private async handleCommand(player: EaglercraftPlayer, commandStr: string) {
    const [command, ...args] = commandStr.slice(1).split(' ');
    
    // Check if player is op for restricted commands
    const playerData = await storage.getPlayerByUsername(player.username);
    const isOp = playerData?.isOp || false;
    
    switch (command.toLowerCase()) {
      case 'help':
        this.sendMessage(player, '§2Available commands:');
        this.sendMessage(player, '§7/help - Show this help');
        this.sendMessage(player, '§7/list - List online players');
        if (isOp) {
          this.sendMessage(player, '§7/op <player> - Give player operator status');
          this.sendMessage(player, '§7/gamemode <mode> - Change your gamemode');
          this.sendMessage(player, '§7/difficulty <difficulty> - Change server difficulty');
        }
        break;
        
      case 'list':
        const playerList = Array.from(this.players.keys()).join(', ');
        this.sendMessage(player, `§2Players online (${this.players.size}): §f${playerList}`);
        break;
        
      case 'op':
        if (!isOp) {
          this.sendMessage(player, '§cYou do not have permission to use this command');
          return;
        }
        
        if (args.length < 1) {
          this.sendMessage(player, '§cUsage: /op <player>');
          return;
        }
        
        const targetPlayer = await storage.getPlayerByUsername(args[0]);
        if (!targetPlayer) {
          this.sendMessage(player, `§cPlayer ${args[0]} not found`);
          return;
        }
        
        await storage.updatePlayer(targetPlayer.id, { isOp: true });
        this.sendMessage(player, `§2${args[0]} is now an operator`);
        this.logToConsole('INFO', `${player.username} gave operator status to ${args[0]}`);
        break;
        
      // Add more commands as needed
        
      default:
        this.sendMessage(player, `§cUnknown command: ${command}`);
        break;
    }
  }

  private handleDisconnect(socket: WebSocket) {
    const player = this.getPlayerBySocket(socket);
    if (!player) return;
    
    // Remove player
    this.players.delete(player.username);
    
    // Update player count
    storage.updateServerStats({
      players: {
        online: this.players.size,
        max: parseInt(storage.getConfig('maxPlayers') || '20')
      }
    });
    
    // Broadcast leave message
    this.broadcastMessage(`§e${player.username} left the game`);
    this.logToConsole('INFO', `${player.username} disconnected`);
  }

  private getPlayerBySocket(socket: WebSocket): EaglercraftPlayer | undefined {
    for (const player of this.players.values()) {
      if (player.socket === socket) {
        return player;
      }
    }
    return undefined;
  }

  private sendKeepAlive() {
    const keepAliveId = Math.floor(Math.random() * 2147483647);
    
    for (const player of this.players.values()) {
      const packet = createPacket(PacketType.KEEP_ALIVE, {
        keepAliveId
      });
      
      player.ping.pingId = keepAliveId;
      player.ping.lastPing = Date.now();
      
      player.socket.send(packet);
    }
  }

  private tick() {
    const now = Date.now();
    const delta = now - this.lastTickTime;
    this.lastTickTime = now;
    
    // Calculate TPS
    this.tickCount++;
    if (this.tickCount % 20 === 0) {
      this.tps = Math.min(20, 1000 / (delta || 50));
      
      // Update server stats every second
      this.updateServerStats();
    }
    
    // Update uptime
    const uptime = Math.floor((now - this.startTime) / 1000);
    storage.updateServerStats({ uptime });
  }

  private async updateServerStats() {
    // Get memory usage
    const memUsage = process.memoryUsage();
    
    // Calculate CPU usage (this is approximate)
    const cpuUsage = Math.floor(Math.random() * 30) + 10; // Simulated value between 10-40%
    
    // Update stats
    await storage.updateServerStats({
      cpuUsage,
      memoryUsage: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal
      },
      tps: this.tps
    });
  }

  private broadcastMessage(message: string) {
    const packet = createPacket(PacketType.CHAT, {
      message
    });
    
    for (const player of this.players.values()) {
      player.socket.send(packet);
    }
  }

  private sendMessage(player: EaglercraftPlayer, message: string) {
    const packet = createPacket(PacketType.CHAT, {
      message
    });
    
    player.socket.send(packet);
  }

  private disconnectPlayer(socket: WebSocket, reason: string) {
    const packet = createPacket(PacketType.DISCONNECT, {
      reason
    });
    
    socket.send(packet);
    socket.close();
  }

  public getOnlinePlayers(): string[] {
    return Array.from(this.players.keys());
  }

  public getPlayerCount(): number {
    return this.players.size;
  }

  public logToConsole(level: string, message: string) {
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    const logMessage = `[${timestamp}] [${level}]: ${message}`;
    
    // Store log in database
    storage.createLog({
      level,
      message
    });
    
    // Notify listeners
    this.consoleListeners.forEach(listener => listener(logMessage));
    
    // Also log to server console
    console.log(logMessage);
  }

  public addConsoleListener(callback: (message: string) => void) {
    this.consoleListeners.push(callback);
    return () => {
      this.consoleListeners = this.consoleListeners.filter(cb => cb !== callback);
    };
  }

  public executeCommand(command: string) {
    this.logToConsole('INFO', `Executing command: ${command}`);
    
    // Handle server commands
    const [cmd, ...args] = command.split(' ');
    
    switch (cmd.toLowerCase()) {
      case 'stop':
        this.broadcastMessage('§cServer is shutting down');
        this.stop();
        break;
        
      case 'restart':
        this.broadcastMessage('§eServer is restarting');
        this.restart();
        break;
        
      case 'say':
        if (args.length > 0) {
          const message = args.join(' ');
          this.broadcastMessage(`[Server] ${message}`);
        }
        break;
        
      // Additional commands can be added here
        
      default:
        this.logToConsole('WARN', `Unknown command: ${cmd}`);
        break;
    }
  }

  public async stop() {
    this.logToConsole('INFO', 'Stopping server...');
    
    // Disconnect all players
    for (const player of this.players.values()) {
      this.disconnectPlayer(player.socket, 'Server shutting down');
    }
    
    // Clear intervals
    if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);
    if (this.serverTick) clearInterval(this.serverTick);
    
    // Update server status
    await storage.updateServerStats({
      status: 'offline',
      players: {
        online: 0,
        max: parseInt(await storage.getConfig('maxPlayers') || '20')
      }
    });
    
    this.logToConsole('INFO', 'Server stopped');
  }

  public async restart() {
    await this.stop();
    
    // Small delay before restarting
    setTimeout(() => {
      this.players.clear();
      this.nextEntityId = 1;
      this.startTime = Date.now();
      this.initServer();
    }, 1000);
  }

  public async start() {
    if (this.keepAliveInterval || this.serverTick) {
      this.logToConsole('WARN', 'Server is already running');
      return;
    }
    
    this.startTime = Date.now();
    this.initServer();
  }
}

// Singleton instance
export const eaglercraftServer = new EaglercraftServer();
