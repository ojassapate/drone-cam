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
    try {
      // Close existing connection if any
      if (socketRef.current) {
        try {
          socketRef.current.close();
        } catch (error) {
          console.error("Error closing existing WebSocket connection:", error);
        }
      }
      
      // Determine protocol (WSS for HTTPS, WS for HTTP)
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log(`Connecting to WebSocket at ${wsUrl}`);
      
      // Create new WebSocket
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      // Connection opened
      socket.addEventListener('open', (event) => {
        try {
          setReadyState(WebSocket.OPEN);
          reconnectCountRef.current = 0;
          console.log('WebSocket connection established');
          if (onOpen) onOpen(event);
        } catch (error) {
          console.error("Error in WebSocket open handler:", error);
        }
      });
      
      // Connection closed
      socket.addEventListener('close', (event) => {
        try {
          setReadyState(WebSocket.CLOSED);
          console.log(`WebSocket connection closed. Clean: ${event.wasClean}, Code: ${event.code}`);
          if (onClose) onClose(event);
          
          // Try to reconnect if not a clean close
          if (!event.wasClean && reconnectCountRef.current < reconnectAttempts) {
            reconnectCountRef.current += 1;
            console.log(`Attempting to reconnect (${reconnectCountRef.current}/${reconnectAttempts})...`);
            
            if (reconnectTimerRef.current) {
              clearTimeout(reconnectTimerRef.current);
            }
            
            reconnectTimerRef.current = setTimeout(() => {
              connect();
            }, reconnectInterval);
          }
        } catch (error) {
          console.error("Error in WebSocket close handler:", error);
        }
      });
      
      // Message received
      socket.addEventListener('message', (event) => {
        try {
          setLastMessage(event);
          if (onMessage) onMessage(event);
        } catch (error) {
          console.error("Error in WebSocket message handler:", error);
        }
      });
      
      // Error
      socket.addEventListener('error', (event) => {
        try {
          console.error("WebSocket error:", event);
          setReadyState(socket.readyState);
          if (onError) onError(event);
        } catch (error) {
          console.error("Error in WebSocket error handler:", error);
        }
      });
      
      return () => {
        try {
          socket.close();
        } catch (error) {
          console.error("Error closing WebSocket:", error);
        }
      };
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
      return () => {};
    }
  }, [onClose, onError, onMessage, onOpen, reconnectAttempts, reconnectInterval]);
  
  // Send message via WebSocket
  const sendMessage = useCallback((message: string) => {
    try {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(message);
        return true;
      } else {
        console.warn("WebSocket not ready. Message not sent. ReadyState:", 
          socketRef.current ? socketRef.current.readyState : "Socket not initialized");
      }
    } catch (error) {
      console.error("Error sending WebSocket message:", error);
    }
    return false;
  }, []);
  
  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    try {
      console.log("Disconnecting WebSocket...");
      
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      
      if (socketRef.current) {
        try {
          socketRef.current.close();
          console.log("WebSocket closed successfully");
        } catch (closeError) {
          console.error("Error closing WebSocket:", closeError);
        }
        socketRef.current = null;
      }
      
      setReadyState(WebSocket.CLOSED);
    } catch (error) {
      console.error("Error in disconnect:", error);
    }
  }, []);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      try {
        console.log("Cleaning up WebSocket resources");
        
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
        
        if (socketRef.current) {
          try {
            socketRef.current.close();
            console.log("WebSocket closed during cleanup");
          } catch (closeError) {
            console.error("Error closing WebSocket during cleanup:", closeError);
          }
          socketRef.current = null;
        }
      } catch (error) {
        console.error("Error in WebSocket cleanup:", error);
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
