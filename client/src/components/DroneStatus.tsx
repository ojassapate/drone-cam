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
  const battery = droneTelemetry?.battery !== undefined ? droneTelemetry.battery : 60; // default to 60%
  const altitude = droneTelemetry?.altitude !== undefined ? droneTelemetry.altitude : 24.5; // default to 24.5m
  const speed = droneTelemetry?.speed !== undefined ? droneTelemetry.speed : 3.2; // default to 3.2m/s
  const signalStrength = droneTelemetry?.signalStrength !== undefined ? droneTelemetry.signalStrength : 85; // default to 85%
  
  // Get signal quality text and color
  const signalQuality = getSignalQuality(signalStrength);
  
  // Get battery level color class
  const batteryColorClass = getBatteryColorClass(battery);
  
  return (
    <div className="bg-slate-800 rounded-lg p-4 shadow-md">
      <h2 className="text-lg font-medium mb-4 flex items-center">
        Drone Status
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Battery */}
        <div className="flex items-center">
          <div>
            <div className="text-xs text-gray-400 mb-1">Battery</div>
            <div className="flex items-center">
              <div className="w-16 bg-slate-700 rounded-full h-2 mr-2">
                <div 
                  className="bg-green-500 h-full rounded-full" 
                  style={{ width: `${battery}%` }}
                  aria-hidden="true"
                ></div>
              </div>
              <span className="text-sm">{battery}%</span>
            </div>
          </div>
        </div>
        
        {/* Signal */}
        <div className="flex items-center">
          <div>
            <div className="text-xs text-gray-400 mb-1">Signal</div>
            <div className="flex items-center">
              <div className="w-16 bg-slate-700 rounded-full h-2 mr-2">
                <div 
                  className="bg-blue-500 h-full rounded-full" 
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
          <div>
            <div className="text-xs text-gray-400 mb-1">Altitude</div>
            <span className="text-lg font-medium">{altitude.toFixed(1)}</span>
            <span className="text-sm ml-1">m</span>
          </div>
        </div>
        
        {/* Speed */}
        <div className="flex items-center">
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
