import React, { createContext, useState, useContext, useEffect, ReactNode, useRef } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { MessageTypes } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { nanoid } from "nanoid";

type DeviceType = 'primary' | 'camera' | 'drone';

interface Device {
  deviceId: string;
  deviceType: DeviceType;
  deviceName: string;
  isConnected: boolean;
}

interface TelemetryData {
  battery?: number;
  altitude?: number;
  speed?: number;
  pitch?: number;
  roll?: number;
  yaw?: number;
  latitude?: number;
  longitude?: number;
  signalStrength?: number;
  timestamp?: Date;
}

interface ConnectionStatus {
  isConnected: boolean;
  text: string;
}

interface StreamStatus {
  isStreaming: boolean;
  isMuted: boolean;
  activeCamera: string;
  streamDuration: number;
}

interface RecordingStatus {
  isRecording: boolean;
  duration: number;
}

interface FlightStatus {
  isFlying: boolean;
}

interface DroneStreamContextType {
  // Session and connection
  sessionId: string | null;
  createSession: () => Promise<string>;
  joinSession: (sessionId: string) => void;
  leaveSession: () => void;
  connectionStatus: ConnectionStatus;
  
  // Device management
  currentDevice: Device | null;
  connectedDevices: Device[];
  registerDevice: (deviceType: DeviceType, deviceName: string) => void;
  
  // Stream control
  streamStatus: StreamStatus;
  toggleStream: () => void;
  toggleMute: () => void;
  switchCamera: () => void;
  
  // Recording and flight control
  recordingStatus: RecordingStatus;
  toggleRecording: () => void;
  flightStatus: FlightStatus;
  toggleFlight: () => void;
  emergencyStop: () => void;
  
  // Telemetry data
  telemetryData: Record<string, TelemetryData>;
  sendTelemetry: (data: TelemetryData) => void;
  
  // WebRTC signaling
  sendSignalingMessage: (type: string, targetDeviceId: string, payload: any) => void;
  onSignalingMessage: (callback: (type: string, from: string, payload: any) => void) => void;
  
  // Device detection
  hasCamera: boolean;
  hasGyroscope: boolean;
  hasMicrophone: boolean;
}

const DroneStreamContext = createContext<DroneStreamContextType | undefined>(undefined);

interface DroneStreamProviderProps {
  children: ReactNode;
}

export const DroneStreamProvider: React.FC<DroneStreamProviderProps> = ({ children }) => {
  const { toast } = useToast();
  
  // WebSocket connection
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<Device[]>([]);
  const [currentDevice, setCurrentDevice] = useState<Device | null>(null);
  const [telemetryData, setTelemetryData] = useState<Record<string, TelemetryData>>({});
  
  // Device capabilities
  const [hasCamera, setHasCamera] = useState(false);
  const [hasGyroscope, setHasGyroscope] = useState(false);
  const [hasMicrophone, setHasMicrophone] = useState(false);
  
  // Streaming state
  const [streamStatus, setStreamStatus] = useState<StreamStatus>({
    isStreaming: false,
    isMuted: false,
    activeCamera: 'primary',
    streamDuration: 0
  });
  
  // Recording state
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>({
    isRecording: false,
    duration: 0
  });
  
  // Flight state
  const [flightStatus, setFlightStatus] = useState<FlightStatus>({
    isFlying: false
  });
  
  // Signaling message callbacks
  const signalingCallbacks = useRef<((type: string, from: string, payload: any) => void)[]>([]);
  
  // Initialize WebSocket connection
  const wsHook = useWebSocket({
    reconnectAttempts: 5,
    onOpen: () => {
      console.log("WebSocket connected successfully");
      setIsWsConnected(true);
    },
    onClose: () => {
      console.log("WebSocket disconnected");
      setIsWsConnected(false);
    },
    onError: (e) => {
      console.error("WebSocket error:", e);
    }
  });
  
  const { readyState, lastMessage, sendMessage, connect, disconnect } = wsHook;
  
  // Get connection status text representation
  const connectionStatus: ConnectionStatus = {
    isConnected: isWsConnected,
    text: isWsConnected ? 'Connected' : 'Disconnected'
  };
  
  // Check device capabilities
  useEffect(() => {
    // Check for camera
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        setHasCamera(devices.some(device => device.kind === 'videoinput'));
        setHasMicrophone(devices.some(device => device.kind === 'audioinput'));
      })
      .catch(err => {
        console.error("Error checking media devices:", err);
      });
    
    // Check for gyroscope
    if ('DeviceOrientationEvent' in window) {
      setHasGyroscope(true);
    }
  }, []);
  
  // Handle WebSocket connection status changes
  useEffect(() => {
    setIsWsConnected(readyState === WebSocket.OPEN);
  }, [readyState]);
  
  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      try {
        const message = JSON.parse(lastMessage.data);
        
        switch (message.type) {
          case MessageTypes.JOIN_SESSION:
            if (message.deviceId && message.deviceType && message.deviceName) {
              // Add device to connected devices if not already present
              setConnectedDevices(prev => {
                const exists = prev.some(d => d.deviceId === message.deviceId);
                if (exists) return prev;
                return [...prev, {
                  deviceId: message.deviceId,
                  deviceType: message.deviceType,
                  deviceName: message.deviceName,
                  isConnected: true
                }];
              });
              
              toast({
                title: "Device Connected",
                description: `${message.deviceName} has joined the session`,
              });
            }
            break;
            
          case MessageTypes.LEAVE_SESSION:
            if (message.deviceId) {
              // Update device connection status
              setConnectedDevices(prev => 
                prev.map(d => d.deviceId === message.deviceId 
                  ? { ...d, isConnected: false } 
                  : d
                )
              );
              
              const device = connectedDevices.find(d => d.deviceId === message.deviceId);
              if (device) {
                toast({
                  title: "Device Disconnected",
                  description: `${device.deviceName} has left the session`,
                  variant: "destructive"
                });
              }
            }
            break;
            
          case 'session_devices':
            if (message.payload && message.payload.devices) {
              setConnectedDevices(message.payload.devices);
            }
            break;
            
          case MessageTypes.TELEMETRY:
            if (message.deviceId && message.payload) {
              // Update telemetry data for device
              setTelemetryData(prev => ({
                ...prev,
                [message.deviceId]: {
                  ...prev[message.deviceId],
                  ...message.payload,
                  timestamp: new Date()
                }
              }));
            }
            break;
            
          case MessageTypes.SWITCH_CAMERA:
            if (message.payload && message.payload.activeCamera) {
              setStreamStatus(prev => ({
                ...prev,
                activeCamera: message.payload.activeCamera
              }));
            }
            break;
            
          case MessageTypes.OFFER:
          case MessageTypes.ANSWER:
          case MessageTypes.ICE_CANDIDATE:
            // Forward signaling messages to registered callbacks
            if (message.deviceId) {
              signalingCallbacks.current.forEach(callback => {
                callback(message.type, message.deviceId, message.payload);
              });
            }
            break;
            
          case MessageTypes.ERROR:
            if (message.payload && message.payload.message) {
              toast({
                title: "Error",
                description: message.payload.message,
                variant: "destructive"
              });
            }
            break;
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    }
  }, [lastMessage, toast, connectedDevices]);
  
  // Recording duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (recordingStatus.isRecording) {
      interval = setInterval(() => {
        setRecordingStatus(prev => ({
          ...prev,
          duration: prev.duration + 1
        }));
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recordingStatus.isRecording]);
  
  // Stream duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (streamStatus.isStreaming) {
      interval = setInterval(() => {
        setStreamStatus(prev => ({
          ...prev,
          streamDuration: prev.streamDuration + 1
        }));
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [streamStatus.isStreaming]);
  
  // Create new session
  const createSession = async (): Promise<string> => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to create session');
      }
      
      const data = await response.json();
      setSessionId(data.sessionId);
      return data.sessionId;
    } catch (error) {
      console.error("Error creating session:", error);
      toast({
        title: "Error",
        description: "Failed to create session",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  // Join existing session
  const joinSession = (id: string) => {
    setSessionId(id);
  };
  
  // Leave current session
  const leaveSession = () => {
    if (sessionId && currentDevice) {
      sendMessage(JSON.stringify({
        type: MessageTypes.LEAVE_SESSION,
        sessionId,
        deviceId: currentDevice.deviceId
      }));
      
      disconnect();
      setSessionId(null);
      setCurrentDevice(null);
      setConnectedDevices([]);
      setTelemetryData({});
    }
  };
  
  // Register device in the session
  const registerDevice = (deviceType: DeviceType, deviceName: string) => {
    if (!sessionId) {
      toast({
        title: "Error",
        description: "No active session to join",
        variant: "destructive"
      });
      return;
    }
    
    // Generate unique device ID
    const deviceId = nanoid();
    
    // Connect to WebSocket server
    connect();
    
    // Create the device object
    const device: Device = {
      deviceId,
      deviceType,
      deviceName,
      isConnected: true
    };
    
    // Set as current device
    setCurrentDevice(device);
    
    // Send join message once WebSocket is connected
    if (readyState === WebSocket.OPEN) {
      sendMessage(JSON.stringify({
        type: MessageTypes.JOIN_SESSION,
        sessionId,
        deviceId,
        deviceType,
        deviceName
      }));
    } else {
      // Try again once connection is established
      const checkAndSend = setInterval(() => {
        if (readyState === WebSocket.OPEN) {
          sendMessage(JSON.stringify({
            type: MessageTypes.JOIN_SESSION,
            sessionId,
            deviceId,
            deviceType,
            deviceName
          }));
          clearInterval(checkAndSend);
        }
      }, 500);
      
      // Clear interval after 10 seconds if connection fails
      setTimeout(() => clearInterval(checkAndSend), 10000);
    }
  };
  
  // Toggle streaming state
  const toggleStream = () => {
    setStreamStatus(prev => ({
      ...prev,
      isStreaming: !prev.isStreaming,
      streamDuration: !prev.isStreaming ? 0 : prev.streamDuration
    }));
  };
  
  // Toggle mute state
  const toggleMute = () => {
    setStreamStatus(prev => ({
      ...prev,
      isMuted: !prev.isMuted
    }));
  };
  
  // Switch camera
  const switchCamera = () => {
    if (!sessionId) return;
    
    const newActiveCamera = streamStatus.activeCamera === 'primary' ? 'camera' : 'primary';
    
    setStreamStatus(prev => ({
      ...prev,
      activeCamera: newActiveCamera
    }));
    
    // Notify all devices about camera switch
    sendMessage(JSON.stringify({
      type: MessageTypes.SWITCH_CAMERA,
      sessionId,
      payload: { activeCamera: newActiveCamera }
    }));
  };
  
  // Toggle recording state
  const toggleRecording = () => {
    setRecordingStatus(prev => ({
      ...prev,
      isRecording: !prev.isRecording,
      duration: !prev.isRecording ? 0 : prev.duration
    }));
  };
  
  // Toggle flight state
  const toggleFlight = () => {
    if (!sessionId) return;
    
    const newIsFlying = !flightStatus.isFlying;
    
    setFlightStatus({
      isFlying: newIsFlying
    });
    
    // Send command to drone
    sendMessage(JSON.stringify({
      type: MessageTypes.DRONE_COMMAND,
      sessionId,
      payload: {
        command: newIsFlying ? 'takeoff' : 'land'
      }
    }));
    
    toast({
      title: newIsFlying ? "Takeoff Initiated" : "Landing Initiated",
      description: newIsFlying ? "Drone is taking off" : "Drone is landing",
    });
  };
  
  // Emergency stop
  const emergencyStop = () => {
    if (!sessionId) return;
    
    setFlightStatus({
      isFlying: false
    });
    
    // Send emergency stop command to drone
    sendMessage(JSON.stringify({
      type: MessageTypes.DRONE_COMMAND,
      sessionId,
      payload: {
        command: 'emergency_stop'
      }
    }));
    
    toast({
      title: "Emergency Stop",
      description: "Emergency stop activated",
      variant: "destructive"
    });
  };
  
  // Send telemetry data
  const sendTelemetry = (data: TelemetryData) => {
    if (!sessionId || !currentDevice) return;
    
    sendMessage(JSON.stringify({
      type: MessageTypes.TELEMETRY,
      sessionId,
      deviceId: currentDevice.deviceId,
      payload: data
    }));
  };
  
  // Send WebRTC signaling message
  const sendSignalingMessage = (type: string, targetDeviceId: string, payload: any) => {
    if (!sessionId || !currentDevice) return;
    
    sendMessage(JSON.stringify({
      type,
      sessionId,
      deviceId: targetDeviceId,
      payload
    }));
  };
  
  // Register callback for signaling messages
  const onSignalingMessage = (callback: (type: string, from: string, payload: any) => void) => {
    signalingCallbacks.current.push(callback);
  };
  
  return (
    <DroneStreamContext.Provider value={{
      sessionId,
      createSession,
      joinSession,
      leaveSession,
      connectionStatus,
      
      currentDevice,
      connectedDevices,
      registerDevice,
      
      streamStatus,
      toggleStream,
      toggleMute,
      switchCamera,
      
      recordingStatus,
      toggleRecording,
      flightStatus,
      toggleFlight,
      emergencyStop,
      
      telemetryData,
      sendTelemetry,
      
      sendSignalingMessage,
      onSignalingMessage,
      
      hasCamera,
      hasGyroscope,
      hasMicrophone
    }}>
      {children}
    </DroneStreamContext.Provider>
  );
};

export const useDroneStream = (): DroneStreamContextType => {
  const context = useContext(DroneStreamContext);
  if (context === undefined) {
    throw new Error('useDroneStream must be used within a DroneStreamProvider');
  }
  return context;
};
