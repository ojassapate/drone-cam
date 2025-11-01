"use client";

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

export default function Home() {
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
        try {
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
            pitch: droneOrientation.pitch === null ? undefined : droneOrientation.pitch,
            roll: droneOrientation.roll === null ? undefined : droneOrientation.roll,
            yaw: droneOrientation.yaw === null ? undefined : droneOrientation.yaw,
            // Default sensor values
            battery: 100, // Default battery level
            altitude: 0,  // Initialize at ground level
            speed: 0,     // Initialize at standstill
            signalStrength: navigator.onLine ? 100 : 0 // Basic online status
          };
          
          sendTelemetry(telemetryData);
        } catch (error) {
          console.error("Error sending telemetry data:", error);
        }
      }
    }
  });
  
  // Initialize session or join existing session
  useEffect(() => {
    const initializeSession = async () => {
      try {
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
      } catch (error) {
        console.error("Error in session initialization:", error);
      }
    };
    
    if (!isSessionSetup && !sessionId) {
      initializeSession();
    }
  }, [createSession, isSessionSetup, sessionId]);
  
  // Handle user setup completion
  const handleSetupComplete = async (deviceType: 'primary' | 'camera' | 'drone') => {
    if (!sessionId) return;
    
    try {
      // Request gyroscope permissions if primary device
      if (deviceType === 'primary' && hasGyroscope) {
        await requestPermission();
      }
      
      // Register the device with the session
      registerDevice(deviceType, getDeviceName());
      setIsSessionSetup(true);
      setShowSetupModal(false);
    } catch (error) {
      console.error("Error in device setup:", error);
    }
  };
  
  if (showSetupModal) {
    return (
      <div className="bg-slate-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-medium mb-4 flex items-center">
            Device Setup
          </h2>
          
          <p className="mb-4">Select how you want to use this device:</p>
          
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => handleSetupComplete('primary')}
              className="bg-blue-600 p-3 rounded-md flex items-center justify-center"
            >
              Primary Control Device
            </button>
            
            <button 
              onClick={() => handleSetupComplete('camera')}
              className="bg-green-600 p-3 rounded-md flex items-center justify-center"
            >
              Camera Device
            </button>
            
            <button 
              onClick={() => handleSetupComplete('drone')}
              className="bg-purple-600 p-3 rounded-md flex items-center justify-center"
            >
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
    <div className="bg-slate-900 text-white min-h-screen flex flex-col">
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
}
