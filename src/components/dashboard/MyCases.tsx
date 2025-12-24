import { useState, useEffect } from "react";
import { Folder, Clock, User, ChevronRight, MessageSquare, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Case {
  id: string;
  case_type: string;
  description: string | null;
  status: string;
  lawyer_id: string | null;
  ai_analysis: any;
  created_at: string;
  updated_at: string;
}

interface MyCasesProps {
  onViewCase?: (caseId: string) => void;
  onOpenChat?: (caseId: string, lawyerId: string) => void;
}

const MyCases = ({ onViewCase, onOpenChat }: MyCasesProps) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    } catch (error) {
      console.error('Error fetching cases:', error);
      toast.error('Failed to load cases');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-green-100 text-green-800';
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
              <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Created: {formatDate(selectedCase.created_at)}
                </span>
                {selectedCase.lawyer_id && (
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    Lawyer Assigned
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis Timeline */}
          {selectedCase.ai_analysis && (
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
          <div className="grid grid-cols-2 gap-4">
            {selectedCase.lawyer_id && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => onOpenChat?.(selectedCase.id, selectedCase.lawyer_id!)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                View Chat History
              </Button>
            )}
            <Button variant="gold" className="w-full col-span-2" onClick={() => setSelectedCase(null)}>
              Back to Cases
            </Button>
          </div>
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
              Your case history will appear here after you consult with lawyers or use NyayScan.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {cases.map((caseItem) => (
            <Card
              key={caseItem.id}
              className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5"
              onClick={() => setSelectedCase(caseItem)}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        #{caseItem.id.slice(0, 8).toUpperCase()}
                      </span>
                      <Badge className={getStatusColor(caseItem.status)}>
                        {caseItem.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-foreground">{caseItem.case_type}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                      {caseItem.description || 'No description'}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(caseItem.created_at)}
                      </span>
                      {caseItem.lawyer_id && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Lawyer Assigned
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCases;