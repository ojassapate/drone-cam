import React from 'react';
import { useDroneStream } from '@/context/DroneStreamContext';
import { degreesToHeading, formatOrientation, getPitchTransform, getRollTransform } from '@/lib/orientationUtils';

interface OrientationProps {
  orientation: {
    alpha: number | null; // z-axis (0-360 deg) - compass direction
    beta: number | null;  // x-axis (-180 to 180 deg) - front to back
    gamma: number | null; // y-axis (-90 to 90 deg) - left to right
    absolute: boolean;
    compassHeading: number | null;
  }
}

const OrientationDisplay: React.FC<OrientationProps> = ({ orientation }) => {
  const { telemetryData, connectedDevices } = useDroneStream();
  
  // Find drone device if connected
  const droneDevice = connectedDevices.find(d => d.deviceType === 'drone' && d.isConnected);
  
  // Get telemetry data for drone or use orientation data from device
  const droneTelemetry = droneDevice ? telemetryData[droneDevice.deviceId] : null;
  
  // Use either drone telemetry or device orientation with null safety
  const pitch = droneTelemetry?.pitch !== undefined ? droneTelemetry.pitch : orientation.beta;
  const roll = droneTelemetry?.roll !== undefined ? droneTelemetry.roll : orientation.gamma;
  const yaw = droneTelemetry?.yaw !== undefined ? droneTelemetry.yaw : orientation.alpha;
  const compassHeading = orientation.compassHeading;
  
  // Get transforms for visualization
  const pitchTransform = getPitchTransform(pitch);
  const rollTransform = getRollTransform(roll);
  
  // Get heading text
  const headingText = degreesToHeading(compassHeading);
  
  return (
    <div className="bg-slate-800 rounded-lg p-4 shadow-md">
      <h2 className="text-lg font-medium mb-4 flex items-center">
        Orientation
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Pitch */}
        <div className="flex items-center">
          <div>
            <div className="text-xs text-gray-400 mb-1">Pitch</div>
            <span className="text-lg font-medium">{formatOrientation(pitch)}</span>
            <span className="text-sm ml-1">°</span>
          </div>
        </div>
        
        {/* Roll */}
        <div className="flex items-center">
          <div>
            <div className="text-xs text-gray-400 mb-1">Roll</div>
            <span className="text-lg font-medium">{formatOrientation(roll)}</span>
            <span className="text-sm ml-1">°</span>
          </div>
        </div>
        
        {/* Yaw */}
        <div className="flex items-center">
          <div>
            <div className="text-xs text-gray-400 mb-1">Yaw</div>
            <span className="text-lg font-medium">{formatOrientation(yaw)}</span>
            <span className="text-sm ml-1">°</span>
          </div>
        </div>
        
        {/* Heading */}
        <div className="flex items-center">
          <div>
            <div className="text-xs text-gray-400 mb-1">Heading</div>
            <span className="text-lg font-medium">{headingText || 'N/A'}</span>
            <span className="text-sm ml-1">{compassHeading !== null ? `${Math.round(compassHeading)}°` : '--'}</span>
          </div>
        </div>
      </div>
      
      {/* Orientation Visualizer */}
      <div className="mt-4 flex justify-center">
        <div className="relative w-24 h-24 border-2 border-blue-500 rounded-full flex items-center justify-center">
          <div 
            className="w-20 h-3 bg-green-500 absolute" 
            style={{ transform: rollTransform || 'rotate(0deg)', transformOrigin: 'center' }}
            aria-hidden="true"
          ></div>
          <div 
            className="w-3 h-16 bg-blue-500 absolute" 
            style={{ transform: pitchTransform || 'rotate(0deg)', transformOrigin: 'center' }}
            aria-hidden="true"
          ></div>
          <div className="absolute w-3 h-3 bg-white rounded-full" aria-hidden="true"></div>
        </div>
      </div>
    </div>
  );
};

export default OrientationDisplay;
