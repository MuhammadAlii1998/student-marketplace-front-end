import { Layout } from '@/components/layout/Layout';
import { useChats } from '@/hooks/useChat';
import { useIsAuthenticated } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { isChatExpired, getChatExpiryDays } from '@/hooks/useChat';
import { Skeleton } from '@/components/ui/skeleton';

const ChatList = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useIsAuthenticated();
  const { data: chats, isLoading, error } = useChats();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Messages</h1>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-3 w-[300px]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container py-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Messages</h1>
          <Card className="border-destructive">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load messages</h3>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : 'Please try again later'}
              </p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const activeChats = chats?.filter((chat) => !isChatExpired(chat.expiresAt)) || [];
  const expiredChats = chats?.filter((chat) => isChatExpired(chat.expiresAt)) || [];

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">
            Chat with buyers and sellers about your marketplace items
          </p>
        </div>

        {/* Active Chats */}
        {activeChats.length > 0 ? (
          <div className="space-y-3 mb-8">
            <h2 className="text-lg font-semibold mb-3">Active Conversations</h2>
            {activeChats.map((chat) => {
              const otherParticipant = chat.participants[0];
              const daysLeft = getChatExpiryDays(chat.expiresAt);
              const isExpiringSoon = daysLeft <= 2;

              return (
                <Card
                  key={chat._id}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => navigate(`/chat/${chat._id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={otherParticipant?.avatar} />
                          <AvatarFallback>
                            {otherParticipant?.name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        {otherParticipant?.isOnline && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold truncate">
                            {otherParticipant?.name || 'Unknown User'}
                          </h3>
                          {chat.unreadCount && chat.unreadCount > 0 && (
                            <Badge variant="default" className="ml-2">
                              {chat.unreadCount}
                            </Badge>
                          )}
                        </div>

                        {chat.productTitle && (
                          <p className="text-sm text-muted-foreground mb-1 truncate">
                            Re: {chat.productTitle}
                          </p>
                        )}

                        {chat.lastMessage && (
                          <p className="text-sm text-muted-foreground truncate mb-2">
                            {chat.lastMessage}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {chat.lastMessageAt && (
                            <span>
                              {formatDistanceToNow(new Date(chat.lastMessageAt), {
                                addSuffix: true,
                              })}
                            </span>
                          )}
                          {isExpiringSoon && (
                            <span className="flex items-center gap-1 text-warning">
                              <Clock className="h-3 w-3" />
                              Expires in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="mb-8">
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
              <p className="text-muted-foreground mb-6">
                Start chatting with sellers by contacting them from product pages
              </p>
              <Button onClick={() => navigate('/products')}>Browse Products</Button>
            </CardContent>
          </Card>
        )}

        {/* Expired Chats */}
        {expiredChats.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
              Expired Conversations
            </h2>
            {expiredChats.map((chat) => {
              const otherParticipant = chat.participants[0];

              return (
                <Card key={chat._id} className="opacity-60">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={otherParticipant?.avatar} />
                        <AvatarFallback>
                          {otherParticipant?.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate mb-1">
                          {otherParticipant?.name || 'Unknown User'}
                        </h3>
                        {chat.productTitle && (
                          <p className="text-sm text-muted-foreground mb-1 truncate">
                            Re: {chat.productTitle}
                          </p>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Expired after 7 days
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ChatList;
