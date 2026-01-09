import { Layout } from '@/components/layout/Layout';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useChat,
  useMessages,
  useChatSocket,
  isChatExpired,
  getChatExpiryDays,
} from '@/hooks/useChat';
import { useIsAuthenticated, useProfile } from '@/hooks/useAuth';
import { useEffect, useState, useRef, KeyboardEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Send, AlertCircle, Clock, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ChatWindow = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useIsAuthenticated();
  const { data: currentUser } = useProfile();
  const { data: chat, isLoading: chatLoading, error: chatError } = useChat(chatId);
  const { data: messages, isLoading: messagesLoading } = useMessages(chatId);
  const { sendMessage, sendTyping, stopTyping, markAsRead, isTyping, isConnected } =
    useChatSocket(chatId);

  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when chat opens
  useEffect(() => {
    if (chatId && isConnected) {
      markAsRead();
    }
  }, [chatId, isConnected, markAsRead]);

  // Handle typing indicator
  const handleInputChange = (text: string) => {
    setMessageText(text);

    // Send typing indicator
    if (text.trim() && isConnected) {
      sendTyping();

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, 2000);
    } else {
      stopTyping();
    }
  };

  // Send message handler
  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending || !isConnected) return;

    const text = messageText.trim();
    setMessageText('');
    setIsSending(true);
    stopTyping();

    try {
      sendMessage(text);
      // Message will be added to UI via socket event
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message', {
        description: 'Please check your connection and try again.',
      });
      setMessageText(text); // Restore message
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  };

  // Handle Enter key to send
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  // Loading state
  if (chatLoading || messagesLoading) {
    return (
      <Layout>
        <div className="container py-8 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <Card>
            <CardContent className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={cn('flex gap-3', i % 2 === 0 ? 'justify-end' : '')}>
                  {i % 2 !== 0 && <Skeleton className="h-10 w-10 rounded-full" />}
                  <Skeleton className="h-16 w-64" />
                  {i % 2 === 0 && <Skeleton className="h-10 w-10 rounded-full" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Error state
  if (chatError) {
    const is410Error =
      chatError &&
      typeof chatError === 'object' &&
      'status' in chatError &&
      chatError.status === 410;

    return (
      <Layout>
        <div className="container py-8 max-w-4xl">
          <Button variant="ghost" onClick={() => navigate('/messages')} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Messages
          </Button>
          <Card className="border-destructive">
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {is410Error ? 'Chat Expired' : 'Chat Not Found'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {is410Error
                  ? 'This conversation has expired after 7 days. Start a new conversation to continue chatting.'
                  : 'This chat does not exist or you do not have access to it.'}
              </p>
              <Button onClick={() => navigate('/messages')}>Back to Messages</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!chat) {
    return null;
  }

  const otherParticipant = chat.participants.find((p) => p._id !== currentUser?._id);
  const isExpired = isChatExpired(chat.expiresAt);
  const daysLeft = getChatExpiryDays(chat.expiresAt);
  const isExpiringSoon = daysLeft <= 2 && daysLeft > 0;

  return (
    <Layout>
      <div className="container py-4 max-w-4xl">
        {/* Header */}
        <div className="mb-4">
          <Button variant="ghost" onClick={() => navigate('/messages')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Messages
          </Button>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={otherParticipant?.avatar} />
                      <AvatarFallback>
                        {otherParticipant?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {otherParticipant?.isOnline && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold">{otherParticipant?.name || 'Unknown User'}</h2>
                    {chat.productTitle && (
                      <p className="text-sm text-muted-foreground">Re: {chat.productTitle}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <Badge variant="outline" className="gap-1">
                      <Wifi className="h-3 w-3" />
                      Online
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <WifiOff className="h-3 w-3" />
                      Offline
                    </Badge>
                  )}
                  {otherParticipant?.isOnline && (
                    <Badge variant="default" className="bg-green-500">
                      Online
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expiry Warning */}
        {isExpiringSoon && !isExpired && (
          <Alert className="mb-4 border-warning bg-warning/10">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              This conversation will be deleted in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}.
              Chats expire after 7 days.
            </AlertDescription>
          </Alert>
        )}

        {isExpired && (
          <Alert className="mb-4 border-destructive bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This conversation has expired. You can no longer send messages.
            </AlertDescription>
          </Alert>
        )}

        {/* Messages */}
        <Card className="mb-4">
          <CardContent className="p-6 space-y-4 min-h-[400px] max-h-[600px] overflow-y-auto">
            {messages && messages.length > 0 ? (
              <>
                {messages.map((message) => {
                  const isOwnMessage = message.senderId === currentUser?._id;

                  return (
                    <div
                      key={message._id}
                      className={cn('flex gap-3 items-start', isOwnMessage && 'justify-end')}
                    >
                      {!isOwnMessage && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.senderAvatar} />
                          <AvatarFallback>
                            {message.senderName?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={cn(
                          'max-w-[70%] space-y-1',
                          isOwnMessage && 'items-end flex flex-col'
                        )}
                      >
                        <div
                          className={cn(
                            'rounded-lg px-4 py-2',
                            isOwnMessage
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground'
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.message}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                        </span>
                      </div>

                      {isOwnMessage && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={currentUser?.avatar} />
                          <AvatarFallback>
                            {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-3 items-center">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={otherParticipant?.avatar} />
                      <AvatarFallback>
                        {otherParticipant?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <span
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        />
                        <span
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: '0.4s' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <p className="text-muted-foreground mb-2">No messages yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start the conversation by sending a message
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Input */}
        {!isExpired && (
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Textarea
                  ref={textareaRef}
                  placeholder={
                    isConnected
                      ? 'Type your message... (Shift+Enter for new line)'
                      : 'Connecting...'
                  }
                  value={messageText}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!isConnected || isSending}
                  className="min-h-[80px] resize-none"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || !isConnected || isSending}
                  size="icon"
                  className="h-[80px] w-[80px]"
                >
                  {isSending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              {!isConnected && (
                <p className="text-sm text-warning mt-2">Connection lost. Trying to reconnect...</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ChatWindow;
