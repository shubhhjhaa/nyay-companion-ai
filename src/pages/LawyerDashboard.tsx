import { useNavigate } from "react-router-dom";
import { Scale, LogOut, MessageSquare, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const LawyerDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

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
                  <p className="text-2xl font-bold">0</p>
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
                  <p className="text-2xl font-bold">0</p>
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
                  <p className="text-2xl font-bold">0</p>
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
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No client inquiries yet</p>
              <p className="text-sm text-muted-foreground mt-2">When users contact you, their messages will appear here.</p>
            </div>
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
