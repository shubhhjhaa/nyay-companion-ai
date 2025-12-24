import { useState, useEffect } from "react";
import { Inbox, MapPin, Calendar, User, Check, X, FileText, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CaseRequest {
  id: string;
  case_type: string;
  description: string | null;
  status: string;
  created_at: string;
  user_id: string;
  ai_analysis: any;
  user_name?: string;
  user_location?: string;
}

interface IncomingRequestsProps {
  onViewCase?: (caseId: string) => void;
}

const IncomingRequests = ({ onViewCase }: IncomingRequestsProps) => {
  const [requests, setRequests] = useState<CaseRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: cases, error } = await supabase
        .from('cases')
        .select('*')
        .eq('lawyer_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user details for each case
      const enrichedCases = await Promise.all((cases || []).map(async (caseItem) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, city, state')
          .eq('id', caseItem.user_id)
          .maybeSingle();

        return {
          ...caseItem,
          user_name: profile?.full_name || 'Anonymous User',
          user_location: profile?.city && profile?.state 
            ? `${profile.city}, ${profile.state}` 
            : 'Location not provided'
        };
      }));

      setRequests(enrichedCases);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (caseId: string) => {
    setProcessingId(caseId);
    try {
      const { error } = await supabase
        .from('cases')
        .update({ status: 'in_progress' })
        .eq('id', caseId);

      if (error) throw error;

      // Create notification for user
      const caseItem = requests.find(r => r.id === caseId);
      if (caseItem) {
        await supabase.from('notifications').insert({
          user_id: caseItem.user_id,
          title: 'Case Accepted',
          message: `Your ${caseItem.case_type} case has been accepted by a lawyer.`,
          type: 'success'
        });
      }

      setRequests(prev => prev.filter(r => r.id !== caseId));
      toast.success('Case accepted successfully');
    } catch (error) {
      console.error('Error accepting case:', error);
      toast.error('Failed to accept case');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (caseId: string) => {
    setProcessingId(caseId);
    try {
      const caseItem = requests.find(r => r.id === caseId);
      
      // Remove lawyer assignment
      const { error } = await supabase
        .from('cases')
        .update({ lawyer_id: null })
        .eq('id', caseId);

      if (error) throw error;

      // Notify user
      if (caseItem) {
        await supabase.from('notifications').insert({
          user_id: caseItem.user_id,
          title: 'Case Update',
          message: `Your ${caseItem.case_type} case is awaiting lawyer assignment.`,
          type: 'info'
        });
      }

      setRequests(prev => prev.filter(r => r.id !== caseId));
      toast.info('Case declined');
    } catch (error) {
      console.error('Error rejecting case:', error);
      toast.error('Failed to decline case');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generateAISummary = (caseItem: CaseRequest) => {
    if (caseItem.ai_analysis?.summary) {
      return caseItem.ai_analysis.summary;
    }
    // Generate a brief summary from description
    const desc = caseItem.description || '';
    return desc.length > 150 ? desc.substring(0, 150) + '...' : desc || 'No description provided';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-nyay-gold/10 flex items-center justify-center">
          <Inbox className="w-6 h-6 text-nyay-gold" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Incoming Case Requests</h2>
          <p className="text-muted-foreground text-sm">Review and respond to new case requests</p>
        </div>
        {requests.length > 0 && (
          <Badge className="ml-auto bg-nyay-gold text-white">{requests.length} New</Badge>
        )}
      </div>

      {requests.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <Inbox className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Pending Requests</h3>
            <p className="text-muted-foreground text-sm">
              New case requests from users will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="shadow-card hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* User Info */}
                  <div className="flex items-center gap-3 md:w-48 shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center text-lg font-bold text-primary-foreground">
                      {request.user_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{request.user_name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {request.user_location}
                      </p>
                    </div>
                  </div>

                  {/* Case Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-nyay-indigo/10 text-nyay-indigo border-nyay-indigo/20">
                        {request.case_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(request.created_at)}
                      </span>
                    </div>

                    {/* AI Summary */}
                    <div className="p-3 rounded-lg bg-muted/50 mb-3">
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                        <Brain className="w-3 h-3" />
                        AI-generated summary
                      </p>
                      <p className="text-sm text-foreground">{generateAISummary(request)}</p>
                    </div>

                    {request.description && request.description.length > 150 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => onViewCase?.(request.id)}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        View Full Details
                      </Button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2 shrink-0">
                    <Button
                      variant="gold"
                      className="flex-1"
                      onClick={() => handleAccept(request.id)}
                      disabled={processingId === request.id}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleReject(request.id)}
                      disabled={processingId === request.id}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        AI-generated summaries are for quick reference only. Review full case details before accepting.
      </p>
    </div>
  );
};

export default IncomingRequests;
