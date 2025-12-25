import { useState, useEffect } from "react";
import { Folder, Clock, User, ChevronRight, MessageSquare, FileText, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getLawyerById, Lawyer } from "@/data/lawyers";

interface Case {
  id: string;
  case_type: string;
  description: string | null;
  status: string;
  lawyer_id: string | null;
  ai_analysis: any;
  created_at: string;
  updated_at: string;
  disposal_reason?: string | null;
  disposal_requested_at?: string | null;
}

interface MyCasesProps {
  onViewCase?: (caseId: string) => void;
  onOpenChat?: (caseId: string, lawyerId: string) => void;
}

const DISPOSAL_REASONS = [
  { value: "solved", label: "Case Solved" },
  { value: "changing_lawyer", label: "Changing Lawyer" },
  { value: "not_pursuing", label: "Not Pursuing Further" },
  { value: "settled_outside", label: "Settled Outside Court" },
  { value: "other", label: "Other Reason" },
];

const MyCases = ({ onViewCase, onOpenChat }: MyCasesProps) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lawyerDetails, setLawyerDetails] = useState<Record<string, Lawyer | undefined>>({});
  const [disposeDialogOpen, setDisposeDialogOpen] = useState(false);
  const [selectedDisposalReason, setSelectedDisposalReason] = useState<string>("");

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCases(data || []);

      // Fetch lawyer details for each case
      const lawyerMap: Record<string, Lawyer | undefined> = {};
      for (const caseItem of data || []) {
        if (caseItem.lawyer_id) {
          // Check if it's a dummy lawyer ID
          if (caseItem.lawyer_id.startsWith('l') && !caseItem.lawyer_id.includes('-')) {
            lawyerMap[caseItem.lawyer_id] = getLawyerById(caseItem.lawyer_id);
          } else {
            // Fetch from profiles table for real lawyers
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, practice_area, city, state')
              .eq('id', caseItem.lawyer_id)
              .single();
            
            if (profile) {
              lawyerMap[caseItem.lawyer_id] = {
                id: caseItem.lawyer_id,
                name: profile.full_name || 'Unknown Lawyer',
                city: profile.city || '',
                state: profile.state || '',
                specialization: profile.practice_area || '',
                experience: 0,
                languages: [],
                barCouncilId: '',
                availability: '',
                rating: 0,
                casesWon: 0,
                profileImage: '',
                gender: 'male'
              };
            }
          }
        }
      }
      setLawyerDetails(lawyerMap);
    } catch (error) {
      console.error('Error fetching cases:', error);
      toast.error('Failed to load cases');
    } finally {
      setIsLoading(false);
    }
  };

  const requestDisposal = async (caseId: string, reason: string) => {
    try {
      const caseItem = cases.find(c => c.id === caseId);
      if (!caseItem) return;

      // Update case with disposal request
      const { error: updateError } = await supabase
        .from('cases')
        .update({ 
          disposal_reason: reason,
          disposal_requested_at: new Date().toISOString()
        })
        .eq('id', caseId);

      if (updateError) throw updateError;

      // Notify the lawyer
      if (caseItem.lawyer_id) {
        await supabase.from('notifications').insert({
          user_id: caseItem.lawyer_id,
          title: 'Case Disposal Request',
          message: `User has requested to dispose case #${caseId.slice(0, 8).toUpperCase()}. Reason: ${DISPOSAL_REASONS.find(r => r.value === reason)?.label || reason}`,
          type: 'warning',
          case_id: caseId
        });
      }

      // Update local state
      setCases(prev => prev.map(c => 
        c.id === caseId ? { ...c, disposal_reason: reason, disposal_requested_at: new Date().toISOString() } : c
      ));
      if (selectedCase?.id === caseId) {
        setSelectedCase(prev => prev ? { ...prev, disposal_reason: reason, disposal_requested_at: new Date().toISOString() } : null);
      }

      toast.success('Disposal request sent to lawyer');
      setDisposeDialogOpen(false);
      setSelectedDisposalReason("");
    } catch (error) {
      console.error('Error requesting disposal:', error);
      toast.error('Failed to request disposal');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'closed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'disposed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/3 mx-auto"></div>
              <div className="h-24 bg-muted rounded"></div>
              <div className="h-24 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedCase) {
    const lawyer = selectedCase.lawyer_id ? lawyerDetails[selectedCase.lawyer_id] : null;
    
    return (
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => setSelectedCase(null)}>
          ← Back to My Cases
        </Button>

        <div className="space-y-6">
          {/* Case Header */}
          <Card className="shadow-card border-l-4 border-l-nyay-indigo">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs text-muted-foreground">Case ID</span>
                  <p className="font-mono text-sm">{selectedCase.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <Badge className={getStatusColor(selectedCase.status)}>
                  {selectedCase.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{selectedCase.case_type}</h2>
              <p className="text-muted-foreground">{selectedCase.description}</p>
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Created: {formatDate(selectedCase.created_at)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Lawyer Details */}
          {lawyer && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-nyay-gold" />
                  Assigned Lawyer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {lawyer.profileImage ? (
                    <img 
                      src={lawyer.profileImage} 
                      alt={lawyer.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-hero flex items-center justify-center text-xl font-bold text-primary-foreground">
                      {lawyer.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg">{lawyer.name}</h3>
                    <p className="text-sm text-muted-foreground">{lawyer.specialization}</p>
                    {lawyer.city && (
                      <p className="text-sm text-muted-foreground">{lawyer.city}, {lawyer.state}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="gold" 
                    className="flex-1"
                    onClick={() => onOpenChat?.(selectedCase.id, selectedCase.lawyer_id!)}
                >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat
                  </Button>
                  
                  {selectedCase.status !== 'disposed' && !selectedCase.disposal_requested_at && (
                    <AlertDialog open={disposeDialogOpen} onOpenChange={setDisposeDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="flex-1">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Dispose Case
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Dispose Case</AlertDialogTitle>
                          <AlertDialogDescription>
                            Please select a reason for disposing this case. The lawyer will need to confirm this action.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                          <Select value={selectedDisposalReason} onValueChange={setSelectedDisposalReason}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select disposal reason" />
                            </SelectTrigger>
                            <SelectContent>
                              {DISPOSAL_REASONS.map((reason) => (
                                <SelectItem key={reason.value} value={reason.value}>
                                  {reason.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setSelectedDisposalReason("")}>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => requestDisposal(selectedCase.id, selectedDisposalReason)}
                            disabled={!selectedDisposalReason}
                          >
                            Request Disposal
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  
                  {selectedCase.disposal_requested_at && selectedCase.status !== 'disposed' && (
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                      Disposal Pending
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Analysis Timeline */}
          {selectedCase.ai_analysis && selectedCase.ai_analysis.nextSteps && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-nyay-teal" />
                  Legal Timeline
                </CardTitle>
                <p className="text-xs text-muted-foreground">AI-generated guidance based on your case</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedCase.ai_analysis.nextSteps?.map((step: string, i: number) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-nyay-indigo/10 text-nyay-indigo flex items-center justify-center font-medium text-sm">
                          {i + 1}
                        </div>
                        {i < (selectedCase.ai_analysis.nextSteps?.length || 0) - 1 && (
                          <div className="w-0.5 h-full bg-border flex-1 my-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm text-foreground">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  This timeline is AI-generated guidance only. Consult a lawyer for professional advice.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Button variant="outline" className="w-full" onClick={() => setSelectedCase(null)}>
            Back to Cases
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-nyay-indigo/10 flex items-center justify-center">
          <Folder className="w-6 h-6 text-nyay-indigo" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">My Cases</h2>
          <p className="text-muted-foreground text-sm">View your case history and status</p>
        </div>
      </div>

      {cases.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Cases Yet</h3>
            <p className="text-muted-foreground text-sm">
              Your case history will appear here when you connect with lawyers.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {cases.map((caseItem) => {
            const lawyer = caseItem.lawyer_id ? lawyerDetails[caseItem.lawyer_id] : null;
            
            return (
              <Card
                key={caseItem.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5"
                onClick={() => setSelectedCase(caseItem)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    {/* Lawyer Avatar */}
                    {lawyer?.profileImage ? (
                      <img 
                        src={lawyer.profileImage} 
                        alt={lawyer.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                    ) : lawyer ? (
                      <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center text-lg font-bold text-primary-foreground shrink-0">
                        {lawyer.name.charAt(0)}
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        <Folder className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-xs text-muted-foreground">
                          #{caseItem.id.slice(0, 8).toUpperCase()}
                        </span>
                        <Badge className={getStatusColor(caseItem.status)}>
                          {caseItem.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-foreground">{caseItem.case_type}</h3>
                      {lawyer && (
                        <p className="text-sm text-nyay-teal font-medium mt-1">
                          {lawyer.name}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                        {caseItem.description || 'No description'}
                      </p>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(caseItem.created_at)}
                        </span>
                        {lawyer && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            Chat Available
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyCases;
