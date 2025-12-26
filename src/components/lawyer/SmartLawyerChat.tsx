import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, ArrowLeft, Phone, Video, MoreVertical, Check, CheckCheck, FileText, X, BadgeCheck, Brain, Sparkles, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

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
  aiAnalysis?: DocumentAnalysis | null;
}

interface DocumentAnalysis {
  documentType: string;
  category: string;
  relevance: string;
  extractedInfo: string[];
  missingDocuments: string[];
  aiNotes: string;
}

interface SmartLawyerChatProps {
  chatPartnerId: string;
  chatPartnerName?: string;
  caseId?: string;
  caseType?: string;
  caseDescription?: string;
  onBack: () => void;
}

const SmartLawyerChat = ({ 
  chatPartnerId, 
  chatPartnerName, 
  caseId,
  caseType,
  caseDescription,
  onBack 
}: SmartLawyerChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const [isGeneratingReplies, setIsGeneratingReplies] = useState(false);
  const [partnerProfile, setPartnerProfile] = useState<{ name: string; city?: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }

      // Fetch partner profile
      if (chatPartnerId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, city')
          .eq('id', chatPartnerId)
          .maybeSingle();

        if (profile) {
          setPartnerProfile({
            name: profile.full_name || chatPartnerName || 'Client',
            city: profile.city
          });
        } else {
          setPartnerProfile({ name: chatPartnerName || 'Client' });
        }
      }

      await fetchMessages();
      setIsLoading(false);
    };

    initChat();

    // Subscribe to realtime messages
    const channel = supabase
      .channel('lawyer-chat-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          if (
            (newMsg.sender_id === currentUserId || newMsg.receiver_id === currentUserId) &&
            (newMsg.sender_id === chatPartnerId || newMsg.receiver_id === chatPartnerId)
          ) {
            // Auto-analyze if it's a file from the client
            if (newMsg.sender_id === chatPartnerId && isFileMessage(newMsg.content)) {
              const analyzed = await analyzeDocument(newMsg);
              setMessages(prev => [...prev, analyzed]);
            } else {
              setMessages(prev => [...prev, newMsg]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatPartnerId, currentUserId, chatPartnerName]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const isFileMessage = (content: string) => {
    return content.includes('supabase') && content.includes('storage');
  };

  const getFileNameFromUrl = (url: string) => {
    try {
      const parts = url.split('/');
      return decodeURIComponent(parts[parts.length - 1]);
    } catch {
      return 'Document';
    }
  };

  const fetchMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${chatPartnerId}),and(sender_id.eq.${chatPartnerId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Convert to local Message type and analyze file messages from client
      const messagesWithAnalysis = await Promise.all(
        (data || []).map(async (msg): Promise<Message> => {
          const localMsg: Message = {
            id: msg.id,
            content: msg.content,
            sender_id: msg.sender_id || '',
            receiver_id: msg.receiver_id || '',
            created_at: msg.created_at || new Date().toISOString(),
            status: msg.status || 'sent',
            case_type: msg.case_type || undefined,
            aiAnalysis: null
          };
          
          if (msg.sender_id === chatPartnerId && isFileMessage(msg.content)) {
            return await analyzeDocument(localMsg);
          }
          return localMsg;
        })
      );

      setMessages(messagesWithAnalysis);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const analyzeDocument = async (message: Message): Promise<Message> => {
    try {
      const fileName = getFileNameFromUrl(message.content);
      
      const { data, error } = await supabase.functions.invoke('lawyer-chat-ai', {
        body: {
          action: 'analyze_document',
          documentName: fileName,
          documentUrl: message.content,
          caseType: caseType,
          caseDescription: caseDescription
        }
      });

      if (error) throw error;

      return {
        ...message,
        aiAnalysis: data?.data || null
      };
    } catch (error) {
      console.error('Error analyzing document:', error);
      return message;
    }
  };

  const generateSmartReplies = async (clientMessage: string) => {
    setIsGeneratingReplies(true);
    try {
      const recentContext = messages.slice(-5).map(m => 
        `${m.sender_id === currentUserId ? 'Lawyer' : 'Client'}: ${m.content}`
      );

      const { data, error } = await supabase.functions.invoke('lawyer-chat-ai', {
        body: {
          action: 'smart_reply',
          messageContent: clientMessage,
          caseType: caseType,
          caseDescription: caseDescription,
          conversationContext: recentContext
        }
      });

      if (error) throw error;

      if (Array.isArray(data?.data)) {
        setSuggestedReplies(data.data);
      }
    } catch (error) {
      console.error('Error generating replies:', error);
      toast.error('Failed to generate smart replies');
    } finally {
      setIsGeneratingReplies(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;
    if (!currentUserId) {
      toast.error("Please login to send messages");
      return;
    }

    try {
      let messageContent = newMessage.trim();
      let isFile = false;
      let fileName = '';

      if (selectedFile) {
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
        isFile = true;
        fileName = selectedFile.name;
        setSelectedFile(null);
      }

      const newMsg: Message = {
        id: Date.now().toString(),
        content: messageContent,
        sender_id: currentUserId,
        receiver_id: chatPartnerId,
        created_at: new Date().toISOString(),
        status: 'sent',
        case_type: caseType,
        isFile,
        fileName
      };

      const { error } = await supabase
        .from('messages')
        .insert({
          content: messageContent,
          sender_id: currentUserId,
          receiver_id: chatPartnerId,
          case_type: caseType,
          case_id: caseId,
          status: 'sent'
        });

      if (error) throw error;

      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");
      setSuggestedReplies([]);
      toast.success("Message sent");
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

  const handleUseSuggestedReply = (reply: string) => {
    setNewMessage(reply);
    setSuggestedReplies([]);
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
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

  // Find last client message for smart reply button
  const lastClientMessage = [...messages].reverse().find(m => m.sender_id === chatPartnerId);

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
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto bg-card rounded-2xl overflow-hidden shadow-card border border-border">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 bg-gradient-hero text-primary-foreground">
        <Button variant="ghost" size="icon-sm" className="text-primary-foreground hover:bg-white/20" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
          {(partnerProfile?.name || 'C').charAt(0)}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{partnerProfile?.name || 'Client'}</h3>
          </div>
          {caseType && (
            <p className="text-xs text-primary-foreground/80">Case: {caseType}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs">
            <Brain className="w-3 h-3" />
            AI Smart Chat
          </div>
        </div>
      </div>

      {/* AI Features Banner */}
      <div className="px-4 py-2 bg-primary/5 border-b border-border flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="w-4 h-4" />
          <span>AI auto-analyzes documents & suggests smart replies</span>
        </div>
        {lastClientMessage && !isGeneratingReplies && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-xs"
            onClick={() => generateSmartReplies(lastClientMessage.content)}
          >
            <Wand2 className="w-3 h-3 mr-1" />
            Generate Reply
          </Button>
        )}
        {isGeneratingReplies && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" />
            Generating...
          </div>
        )}
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 bg-muted/30" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">AI-Powered Chat</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Documents sent by your client will be automatically analyzed. You'll get AI-suggested replies.
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
                  const isFileMsg = isFileMessage(msg.content);
                  
                  return (
                    <div key={msg.id} className="mb-3">
                      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%]`}>
                          <div className={`rounded-2xl px-4 py-2 ${
                            isOwn 
                              ? 'bg-primary text-primary-foreground rounded-br-md' 
                              : 'bg-card text-foreground border border-border rounded-bl-md'
                          }`}>
                            {isFileMsg ? (
                              <a 
                                href={msg.content} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 underline"
                              >
                                <FileText className="w-4 h-4" />
                                <span className="text-sm">{getFileNameFromUrl(msg.content)}</span>
                              </a>
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

                      {/* AI Document Analysis Card */}
                      {!isOwn && msg.aiAnalysis && (
                        <Card className="mt-2 ml-4 max-w-[85%] bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Brain className="w-4 h-4 text-primary" />
                              <span className="text-xs font-medium text-primary">AI Document Analysis</span>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Type:</span>
                                <span className="font-medium">{msg.aiAnalysis.documentType}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                  msg.aiAnalysis.relevance === 'high' ? 'bg-green-500/20 text-green-700' :
                                  msg.aiAnalysis.relevance === 'medium' ? 'bg-yellow-500/20 text-yellow-700' :
                                  'bg-gray-500/20 text-gray-600'
                                }`}>
                                  {msg.aiAnalysis.relevance} relevance
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Category: </span>
                                <span>{msg.aiAnalysis.category}</span>
                              </div>
                              {msg.aiAnalysis.extractedInfo?.length > 0 && (
                                <div>
                                  <span className="text-muted-foreground">Key Info: </span>
                                  <span>{msg.aiAnalysis.extractedInfo.join(', ')}</span>
                                </div>
                              )}
                              {msg.aiAnalysis.missingDocuments?.length > 0 && (
                                <div className="p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                                  <span className="text-yellow-700 font-medium">Missing Documents: </span>
                                  <span className="text-yellow-600">{msg.aiAnalysis.missingDocuments.join(', ')}</span>
                                </div>
                              )}
                              {msg.aiAnalysis.aiNotes && (
                                <p className="text-muted-foreground italic">{msg.aiAnalysis.aiNotes}</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Suggested Replies */}
      {suggestedReplies.length > 0 && (
        <div className="px-4 py-3 bg-primary/5 border-t border-border">
          <div className="flex items-center gap-2 mb-2 text-xs text-primary">
            <Sparkles className="w-3 h-3" />
            <span className="font-medium">AI Suggested Replies</span>
          </div>
          <div className="space-y-2">
            {suggestedReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => handleUseSuggestedReply(reply)}
                className="w-full text-left p-2 text-sm bg-card rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected File Preview */}
      {selectedFile && (
        <div className="px-4 py-2 bg-muted/50 border-t border-border flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-card rounded-lg flex-1">
            <FileText className="w-4 h-4 text-primary" />
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

export default SmartLawyerChat;
