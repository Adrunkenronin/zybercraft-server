/**
 * This file contains functions for handling Minecraft protocol
 * conversion for Eaglercraft compatibility
 */

// Packet types for Minecraft 1.5.2 protocol
export enum PacketType {
  KEEP_ALIVE = 0x00,
  LOGIN = 0x01,
  HANDSHAKE = 0x02,
  CHAT = 0x03,
  PLAYER_POSITION = 0x0B,
  PLAYER_LOOK = 0x0C,
  PLAYER_POSITION_LOOK = 0x0D,
  PLAYER_DIGGING = 0x0E,
  PLAYER_BLOCK_PLACEMENT = 0x0F,
  ANIMATION = 0x12,
  SPAWN_PLAYER = 0x14,
  ENTITY_VELOCITY = 0x1C,
  DESTROY_ENTITY = 0x1D,
  ENTITY = 0x1E,
  ENTITY_MOVE = 0x1F,
  ENTITY_LOOK = 0x20,
  ENTITY_LOOK_MOVE = 0x21,
  ENTITY_TELEPORT = 0x22,
  UPDATE_HEALTH = 0x08,
  RESPAWN = 0x09,
  DISCONNECT = 0xFF
}

// Minecraft packet structure
export interface MinecraftPacket {
  type: PacketType;
  data: any;
}

// Parse a binary WebSocket message into a MinecraftPacket
export function parsePacket(buffer: Buffer): MinecraftPacket | null {
  try {
    if (buffer.length < 1) return null;
    
    const packetId = buffer.readUInt8(0);
    
    switch (packetId) {
      case PacketType.KEEP_ALIVE:
        return {
          type: PacketType.KEEP_ALIVE,
          data: {
            keepAliveId: buffer.readInt32BE(1)
          }
        };
        
      case PacketType.LOGIN:
        return {
          type: PacketType.LOGIN,
          data: {
            protocolVersion: buffer.readInt32BE(1),
            username: readString(buffer, 5)
          }
        };
        
      case PacketType.HANDSHAKE:
        return {
          type: PacketType.HANDSHAKE,
          data: {
            username: readString(buffer, 1)
          }
        };
        
      case PacketType.CHAT:
        return {
          type: PacketType.CHAT,
          data: {
            message: readString(buffer, 1)
          }
        };
        
      // Other packet types would be implemented here
      
      default:
        console.log(`Unhandled packet type: ${packetId}`);
        return {
          type: packetId,
          data: { raw: buffer }
        };
    }
  } catch (error) {
    console.error("Error parsing packet:", error);
    return null;
  }
}

// Create a response packet to send back to the client
export function createPacket(type: PacketType, data: any): Buffer {
  let packet: Buffer;
  
  switch (type) {
    case PacketType.KEEP_ALIVE:
      packet = Buffer.alloc(5);
      packet.writeUInt8(PacketType.KEEP_ALIVE, 0);
      packet.writeInt32BE(data.keepAliveId, 1);
      break;
      
    case PacketType.LOGIN:
      packet = Buffer.alloc(14);
      packet.writeUInt8(PacketType.LOGIN, 0);
      packet.writeInt32BE(data.entityId, 1);
      writeString(packet, "", 5); // Empty string for unused field
      packet.writeInt64BE(BigInt(data.seed), 7);
      packet.writeInt32BE(data.gameMode, 15);
      packet.writeInt8(data.dimension, 19);
      packet.writeInt8(data.difficulty, 20);
      packet.writeInt8(data.worldHeight, 21);
      packet.writeInt8(data.maxPlayers, 22);
      break;
      
    case PacketType.CHAT:
      const message = data.message;
      packet = Buffer.alloc(3 + Buffer.byteLength(message, 'utf8'));
      packet.writeUInt8(PacketType.CHAT, 0);
      writeString(packet, message, 1);
      break;
      
    case PacketType.DISCONNECT:
      const reason = data.reason || "Disconnected";
      packet = Buffer.alloc(3 + Buffer.byteLength(reason, 'utf8'));
      packet.writeUInt8(PacketType.DISCONNECT, 0);
      writeString(packet, reason, 1);
      break;
      
    // Other packet types would be implemented here
    
    default:
      throw new Error(`Unsupported packet type: ${type}`);
  }
  
  return packet;
}

// Helper functions for reading and writing strings
function readString(buffer: Buffer, offset: number): string {
  const length = buffer.readUInt16BE(offset);
  return buffer.toString('utf8', offset + 2, offset + 2 + length);
}

function writeString(buffer: Buffer, string: string, offset: number): number {
  const stringBytes = Buffer.from(string, 'utf8');
  buffer.writeUInt16BE(stringBytes.length, offset);
  stringBytes.copy(buffer, offset + 2);
  return offset + 2 + stringBytes.length;
}

// Polyfill for writeInt64BE if needed 
if (!Buffer.prototype.writeInt64BE) {
  Buffer.prototype.writeInt64BE = function(value: bigint, offset = 0): number {
    const high = Number(value >> BigInt(32));
    const low = Number(value & BigInt(0xffffffff));
    this.writeUInt32BE(high, offset);
    this.writeUInt32BE(low, offset + 4);
    return offset + 8;
  };
}
