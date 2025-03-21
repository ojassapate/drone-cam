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
  
  // Use either drone telemetry or device orientation
  const pitch = droneTelemetry?.pitch || orientation.beta;
  const roll = droneTelemetry?.roll || orientation.gamma;
  const yaw = droneTelemetry?.yaw || orientation.alpha;
  const compassHeading = orientation.compassHeading;
  
  // Get transforms for visualization
  const pitchTransform = getPitchTransform(pitch);
  const rollTransform = getRollTransform(roll);
  
  // Get heading text
  const headingText = degreesToHeading(compassHeading);
  
  return (
    <div className="bg-dark-medium rounded-lg p-4 shadow-md">
      <h2 className="text-lg font-medium mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Orientation
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Pitch */}
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19h18M3 5h18M3 12h18" />
          </svg>
          <div>
            <div className="text-xs text-gray-400 mb-1">Pitch</div>
            <span className="text-lg font-medium">{formatOrientation(pitch)}</span>
            <span className="text-sm ml-1">°</span>
          </div>
        </div>
        
        {/* Roll */}
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <div>
            <div className="text-xs text-gray-400 mb-1">Roll</div>
            <span className="text-lg font-medium">{formatOrientation(roll)}</span>
            <span className="text-sm ml-1">°</span>
          </div>
        </div>
        
        {/* Yaw */}
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          <div>
            <div className="text-xs text-gray-400 mb-1">Yaw</div>
            <span className="text-lg font-medium">{formatOrientation(yaw)}</span>
            <span className="text-sm ml-1">°</span>
          </div>
        </div>
        
        {/* Heading */}
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v.01M12 12v.01M12 18v.01M12 7a1 1 0 011 1v1a1 1 0 01-1 1 1 1 0 00-1 1v1a1 1 0 001 1 1 1 0 011 1v1a1 1 0 01-1 1m-8.25 2h16.5" />
          </svg>
          <div>
            <div className="text-xs text-gray-400 mb-1">Heading</div>
            <span className="text-lg font-medium">{headingText}</span>
            <span className="text-sm ml-1">{compassHeading !== null ? `${Math.round(compassHeading)}°` : '--'}</span>
          </div>
        </div>
      </div>
      
      {/* Orientation Visualizer */}
      <div className="mt-4 flex justify-center">
        <div className="relative w-24 h-24 border-2 border-primary rounded-full flex items-center justify-center">
          <div 
            className="w-20 h-3 bg-secondary absolute" 
            style={{ transform: rollTransform, transformOrigin: 'center' }}
            aria-hidden="true"
          ></div>
          <div 
            className="w-3 h-16 bg-primary absolute" 
            style={{ transform: pitchTransform, transformOrigin: 'center' }}
            aria-hidden="true"
          ></div>
          <div className="absolute w-3 h-3 bg-white rounded-full" aria-hidden="true"></div>
        </div>
      </div>
    </div>
  );
};

export default OrientationDisplay;
