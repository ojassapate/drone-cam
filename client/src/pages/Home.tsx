import React, { useEffect, useState } from 'react';
import AppHeader from '@/components/AppHeader';
import VideoStream from '@/components/VideoStream';
import DroneStatus from '@/components/DroneStatus';
import OrientationDisplay from '@/components/OrientationDisplay';
import MapDisplay from '@/components/MapDisplay';
import ConnectionSettings from '@/components/ConnectionSettings';
import ControlFooter from '@/components/ControlFooter';
import { useDroneStream } from '@/context/DroneStreamContext';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';
import { deviceToDroneOrientation } from '@/lib/orientationUtils';
import { getDeviceName } from '@/lib/rtcUtils';
import { nanoid } from 'nanoid';

const Home: React.FC = () => {
  const { 
    sessionId, 
    createSession, 
    registerDevice, 
    connectionStatus,
    sendTelemetry,
    hasGyroscope
  } = useDroneStream();
  
  const [isSessionSetup, setIsSessionSetup] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  
  // Get device orientation data
  const { orientation, requestPermission } = useDeviceOrientation({
    onOrientationChange: (data) => {
      if (sessionId) {
        // Convert device orientation to drone orientation
        const droneOrientation = deviceToDroneOrientation({
          alpha: data.alpha,
          beta: data.beta,
          gamma: data.gamma
        });
        
        // Send telemetry data with dynamic values
        // Convert null values to undefined to match TelemetryData type
        const telemetryData = {
          // Convert from number|null to number|undefined
          pitch: droneOrientation.pitch || undefined,
          roll: droneOrientation.roll || undefined,
          yaw: droneOrientation.yaw || undefined,
          // Default sensor values
          battery: 100, // Default battery level
          altitude: 0,  // Initialize at ground level
          speed: 0,     // Initialize at standstill
          signalStrength: navigator.onLine ? 100 : 0 // Basic online status
        };
        
        sendTelemetry(telemetryData);
      }
    }
  });
  
  // Initialize session or join existing session
  useEffect(() => {
    const initializeSession = async () => {
      // Check if session ID exists in URL
      const urlParams = new URLSearchParams(window.location.search);
      let currentSessionId = urlParams.get('session');
      
      if (!currentSessionId) {
        // Create new session if none exists
        try {
          currentSessionId = await createSession();
          // Update URL with new session ID
          const newUrl = `${window.location.pathname}?session=${currentSessionId}`;
          window.history.pushState({ path: newUrl }, '', newUrl);
        } catch (error) {
          console.error('Failed to create session:', error);
          return;
        }
      }
      
      setShowSetupModal(true);
    };
    
    if (!isSessionSetup && !sessionId) {
      initializeSession();
    }
  }, [createSession, isSessionSetup, sessionId]);
  
  // Handle user setup completion
  const handleSetupComplete = async (deviceType: 'primary' | 'camera' | 'drone') => {
    if (!sessionId) return;
    
    // Request gyroscope permissions if primary device
    if (deviceType === 'primary' && hasGyroscope) {
      await requestPermission();
    }
    
    // Register the device with the session
    registerDevice(deviceType, getDeviceName());
    setIsSessionSetup(true);
    setShowSetupModal(false);
  };
  
  if (showSetupModal) {
    return (
      <div className="bg-dark text-light font-roboto min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-dark-medium rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-medium mb-4 flex items-center">
            <span className="material-icons mr-2">settings</span>
            Device Setup
          </h2>
          
          <p className="mb-4">Select how you want to use this device:</p>
          
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => handleSetupComplete('primary')}
              className="bg-primary p-3 rounded-md flex items-center justify-center"
            >
              <span className="material-icons mr-2">smartphone</span>
              Primary Control Device
            </button>
            
            <button 
              onClick={() => handleSetupComplete('camera')}
              className="bg-secondary p-3 rounded-md flex items-center justify-center"
            >
              <span className="material-icons mr-2">videocam</span>
              Camera Device
            </button>
            
            <button 
              onClick={() => handleSetupComplete('drone')}
              className="bg-accent p-3 rounded-md flex items-center justify-center"
            >
              <span className="material-icons mr-2">flight</span>
              Simulate Drone (Debug)
            </button>
          </div>
          
          <div className="mt-4 text-sm text-gray-400">
            <p>Session ID: {sessionId}</p>
            <p className="mt-2">Share this URL with other devices to connect to this session.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-dark text-light font-roboto min-h-screen flex flex-col">
      <AppHeader title="DroneStream" connectionStatus={connectionStatus} />
      
      <main className="flex-1 overflow-hidden flex flex-col">
        <VideoStream />
        
        <div className="flex-1 overflow-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <DroneStatus />
          <OrientationDisplay orientation={orientation} />
          <MapDisplay />
          <ConnectionSettings />
        </div>
      </main>
      
      <ControlFooter />
    </div>
  );
};

export default Home;
