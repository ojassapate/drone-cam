import React from 'react';
import { useDroneStream } from '@/context/DroneStreamContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const ConnectionSettings: React.FC = () => {
  const { toast } = useToast();
  const { 
    connectedDevices,
    sessionId,
    currentDevice
  } = useDroneStream();
  
  // Filter devices by type
  const primaryDevice = connectedDevices.find(d => d.deviceType === 'primary' && d.isConnected);
  const cameraDevice = connectedDevices.find(d => d.deviceType === 'camera' && d.isConnected);
  const droneDevice = connectedDevices.find(d => d.deviceType === 'drone' && d.isConnected);
  
  // Handle new device connection
  const handleAddNewDevice = () => {
    if (!sessionId) return;
    
    // Generate shareable URL
    const shareUrl = `${window.location.origin}${window.location.pathname}?session=${sessionId}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        toast({
          title: "Link Copied!",
          description: "Share this link with another device to connect",
        });
      })
      .catch(err => {
        toast({
          title: "Couldn't copy link",
          description: "Please copy the session ID manually: " + sessionId,
          variant: "destructive"
        });
      });
  };
  
  return (
    <div className="bg-dark-medium rounded-lg p-4 shadow-md col-span-1 md:col-span-2">
      <h2 className="text-lg font-medium mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
        Connected Devices
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Primary Device */}
        <div className="bg-dark p-3 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <div>
              <div className="font-medium">Primary Device</div>
              <div className="text-sm text-gray-400">
                {primaryDevice ? primaryDevice.deviceName : 'Not Connected'}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <span 
              className={`w-3 h-3 rounded-full mr-2 ${primaryDevice ? 'bg-accent' : 'bg-danger'}`}
              aria-hidden="true"
            ></span>
            <span className="text-sm">{primaryDevice ? 'Active' : 'Offline'}</span>
          </div>
        </div>
        
        {/* Camera Device */}
        <div className="bg-dark p-3 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z" />
            </svg>
            <div>
              <div className="font-medium">Camera Device</div>
              <div className="text-sm text-gray-400">
                {cameraDevice ? cameraDevice.deviceName : 'Not Connected'}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <span 
              className={`w-3 h-3 rounded-full mr-2 ${cameraDevice ? 'bg-accent' : 'bg-danger'}`}
              aria-hidden="true"
            ></span>
            <span className="text-sm">{cameraDevice ? 'Connected' : 'Offline'}</span>
          </div>
        </div>
        
        {/* Drone Device */}
        <div className="bg-dark p-3 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <div>
              <div className="font-medium">Drone</div>
              <div className="text-sm text-gray-400">
                {droneDevice ? droneDevice.deviceName : 'Not Connected'}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <span 
              className={`w-3 h-3 rounded-full mr-2 ${droneDevice ? 'bg-accent' : 'bg-danger'}`}
              aria-hidden="true"
            ></span>
            <span className="text-sm">{droneDevice ? 'Connected' : 'Offline'}</span>
          </div>
        </div>
        
        {/* Add New Device */}
        <Button
          variant="outline"
          onClick={handleAddNewDevice}
          className="bg-dark p-3 h-auto rounded-md flex items-center justify-center border border-dashed border-dark-light hover:bg-dark-medium transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Connect New Device</span>
        </Button>
      </div>
      
      {sessionId && (
        <div className="mt-4 p-3 bg-dark rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium mb-1">Session ID</p>
              <p className="text-xs text-gray-400">{sessionId}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddNewDevice}
              className="bg-dark-medium hover:bg-dark-light"
            >
              Share
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionSettings;
