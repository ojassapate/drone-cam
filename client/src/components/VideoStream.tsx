import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDroneStream } from '@/context/DroneStreamContext';
import { useWebRTC } from '@/hooks/useWebRTC';
import { formatDuration } from '@/lib/orientationUtils';

const VideoStream: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [targetDevice, setTargetDevice] = useState<string | null>(null);
  
  const { 
    streamStatus, 
    toggleStream, 
    toggleMute, 
    switchCamera,
    connectedDevices,
    currentDevice,
    emergencyStop
  } = useDroneStream();
  
  const { 
    localStream,
    remoteStream,
    connect,
    disconnect,
    startLocalStream
  } = useWebRTC(targetDevice, {
    isInitiator: currentDevice?.deviceType === 'primary',
    mediaConstraints: {
      video: true,
      audio: !streamStatus.isMuted
    }
  });
  
  // Find appropriate streaming target based on device type
  useEffect(() => {
    if (!currentDevice || connectedDevices.length === 0) return;
    
    let target = null;
    
    if (currentDevice.deviceType === 'primary') {
      // Primary device connects to camera device
      const cameraDevice = connectedDevices.find(d => 
        d.deviceType === 'camera' && d.isConnected
      );
      if (cameraDevice) target = cameraDevice.deviceId;
    } else if (currentDevice.deviceType === 'camera') {
      // Camera device connects to primary device
      const primaryDevice = connectedDevices.find(d => 
        d.deviceType === 'primary' && d.isConnected
      );
      if (primaryDevice) target = primaryDevice.deviceId;
    }
    
    setTargetDevice(target);
  }, [connectedDevices, currentDevice]);
  
  // Update video source when stream changes
  useEffect(() => {
    if (videoRef.current) {
      const stream = remoteStream || localStream;
      
      if (stream && streamStatus.isStreaming) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => {
          console.error("Error playing video:", err);
        });
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [localStream, remoteStream, streamStatus.isStreaming]);
  
  // Connect/disconnect WebRTC based on streaming status
  useEffect(() => {
    if (streamStatus.isStreaming && targetDevice) {
      connect().catch(err => {
        console.error("WebRTC connection error:", err);
      });
    } else {
      disconnect();
    }
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect, streamStatus.isStreaming, targetDevice]);
  
  // Handle toggle stream
  const handleToggleStream = async () => {
    if (!streamStatus.isStreaming) {
      // Start the stream
      try {
        await startLocalStream();
      } catch (err) {
        console.error("Error starting stream:", err);
        return;
      }
    }
    
    toggleStream();
  };
  
  // Handle toggle mute
  const handleToggleMute = () => {
    toggleMute();
    
    // Update audio tracks in the stream
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !streamStatus.isMuted;
      });
    }
  };
  
  // Format stream duration
  const formattedDuration = formatDuration(streamStatus.streamDuration);
  
  return (
    <div className="relative w-full bg-black aspect-video">
      <video 
        ref={videoRef}
        className="w-full h-full object-cover"
        muted={currentDevice?.deviceType !== 'primary'}
        playsInline
      />
      
      {/* Video Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-opacity-50 bg-dark p-2 flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className={`rounded-full p-2 mr-2 ${streamStatus.isStreaming ? 'bg-danger' : 'bg-primary'}`}
            onClick={handleToggleStream}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {streamStatus.isStreaming 
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M16 12H8" /> 
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z" />
              }
            </svg>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="bg-dark-medium rounded-full p-2 mr-2"
            onClick={handleToggleMute}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {streamStatus.isMuted 
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              }
            </svg>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="bg-secondary rounded-full p-2"
            onClick={switchCamera}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </Button>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon"
          className="bg-danger rounded-full p-2"
          onClick={emergencyStop}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </Button>
      </div>
      
      {/* Stream Status Indicator */}
      <div className="absolute top-2 right-2 bg-opacity-70 bg-dark px-2 py-1 rounded-md flex items-center">
        <span 
          className={`w-3 h-3 rounded-full mr-2 ${streamStatus.isStreaming ? 'bg-accent' : 'bg-danger'}`}
          aria-hidden="true"
        ></span>
        <span className="text-sm mr-2">{streamStatus.isStreaming ? 'Live' : 'Offline'}</span>
        {streamStatus.isStreaming && (
          <span className="text-xs text-gray-300">{formattedDuration}</span>
        )}
      </div>
      
      {/* Camera Selection Indicator */}
      <div className="absolute top-2 left-2 bg-opacity-70 bg-dark px-2 py-1 rounded-md">
        <span className="text-sm flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {streamStatus.activeCamera === 'primary' ? 'Primary Camera' : 'Secondary Camera'}
        </span>
      </div>
    </div>
  );
};

export default VideoStream;
