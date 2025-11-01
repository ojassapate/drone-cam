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
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="icon"
            className={`rounded-full ${streamStatus.isStreaming ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            onClick={handleToggleStream}
          >
            {streamStatus.isStreaming ? '■' : '▶'}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="bg-slate-700 hover:bg-slate-600 rounded-full"
            onClick={handleToggleMute}
          >
            {streamStatus.isMuted ? '🔇' : '🔊'}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="bg-slate-700 hover:bg-slate-600 rounded-full"
            onClick={switchCamera}
          >
            🔄
          </Button>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon"
          className="bg-red-600 hover:bg-red-700 rounded-full"
          onClick={emergencyStop}
        >
          ⚡
        </Button>
      </div>
      
      {/* Stream Status Indicator */}
      <div className="absolute top-2 right-2 bg-black/60 px-3 py-1 rounded-md flex items-center">
        <span 
          className={`w-3 h-3 rounded-full mr-2 ${streamStatus.isStreaming ? 'bg-green-500' : 'bg-red-500'}`}
          aria-hidden="true"
        ></span>
        <span className="text-sm mr-2">{streamStatus.isStreaming ? 'Live' : 'Offline'}</span>
        {streamStatus.isStreaming && (
          <span className="text-xs text-gray-300">{formattedDuration}</span>
        )}
      </div>
      
      {/* Camera Selection Indicator */}
      <div className="absolute top-2 left-2 bg-black/60 px-3 py-1 rounded-md">
        <span className="text-sm flex items-center">
          📷 {streamStatus.activeCamera === 'primary' ? 'Primary Camera' : 'Secondary Camera'}
        </span>
      </div>
    </div>
  );
};

export default VideoStream;
