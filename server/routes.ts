import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { randomUUID } from "crypto";
import { storage } from "./storage";
import { wsMessageSchema, MessageTypes, type WsMessage, insertDeviceSchema, insertTelemetrySchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Map to store active WebSocket connections by deviceId
const connectedClients = new Map<string, { 
  ws: WebSocket, 
  sessionId: string, 
  deviceType: string,
  deviceName: string




  

  
}>();

// Function to broadcast a message to all clients in a session
function broadcastToSession(
  sessionId: string, 
  message: WsMessage, 
  excludeDeviceId?: string
) {
  // Convert to array for iteration to avoid TypeScript issues
  Array.from(connectedClients.entries()).forEach(([deviceId, client]) => {
    if (client.sessionId === sessionId && deviceId !== excludeDeviceId) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    }
  });
}

// Function to send a message to a specific device
function sendToDevice(deviceId: string, message: WsMessage) {
  const client = connectedClients.get(deviceId);
  if (client && client.ws.readyState === WebSocket.OPEN) {
    client.ws.send(JSON.stringify(message));
    return true;
  }
  return false;
}

// Handle closed connections and cleanup
function handleDisconnect(deviceId: string) {
  const client = connectedClients.get(deviceId);
  if (client) {
    const { sessionId } = client;
    connectedClients.delete(deviceId);
    
    // Update device status in storage
    storage.updateDeviceStatus(deviceId, false);
    
    // Notify other clients about the disconnection
    broadcastToSession(sessionId, {
      type: MessageTypes.LEAVE_SESSION,
      deviceId,
      sessionId
    });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Create WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Handle WebSocket connections
  wss.on('connection', (ws) => {
    let deviceId: string | undefined;
    let sessionId: string | undefined;
    
    // Setup ping-pong to detect dead connections
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN && deviceId) {
        ws.send(JSON.stringify({ type: MessageTypes.PING }));
      }
    }, 30000);
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        const validatedMessage = wsMessageSchema.parse(data);
        
        switch (validatedMessage.type) {
          case MessageTypes.JOIN_SESSION: {
            if (!validatedMessage.sessionId || !validatedMessage.deviceId || 
                !validatedMessage.deviceType || !validatedMessage.deviceName) {
              ws.send(JSON.stringify({
                type: MessageTypes.ERROR,
                payload: { message: 'Missing required fields for joining session' }
              }));
              return;
            }
            
            deviceId = validatedMessage.deviceId;
            sessionId = validatedMessage.sessionId;
            
            // Check if session exists, create if not
            let session = await storage.getSession(sessionId);
            if (!session) {
              session = await storage.createSession({ sessionId });
            }
            
            // Register the device
            try {
              const deviceData = insertDeviceSchema.parse({
                sessionId,
                deviceId,
                deviceType: validatedMessage.deviceType,
                deviceName: validatedMessage.deviceName
              });
              
              // Store the device
              const existingDevice = await storage.getDevice(deviceId);
              if (!existingDevice) {
                await storage.addDevice(deviceData);
              } else {
                await storage.updateDeviceStatus(deviceId, true);
              }
              
              // Store the connection
              connectedClients.set(deviceId, {
                ws,
                sessionId,
                deviceType: validatedMessage.deviceType,
                deviceName: validatedMessage.deviceName
              });
              
              // Broadcast join to other clients in the session
              broadcastToSession(sessionId, {
                type: MessageTypes.JOIN_SESSION,
                sessionId,
                deviceId,
                deviceType: validatedMessage.deviceType,
                deviceName: validatedMessage.deviceName
              }, deviceId);
              
              // Send current session participants to the new client
              const devices = await storage.getDevicesBySession(sessionId);
              ws.send(JSON.stringify({
                type: 'session_devices',
                sessionId,
                payload: { devices }
              }));
            } catch (error) {
              if (error instanceof ZodError) {
                ws.send(JSON.stringify({
                  type: MessageTypes.ERROR,
                  payload: { message: fromZodError(error).message }
                }));
              } else {
                ws.send(JSON.stringify({
                  type: MessageTypes.ERROR,
                  payload: { message: 'Error registering device' }
                }));
              }
            }
            break;
          }
          
          case MessageTypes.LEAVE_SESSION: {
            if (deviceId && sessionId) {
              handleDisconnect(deviceId);
            }
            break;
          }
          
          case MessageTypes.TELEMETRY: {
            if (!deviceId || !validatedMessage.payload) {
              ws.send(JSON.stringify({
                type: MessageTypes.ERROR,
                payload: { message: 'Invalid telemetry data' }
              }));
              return;
            }
            
            try {
              const telemetryData = insertTelemetrySchema.parse({
                deviceId,
                ...validatedMessage.payload
              });
              
              // Store telemetry data
              await storage.addTelemetry(telemetryData);
              
              // Broadcast telemetry to session participants
              if (sessionId) {
                broadcastToSession(sessionId, {
                  type: MessageTypes.TELEMETRY,
                  deviceId,
                  payload: telemetryData
                });
              }
            } catch (error) {
              if (error instanceof ZodError) {
                ws.send(JSON.stringify({
                  type: MessageTypes.ERROR,
                  payload: { message: fromZodError(error).message }
                }));
              } else {
                ws.send(JSON.stringify({
                  type: MessageTypes.ERROR,
                  payload: { message: 'Error processing telemetry data' }
                }));
              }
            }
            break;
          }
          
          case MessageTypes.OFFER:
          case MessageTypes.ANSWER:
          case MessageTypes.ICE_CANDIDATE: {
            if (!validatedMessage.deviceId || !sessionId || !validatedMessage.payload) {
              ws.send(JSON.stringify({
                type: MessageTypes.ERROR,
                payload: { message: 'Missing required fields for signaling' }
              }));
              return;
            }
            
            // Forward the signaling message to the target device
            const success = sendToDevice(validatedMessage.deviceId, validatedMessage);
            
            if (!success) {
              ws.send(JSON.stringify({
                type: MessageTypes.ERROR,
                payload: { message: 'Target device not connected' }
              }));
            }
            break;
          }
          
          case MessageTypes.SWITCH_CAMERA: {
            if (!sessionId || !validatedMessage.payload) {
              ws.send(JSON.stringify({
                type: MessageTypes.ERROR,
                payload: { message: 'Invalid camera switch request' }
              }));
              return;
            }
            
            // Forward camera switch command to all devices in the session
            broadcastToSession(sessionId, validatedMessage);
            break;
          }
          
          case MessageTypes.DRONE_COMMAND: {
            if (!sessionId || !validatedMessage.payload) {
              ws.send(JSON.stringify({
                type: MessageTypes.ERROR,
                payload: { message: 'Invalid drone command' }
              }));
              return;
            }
            
            // Forward drone command to devices of type 'drone'
            Array.from(connectedClients.entries()).forEach(([clientDeviceId, client]) => {
              if (client.sessionId === sessionId && client.deviceType === 'drone') {
                if (client.ws.readyState === WebSocket.OPEN) {
                  client.ws.send(JSON.stringify(validatedMessage));
                }
              }
            });
            break;
          }
          
          case MessageTypes.PONG: {
            // Update last ping time for the device
            if (deviceId) {
              storage.updateDevicePing(deviceId);
            }
            break;
          }
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
        ws.send(JSON.stringify({
          type: MessageTypes.ERROR,
          payload: { message: 'Invalid message format' }
        }));
      }
    });
    
    // Handle connection close
    ws.on('close', () => {
      clearInterval(pingInterval);
      if (deviceId) {
        handleDisconnect(deviceId);
      }
    });
    
    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clearInterval(pingInterval);
      if (deviceId) {
        handleDisconnect(deviceId);
      }
    });
  });
  
  // Create a new session
  app.post('/api/sessions', async (req, res) => {
    try {
      const sessionId = randomUUID();
      const session = await storage.createSession({ sessionId });
      
      res.status(201).json({
        sessionId: session.sessionId,
        createdAt: session.createdAt
      });
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({ message: 'Error creating session' });
    }
  });
  
  // Get session information
  app.get('/api/sessions/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
      
      const devices = await storage.getDevicesBySession(sessionId);
      
      res.json({
        sessionId: session.sessionId,
        createdAt: session.createdAt,
        isActive: session.isActive,
        devices
      });
    } catch (error) {
      console.error('Error fetching session:', error);
      res.status(500).json({ message: 'Error fetching session' });
    }
  });
  
  // Get latest telemetry for a device
  app.get('/api/devices/:deviceId/telemetry', async (req, res) => {
    try {
      const { deviceId } = req.params;
      const telemetry = await storage.getLatestTelemetry(deviceId);
      
      if (!telemetry) {
        return res.status(404).json({ message: 'No telemetry data found for device' });
      }
      
      res.json(telemetry);
    } catch (error) {
      console.error('Error fetching telemetry:', error);
      res.status(500).json({ message: 'Error fetching telemetry data' });
    }
  });

  return httpServer;
}
