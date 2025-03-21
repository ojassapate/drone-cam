import { useState, useEffect, useCallback, useRef } from 'react';

interface UseWebSocketOptions {
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onMessage?: (event: MessageEvent) => void;
  onError?: (event: Event) => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef<number>(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { 
    reconnectAttempts = 5, 
    reconnectInterval = 3000,
    onOpen,
    onClose,
    onMessage,
    onError
  } = options;

  // Create WebSocket connection
  const connect = useCallback(() => {
    // Close existing connection if any
    if (socketRef.current) {
      socketRef.current.close();
    }
    
    // Determine protocol (WSS for HTTPS, WS for HTTP)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    // Create new WebSocket
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    
    // Connection opened
    socket.addEventListener('open', (event) => {
      setReadyState(WebSocket.OPEN);
      reconnectCountRef.current = 0;
      if (onOpen) onOpen(event);
    });
    
    // Connection closed
    socket.addEventListener('close', (event) => {
      setReadyState(WebSocket.CLOSED);
      if (onClose) onClose(event);
      
      // Try to reconnect if not a clean close
      if (!event.wasClean && reconnectCountRef.current < reconnectAttempts) {
        reconnectCountRef.current += 1;
        
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
        }
        
        reconnectTimerRef.current = setTimeout(() => {
          connect();
        }, reconnectInterval);
      }
    });
    
    // Message received
    socket.addEventListener('message', (event) => {
      setLastMessage(event);
      if (onMessage) onMessage(event);
    });
    
    // Error
    socket.addEventListener('error', (event) => {
      setReadyState(socket.readyState);
      if (onError) onError(event);
    });
    
    return () => {
      socket.close();
    };
  }, [onClose, onError, onMessage, onOpen, reconnectAttempts, reconnectInterval]);
  
  // Send message via WebSocket
  const sendMessage = useCallback((message: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
      return true;
    }
    return false;
  }, []);
  
  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    setReadyState(WebSocket.CLOSED);
  }, []);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);
  
  return {
    readyState,
    lastMessage,
    sendMessage,
    connect,
    disconnect
  };
};
