import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, LogOut, LayoutDashboard, Inbox, Briefcase, User, Star, Bell, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LawyerOverview from "@/components/lawyer/LawyerOverview";
import IncomingRequests from "@/components/lawyer/IncomingRequests";
import ActiveCases from "@/components/lawyer/ActiveCases";
import LawyerProfileSettings from "@/components/lawyer/LawyerProfileSettings";
import LawyerReviews from "@/components/lawyer/LawyerReviews";
import CaseDocuments from "@/components/lawyer/CaseDocuments";
import SmartLawyerChat from "@/components/lawyer/SmartLawyerChat";
import Notifications from "@/components/dashboard/Notifications";

type ActiveSection = "overview" | "incoming" | "active" | "profile" | "reviews" | "notifications" | "chat" | "documents";

interface ChatState {
  caseId: string;
  userId: string;
  caseType?: string;
  caseDescription?: string;
}

interface DocumentState {
  caseId: string;
  userId: string;
}

const LawyerDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<ActiveSection>("overview");
  const [chatState, setChatState] = useState<ChatState | null>(null);
  const [documentState, setDocumentState] = useState<DocumentState | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/");
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();
      
      // Check if user is authorized to access lawyer dashboard
      if (profile?.user_type !== 'lawyer') {
        navigate("/user-dashboard");
        return;
      }

      setIsAuthorized(true);
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const navItems = [
    { id: "overview" as const, label: "Dashboard", icon: LayoutDashboard },
    { id: "incoming" as const, label: "Requests", icon: Inbox },
    { id: "active" as const, label: "Active Cases", icon: Briefcase },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
    { id: "reviews" as const, label: "Reviews", icon: Star },
    { id: "profile" as const, label: "Profile", icon: User },
  ];

  const handleOpenChat = async (caseId: string, userId: string) => {
    // Fetch case details for AI context
    const { data: caseData } = await supabase
      .from('cases')
      .select('case_type, description')
      .eq('id', caseId)
      .maybeSingle();
    
    setChatState({ 
      caseId, 
      userId,
      caseType: caseData?.case_type,
      caseDescription: caseData?.description || undefined
    });
    setActiveSection("chat");
  };

  const handleViewDocuments = async (caseId: string) => {
    // Fetch the user_id from the case
    const { data: caseData } = await supabase
      .from('cases')
      .select('user_id')
      .eq('id', caseId)
      .maybeSingle();
    
    setDocumentState({ caseId, userId: caseData?.user_id || '' });
    setActiveSection("documents");
  };

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <LawyerOverview />;
      case "incoming":
        return <IncomingRequests />;
      case "active":
        return <ActiveCases onOpenChat={handleOpenChat} onViewDocuments={handleViewDocuments} />;
      case "profile":
        return <LawyerProfileSettings />;
      case "reviews":
        return <LawyerReviews />;
      case "notifications":
        return <Notifications />;
      case "chat":
        if (!chatState) {
          setActiveSection("active");
          return null;
        }
        return (
          <SmartLawyerChat
            chatPartnerId={chatState.userId}
            caseId={chatState.caseId}
            caseType={chatState.caseType}
            caseDescription={chatState.caseDescription}
            onBack={() => {
              setChatState(null);
              setActiveSection("active");
            }}
          />
        );
      case "documents":
        if (!documentState) {
          setActiveSection("active");
          return null;
        }
        return (
          <CaseDocuments
            caseId={documentState.caseId}
            userId={documentState.userId}
            onBack={() => {
              setDocumentState(null);
              setActiveSection("active");
            }}
          />
        );
      default:
        return <LawyerOverview />;
    }
  };

  // Show loading while checking authorization
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center mx-auto mb-4">
            <Scale className="w-5 h-5 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
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
            {activeSection !== "overview" && (
              <Button variant="ghost" size="icon-sm" onClick={() => setActiveSection("overview")}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
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

      {/* Navigation */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto py-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "ghost"}
                size="sm"
                className="shrink-0"
                onClick={() => setActiveSection(item.id)}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
        
        <p className="text-xs text-muted-foreground text-center mt-8">
          NyayBuddy provides AI-assisted legal tools for lawyers. Final legal responsibility rests with the lawyer.
        </p>
      </main>
    </div>
  );
};

export default LawyerDashboard;
