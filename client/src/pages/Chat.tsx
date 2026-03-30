import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Send, MessageCircle, Users, Clock, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Chat() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  // Fetch user's messages
  const { data: messages, refetch: refetchMessages } = trpc.messages.list.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time feel
  });

  // Fetch conversation with selected user
  const { data: conversation, refetch: refetchConversation } = trpc.messages.getConversation.useQuery(
    { otherUserId: selectedUserId! },
    { 
      enabled: !!selectedUserId,
      refetchInterval: 3000, // More frequent refresh for active conversation
    }
  );

  // Note: In production, fetch actual admin users list

  // Send message mutation
  const sendMessageMutation = trpc.messages.send.useMutation({
    onSuccess: () => {
      setMessageContent("");
      refetchConversation();
      refetchMessages();
      
      // Scroll to bottom
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Mark message as read mutation
  const markAsReadMutation = trpc.messages.markAsRead.useMutation({
    onSuccess: () => {
      refetchMessages();
    }
  });

  // Auto-scroll to bottom when conversation changes
  useEffect(() => {
    if (scrollRef.current && conversation) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation]);

  // Mark messages as read when viewing conversation
  useEffect(() => {
    if (conversation && user) {
      conversation.forEach(msg => {
        if (msg.recipientId === user.id && msg.isRead === 0) {
          markAsReadMutation.mutate({ id: msg.id });
        }
      });
    }
  }, [conversation, user]);

  // Get unique conversations
  const getConversations = () => {
    if (!messages || !user || messages.length === 0) return [];
    
    const conversationMap = new Map<number, (typeof messages)[0]>();
    
    messages.forEach(msg => {
      const otherUserId = msg.senderId === user.id ? msg.recipientId : msg.senderId;
      const existing = conversationMap.get(otherUserId);
      
      if (!existing || new Date(msg.createdAt) > new Date(existing.createdAt)) {
        conversationMap.set(otherUserId, msg);
      }
    });
    
    return Array.from(conversationMap.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !selectedUserId) return;
    
    await sendMessageMutation.mutateAsync({
      recipientId: selectedUserId,
      content: messageContent,
    });
  };

  const getOtherUserName = (msg: NonNullable<typeof messages>[0]) => {
    if (!user) return "";
    return msg.senderId === user.id ? "Organisateur" : "Utilisateur";
  };

  const getUnreadCount = (otherUserId: number) => {
    if (!messages || !user) return 0;
    return messages.filter(
      msg => msg.senderId === otherUserId && msg.recipientId === user.id && msg.isRead === 0
    ).length;
  };

  // For admins, get default recipient (first admin)
  useEffect(() => {
    if (user && user.role !== 'admin' && !selectedUserId) {
      // Candidates should message admins by default
      // We'll use a placeholder admin ID (1) - in production, fetch actual admin users
      setSelectedUserId(1);
    }
  }, [user, selectedUserId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const conversations = getConversations();
  const selectedConversation = conversations.find(c => 
    (c.senderId === user?.id && c.recipientId === selectedUserId) ||
    (c.recipientId === user?.id && c.senderId === selectedUserId)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-8">
      <div className="container max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-display font-bold mb-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
            Messagerie
          </h1>
          <p className="text-gray-400">
            {user?.role === 'admin' 
              ? 'Communiquez avec les candidats et l\'équipe' 
              : 'Communiquez avec les organisateurs'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="lg:col-span-1 border-yellow-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-yellow-500" />
                Conversations
              </CardTitle>
              <CardDescription>
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                {conversations.length === 0 ? (
                  <div className="p-6 text-center text-gray-400">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucune conversation</p>
                    {user?.role !== 'admin' && (
                      <p className="text-sm mt-2">
                        Envoyez un message aux organisateurs pour commencer
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {conversations.map((msg) => {
                      const otherUserId = msg.senderId === user?.id ? msg.recipientId : msg.senderId;
                      const unreadCount = getUnreadCount(otherUserId);
                      const isSelected = selectedUserId === otherUserId;
                      
                      return (
                        <motion.button
                          key={msg.id}
                          onClick={() => setSelectedUserId(otherUserId)}
                          className={`w-full p-4 text-left hover:bg-accent/50 transition-colors ${
                            isSelected ? 'bg-accent' : ''
                          }`}
                          whileHover={{ x: 4 }}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-yellow-500 text-black">
                                {getOtherUserName(msg).charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold truncate">
                                  {getOtherUserName(msg)}
                                </h3>
                                {unreadCount > 0 && (
                                  <Badge variant="destructive" className="ml-2">
                                    {unreadCount}
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-sm text-gray-400 truncate">
                                {msg.content}
                              </p>
                              
                              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(msg.createdAt), { 
                                  addSuffix: true,
                                  locale: fr 
                                })}
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 border-yellow-500/20">
            {selectedUserId ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-yellow-500 text-black">
                        {selectedConversation ? getOtherUserName(selectedConversation).charAt(0) : 'O'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>
                        {selectedConversation ? getOtherUserName(selectedConversation) : 'Organisateur'}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        En ligne
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <ScrollArea className="h-[480px] p-4" ref={scrollRef}>
                    <AnimatePresence>
                      {conversation && conversation.length > 0 ? (
                        <div className="space-y-4">
                          {conversation.map((msg, index) => {
                            const isOwn = msg.senderId === user?.id;
                            
                            return (
                              <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                              >
                                <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                                  <div
                                    className={`rounded-2xl px-4 py-3 ${
                                      isOwn
                                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black'
                                        : 'bg-card border'
                                    }`}
                                  >
                                    <p className="text-sm whitespace-pre-wrap break-words">
                                      {msg.content}
                                    </p>
                                  </div>
                                  
                                  <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
                                    isOwn ? 'justify-end' : 'justify-start'
                                  }`}>
                                    <Clock className="w-3 h-3" />
                                    {formatDistanceToNow(new Date(msg.createdAt), { 
                                      addSuffix: true,
                                      locale: fr 
                                    })}
                                    {isOwn && msg.isRead === 1 && (
                                      <CheckCheck className="w-4 h-4 text-blue-500" />
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-center text-gray-400">
                          <div>
                            <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>Aucun message</p>
                            <p className="text-sm mt-2">Envoyez un message pour commencer la conversation</p>
                          </div>
                        </div>
                      )}
                    </AnimatePresence>
                  </ScrollArea>
                </CardContent>

                <Separator />

                <CardFooter className="p-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex gap-2 w-full"
                  >
                    <Input
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="Écrivez votre message..."
                      className="flex-1"
                      disabled={sendMessageMutation.isPending}
                    />
                    <Button
                      type="submit"
                      disabled={!messageContent.trim() || sendMessageMutation.isPending}
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </form>
                </CardFooter>
              </>
            ) : (
              <div className="h-[680px] flex items-center justify-center text-center text-gray-400">
                <div>
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold mb-2">Sélectionnez une conversation</p>
                  <p className="text-sm">
                    {user?.role === 'admin'
                      ? 'Choisissez un candidat pour commencer à discuter'
                      : 'Commencez une conversation avec les organisateurs'}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
