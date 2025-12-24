import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, LogOut, Search, MessageSquareText, Mail, MapPin, Briefcase, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"find" | "nyayscan" | "nyaymail">("find");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const features = [
    {
      id: "find" as const,
      title: "Find Lawyers",
      description: "Search for lawyers by location and case type",
      icon: Search,
      color: "text-nyay-gold",
      bgColor: "bg-nyay-gold/10",
    },
    {
      id: "nyayscan" as const,
      title: "NyayScan",
      description: "AI-powered case analyzer",
      icon: MessageSquareText,
      color: "text-nyay-teal",
      bgColor: "bg-nyay-teal/10",
    },
    {
      id: "nyaymail" as const,
      title: "NyayMail",
      description: "Generate legal emails with AI",
      icon: Mail,
      color: "text-nyay-indigo",
      bgColor: "bg-nyay-indigo/10",
    },
  ];

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
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to NyayBuddy</h1>
        <p className="text-muted-foreground mb-8">How can we help you today?</p>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {features.map((feature) => (
            <Card
              key={feature.id}
              className={`cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${
                activeTab === feature.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setActiveTab(feature.id)}
            >
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

        {/* Active Feature Content */}
        <Card className="shadow-card">
          <CardContent className="p-8">
            {activeTab === "find" && (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-nyay-gold mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">Find Lawyers Near You</h2>
                <p className="text-muted-foreground mb-6">Select your location and case type to find specialized lawyers.</p>
                <Button variant="gold" size="lg">
                  Start Search <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
            {activeTab === "nyayscan" && (
              <div className="text-center py-12">
                <MessageSquareText className="w-16 h-16 text-nyay-teal mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">NyayScan - AI Case Analyzer</h2>
                <p className="text-muted-foreground mb-6">Describe your legal issue and get AI-powered guidance.</p>
                <Button variant="teal" size="lg">
                  Analyze My Case <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
            {activeTab === "nyaymail" && (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-nyay-indigo mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">NyayMail - Email Generator</h2>
                <p className="text-muted-foreground mb-6">Generate professional legal emails and complaints.</p>
                <Button variant="hero" size="lg">
                  Create Email <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
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

export default UserDashboard;
