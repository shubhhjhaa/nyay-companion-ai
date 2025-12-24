import { useState } from "react";
import { MessageSquareText, Send, Loader2, AlertTriangle, CheckCircle, ExternalLink, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
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

const NyayScan = () => {
  const [step, setStep] = useState<"input" | "analyzing" | "result" | "consumer-check" | "proceed-choice">("input");
  const [caseDescription, setCaseDescription] = useState("");
  const [analysis, setAnalysis] = useState<CaseAnalysis | null>(null);
  const [consumerRegistered, setConsumerRegistered] = useState<string>("");
  const [complaintId, setComplaintId] = useState("");
  const [proceedChoice, setProceedChoice] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

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

      // Check if it's a consumer case
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

  const resetForm = () => {
    setStep("input");
    setCaseDescription("");
    setAnalysis(null);
    setConsumerRegistered("");
    setComplaintId("");
    setProceedChoice("");
  };

  if (step === "analyzing") {
    return (
      <div className="max-w-xl mx-auto">
        <Card className="shadow-card">
          <CardContent className="py-16 text-center">
            <Loader2 className="w-16 h-16 text-nyay-teal mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold mb-2">Analyzing Your Case...</h3>
            <p className="text-muted-foreground">
              Our AI is reviewing your legal situation and preparing guidance.
            </p>
          </CardContent>
        </Card>
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
                  <Button variant="gold" onClick={() => window.location.reload()}>
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
