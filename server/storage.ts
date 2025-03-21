import { 
  users, type User, type InsertUser,
  sessions, type Session, type InsertSession,
  devices, type Device, type InsertDevice,
  telemetry, type TelemetryData, type InsertTelemetry
} from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface for CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Session operations
  createSession(session: Partial<InsertSession>): Promise<Session>;
  getSession(sessionId: string): Promise<Session | undefined>;
  deactivateSession(sessionId: string): Promise<boolean>;
  
  // Device operations
  addDevice(device: InsertDevice): Promise<Device>;
  getDevice(deviceId: string): Promise<Device | undefined>;
  getDevicesBySession(sessionId: string): Promise<Device[]>;
  updateDeviceStatus(deviceId: string, isConnected: boolean): Promise<boolean>;
  updateDevicePing(deviceId: string): Promise<boolean>;
  
  // Telemetry operations
  addTelemetry(data: InsertTelemetry): Promise<TelemetryData>;
  getLatestTelemetry(deviceId: string): Promise<TelemetryData | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sessions: Map<string, Session>;
  private devices: Map<string, Device>;
  private telemetry: TelemetryData[];
  
  private userId: number;
  private deviceId: number;
  private telemetryId: number;
  
  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.devices = new Map();
    this.telemetry = [];
    
    this.userId = 1;
    this.deviceId = 1;
    this.telemetryId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Session methods
  async createSession(session: Partial<InsertSession>): Promise<Session> {
    const sessionId = session.sessionId || randomUUID();
    const newSession: Session = {
      id: this.sessions.size + 1,
      sessionId,
      createdAt: new Date(),
      isActive: true,
      createdBy: session.createdBy || null
    };
    
    this.sessions.set(sessionId, newSession);
    return newSession;
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    return this.sessions.get(sessionId);
  }

  async deactivateSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    
    const updatedSession = { ...session, isActive: false };
    this.sessions.set(sessionId, updatedSession);
    return true;
  }

  // Device methods
  async addDevice(insertDevice: InsertDevice): Promise<Device> {
    const device: Device = {
      id: this.deviceId++,
      sessionId: insertDevice.sessionId,
      deviceId: insertDevice.deviceId,
      deviceType: insertDevice.deviceType,
      deviceName: insertDevice.deviceName,
      isConnected: true,
      lastPing: new Date()
    };
    
    this.devices.set(insertDevice.deviceId, device);
    return device;
  }

  async getDevice(deviceId: string): Promise<Device | undefined> {
    return this.devices.get(deviceId);
  }

  async getDevicesBySession(sessionId: string): Promise<Device[]> {
    return Array.from(this.devices.values())
      .filter(device => device.sessionId === sessionId);
  }

  async updateDeviceStatus(deviceId: string, isConnected: boolean): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device) return false;
    
    const updatedDevice = { ...device, isConnected };
    this.devices.set(deviceId, updatedDevice);
    return true;
  }

  async updateDevicePing(deviceId: string): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device) return false;
    
    const updatedDevice = { ...device, lastPing: new Date() };
    this.devices.set(deviceId, updatedDevice);
    return true;
  }

  // Telemetry methods
  async addTelemetry(insertTelemetry: InsertTelemetry): Promise<TelemetryData> {
    const newTelemetry: TelemetryData = {
      id: this.telemetryId++,
      deviceId: insertTelemetry.deviceId,
      timestamp: new Date(),
      battery: insertTelemetry.battery || null,
      altitude: insertTelemetry.altitude || null,
      speed: insertTelemetry.speed || null,
      pitch: insertTelemetry.pitch || null,
      roll: insertTelemetry.roll || null,
      yaw: insertTelemetry.yaw || null,
      latitude: insertTelemetry.latitude || null,
      longitude: insertTelemetry.longitude || null,
      signalStrength: insertTelemetry.signalStrength || null
    };
    
    this.telemetry.push(newTelemetry);
    return newTelemetry;
  }

  async getLatestTelemetry(deviceId: string): Promise<TelemetryData | undefined> {
    const deviceTelemetry = this.telemetry
      .filter(t => t.deviceId === deviceId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return deviceTelemetry[0];
  }
}

export const storage = new MemStorage();
