import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User account schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Sessions for WebRTC connections
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: integer("created_by").references(() => users.id),
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  sessionId: true,
  createdBy: true,
});

// Connected devices in a session
export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => sessions.sessionId),
  deviceId: text("device_id").notNull(),
  deviceType: text("device_type").notNull(), // 'primary', 'camera', 'drone'
  deviceName: text("device_name").notNull(),
  isConnected: boolean("is_connected").notNull().default(true),
  lastPing: timestamp("last_ping").notNull().defaultNow(),
});

export const insertDeviceSchema = createInsertSchema(devices).pick({
  sessionId: true,
  deviceId: true,
  deviceType: true,
  deviceName: true,
});

// Drone telemetry data
export const telemetry = pgTable("telemetry", {
  id: serial("id").primaryKey(),
  deviceId: text("device_id").notNull().references(() => devices.deviceId),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  battery: real("battery"), // percentage
  altitude: real("altitude"), // meters
  speed: real("speed"), // m/s
  pitch: real("pitch"), // degrees
  roll: real("roll"), // degrees
  yaw: real("yaw"), // degrees
  latitude: real("latitude"), // GPS latitude
  longitude: real("longitude"), // GPS longitude
  signalStrength: real("signal_strength"), // percentage
});

export const insertTelemetrySchema = createInsertSchema(telemetry).pick({
  deviceId: true,
  battery: true,
  altitude: true,
  speed: true,
  pitch: true,
  roll: true,
  yaw: true,
  latitude: true,
  longitude: true,
  signalStrength: true,
});

// Message types for WebSocket communication
export const MessageTypes = {
  JOIN_SESSION: 'join_session',
  LEAVE_SESSION: 'leave_session',
  OFFER: 'offer',
  ANSWER: 'answer',
  ICE_CANDIDATE: 'ice_candidate',
  TELEMETRY: 'telemetry',
  DRONE_COMMAND: 'drone_command',
  SWITCH_CAMERA: 'switch_camera',
  ERROR: 'error',
  PING: 'ping',
  PONG: 'pong'
} as const;

// WebSocket message schema
export const wsMessageSchema = z.object({
  type: z.enum([
    MessageTypes.JOIN_SESSION,
    MessageTypes.LEAVE_SESSION,
    MessageTypes.OFFER,
    MessageTypes.ANSWER,
    MessageTypes.ICE_CANDIDATE,
    MessageTypes.TELEMETRY,
    MessageTypes.DRONE_COMMAND,
    MessageTypes.SWITCH_CAMERA,
    MessageTypes.ERROR,
    MessageTypes.PING,
    MessageTypes.PONG
  ]),
  sessionId: z.string().optional(),
  deviceId: z.string().optional(),
  deviceType: z.enum(['primary', 'camera', 'drone']).optional(),
  deviceName: z.string().optional(),
  payload: z.any().optional(),
});

export type WsMessage = z.infer<typeof wsMessageSchema>;
export type TelemetryData = typeof telemetry.$inferSelect;
export type InsertTelemetry = z.infer<typeof insertTelemetrySchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Device = typeof devices.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
