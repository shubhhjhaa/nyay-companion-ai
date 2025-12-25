import { useState, useEffect } from "react";
import { Briefcase, User, Calendar, ChevronRight, MessageSquare, FileText, AlertCircle, Brain, Sparkles, Trash2, CheckCircle } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ActiveCase {
  id: string;
  case_type: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  ai_analysis: any;
  user_name?: string;
  user_location?: string;
  disposal_reason?: string | null;
  disposal_requested_at?: string | null;
}

const DISPOSAL_REASONS: Record<string, string> = {
  "solved": "Case Solved",
  "changing_lawyer": "Changing Lawyer",
  "not_pursuing": "Not Pursuing Further",
  "settled_outside": "Settled Outside Court",
  "other": "Other Reason",
};

interface ActiveCasesProps {
  onOpenChat?: (caseId: string, userId: string) => void;
  onViewDocuments?: (caseId: string) => void;
}

const ActiveCases = ({ onOpenChat, onViewDocuments }: ActiveCasesProps) => {
  const [cases, setCases] = useState<ActiveCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<ActiveCase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [disposeConfirmOpen, setDisposeConfirmOpen] = useState(false);
  const [caseToDispose, setCaseToDispose] = useState<ActiveCase | null>(null);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: casesData, error } = await supabase
        .from('cases')
        .select('*')
        .eq('lawyer_id', user.id)
        .neq('status', 'pending')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const enrichedCases = await Promise.all((casesData || []).map(async (caseItem) => {
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

      setCases(enrichedCases);
    } catch (error) {
      console.error('Error fetching cases:', error);
      toast.error('Failed to load cases');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCaseStatus = async (caseId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('cases')
        .update({ status: newStatus })
        .eq('id', caseId);

      if (error) throw error;

      const caseItem = cases.find(c => c.id === caseId);
      if (caseItem) {
        await supabase.from('notifications').insert({
          user_id: caseItem.user_id,
          title: 'Case Status Updated',
          message: `Your ${caseItem.case_type} case status has been updated to: ${newStatus.replace('_', ' ')}`,
          type: 'info',
          case_id: caseId
        });
      }

      setCases(prev => prev.map(c => 
        c.id === caseId ? { ...c, status: newStatus } : c
      ));
      if (selectedCase?.id === caseId) {
        setSelectedCase(prev => prev ? { ...prev, status: newStatus } : null);
      }
      toast.success('Case status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const confirmDisposal = async (caseItem: ActiveCase) => {
    try {
      const { error } = await supabase
        .from('cases')
        .update({ 
          status: 'disposed',
          disposal_confirmed_at: new Date().toISOString()
        })
        .eq('id', caseItem.id);

      if (error) throw error;

      // Notify the user
      await supabase.from('notifications').insert({
        user_id: caseItem.user_id,
        title: 'Case Disposed',
        message: `Your ${caseItem.case_type} case has been disposed. Reason: ${DISPOSAL_REASONS[caseItem.disposal_reason || ''] || caseItem.disposal_reason}`,
        type: 'info',
        case_id: caseItem.id
      });

      // Update local state
      setCases(prev => prev.map(c => 
        c.id === caseItem.id ? { ...c, status: 'disposed' } : c
      ));
      if (selectedCase?.id === caseItem.id) {
        setSelectedCase(prev => prev ? { ...prev, status: 'disposed' } : null);
      }

      toast.success('Case disposed successfully');
      setDisposeConfirmOpen(false);
      setCaseToDispose(null);
    } catch (error) {
      console.error('Error disposing case:', error);
      toast.error('Failed to dispose case');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'awaiting_documents': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'closed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'disposed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getMissingInfo = (caseItem: ActiveCase) => {
    const missing: string[] = [];
    const desc = caseItem.description?.toLowerCase() || '';
    
    if (!desc.includes('invoice') && !desc.includes('bill') && 
        (caseItem.case_type.includes('Consumer') || caseItem.case_type.includes('Refund'))) {
      missing.push('Invoice/Bill');
    }
    if (!desc.includes('fir') && caseItem.case_type.includes('Criminal')) {
      missing.push('FIR Copy');
    }
    if (!desc.includes('complaint') && !desc.includes('case number')) {
      missing.push('Complaint ID');
    }
    return missing;
  };

  const getCaseStrength = (caseItem: ActiveCase) => {
    const desc = caseItem.description?.toLowerCase() || '';
    let score = 0;
    
    if (desc.length > 200) score += 2;
    if (desc.includes('evidence') || desc.includes('proof')) score += 2;
    if (desc.includes('date') || desc.includes('amount')) score += 1;
    if (caseItem.ai_analysis) score += 2;
    if (getMissingInfo(caseItem).length === 0) score += 2;
    
    if (score >= 6) return { level: 'Strong', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 3) return { level: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Weak', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const filteredCases = statusFilter === 'all' 
    ? cases 
    : cases.filter(c => c.status === statusFilter);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-24 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (selectedCase) {
    const missingInfo = getMissingInfo(selectedCase);
    const strength = getCaseStrength(selectedCase);

    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setSelectedCase(null)}>
          ← Back to Active Cases
        </Button>

        {/* Case Header */}
        <Card className="border-l-4 border-l-nyay-indigo">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs text-muted-foreground">Case ID</span>
                <p className="font-mono text-sm">{selectedCase.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <Select 
                value={selectedCase.status} 
                onValueChange={(v) => updateCaseStatus(selectedCase.id, v)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="awaiting_documents">Awaiting Documents</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="disposed">Disposed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Disposal Request Alert */}
            {selectedCase.disposal_requested_at && selectedCase.status !== 'disposed' && (
              <div className="bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <span className="font-semibold text-orange-800 dark:text-orange-300">Disposal Requested</span>
                </div>
                <p className="text-sm text-orange-700 dark:text-orange-400 mb-3">
                  User has requested to dispose this case. Reason: <strong>{DISPOSAL_REASONS[selectedCase.disposal_reason || ''] || selectedCase.disposal_reason}</strong>
                </p>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => {
                    setCaseToDispose(selectedCase);
                    setDisposeConfirmOpen(true);
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Disposal
                </Button>
              </div>
            )}
            
            <h2 className="text-2xl font-bold mb-2">{selectedCase.case_type}</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {selectedCase.user_name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Opened: {formatDate(selectedCase.created_at)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* AI Case Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="w-5 h-5 text-nyay-teal" />
              AI Case Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground mb-4">
              {selectedCase.description || 'No description provided'}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              AI-generated summary for assistance only.
            </p>
          </CardContent>
        </Card>

        {/* Case Strength & Missing Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-nyay-gold" />
                Case Strength Indicator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`inline-flex items-center px-4 py-2 rounded-full ${strength.bg}`}>
                <span className={`font-semibold ${strength.color}`}>{strength.level}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Assessment is indicative and not a legal opinion.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Missing Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {missingInfo.length === 0 ? (
                <p className="text-sm text-green-600">All required information appears to be present</p>
              ) : (
                <ul className="space-y-1">
                  {missingInfo.map((item, i) => (
                    <li key={i} className="text-sm text-destructive flex items-center gap-2">
                      • {item} - Consider requesting from user
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button 
            variant="gold" 
            className="flex-1"
            onClick={() => onOpenChat?.(selectedCase.id, selectedCase.user_id)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Open Chat
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onViewDocuments?.(selectedCase.id)}
          >
            <FileText className="w-4 h-4 mr-2" />
            View Documents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-nyay-teal/10 flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-nyay-teal" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Active Cases</h2>
            <p className="text-muted-foreground text-sm">Manage your ongoing cases</p>
          </div>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cases</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="awaiting_documents">Awaiting Docs</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="disposed">Disposed</SelectItem>
          </SelectContent>
        </Select>

        {/* Disposal Confirmation Dialog */}
        <AlertDialog open={disposeConfirmOpen} onOpenChange={setDisposeConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Case Disposal</AlertDialogTitle>
              <AlertDialogDescription>
                {caseToDispose && (
                  <>
                    Are you sure you want to dispose case #{caseToDispose.id.slice(0, 8).toUpperCase()}?
                    <br /><br />
                    <strong>Reason:</strong> {DISPOSAL_REASONS[caseToDispose.disposal_reason || ''] || caseToDispose.disposal_reason}
                    <br /><br />
                    This action will mark the case as disposed and notify the user.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCaseToDispose(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => caseToDispose && confirmDisposal(caseToDispose)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Confirm Disposal
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {filteredCases.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <Briefcase className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Cases</h3>
            <p className="text-muted-foreground text-sm">
              Accept case requests to see them here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredCases.map((caseItem) => {
            const strength = getCaseStrength(caseItem);
            
            return (
              <Card 
                key={caseItem.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5"
                onClick={() => setSelectedCase(caseItem)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center text-lg font-bold text-primary-foreground shrink-0">
                      {caseItem.user_name?.charAt(0) || 'U'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-xs text-muted-foreground">
                          #{caseItem.id.slice(0, 8).toUpperCase()}
                        </span>
                        <Badge className={getStatusColor(caseItem.status)}>
                          {caseItem.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={`${strength.bg} ${strength.color} border-0`}>
                          {strength.level}
                        </Badge>
                        {caseItem.disposal_requested_at && caseItem.status !== 'disposed' && (
                          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 animate-pulse">
                            <Trash2 className="w-3 h-3 mr-1" />
                            Disposal Requested
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground">{caseItem.case_type}</h3>
                      <p className="text-sm text-nyay-teal">{caseItem.user_name}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {formatDate(caseItem.created_at)}
                      </p>
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

export default ActiveCases;
