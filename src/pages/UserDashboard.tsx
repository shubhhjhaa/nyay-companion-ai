import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, LogOut, Search, MessageSquareText, Mail, ArrowLeft, Folder, Heart, Bell, Book, Shield, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import FindLawyers from "@/components/dashboard/FindLawyers";
import NyayScan from "@/components/dashboard/NyayScan";
import NyayMail from "@/components/dashboard/NyayMail";
import NyayNotice from "@/components/dashboard/NyayNotice";
import MyCases from "@/components/dashboard/MyCases";
import SavedLawyers from "@/components/dashboard/SavedLawyers";
import Notifications from "@/components/dashboard/Notifications";
import LegalDictionary from "@/components/dashboard/LegalDictionary";
import PrivacySettings from "@/components/dashboard/PrivacySettings";
import LawyerChat from "@/components/dashboard/LawyerChat";
import SnehhChatbot from "@/components/dashboard/SnehhChatbot";

type ActiveFeature = "home" | "find" | "nyayscan" | "nyaymail" | "nyaynotice" | "cases" | "saved" | "notifications" | "dictionary" | "privacy" | "chat";

interface ChatState {
  lawyerId: string;
  caseType: string;
  caseId?: string;
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState<ActiveFeature>("home");
  const [prefillCaseType, setPrefillCaseType] = useState<string>("");
  const [chatState, setChatState] = useState<ChatState | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const mainFeatures = [
    { id: "find" as const, title: "Find Lawyers", description: "Search by location and case type", icon: Search, color: "text-nyay-gold", bgColor: "bg-nyay-gold/10" },
    { id: "nyayscan" as const, title: "NyayScan", description: "AI-powered case analyzer", icon: MessageSquareText, color: "text-nyay-teal", bgColor: "bg-nyay-teal/10" },
    { id: "nyaymail" as const, title: "NyayMail", description: "Generate legal emails with AI", icon: Mail, color: "text-nyay-indigo", bgColor: "bg-nyay-indigo/10" },
    { id: "nyaynotice" as const, title: "NyayNotice", description: "AI Legal Notice Generator", icon: FileText, color: "text-destructive", bgColor: "bg-destructive/10" },
  ];

  const userFeatures = [
    { id: "cases" as const, title: "My Cases", description: "View case history & status", icon: Folder, color: "text-nyay-indigo", bgColor: "bg-nyay-indigo/10" },
    { id: "saved" as const, title: "Saved Lawyers", description: "Your favorite lawyers", icon: Heart, color: "text-destructive", bgColor: "bg-destructive/10" },
    { id: "notifications" as const, title: "Notifications", description: "Updates & alerts", icon: Bell, color: "text-nyay-gold", bgColor: "bg-nyay-gold/10" },
    { id: "dictionary" as const, title: "Legal Dictionary", description: "Terms explained simply", icon: Book, color: "text-nyay-teal", bgColor: "bg-nyay-teal/10" },
    { id: "privacy" as const, title: "Privacy Settings", description: "Data control & security", icon: Shield, color: "text-muted-foreground", bgColor: "bg-muted" },
  ];

  const handleFindLawyersFromScan = (caseType: string) => {
    setPrefillCaseType(caseType);
    setActiveFeature("find");
  };

  const handleConnectLawyer = (lawyerId: string, caseType: string, caseId: string) => {
    setChatState({ lawyerId, caseType, caseId });
    setActiveFeature("chat");
  };

  const handleContactFromSaved = (lawyerId: string) => {
    setChatState({ lawyerId, caseType: '' });
    setActiveFeature("chat");
  };

  const handleOpenChatFromCase = (caseId: string, lawyerId: string) => {
    setChatState({ lawyerId, caseType: '', caseId });
    setActiveFeature("chat");
  };

  const renderContent = () => {
    switch (activeFeature) {
      case "find": 
        return (
          <FindLawyers 
            prefillCaseType={prefillCaseType} 
            onClear={() => setPrefillCaseType("")} 
            onConnectLawyer={handleConnectLawyer}
          />
        );
      case "nyayscan": 
        return <NyayScan onFindLawyers={handleFindLawyersFromScan} />;
      case "nyaymail": 
        return <NyayMail />;
      case "nyaynotice": 
        return <NyayNotice onFindLawyers={handleFindLawyersFromScan} />;
      case "cases": 
        return <MyCases onOpenChat={handleOpenChatFromCase} />;
      case "saved": 
        return <SavedLawyers onContactLawyer={handleContactFromSaved} />;
      case "notifications": 
        return <Notifications />;
      case "dictionary": 
        return <LegalDictionary />;
      case "privacy": 
        return <PrivacySettings />;
      case "chat":
        if (!chatState) {
          setActiveFeature("home");
          return null;
        }
        return (
          <LawyerChat 
            lawyerId={chatState.lawyerId}
            caseType={chatState.caseType}
            onBack={() => {
              setChatState(null);
              setActiveFeature("cases");
            }}
            userType="user"
          />
        );
      default:
        return (
          <>
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to NyayBuddy</h1>
            <p className="text-muted-foreground mb-8">How can we help you today?</p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {mainFeatures.map((feature) => (
                <Card key={feature.id} className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1" onClick={() => setActiveFeature(feature.id)}>
                  <CardHeader className="pb-3">
                    <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-3`}>
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {userFeatures.map((feature) => (
                <Card key={feature.id} className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5" onClick={() => setActiveFeature(feature.id)}>
                  <CardContent className="p-4 text-center">
                    <div className={`w-10 h-10 rounded-xl ${feature.bgColor} flex items-center justify-center mx-auto mb-2`}>
                      <feature.icon className={`w-5 h-5 ${feature.color}`} />
                    </div>
                    <p className="font-medium text-sm">{feature.title}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeFeature !== "home" && (
              <Button variant="ghost" size="icon-sm" onClick={() => {
                if (activeFeature === "chat") {
                  setChatState(null);
                  setActiveFeature("cases");
                } else {
                  setActiveFeature("home");
                }
              }}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
              <Scale className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Nyay<span className="text-nyay-gold">Buddy</span></span>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {renderContent()}
        <p className="text-xs text-muted-foreground text-center mt-8">
          NyayBuddy provides AI-assisted legal guidance and does not replace professional legal consultation.
        </p>
      </div>

      {/* Snehh AI Chatbot */}
      <SnehhChatbot />
    </div>
  );
};

export default UserDashboard;
