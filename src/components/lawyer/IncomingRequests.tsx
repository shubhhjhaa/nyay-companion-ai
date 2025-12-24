import { useState, useEffect } from "react";
import { Inbox, MapPin, Calendar, User, Check, X, FileText, Brain, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  const [selectedCase, setSelectedCase] = useState<CaseRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleViewDetails = (request: CaseRequest) => {
    setSelectedCase(request);
    setIsDetailsOpen(true);
  };

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

                    {request.description && request.description.length > 50 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => handleViewDetails(request)}
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

      {/* Case Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-nyay-teal" />
              Case Details
            </DialogTitle>
            <DialogDescription>
              Full case information and AI-generated summary
            </DialogDescription>
          </DialogHeader>
          
          {selectedCase && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Client Info */}
                <div className="p-4 rounded-xl bg-muted/50">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-nyay-indigo" />
                    Client Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <p className="font-medium">{selectedCase.user_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <p className="font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {selectedCase.user_location || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Case Info */}
                <div className="p-4 rounded-xl bg-nyay-teal/10 border border-nyay-teal/20">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-nyay-teal" />
                    Case Information
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-nyay-indigo/10 text-nyay-indigo border-nyay-indigo/20">
                        {selectedCase.case_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(selectedCase.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Analysis */}
                {selectedCase.ai_analysis && (
                  <div className="p-4 rounded-xl bg-nyay-gold/10 border border-nyay-gold/20">
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-nyay-gold" />
                      AI Analysis
                    </h4>
                    <div className="space-y-3 text-sm">
                      {selectedCase.ai_analysis.summary && (
                        <div>
                          <span className="text-muted-foreground">Summary:</span>
                          <p className="mt-1">{selectedCase.ai_analysis.summary}</p>
                        </div>
                      )}
                      {selectedCase.ai_analysis.urgencyLevel && (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`w-4 h-4 ${
                            selectedCase.ai_analysis.urgencyLevel === 'high' ? 'text-destructive' :
                            selectedCase.ai_analysis.urgencyLevel === 'medium' ? 'text-nyay-gold' : 'text-nyay-teal'
                          }`} />
                          <span className="capitalize">{selectedCase.ai_analysis.urgencyLevel} Priority</span>
                        </div>
                      )}
                      {selectedCase.ai_analysis.estimatedTimeframe && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>Estimated: {selectedCase.ai_analysis.estimatedTimeframe}</span>
                        </div>
                      )}
                      {selectedCase.ai_analysis.requiresFIR && (
                        <Badge variant="destructive" className="text-xs">
                          FIR Required
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Full Description */}
                <div>
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Full Case Description
                  </h4>
                  <div className="p-4 rounded-xl bg-muted/30 border">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {selectedCase.description || 'No description provided'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="gold"
                    className="flex-1"
                    onClick={() => {
                      handleAccept(selectedCase.id);
                      setIsDetailsOpen(false);
                    }}
                    disabled={processingId === selectedCase.id}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Accept Case
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      handleReject(selectedCase.id);
                      setIsDetailsOpen(false);
                    }}
                    disabled={processingId === selectedCase.id}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IncomingRequests;
