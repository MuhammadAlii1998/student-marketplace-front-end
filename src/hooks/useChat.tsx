import { useEffect, useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Socket } from 'socket.io-client';
import api from '@/lib/api';
import { useSocket } from './useSocket';

export type Message = {
  _id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId: string;
  message: string;
  createdAt: string;
  delivered: boolean;
  read: boolean;
};

export type Chat = {
  _id: string;
  buyerId: string;
  sellerId: string;
  productId?: string;
  productTitle?: string;
  productImage?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  expiresAt: string;
  participants: {
    _id: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
  }[];
  unreadCount?: number;
  createdAt: string;
};

export type CreateChatData = {
  buyerId?: string;
  sellerId?: string;
  productId?: string;
};

export type SendMessageData = {
  chatId: string;
  message: string;
};

// Get all chats for current user
export function useChats() {
  return useQuery<Chat[]>({
    queryKey: ['chats'],
    queryFn: async () => {
      const response = await api.get<Chat[] | { chats: Chat[] }>('/chats');

      // Handle both response formats: array or object with chats property
      if (Array.isArray(response)) {
        return response;
      } else if (response && typeof response === 'object' && 'chats' in response) {
        return Array.isArray(response.chats) ? response.chats : [];
      }

      return [];
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // refetch every minute
    initialData: [], // Ensure data is always an array
  });
}

// Get single chat by ID
export function useChat(chatId?: string) {
  return useQuery<Chat>({
    queryKey: ['chats', chatId],
    queryFn: () => api.get<Chat>(`/chats/${chatId}`),
    enabled: !!chatId,
    staleTime: 1000 * 30,
  });
}

// Get messages for a chat
export function useMessages(chatId?: string) {
  return useQuery<Message[]>({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      const response = await api.get<Message[] | { messages: Message[] }>(
        `/chats/${chatId}/messages`
      );

      // Handle both response formats: array or object with messages property
      if (Array.isArray(response)) {
        return response;
      } else if (response && typeof response === 'object' && 'messages' in response) {
        return Array.isArray(response.messages) ? response.messages : [];
      }

      return [];
    },
    enabled: !!chatId,
    staleTime: 1000 * 10, // 10 seconds
    initialData: [], // Ensure data is always an array
  });
}

// Create a new chat
export function useCreateChat() {
  const queryClient = useQueryClient();

  return useMutation<Chat, Error, CreateChatData>({
    mutationFn: (data: CreateChatData) => api.post<Chat>('/chats', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
}

// Send message via API (fallback if socket fails)
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation<Message, Error, SendMessageData>({
    mutationFn: ({ chatId, message }: SendMessageData) =>
      api.post<Message>(`/chats/${chatId}/messages`, { message }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
}

// Hook for real-time chat functionality
export function useChatSocket(chatId?: string) {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  // Join chat room
  useEffect(() => {
    if (!socket || !chatId || !isConnected) return;

    socket.emit('join_chat', { chatId });

    return () => {
      socket.emit('leave_chat', { chatId });
    };
  }, [socket, chatId, isConnected]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket || !chatId) return;

    const handleReceiveMessage = (message: Message) => {
      // Add message to cache
      queryClient.setQueryData<Message[]>(['messages', chatId], (old) => {
        if (!old) return [message];
        // Avoid duplicates
        if (old.some((m) => m._id === message._id)) return old;
        return [...old, message];
      });

      // Update chat list
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, chatId, queryClient]);

  // Listen for typing events
  useEffect(() => {
    if (!socket || !chatId) return;

    const handleTyping = () => setOtherUserTyping(true);
    const handleStopTyping = () => setOtherUserTyping(false);

    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);

    return () => {
      socket.off('user_typing', handleTyping);
      socket.off('user_stop_typing', handleStopTyping);
    };
  }, [socket, chatId]);

  // Listen for user online status
  useEffect(() => {
    if (!socket || !chatId) return;

    const handleUserStatus = ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
      queryClient.setQueryData<Chat>(['chats', chatId], (old) => {
        if (!old) return old;
        return {
          ...old,
          participants: old.participants.map((p) => (p._id === userId ? { ...p, isOnline } : p)),
        };
      });
    };

    socket.on('user_status', handleUserStatus);

    return () => {
      socket.off('user_status', handleUserStatus);
    };
  }, [socket, chatId, queryClient]);

  // Send message via socket
  const sendMessage = useCallback(
    (message: string) => {
      if (!socket || !chatId || !isConnected || !message.trim()) return;

      socket.emit('send_message', {
        chatId,
        message: message.trim(),
      });
    },
    [socket, chatId, isConnected]
  );

  // Send typing indicator
  const sendTyping = useCallback(() => {
    if (!socket || !chatId || !isConnected) return;
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { chatId });
    }
  }, [socket, chatId, isConnected, isTyping]);

  // Stop typing indicator
  const stopTyping = useCallback(() => {
    if (!socket || !chatId || !isConnected) return;
    if (isTyping) {
      setIsTyping(false);
      socket.emit('stop_typing', { chatId });
    }
  }, [socket, chatId, isConnected, isTyping]);

  // Mark messages as read
  const markAsRead = useCallback(() => {
    if (!socket || !chatId || !isConnected) return;
    socket.emit('mark_read', { chatId });
  }, [socket, chatId, isConnected]);

  return {
    sendMessage,
    sendTyping,
    stopTyping,
    markAsRead,
    isTyping: otherUserTyping,
    isConnected,
  };
}

// Helper to check if chat is expired
export function isChatExpired(expiresAt: string): boolean {
  if (!expiresAt) return false;
  const expiryTime = new Date(expiresAt).getTime();
  if (isNaN(expiryTime)) return false;
  return expiryTime < Date.now();
}

// Helper to format chat expiry time
export function getChatExpiryDays(expiresAt: string): number {
  if (!expiresAt) return 0;
  const expiryTime = new Date(expiresAt).getTime();
  if (isNaN(expiryTime)) return 0;
  const now = Date.now();
  const diff = expiryTime - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
