import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDroneStream } from '@/context/DroneStreamContext';
import { formatDuration } from '@/lib/orientationUtils';
import { useToast } from '@/hooks/use-toast';

const ControlFooter: React.FC = () => {
  const { toast } = useToast();
  const { 
    recordingStatus, 
    toggleRecording, 
    flightStatus, 
    toggleFlight,
    streamStatus,
    currentDevice
  } = useDroneStream();
  
  const [recordingDurationText, setRecordingDurationText] = useState('');
  
  // Format recording duration
  useEffect(() => {
    if (recordingStatus.isRecording) {
      setRecordingDurationText(formatDuration(recordingStatus.duration));
    } else {
      setRecordingDurationText('');
    }
  }, [recordingStatus]);
  
  // Handle capture photo
  const handleTakePhoto = () => {
    const video = document.querySelector('video');
    if (!video) {
      toast({
        title: "Error",
        description: "No video stream available",
        variant: "destructive"
      });
      return;
    }
    
    // Create a canvas element to capture a frame
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current frame to the canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert the canvas to a data URL and "download" it
    try {
      const dataUrl = canvas.toDataURL('image/jpeg');
      
      // Create a link and trigger download
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `drone-capture-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.jpg`;
      a.click();
      
      toast({
        title: "Photo Captured",
        description: "Image saved to your device",
      });
    } catch (err) {
      toast({
        title: "Capture Failed",
        description: "Could not capture photo",
        variant: "destructive"
      });
    }
  };
  
  // Determine if controls should be enabled
  // Only enable controls for the primary device or when simulating a drone
  const isControlEnabled = currentDevice?.deviceType === 'primary' || currentDevice?.deviceType === 'drone';
  
  // Disable flight controls if not streaming
  const canControlFlight = isControlEnabled && streamStatus.isStreaming;
  
  return (
    <footer className="bg-dark-medium py-3 px-4 flex justify-between items-center shadow-lg">
      <div className="flex items-center">
        <Button 
          variant={recordingStatus.isRecording ? "destructive" : "default"}
          className={`flex items-center mr-4 ${!streamStatus.isStreaming && 'opacity-50 cursor-not-allowed'}`}
          onClick={toggleRecording}
          disabled={!streamStatus.isStreaming}
        >
          {recordingStatus.isRecording ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M16 12H8" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-danger" fill="currentColor" viewBox="0 0 24 24" stroke="none">
              <circle cx="12" cy="12" r="10" />
            </svg>
          )}
          <span>{recordingStatus.isRecording ? 'Stop Recording' : 'Record'}</span>
        </Button>
        
        {recordingDurationText && (
          <div className="text-sm">{recordingDurationText}</div>
        )}
      </div>
      
      <div className="flex items-center">
        <Button 
          variant="outline"
          size="sm"
          className="bg-dark-light mr-3 flex items-center"
          onClick={handleTakePhoto}
          disabled={!streamStatus.isStreaming}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Capture
        </Button>
        
        <Button 
          variant={flightStatus.isFlying ? "destructive" : "success"}
          className={`bg-accent hover:bg-accent/80 text-white flex items-center ${!canControlFlight && 'opacity-50 cursor-not-allowed'}`}
          onClick={toggleFlight}
          disabled={!canControlFlight}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {flightStatus.isFlying ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            )}
          </svg>
          <span>{flightStatus.isFlying ? 'Land' : 'Take Off'}</span>
        </Button>
      </div>
    </footer>
  );
};

export default ControlFooter;
