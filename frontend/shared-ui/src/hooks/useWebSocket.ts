import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useWebSocket = (url: string, userId?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socketInstance = io(url, {
      transports: ['websocket'],
      reconnection: true,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      if (userId) {
        socketInstance.emit('subscribe', userId);
      }
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    return () => {
      if (userId) {
        socketInstance.emit('unsubscribe', userId);
      }
      socketInstance.disconnect();
    };
  }, [url, userId]);

  const emit = (event: string, data: unknown) => {
    socketRef.current?.emit(event, data);
  };

  const on = (event: string, callback: (data: unknown) => void) => {
    socketRef.current?.on(event, callback);
  };

  const off = (event: string, callback?: (data: unknown) => void) => {
    socketRef.current?.off(event, callback);
  };

  return {
    socket,
    isConnected,
    emit,
    on,
    off,
  };
};

