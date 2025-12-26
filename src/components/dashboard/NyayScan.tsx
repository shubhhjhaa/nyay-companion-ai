import { useState } from "react";
import { MessageSquareText, Send, Loader2, AlertTriangle, CheckCircle, ExternalLink, ChevronRight, Users, Sparkles, Building2, FileText, Scale, ArrowRight, MessageCircle, Calendar, DollarSign, Clock, TrendingUp, Shield, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CaseAnalysis {
  caseType: string;
  summary: string;
  isConsumerCase: boolean;
  requiresFIR: boolean;
  prerequisites: string[];
  recommendations: string[];
  nextSteps: string[];
  urgencyLevel: string;
  estimatedTimeframe: string;
}

interface SmartQuestion {
  id: string;
  question: string;
  type: 'yes_no' | 'multiple_choice' | 'scale' | 'date' | 'amount' | 'text';
  options?: string[];
  scale_labels?: { min: string; max: string };
  required: boolean;
}

interface DetailedAnalysis {
  summary?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  authority: {
    name: string;
    explanation: string;
    role: string;
    contact?: string;
  };
  legalProvisions?: Array<{
    law: string;
    section: string;
    relevance: string;
  }>;
  actionPlan: Array<{
    step: number;
    action: string;
    explanation: string;
    timeline?: string;
    expectedOutcome: string;
    documents?: string[];
  }>;
  estimatedTimeline?: {
    bestCase: string;
    typical: string;
    worstCase: string;
  };
  costEstimate?: {
    courtFees: string;
    lawyerFees: string;
    otherCosts: string;
  };
  successFactors?: string[];
  challenges?: string[];
  pastCases: Array<{
    title?: string;
    summary: string;
    outcome: string;
    relevance: string;
  }>;
  immediateActions?: string[];
  finalAssessment: {
    currentStage: string;
    successProbability?: 'low' | 'medium' | 'high';
    immediateAction?: string;
    legalAssistance: 'not_required' | 'optional' | 'recommended';
    assistanceReasoning: string;
  };
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface NyayScanProps {
  onFindLawyers?: (caseType: string, caseDescription: string, analysis: CaseAnalysis | null) => void;
}

type Step = "input" | "analyzing" | "result" | "consumer-check" | "proceed-choice" | "detailed-loading" | "detailed-followup" | "detailed-result";

const NyayScan = ({ onFindLawyers }: NyayScanProps) => {
  const [step, setStep] = useState<Step>("input");
  const [caseDescription, setCaseDescription] = useState("");
  const [analysis, setAnalysis] = useState<CaseAnalysis | null>(null);
  const [consumerRegistered, setConsumerRegistered] = useState<string>("");
  const [complaintId, setComplaintId] = useState("");
  const [proceedChoice, setProceedChoice] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Detailed analysis state
  const [detailedAnalysis, setDetailedAnalysis] = useState<DetailedAnalysis | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [aiMessage, setAiMessage] = useState<string>("");
  const [smartQuestions, setSmartQuestions] = useState<SmartQuestion[]>([]);
  const [questionResponses, setQuestionResponses] = useState<Record<string, any>>({});
  const [questionSetCount, setQuestionSetCount] = useState(0);

  const handleAnalyze = async () => {
    if (!caseDescription.trim()) {
      toast.error("Please describe your legal issue");
      return;
    }

    setIsLoading(true);
    setStep("analyzing");

    try {
      const { data, error } = await supabase.functions.invoke("nyayscan", {
        body: { caseDescription },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysis(data.analysis);

      if (data.analysis.isConsumerCase) {
        setStep("consumer-check");
      } else {
        setStep("result");
      }
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Failed to analyze case. Please try again.");
      setStep("input");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConsumerCheck = () => {
    if (!consumerRegistered) {
      toast.error("Please select an option");
      return;
    }
    if (consumerRegistered === "yes" && !complaintId.trim()) {
      toast.error("Please enter your complaint ID");
      return;
    }
    setStep("proceed-choice");
  };

  const handleProceedChoice = () => {
    if (!proceedChoice) {
      toast.error("Please select how you want to proceed");
      return;
    }
    setStep("result");
  };

  const startDetailedAnalysis = async () => {
    setStep("detailed-loading");
    setConversationHistory([]);
    setQuestionSetCount(0);
    setQuestionResponses({});
    setSmartQuestions([]);

    try {
      const { data, error } = await supabase.functions.invoke("nyayscan-detailed", {
        body: {
          caseDescription,
          initialAnalysis: analysis,
          conversationHistory: [],
          action: 'start'
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      const result = data.result;

      if (result.type === 'follow_up') {
        setAiMessage(result.message);
        setSmartQuestions(result.questions || []);
        setStep("detailed-followup");
        setQuestionSetCount(1);
      } else if (result.type === 'analysis_ready') {
        await generateDetailedAnalysis([]);
      }
    } catch (error: any) {
      console.error("Detailed analysis error:", error);
      toast.error(error.message || "Failed to start detailed analysis.");
      setStep("result");
    }
  };

  const formatResponsesForHistory = (): string => {
    return smartQuestions.map(q => {
      const response = questionResponses[q.id];
      let formattedResponse = '';
      
      if (q.type === 'yes_no') {
        formattedResponse = response === true ? 'Yes' : response === false ? 'No' : 'Not answered';
      } else if (q.type === 'scale') {
        formattedResponse = `${response || 3}/5`;
      } else if (q.type === 'multiple_choice') {
        formattedResponse = response || 'Not selected';
      } else {
        formattedResponse = response || 'Not provided';
      }
      
      return `Q: ${q.question}\nA: ${formattedResponse}`;
    }).join('\n\n');
  };

  const handleSubmitResponses = async () => {
    // Check required questions
    const unansweredRequired = smartQuestions.filter(q => {
      if (!q.required) return false;
      const response = questionResponses[q.id];
      if (q.type === 'yes_no') return response === undefined;
      if (q.type === 'text' || q.type === 'amount' || q.type === 'date') return !response || !response.toString().trim();
      if (q.type === 'multiple_choice') return !response;
      return false;
    });

    if (unansweredRequired.length > 0) {
      toast.error("Please answer all required questions");
      return;
    }

    setStep("detailed-loading");

    const formattedResponses = formatResponsesForHistory();
    
    const newHistory: ConversationMessage[] = [
      ...conversationHistory,
      { role: 'assistant', content: aiMessage },
      { role: 'user', content: formattedResponses }
    ];
    setConversationHistory(newHistory);
    setQuestionResponses({});

    try {
      const { data, error } = await supabase.functions.invoke("nyayscan-detailed", {
        body: {
          caseDescription,
          initialAnalysis: analysis,
          conversationHistory: newHistory,
          action: 'respond'
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      const result = data.result;

      if (result.type === 'follow_up' && questionSetCount < 5) {
        setAiMessage(result.message);
        setSmartQuestions(result.questions || []);
        setStep("detailed-followup");
        setQuestionSetCount(prev => prev + 1);
      } else {
        await generateDetailedAnalysis(newHistory);
      }
    } catch (error: any) {
      console.error("Response processing error:", error);
      toast.error(error.message || "Failed to process response.");
      setStep("detailed-followup");
    }
  };

  const generateDetailedAnalysis = async (history: ConversationMessage[]) => {
    try {
      const { data, error } = await supabase.functions.invoke("nyayscan-detailed", {
        body: {
          caseDescription,
          initialAnalysis: analysis,
          conversationHistory: history,
          action: 'generate'
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      const result = data.result;

      if (result.type === 'detailed_analysis') {
        setDetailedAnalysis(result);
        setStep("detailed-result");
      } else {
        throw new Error("Invalid analysis response");
      }
    } catch (error: any) {
      console.error("Generate analysis error:", error);
      toast.error(error.message || "Failed to generate detailed analysis.");
      setStep("result");
    }
  };

  const skipToAnalysis = async () => {
    setStep("detailed-loading");
    // Add any current responses to history before generating
    if (Object.keys(questionResponses).length > 0) {
      const formattedResponses = formatResponsesForHistory();
      const newHistory: ConversationMessage[] = [
        ...conversationHistory,
        { role: 'assistant', content: aiMessage },
        { role: 'user', content: formattedResponses }
      ];
      await generateDetailedAnalysis(newHistory);
    } else {
      await generateDetailedAnalysis(conversationHistory);
    }
  };

  const resetForm = () => {
    setStep("input");
    setCaseDescription("");
    setAnalysis(null);
    setConsumerRegistered("");
    setComplaintId("");
    setProceedChoice("");
    setDetailedAnalysis(null);
    setConversationHistory([]);
    setSmartQuestions([]);
    setAiMessage("");
    setQuestionResponses({});
    setQuestionSetCount(0);
  };

  const backToResult = () => {
    setStep("result");
    setDetailedAnalysis(null);
  };

  const updateResponse = (questionId: string, value: any) => {
    setQuestionResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const renderQuestionInput = (question: SmartQuestion) => {
    const value = questionResponses[question.id];

    switch (question.type) {
      case 'yes_no':
        return (
          <div className="flex items-center gap-4">
            <Button
              variant={value === true ? "default" : "outline"}
              size="sm"
              onClick={() => updateResponse(question.id, true)}
              className={value === true ? "bg-nyay-teal hover:bg-nyay-teal/90" : ""}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Yes
            </Button>
            <Button
              variant={value === false ? "default" : "outline"}
              size="sm"
              onClick={() => updateResponse(question.id, false)}
              className={value === false ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              No
            </Button>
          </div>
        );

      case 'multiple_choice':
        return (
          <RadioGroup
            value={value || ""}
            onValueChange={(val) => updateResponse(question.id, val)}
            className="grid grid-cols-2 gap-2"
          >
            {question.options?.map((option, idx) => (
              <Label
                key={idx}
                htmlFor={`${question.id}-${idx}`}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                  value === option ? "border-nyay-teal bg-nyay-teal/5" : "border-border hover:border-nyay-teal/50"
                }`}
              >
                <RadioGroupItem value={option} id={`${question.id}-${idx}`} />
                <span className="text-sm">{option}</span>
              </Label>
            ))}
          </RadioGroup>
        );

      case 'scale':
        const scaleValue = value || 3;
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{question.scale_labels?.min || 'Low'}</span>
              <span>{question.scale_labels?.max || 'High'}</span>
            </div>
            <Slider
              value={[scaleValue]}
              onValueChange={(val) => updateResponse(question.id, val[0])}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => updateResponse(question.id, num)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                    scaleValue === num
                      ? "bg-nyay-teal text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value || ""}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            className="max-w-xs"
          />
        );

      case 'amount':
        return (
          <div className="relative max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
            <Input
              type="number"
              value={value || ""}
              onChange={(e) => updateResponse(question.id, e.target.value)}
              placeholder="Enter amount"
              className="pl-7"
            />
          </div>
        );

      case 'text':
      default:
        return (
          <Textarea
            value={value || ""}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            placeholder="Type your response here..."
            rows={2}
            className="resize-none"
          />
        );
    }
  };

  // Loading states
  if (step === "analyzing" || step === "detailed-loading") {
    return (
      <div className="max-w-xl mx-auto">
        <Card className="shadow-card">
          <CardContent className="py-16 text-center">
            <Loader2 className="w-16 h-16 text-nyay-teal mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold mb-2">
              {step === "analyzing" ? "Analyzing Your Case..." : "Processing Your Information..."}
            </h3>
            <p className="text-muted-foreground">
              {step === "analyzing" 
                ? "Our AI is reviewing your legal situation and preparing guidance."
                : "Our AI is analyzing your responses and preparing comprehensive guidance."
              }
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Detailed follow-up questions with smart inputs
  if (step === "detailed-followup") {
    return (
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={backToResult}>
          ← Back to Basic Analysis
        </Button>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-nyay-indigo/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-nyay-indigo" />
              </div>
              <div>
                <CardTitle className="text-lg">Help Us Understand Better</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Round {questionSetCount} of 5 • Answer the questions below
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* AI Message */}
            <div className="p-4 rounded-xl bg-muted/50 border">
              <p className="text-sm text-foreground">{aiMessage}</p>
            </div>

            {/* Smart Questions */}
            <div className="space-y-5">
              {smartQuestions.map((question, idx) => (
                <div key={question.id} className="space-y-3 p-4 rounded-xl bg-background border">
                  <div className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-nyay-indigo/10 text-nyay-indigo text-xs font-medium flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <Label className="text-sm font-medium">
                        {question.question}
                        {question.required && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      <div className="mt-3">
                        {renderQuestionInput(question)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="teal"
                className="flex-1"
                onClick={handleSubmitResponses}
              >
                <Send className="w-4 h-4 mr-2" />
                Continue
              </Button>
              <Button
                variant="outline"
                onClick={skipToAnalysis}
              >
                Skip to Analysis
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Your responses help the AI provide more accurate and relevant guidance.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Detailed Analysis Result
  if (step === "detailed-result" && detailedAnalysis && analysis) {
    const assistanceColors = {
      not_required: 'bg-nyay-teal/10 text-nyay-teal border-nyay-teal/20',
      optional: 'bg-nyay-gold/10 text-nyay-gold border-nyay-gold/20',
      recommended: 'bg-destructive/10 text-destructive border-destructive/20'
    };

    const assistanceLabels = {
      not_required: 'Legal Assistance Not Required',
      optional: 'Legal Assistance Optional',
      recommended: 'Legal Assistance Recommended'
    };

    const severityColors = {
      low: 'bg-nyay-teal/10 text-nyay-teal',
      medium: 'bg-nyay-gold/10 text-nyay-gold',
      high: 'bg-orange-500/10 text-orange-600',
      critical: 'bg-destructive/10 text-destructive'
    };

    const probabilityColors = {
      low: 'text-destructive',
      medium: 'text-nyay-gold',
      high: 'text-nyay-teal'
    };

    return (
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={backToResult}>
          ← Back to Basic Analysis
        </Button>

        <div className="space-y-6">
          {/* Header with Summary */}
          <Card className="shadow-card border-l-4 border-l-nyay-indigo">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-nyay-indigo/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-nyay-indigo" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-nyay-indigo">Detailed AI Analysis</span>
                    {detailedAnalysis.severity && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${severityColors[detailedAnalysis.severity]}`}>
                        {detailedAnalysis.severity.toUpperCase()} SEVERITY
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mt-1">{analysis.caseType}</h2>
                  <p className="text-muted-foreground mt-2">
                    {detailedAnalysis.summary || analysis.summary}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Immediate Actions - Highlighted */}
          {detailedAnalysis.immediateActions && detailedAnalysis.immediateActions.length > 0 && (
            <Card className="border-nyay-teal/30 bg-nyay-teal/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-nyay-teal" />
                  <CardTitle className="text-lg">Immediate Actions Required</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {detailedAnalysis.immediateActions.map((action, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-nyay-teal shrink-0 mt-0.5" />
                      <span className="font-medium">{action}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Relevant Authority */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-nyay-teal" />
                <CardTitle className="text-lg">Relevant Authority</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-nyay-teal/5 border border-nyay-teal/20">
                <h4 className="font-semibold text-foreground">{detailedAnalysis.authority.name}</h4>
                <p className="text-sm text-muted-foreground mt-2">{detailedAnalysis.authority.explanation}</p>
                {detailedAnalysis.authority.contact && (
                  <p className="text-sm text-nyay-teal mt-2 font-medium">{detailedAnalysis.authority.contact}</p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium">Role & Powers</Label>
                <p className="text-sm text-muted-foreground mt-1">{detailedAnalysis.authority.role}</p>
              </div>
            </CardContent>
          </Card>

          {/* Legal Provisions */}
          {detailedAnalysis.legalProvisions && detailedAnalysis.legalProvisions.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-nyay-indigo" />
                  <CardTitle className="text-lg">Applicable Laws & Provisions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {detailedAnalysis.legalProvisions.map((provision, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/50 border">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{provision.law}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-nyay-indigo/10 text-nyay-indigo">
                          {provision.section}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{provision.relevance}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Plan */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-nyay-gold" />
                <CardTitle className="text-lg">Step-by-Step Action Plan</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {detailedAnalysis.actionPlan.map((item, i) => (
                  <div key={i} className="relative pl-8 pb-4 last:pb-0">
                    {i < detailedAnalysis.actionPlan.length - 1 && (
                      <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-border" />
                    )}
                    <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-nyay-gold text-primary-foreground text-xs font-medium flex items-center justify-center">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{item.action}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{item.explanation}</p>
                      {item.timeline && (
                        <div className="flex items-center gap-2 mt-2 text-xs">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Timeline: {item.timeline}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <ArrowRight className="w-3 h-3 text-nyay-teal" />
                        <span className="text-nyay-teal font-medium">Expected: {item.expectedOutcome}</span>
                      </div>
                      {item.documents && item.documents.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.documents.map((doc, idx) => (
                            <span key={idx} className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                              📄 {doc}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline & Cost Estimates */}
          {(detailedAnalysis.estimatedTimeline || detailedAnalysis.costEstimate) && (
            <div className="grid md:grid-cols-2 gap-6">
              {detailedAnalysis.estimatedTimeline && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-nyay-indigo" />
                      <CardTitle className="text-base">Expected Timeline</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Best Case:</span>
                      <span className="font-medium text-nyay-teal">{detailedAnalysis.estimatedTimeline.bestCase}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Typical:</span>
                      <span className="font-medium">{detailedAnalysis.estimatedTimeline.typical}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Worst Case:</span>
                      <span className="font-medium text-destructive">{detailedAnalysis.estimatedTimeline.worstCase}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
              {detailedAnalysis.costEstimate && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-nyay-gold" />
                      <CardTitle className="text-base">Estimated Costs</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Court Fees:</span>
                      <span className="font-medium">{detailedAnalysis.costEstimate.courtFees}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Lawyer Fees:</span>
                      <span className="font-medium">{detailedAnalysis.costEstimate.lawyerFees}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Other Costs:</span>
                      <span className="font-medium">{detailedAnalysis.costEstimate.otherCosts}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Success Factors & Challenges */}
          {(detailedAnalysis.successFactors || detailedAnalysis.challenges) && (
            <div className="grid md:grid-cols-2 gap-6">
              {detailedAnalysis.successFactors && detailedAnalysis.successFactors.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-nyay-teal" />
                      <CardTitle className="text-base">Factors in Your Favor</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {detailedAnalysis.successFactors.map((factor, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-nyay-teal shrink-0 mt-0.5" />
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {detailedAnalysis.challenges && detailedAnalysis.challenges.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-nyay-gold" />
                      <CardTitle className="text-base">Potential Challenges</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {detailedAnalysis.challenges.map((challenge, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="w-4 h-4 text-nyay-gold shrink-0 mt-0.5" />
                          <span>{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Past Cases Reference */}
          {detailedAnalysis.pastCases && detailedAnalysis.pastCases.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-nyay-indigo" />
                  <CardTitle className="text-lg">Relevant Case Patterns</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">Similar cases for awareness</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {detailedAnalysis.pastCases.map((item, i) => (
                    <div key={i} className="p-4 rounded-xl bg-muted/50 border">
                      {item.title && <h5 className="font-medium text-foreground mb-1">{item.title}</h5>}
                      <p className="text-sm text-foreground">{item.summary}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Outcome:</span> {item.outcome}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Relevance:</span> {item.relevance}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Final Assessment */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg">Final Case Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Current Stage</Label>
                  <p className="text-sm text-muted-foreground mt-1">{detailedAnalysis.finalAssessment.currentStage}</p>
                </div>
                {detailedAnalysis.finalAssessment.successProbability && (
                  <div>
                    <Label className="text-sm font-medium">Success Probability</Label>
                    <p className={`text-sm font-semibold mt-1 ${probabilityColors[detailedAnalysis.finalAssessment.successProbability]}`}>
                      {detailedAnalysis.finalAssessment.successProbability.toUpperCase()}
                    </p>
                  </div>
                )}
              </div>

              <div className={`p-4 rounded-xl border ${assistanceColors[detailedAnalysis.finalAssessment.legalAssistance]}`}>
                <div className="flex items-center gap-2 mb-2">
                  {detailedAnalysis.finalAssessment.legalAssistance === 'not_required' && <CheckCircle className="w-5 h-5" />}
                  {detailedAnalysis.finalAssessment.legalAssistance === 'optional' && <AlertTriangle className="w-5 h-5" />}
                  {detailedAnalysis.finalAssessment.legalAssistance === 'recommended' && <Users className="w-5 h-5" />}
                  <span className="font-semibold">{assistanceLabels[detailedAnalysis.finalAssessment.legalAssistance]}</span>
                </div>
                <p className="text-sm opacity-90">{detailedAnalysis.finalAssessment.assistanceReasoning}</p>
              </div>
            </CardContent>
          </Card>

          {/* Professional Support - Only shown at the end */}
          {(detailedAnalysis.finalAssessment.legalAssistance === 'optional' || 
            detailedAnalysis.finalAssessment.legalAssistance === 'recommended') && (
            <Card className="bg-gradient-hero text-primary-foreground">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Users className="w-10 h-10" />
                    <div>
                      <h3 className="text-lg font-semibold">Connect with Professional Support</h3>
                      <p className="text-primary-foreground/80 text-sm">Optional: Get assistance from experienced legal professionals</p>
                    </div>
                  </div>
                  <Button variant="gold" onClick={() => onFindLawyers?.(analysis.caseType, caseDescription, analysis)}>
                    Find Lawyers
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Disclaimer */}
          <div className="p-4 rounded-xl bg-muted/50 border text-center">
            <p className="text-xs text-muted-foreground">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              This detailed AI analysis is for guidance and awareness only and does not replace professional legal advice.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === "consumer-check" && analysis) {
    return (
      <div className="max-w-xl mx-auto">
        <Card className="shadow-card">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-nyay-gold/10 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6 text-nyay-gold" />
            </div>
            <CardTitle>Consumer Case Detected</CardTitle>
            <p className="text-sm text-muted-foreground">
              This appears to be a {analysis.caseType} matter. We need some additional information.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Have you registered your complaint on the National Consumer Helpline?</Label>
              <RadioGroup value={consumerRegistered} onValueChange={setConsumerRegistered}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes" className="cursor-pointer">Yes, I have registered</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no" className="cursor-pointer">No, I haven't registered</Label>
                </div>
              </RadioGroup>
            </div>

            {consumerRegistered === "no" && (
              <div className="p-4 rounded-xl bg-nyay-gold/10 border border-nyay-gold/20">
                <p className="text-sm text-foreground mb-3">
                  <strong>Important:</strong> Registering on National Consumer Helpline is recommended before proceeding.
                </p>
                <a
                  href="https://consumerhelpline.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-nyay-gold hover:underline"
                >
                  Visit National Consumer Helpline
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {consumerRegistered === "yes" && (
              <div className="space-y-2">
                <Label htmlFor="complaintId">Complaint ID</Label>
                <Input
                  id="complaintId"
                  value={complaintId}
                  onChange={(e) => setComplaintId(e.target.value)}
                  placeholder="Enter your NCH complaint ID"
                />
              </div>
            )}

            <Button variant="gold" className="w-full" onClick={handleConsumerCheck}>
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "proceed-choice" && analysis) {
    return (
      <div className="max-w-xl mx-auto">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>How do you want to proceed?</CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose your preferred way to handle this consumer complaint.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup value={proceedChoice} onValueChange={setProceedChoice} className="space-y-3">
              <Label
                htmlFor="online"
                className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  proceedChoice === "online" ? "border-nyay-teal bg-nyay-teal/5" : "border-border hover:border-nyay-teal/50"
                }`}
              >
                <RadioGroupItem value="online" id="online" className="mt-1" />
                <div>
                  <span className="font-medium">File Online Complaint (Self)</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    We'll guide you step-by-step to file your complaint on e-Daakhil portal
                  </p>
                </div>
              </Label>
              <Label
                htmlFor="lawyer"
                className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  proceedChoice === "lawyer" ? "border-nyay-gold bg-nyay-gold/5" : "border-border hover:border-nyay-gold/50"
                }`}
              >
                <RadioGroupItem value="lawyer" id="lawyer" className="mt-1" />
                <div>
                  <span className="font-medium">Offline / Need a Lawyer</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Connect with consumer lawyers who can handle your case
                  </p>
                </div>
              </Label>
            </RadioGroup>

            <Button variant="gold" className="w-full" onClick={handleProceedChoice}>
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "result" && analysis) {
    return (
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={resetForm}>
          ← New Analysis
        </Button>

        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="shadow-card border-l-4 border-l-nyay-teal">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  analysis.urgencyLevel === "high" ? "bg-destructive/10" :
                  analysis.urgencyLevel === "medium" ? "bg-nyay-gold/10" : "bg-nyay-teal/10"
                }`}>
                  <CheckCircle className={`w-6 h-6 ${
                    analysis.urgencyLevel === "high" ? "text-destructive" :
                    analysis.urgencyLevel === "medium" ? "text-nyay-gold" : "text-nyay-teal"
                  }`} />
                </div>
                <div>
                  <span className="text-sm font-medium text-nyay-teal">Case Type</span>
                  <h2 className="text-2xl font-bold text-foreground">{analysis.caseType}</h2>
                  <p className="text-muted-foreground mt-2">{analysis.summary}</p>
                  <div className="flex gap-3 mt-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      analysis.urgencyLevel === "high" ? "bg-destructive/10 text-destructive" :
                      analysis.urgencyLevel === "medium" ? "bg-nyay-gold/10 text-nyay-gold" : "bg-nyay-teal/10 text-nyay-teal"
                    }`}>
                      {analysis.urgencyLevel.toUpperCase()} PRIORITY
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      ~{analysis.estimatedTimeframe}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis CTA */}
          <Card className="border-nyay-indigo/30 bg-nyay-indigo/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-nyay-indigo/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-nyay-indigo" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Want deeper insights?</h3>
                    <p className="text-sm text-muted-foreground">Get authority mapping, action plan, and case assessment</p>
                  </div>
                </div>
                <Button onClick={startDetailedAnalysis} className="bg-nyay-indigo hover:bg-nyay-indigo/90">
                  View Detailed AI Analysis
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* FIR Warning */}
          {analysis.requiresFIR && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
                  <div>
                    <p className="font-medium text-destructive">FIR Required</p>
                    <p className="text-sm text-muted-foreground">
                      This case may require filing an FIR at your local police station before proceeding with legal action.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Online Filing Guide for Consumer Cases */}
          {analysis.isConsumerCase && proceedChoice === "online" && (
            <Card className="border-nyay-teal/50">
              <CardHeader>
                <CardTitle className="text-lg">e-Daakhil Filing Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Follow these steps to file your consumer complaint online:</p>
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-nyay-teal/10 text-nyay-teal text-sm font-medium flex items-center justify-center shrink-0">1</span>
                    <span>Visit <a href="https://edaakhil.nic.in/" target="_blank" rel="noopener noreferrer" className="text-nyay-teal hover:underline">e-Daakhil Portal</a> and register/login</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-nyay-teal/10 text-nyay-teal text-sm font-medium flex items-center justify-center shrink-0">2</span>
                    <span>Prepare: ID proof, address proof, purchase receipts, warranty cards</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-nyay-teal/10 text-nyay-teal text-sm font-medium flex items-center justify-center shrink-0">3</span>
                    <span>Select your District/State Forum based on claim amount</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-nyay-teal/10 text-nyay-teal text-sm font-medium flex items-center justify-center shrink-0">4</span>
                    <span>Fill complaint form with opposite party details and relief sought</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-nyay-teal/10 text-nyay-teal text-sm font-medium flex items-center justify-center shrink-0">5</span>
                    <span>Pay filing fee online and submit</span>
                  </li>
                </ol>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Prerequisites */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Prerequisites</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.prerequisites.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-nyay-teal shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {analysis.nextSteps.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-nyay-gold/10 text-nyay-gold text-xs font-medium flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.recommendations.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <ChevronRight className="w-4 h-4 text-nyay-indigo shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Find Lawyers CTA */}
          {(!analysis.isConsumerCase || proceedChoice === "lawyer") && (
            <Card className="bg-gradient-hero text-primary-foreground">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Users className="w-10 h-10" />
                    <div>
                      <h3 className="text-lg font-semibold">Connect with {analysis.caseType} Lawyers</h3>
                      <p className="text-primary-foreground/80 text-sm">Find experienced lawyers specialized in your case type</p>
                    </div>
                  </div>
                  <Button variant="gold" onClick={() => onFindLawyers?.(analysis.caseType, caseDescription, analysis)}>
                    Find Lawyers
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <Card className="shadow-card">
        <CardHeader>
          <div className="w-12 h-12 rounded-xl bg-nyay-teal/10 flex items-center justify-center mb-3">
            <MessageSquareText className="w-6 h-6 text-nyay-teal" />
          </div>
          <CardTitle>NyayScan - AI Case Analyzer</CardTitle>
          <p className="text-sm text-muted-foreground">
            Describe your legal issue in detail and our AI will analyze it to provide guidance.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="caseDescription">Describe Your Legal Issue</Label>
            <Textarea
              id="caseDescription"
              value={caseDescription}
              onChange={(e) => setCaseDescription(e.target.value)}
              placeholder="Example: I purchased a mobile phone online for ₹25,000 but received a defective product. The seller is not responding to my refund request. It has been 15 days since my complaint..."
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Include relevant details like dates, amounts, parties involved, and what happened.
            </p>
          </div>

          <Button
            variant="teal"
            size="lg"
            className="w-full"
            onClick={handleAnalyze}
            disabled={isLoading || !caseDescription.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Analyze My Case
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NyayScan;
