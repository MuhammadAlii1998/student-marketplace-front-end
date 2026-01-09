import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getAuthToken } from './useAuth';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export type SocketStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export function useSocket(autoConnect = true) {
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<SocketStatus>('disconnected');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!autoConnect) return;

    const token = getAuthToken();
    if (!token) {
      setStatus('error');
      return;
    }

    // Initialize socket connection
    setStatus('connecting');

    const socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setStatus('connected');
      setIsAuthenticated(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setStatus('disconnected');
      setIsAuthenticated(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setStatus('error');
      setIsAuthenticated(false);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [autoConnect]);

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setStatus('disconnected');
      setIsAuthenticated(false);
    }
  };

  return {
    socket: socketRef.current,
    status,
    isConnected: status === 'connected',
    isAuthenticated,
    disconnect,
  };
}
