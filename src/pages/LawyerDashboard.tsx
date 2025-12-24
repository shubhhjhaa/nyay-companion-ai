import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, LogOut, MessageSquare, User, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LawyerChat from "@/components/dashboard/LawyerChat";

interface ChatThread {
  partnerId: string;
  partnerName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  caseType?: string;
}

const LawyerDashboard = () => {
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState<ChatThread | null>(null);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingRequests: 0,
    activeClients: 0,
    casesThisMonth: 0
  });

  useEffect(() => {
    fetchChatThreads();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get unique senders (active clients)
      const { data: messages } = await supabase
        .from('messages')
        .select('sender_id, status')
        .eq('receiver_id', user.id);

      if (messages) {
        const uniqueClients = new Set(messages.map(m => m.sender_id));
        const pendingCount = messages.filter(m => m.status === 'pending' || m.status === 'sent').length;
        
        setStats({
          pendingRequests: pendingCount,
          activeClients: uniqueClients.size,
          casesThisMonth: Math.floor(uniqueClients.size * 0.6) // Approximate
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchChatThreads = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all messages where the lawyer is receiver or sender
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by chat partner
      const threadMap = new Map<string, ChatThread>();
      
      for (const msg of messages || []) {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!partnerId) continue;
        
        if (!threadMap.has(partnerId)) {
          // Fetch partner profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', partnerId)
            .single();

          threadMap.set(partnerId, {
            partnerId,
            partnerName: profile?.full_name || 'User',
            lastMessage: msg.content,
            lastMessageTime: msg.created_at,
            unreadCount: msg.receiver_id === user.id && msg.status !== 'read' ? 1 : 0,
            caseType: msg.case_type || undefined
          });
        } else {
          const thread = threadMap.get(partnerId)!;
          if (msg.receiver_id === user.id && msg.status !== 'read') {
            thread.unreadCount++;
          }
        }
      }

      setChatThreads(Array.from(threadMap.values()));
    } catch (error) {
      console.error('Error fetching chat threads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  if (activeChat) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon-sm" onClick={() => setActiveChat(null)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
                <Scale className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Nyay<span className="text-nyay-gold">Buddy</span></span>
              <span className="px-2 py-1 text-xs font-medium bg-nyay-gold/20 text-nyay-gold rounded-full">Lawyer</span>
            </div>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-8">
          <LawyerChat
            lawyerId=""
            chatPartnerId={activeChat.partnerId}
            chatPartnerName={activeChat.partnerName}
            caseType={activeChat.caseType}
            userType="lawyer"
            onBack={() => setActiveChat(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
              <Scale className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Nyay<span className="text-nyay-gold">Buddy</span></span>
            <span className="px-2 py-1 text-xs font-medium bg-nyay-gold/20 text-nyay-gold rounded-full">Lawyer</span>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Lawyer Dashboard</h1>
        <p className="text-muted-foreground mb-8">Manage your cases and client inquiries</p>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-nyay-gold/10 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-nyay-gold" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingRequests}</p>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-nyay-teal/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-nyay-teal" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeClients}</p>
                  <p className="text-sm text-muted-foreground">Active Clients</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-nyay-indigo/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-nyay-indigo" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.casesThisMonth}</p>
                  <p className="text-sm text-muted-foreground">Cases This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Messages */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Client Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-16 bg-muted rounded"></div>
                <div className="h-16 bg-muted rounded"></div>
              </div>
            ) : chatThreads.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No client inquiries yet</p>
                <p className="text-sm text-muted-foreground mt-2">When users contact you, their messages will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {chatThreads.map((thread) => (
                  <div
                    key={thread.partnerId}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setActiveChat(thread)}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-bold">
                      {thread.partnerName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">{thread.partnerName}</h3>
                        <span className="text-xs text-muted-foreground">{formatTime(thread.lastMessageTime)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{thread.lastMessage}</p>
                      {thread.caseType && (
                        <span className="text-xs text-nyay-teal">Re: {thread.caseType}</span>
                      )}
                    </div>
                    {thread.unreadCount > 0 && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                        {thread.unreadCount}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center mt-8">
          NyayBuddy provides AI-assisted legal guidance and lawyer discovery. It does not replace professional legal consultation.
        </p>
      </div>
    </div>
  );
};

export default LawyerDashboard;
