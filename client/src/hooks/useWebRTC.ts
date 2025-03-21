import { useEffect, useRef, useState, useCallback } from 'react';
import { useDroneStream } from '../context/DroneStreamContext';

interface UseWebRTCOptions {
  isInitiator?: boolean;
  onStream?: (stream: MediaStream) => void;
  mediaConstraints?: MediaStreamConstraints;
}

export const useWebRTC = (targetDeviceId: string | null, options: UseWebRTCOptions = {}) => {
  const { 
    isInitiator = false, 
    onStream, 
    mediaConstraints = { 
      video: true, 
      audio: true 
    } 
  } = options;
  
  const { 
    sendSignalingMessage, 
    onSignalingMessage, 
    currentDevice 
  } = useDroneStream();
  
  const [isConnected, setIsConnected] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  
  // Initialize WebRTC peer connection
  const initPeerConnection = useCallback(() => {
    // Close any existing connection
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    
    // Create a new peer connection
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });
    
    peerConnection.current = pc;
    
    // Add local tracks to the connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        if (localStreamRef.current) {
          pc.addTrack(track, localStreamRef.current);
        }
      });
    }
    
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && targetDeviceId && currentDevice) {
        sendSignalingMessage('ice_candidate', targetDeviceId, {
          candidate: event.candidate
        });
      }
    };
    
    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setIsConnected(true);
      } else if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        setIsConnected(false);
      }
    };
    
    // Handle remote stream
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (onStream) {
        onStream(event.streams[0]);
      }
    };
    
    return pc;
  }, [currentDevice, onStream, sendSignalingMessage, targetDeviceId]);
  
  // Start local media stream
  const startLocalStream = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      localStreamRef.current = stream;
      setLocalStream(stream);
      
      return stream;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to access media devices'));
      console.error('Error accessing media devices:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [mediaConstraints]);
  
  // Create and send offer (for initiator)
  const createOffer = useCallback(async () => {
    if (!peerConnection.current || !targetDeviceId) return;
    
    try {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      
      sendSignalingMessage('offer', targetDeviceId, {
        sdp: peerConnection.current.localDescription
      });
    } catch (err) {
      console.error('Error creating offer:', err);
      setError(err instanceof Error ? err : new Error('Failed to create offer'));
    }
  }, [sendSignalingMessage, targetDeviceId]);
  
  // Handle incoming signaling messages
  useEffect(() => {
    const handleSignalingMessage = async (type: string, from: string, payload: any) => {
      if (!peerConnection.current || from !== targetDeviceId || !currentDevice) return;
      
      try {
        if (type === 'offer' && payload.sdp) {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          
          sendSignalingMessage('answer', from, {
            sdp: peerConnection.current.localDescription
          });
        } else if (type === 'answer' && payload.sdp) {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        } else if (type === 'ice_candidate' && payload.candidate) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
        }
      } catch (err) {
        console.error('Error handling signaling message:', err);
        setError(err instanceof Error ? err : new Error('Signaling error'));
      }
    };
    
    onSignalingMessage(handleSignalingMessage);
  }, [currentDevice, onSignalingMessage, sendSignalingMessage, targetDeviceId]);
  
  // Initialize connection
  const connect = useCallback(async () => {
    if (!targetDeviceId || !currentDevice) {
      setError(new Error('No target device or current device specified'));
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Start local media stream if not already started
      if (!localStreamRef.current) {
        await startLocalStream();
      }
      
      // Initialize peer connection
      const pc = initPeerConnection();
      
      // Create offer if initiator
      if (isInitiator) {
        await createOffer();
      }
      
      return pc;
    } catch (err) {
      console.error('Error connecting:', err);
      setError(err instanceof Error ? err : new Error('Connection failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [createOffer, currentDevice, initPeerConnection, isInitiator, startLocalStream, targetDeviceId]);
  
  // Disconnect and cleanup
  const disconnect = useCallback(() => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    
    setRemoteStream(null);
    setIsConnected(false);
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);
  
  return {
    connect,
    disconnect,
    isConnected,
    isLoading,
    error,
    localStream,
    remoteStream,
    startLocalStream
  };
};
