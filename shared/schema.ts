import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  lastLogin: timestamp("last_login"),
  lastIp: text("last_ip"),
  isOp: boolean("is_op").default(false),
  playTime: integer("play_time").default(0), // in seconds
  banned: boolean("banned").default(false),
});

export const serverConfig = pgTable("server_config", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

export const serverLogs = pgTable("server_logs", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow(),
  level: text("level").notNull(), // INFO, WARN, ERROR
  message: text("message").notNull(),
});

export const worldStats = pgTable("world_stats", {
  id: serial("id").primaryKey(),
  seed: text("seed").notNull(),
  size: integer("size").default(0), // in bytes
  spawnX: integer("spawn_x").default(0),
  spawnY: integer("spawn_y").default(64),
  spawnZ: integer("spawn_z").default(0),
  loadedChunks: integer("loaded_chunks").default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

export const insertPlayerSchema = createInsertSchema(players).pick({
  username: true,
  lastIp: true,
  isOp: true,
});

export const insertServerConfigSchema = createInsertSchema(serverConfig);

export const insertServerLogSchema = createInsertSchema(serverLogs).pick({
  level: true,
  message: true,
});

export const insertWorldStatsSchema = createInsertSchema(worldStats);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

export type InsertServerConfig = z.infer<typeof insertServerConfigSchema>;
export type ServerConfig = typeof serverConfig.$inferSelect;

export type InsertServerLog = z.infer<typeof insertServerLogSchema>;
export type ServerLog = typeof serverLogs.$inferSelect;

export type InsertWorldStats = z.infer<typeof insertWorldStatsSchema>;
export type WorldStats = typeof worldStats.$inferSelect;

export interface ServerStats {
  status: 'online' | 'offline' | 'starting' | 'stopping';
  uptime: number; // in seconds
  version: string;
  cpuUsage: number; // percentage
  memoryUsage: {
    used: number; // in bytes
    total: number; // in bytes
  };
  tps: number; // ticks per second
  players: {
    online: number;
    max: number;
  };
}
