import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Loader2 } from 'lucide-react';
import { useCreateChat } from '@/hooks/useChat';
import { useIsAuthenticated } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ContactSellerButtonProps {
  sellerId: string;
  sellerName: string;
  productId?: string;
  productTitle?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ContactSellerButton({
  sellerId,
  sellerName,
  productId,
  productTitle,
  className,
  variant = 'default',
  size = 'default',
}: ContactSellerButtonProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useIsAuthenticated();
  const createChat = useCreateChat();
  const [showDialog, setShowDialog] = useState(false);
  const [message, setMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleContactSeller = async () => {
    // Check authentication
    if (!isAuthenticated) {
      toast.error('Login required', {
        description: 'Please login to contact sellers.',
      });
      navigate('/login');
      return;
    }

    setShowDialog(true);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsCreating(true);

    try {
      // Create chat
      const chat = await createChat.mutateAsync({
        sellerId,
        productId,
      });

      toast.success('Chat created!', {
        description: `You can now message ${sellerName}`,
      });

      // Navigate to chat window with initial message
      // The initial message will be sent via socket when the chat window loads
      navigate(`/chat/${chat._id}`, {
        state: { initialMessage: message.trim() },
      });
    } catch (error: unknown) {
      console.error('Failed to create chat:', error);

      // Check if chat already exists
      if (error && typeof error === 'object' && 'status' in error && error.status === 409) {
        // Chat already exists, extract chatId from error
        const errorData = error as { data?: { chatId?: string } };
        if (errorData.data?.chatId) {
          navigate(`/chat/${errorData.data.chatId}`, {
            state: { initialMessage: message.trim() },
          });
          return;
        }
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create chat. Please try again.';
      toast.error('Failed to contact seller', {
        description: errorMessage,
      });
    } finally {
      setIsCreating(false);
      setShowDialog(false);
      setMessage('');
    }
  };

  return (
    <>
      <Button variant={variant} size={size} className={className} onClick={handleContactSeller}>
        <MessageSquare className="h-4 w-4 mr-2" />
        Contact Seller
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Contact {sellerName}</DialogTitle>
            <DialogDescription>
              {productTitle
                ? `Send a message about "${productTitle}"`
                : 'Send a message to the seller'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Hi, I'm interested in this item..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px]"
              disabled={isCreating}
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)} disabled={isCreating}>
                Cancel
              </Button>
              <Button onClick={handleSendMessage} disabled={isCreating || !message.trim()}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
