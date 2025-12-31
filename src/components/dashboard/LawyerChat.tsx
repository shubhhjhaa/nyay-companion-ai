import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, ArrowLeft, Phone, Video, MoreVertical, Check, CheckCheck, Image, FileText, X, BadgeCheck, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lawyer, getLawyerById } from "@/data/lawyers";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  status: string;
  case_type?: string;
  isFile?: boolean;
  fileName?: string;
}

interface ChatPartnerInfo {
  name: string;
  specialization?: string;
  city?: string;
  profileImage?: string;
  isReal: boolean;
}

interface LawyerChatProps {
  lawyerId: string;
  onBack: () => void;
  caseType?: string;
  userType?: 'user' | 'lawyer';
  chatPartnerId?: string;
  chatPartnerName?: string;
}

// Check if ID is a dummy lawyer ID (not a UUID)
const isDummyLawyerId = (id: string) => {
  return id.startsWith('l') && !id.includes('-');
};

const getAvatarUrl = (name: string) => {
  const bgColors = ['0D9488', '6366F1', 'D97706', 'DC2626', '7C3AED', '059669'];
  const randomColor = bgColors[Math.abs(name.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % bgColors.length];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${randomColor}&color=fff&size=200&bold=true`;
};

const LawyerChat = ({ lawyerId, onBack, caseType, userType = 'user', chatPartnerId, chatPartnerName }: LawyerChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [partnerInfo, setPartnerInfo] = useState<ChatPartnerInfo | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
      
      const partnerId = userType === 'user' ? lawyerId : chatPartnerId;
      
      // Check if this is a dummy lawyer
      if (partnerId && isDummyLawyerId(partnerId)) {
        setIsDemoMode(true);
        if (userType === 'user') {
          const lawyerData = getLawyerById(lawyerId);
          if (lawyerData) {
            setPartnerInfo({
              name: lawyerData.name,
              specialization: lawyerData.specialization,
              city: lawyerData.city,
              profileImage: lawyerData.profileImage,
              isReal: false
            });
          }
        }
        // Load demo messages from localStorage
        const storedMessages = localStorage.getItem(`chat_${partnerId}_${user?.id}`);
        if (storedMessages) {
          setMessages(JSON.parse(storedMessages));
        }
        setIsLoading(false);
        return;
      }
      
      // Fetch real lawyer/user profile
      if (partnerId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, practice_area, city, state, user_type')
          .eq('id', partnerId)
          .maybeSingle();
        
        if (profile) {
          const isLawyer = profile.user_type === 'lawyer';
          setPartnerInfo({
            name: isLawyer ? `Adv. ${profile.full_name}` : profile.full_name || 'User',
            specialization: profile.practice_area,
            city: profile.city,
            profileImage: getAvatarUrl(profile.full_name || 'User'),
            isReal: true
          });
        } else if (userType === 'user') {
          // Fallback to dummy data
          const lawyerData = getLawyerById(lawyerId);
          if (lawyerData) {
            setPartnerInfo({
              name: lawyerData.name,
              specialization: lawyerData.specialization,
              city: lawyerData.city,
              profileImage: lawyerData.profileImage,
              isReal: false
            });
          }
        }
      }
      
      await fetchMessages();
      setIsLoading(false);
    };

    initChat();

    // Subscribe to realtime messages only if not demo mode
    if (!isDemoMode) {
      const channel = supabase
        .channel('messages-channel')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            const newMsg = payload.new as Message;
            if (
              (newMsg.sender_id === currentUserId || newMsg.receiver_id === currentUserId) &&
              (newMsg.sender_id === chatPartnerId || newMsg.receiver_id === chatPartnerId)
            ) {
              setMessages(prev => [...prev, newMsg]);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [lawyerId, chatPartnerId, currentUserId, userType]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Save demo messages to localStorage
  useEffect(() => {
    if (isDemoMode && currentUserId && messages.length > 0) {
      const partnerId = userType === 'user' ? lawyerId : chatPartnerId;
      localStorage.setItem(`chat_${partnerId}_${currentUserId}`, JSON.stringify(messages));
    }
  }, [messages, isDemoMode, currentUserId, lawyerId, chatPartnerId, userType]);

  const fetchMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const partnerId = userType === 'user' ? lawyerId : chatPartnerId;
      if (!partnerId || isDummyLawyerId(partnerId)) return;

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;
    if (!currentUserId) {
      toast.error("Please login to send messages");
      return;
    }

    const receiverId = userType === 'user' ? lawyerId : chatPartnerId;
    
    try {
      let messageContent = newMessage.trim();
      let isFile = false;
      let fileName = '';

      if (selectedFile) {
        // For demo mode, just show file name
        if (isDemoMode) {
          messageContent = `📎 ${selectedFile.name}`;
        } else {
          // Upload file to storage
          const fileExt = selectedFile.name.split('.').pop();
          const filePath = `${currentUserId}/${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('case-documents')
            .upload(filePath, selectedFile);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('case-documents')
            .getPublicUrl(filePath);

          messageContent = publicUrl;
        }
        isFile = true;
        fileName = selectedFile.name;
        setSelectedFile(null);
      }

      const newMsg: Message = {
        id: Date.now().toString(),
        content: messageContent,
        sender_id: currentUserId,
        receiver_id: receiverId!,
        created_at: new Date().toISOString(),
        status: 'sent',
        case_type: caseType,
        isFile,
        fileName
      };

      // For demo mode, just add to local state and get AI response
      if (isDemoMode) {
        setMessages(prev => [...prev, newMsg]);
        setNewMessage("");
        
        // Get AI auto-reply
        try {
          const conversationHistory = messages.map(m => ({
            role: m.sender_id === currentUserId ? 'user' : 'assistant',
            content: m.content
          }));

          const { data, error } = await supabase.functions.invoke('lawyer-auto-reply', {
            body: {
              userMessage: messageContent,
              caseType: caseType,
              lawyerName: partnerInfo?.name,
              conversationHistory
            }
          });

          if (error) throw error;

          const aiReply = data?.reply || "Thank you for your message. The lawyer will respond soon.\n\n— Sent by AI Assistant";
          
          setTimeout(() => {
            const lawyerMsg: Message = {
              id: (Date.now() + 1).toString(),
              content: aiReply,
              sender_id: receiverId!,
              receiver_id: currentUserId,
              created_at: new Date().toISOString(),
              status: 'sent',
              case_type: caseType
            };
            setMessages(prev => [...prev, lawyerMsg]);
          }, 1000 + Math.random() * 1000);
        } catch (aiError) {
          console.error('AI auto-reply error:', aiError);
          // Fallback response
          setTimeout(() => {
            const lawyerMsg: Message = {
              id: (Date.now() + 1).toString(),
              content: `Thank you for your message. ${partnerInfo?.name || 'The lawyer'} is currently offline and will respond soon.\n\n— Sent by AI Assistant (Lawyer will respond soon)`,
              sender_id: receiverId!,
              receiver_id: currentUserId,
              created_at: new Date().toISOString(),
              status: 'sent',
              case_type: caseType
            };
            setMessages(prev => [...prev, lawyerMsg]);
          }, 1500);
        }
        
        toast.success("Message sent to lawyer");
        return;
      }

      // For real lawyers, save to database
      const { error } = await supabase
        .from('messages')
        .insert({
          content: messageContent,
          sender_id: currentUserId,
          receiver_id: receiverId,
          case_type: caseType,
          status: 'pending'
        });

      if (error) throw error;

      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");

      // Trigger AI auto-reply for real lawyers (assuming offline)
      try {
        const conversationHistory = messages.map(m => ({
          role: m.sender_id === currentUserId ? 'user' : 'assistant',
          content: m.content
        }));

        console.log('Calling lawyer-auto-reply edge function...');
        
        const { data: aiData, error: aiError } = await supabase.functions.invoke('lawyer-auto-reply', {
          body: {
            userMessage: messageContent,
            caseType: caseType,
            lawyerName: partnerInfo?.name,
            lawyerId: receiverId,
            userId: currentUserId,
            conversationHistory,
            saveToDatabase: true
          }
        });

        console.log('AI auto-reply response:', aiData, aiError);

        if (!aiError && aiData?.reply) {
          // The edge function saves to DB, we just update local state
          const aiReplyMsg: Message = {
            id: (Date.now() + 1).toString(),
            content: aiData.reply,
            sender_id: receiverId!,
            receiver_id: currentUserId,
            created_at: new Date().toISOString(),
            status: 'sent',
            case_type: caseType
          };
          setTimeout(() => {
            setMessages(prev => [...prev, aiReplyMsg]);
          }, 1000);
        } else if (aiError) {
          console.error('AI auto-reply error:', aiError);
        }
      } catch (aiError) {
        console.error('AI auto-reply error:', aiError);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size should be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const partnerName = userType === 'user' ? partnerInfo?.name : chatPartnerName || partnerInfo?.name;
  const partnerImage = partnerInfo?.profileImage;
  const isRealLawyer = partnerInfo?.isReal;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-muted-foreground">Loading chat...</div>
      </div>
    );
  }

  // Group messages by date
  const messagesByDate: Record<string, Message[]> = {};
  messages.forEach(msg => {
    const dateKey = new Date(msg.created_at).toDateString();
    if (!messagesByDate[dateKey]) messagesByDate[dateKey] = [];
    messagesByDate[dateKey].push(msg);
  });

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-3xl mx-auto bg-card rounded-2xl overflow-hidden shadow-card border border-border">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 bg-gradient-hero text-primary-foreground">
        <Button variant="ghost" size="icon-sm" className="text-primary-foreground hover:bg-white/20" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        {partnerImage ? (
          <img src={partnerImage} alt={partnerName} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
            {partnerName?.charAt(0) || '?'}
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{partnerName || 'Chat'}</h3>
            {isRealLawyer && (
              <BadgeCheck className="w-4 h-4 text-nyay-gold" />
            )}
          </div>
          {userType === 'user' && partnerInfo && (
            <p className="text-xs text-primary-foreground/80">{partnerInfo.specialization} • {partnerInfo.city}</p>
          )}
          {caseType && (
            <p className="text-xs text-primary-foreground/80">Re: {caseType}</p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" className="text-primary-foreground hover:bg-white/20">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="text-primary-foreground hover:bg-white/20">
            <Video className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="text-primary-foreground hover:bg-white/20">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="px-4 py-2 bg-nyay-gold/10 text-nyay-gold text-xs text-center">
          Demo Mode: Chatting with simulated lawyer profile
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 bg-muted/30" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Start a conversation</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Send a message to {partnerName} to begin your legal consultation.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(messagesByDate).map(([dateKey, msgs]) => (
              <div key={dateKey}>
                <div className="flex justify-center mb-4">
                  <span className="px-3 py-1 text-xs bg-muted rounded-full text-muted-foreground">
                    {formatDate(msgs[0].created_at)}
                  </span>
                </div>
                {msgs.map((msg) => {
                  const isOwn = msg.sender_id === currentUserId;
                  const isFileMessage = msg.content.includes('supabase') && msg.content.includes('storage');
                  const isAiMessage = !isOwn && (msg.content.includes('— Sent by AI Assistant') || msg.content.includes('— Sent by AI'));
                  
                  return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
                      <div className={`max-w-[75%] ${isOwn ? 'order-1' : ''}`}>
                        {/* AI Badge */}
                        {isAiMessage && (
                          <div className="flex items-center gap-1 mb-1">
                            <Bot className="w-3 h-3 text-blue-500" />
                            <span className="text-xs text-blue-500 font-medium">AI Assistant</span>
                          </div>
                        )}
                        <div className={`rounded-2xl px-4 py-2 ${
                          isOwn 
                            ? 'bg-primary text-primary-foreground rounded-br-md' 
                            : isAiMessage
                              ? 'bg-blue-50 dark:bg-blue-950/30 text-foreground border border-blue-200 dark:border-blue-800 rounded-bl-md'
                              : 'bg-card text-foreground border border-border rounded-bl-md'
                        }`}>
                          {isFileMessage ? (
                            <a 
                              href={msg.content} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 underline"
                            >
                              <FileText className="w-4 h-4" />
                              <span className="text-sm">View Document</span>
                            </a>
                          ) : msg.content.startsWith('📎') ? (
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              <span className="text-sm">{msg.content.replace('📎 ', '')}</span>
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          )}
                        </div>
                        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                          <span className="text-xs text-muted-foreground">{formatTime(msg.created_at)}</span>
                          {isOwn && (
                            msg.status === 'read' 
                              ? <CheckCheck className="w-3 h-3 text-primary" />
                              : <Check className="w-3 h-3 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Selected File Preview */}
      {selectedFile && (
        <div className="px-4 py-2 bg-muted/50 border-t border-border flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-card rounded-lg flex-1">
            {selectedFile.type.startsWith('image/') ? (
              <Image className="w-4 h-4 text-primary" />
            ) : (
              <FileText className="w-4 h-4 text-primary" />
            )}
            <span className="text-sm truncate flex-1">{selectedFile.name}</span>
            <Button 
              variant="ghost" 
              size="icon-sm" 
              className="h-6 w-6"
              onClick={() => setSelectedFile(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 bg-card border-t border-border">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="w-5 h-5 text-muted-foreground" />
          </Button>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-muted border-0 focus-visible:ring-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          
          <Button
            size="icon-sm"
            className="shrink-0 bg-primary hover:bg-primary/90"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() && !selectedFile}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LawyerChat;
