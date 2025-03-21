import React from 'react';
import { useDroneStream } from '@/context/DroneStreamContext';
import { getBatteryColorClass, getSignalQuality } from '@/lib/orientationUtils';

const DroneStatus: React.FC = () => {
  const { telemetryData, connectedDevices } = useDroneStream();
  
  // Find drone device if connected
  const droneDevice = connectedDevices.find(d => d.deviceType === 'drone' && d.isConnected);
  
  // Get telemetry data for drone
  const droneTelemetry = droneDevice ? telemetryData[droneDevice.deviceId] : null;
  
  // Default values when no data is available
  const battery = droneTelemetry?.battery || 60; // default to 60%
  const altitude = droneTelemetry?.altitude || 24.5; // default to 24.5m
  const speed = droneTelemetry?.speed || 3.2; // default to 3.2m/s
  const signalStrength = droneTelemetry?.signalStrength || 85; // default to 85%
  
  // Get signal quality text and color
  const signalQuality = getSignalQuality(signalStrength);
  
  // Get battery level color class
  const batteryColorClass = getBatteryColorClass(battery);
  
  return (
    <div className="bg-dark-medium rounded-lg p-4 shadow-md">
      <h2 className="text-lg font-medium mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Drone Status
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Battery */}
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${batteryColorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16h1c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1h-1V4c0-.55-.45-1-1-1H8c-.55 0-1 .45-1 1v4H6c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h1v4c0 .55.45 1 1 1h8c.55 0-1-.45 1-1v-4z" />
          </svg>
          <div>
            <div className="text-xs text-gray-400 mb-1">Battery</div>
            <div className="flex items-center">
              <div className={`w-10 h-5 border-2 ${batteryColorClass} border-current rounded relative mr-2`}>
                <div 
                  className={`h-full ${batteryColorClass} bg-current`} 
                  style={{ width: `${battery}%` }}
                  aria-hidden="true"
                ></div>
                <div className={`w-1 h-3 ${batteryColorClass} bg-current absolute -right-1 top-[3px]`} aria-hidden="true"></div>
              </div>
              <span className="text-sm">{battery}%</span>
            </div>
          </div>
        </div>
        
        {/* Signal */}
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${signalQuality.colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="text-xs text-gray-400 mb-1">Signal</div>
            <div className="flex items-center">
              <div className="w-16 bg-dark rounded-full h-1.5 mr-2">
                <div 
                  className={`${signalQuality.colorClass} h-full rounded-full`} 
                  style={{ width: `${signalStrength}%` }}
                  aria-hidden="true"
                ></div>
              </div>
              <span className="text-sm">{signalQuality.text}</span>
            </div>
          </div>
        </div>
        
        {/* Altitude */}
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <div>
            <div className="text-xs text-gray-400 mb-1">Altitude</div>
            <span className="text-lg font-medium">{altitude.toFixed(1)}</span>
            <span className="text-sm ml-1">m</span>
          </div>
        </div>
        
        {/* Speed */}
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="text-xs text-gray-400 mb-1">Speed</div>
            <span className="text-lg font-medium">{speed.toFixed(1)}</span>
            <span className="text-sm ml-1">m/s</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DroneStatus;
