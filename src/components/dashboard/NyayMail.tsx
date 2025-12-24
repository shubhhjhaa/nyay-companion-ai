import { useState } from "react";
import { Mail, Send, Loader2, Copy, Check, ChevronRight, Phone, Globe, MapPin, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { caseTypes } from "@/data/caseTypes";

interface CompanyDetails {
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  confidence: "high" | "medium" | "low";
}

interface EmailResult {
  subject: string;
  body: string;
  tips: string[];
  companyDetails?: CompanyDetails;
}

const NyayMail = () => {
  const [step, setStep] = useState<"form" | "generating" | "result">("form");
  const [emailResult, setEmailResult] = useState<EmailResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedContacts, setCopiedContacts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    caseType: "",
    problem: "",
    oppositeParty: "",
    incidentDate: "",
    consumerComplaintRegistered: "",
    complaintId: "",
    amount: "",
    additionalDetails: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.name || !formData.caseType || !formData.problem || !formData.oppositeParty) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setStep("generating");

    try {
      const { data, error } = await supabase.functions.invoke("nyaymail", {
        body: { formData },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setEmailResult(data.email);
      setStep("result");
    } catch (error: any) {
      console.error("Email generation error:", error);
      toast.error(error.message || "Failed to generate email. Please try again.");
      setStep("form");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!emailResult) return;
    
    const fullEmail = `Subject: ${emailResult.subject}\n\n${emailResult.body}`;
    await navigator.clipboard.writeText(fullEmail);
    setCopied(true);
    toast.success("Email copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyContacts = async () => {
    if (!emailResult?.companyDetails) return;
    
    const details = emailResult.companyDetails;
    const contactText = [
      details.email && `Email: ${details.email}`,
      details.phone && `Phone: ${details.phone}`,
      details.website && `Website: ${details.website}`,
      details.address && `Address: ${details.address}`,
    ].filter(Boolean).join("\n");
    
    await navigator.clipboard.writeText(contactText);
    setCopiedContacts(true);
    toast.success("Contact details copied!");
    setTimeout(() => setCopiedContacts(false), 2000);
  };

  const resetForm = () => {
    setStep("form");
    setEmailResult(null);
    setFormData({
      name: "",
      phone: "",
      caseType: "",
      problem: "",
      oppositeParty: "",
      incidentDate: "",
      consumerComplaintRegistered: "",
      complaintId: "",
      amount: "",
      additionalDetails: "",
    });
  };

  if (step === "generating") {
    return (
      <div className="max-w-xl mx-auto">
        <Card className="shadow-card">
          <CardContent className="py-16 text-center">
            <Loader2 className="w-16 h-16 text-nyay-indigo mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold mb-2">Generating Your Email...</h3>
            <p className="text-muted-foreground">
              Creating a professional legal email based on your details.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "result" && emailResult) {
    return (
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={resetForm}>
          ← Create Another Email
        </Button>

        <div className="space-y-6">
          {/* Subject */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <Label className="text-sm text-muted-foreground">Subject</Label>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-foreground">{emailResult.subject}</p>
            </CardContent>
          </Card>

          {/* Body */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <Label className="text-sm text-muted-foreground">Email Body</Label>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed bg-muted/30 p-4 rounded-lg">
                {emailResult.body}
              </div>
            </CardContent>
          </Card>

          {/* Copy Button */}
          <Button
            variant="gold"
            size="lg"
            className="w-full"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Full Email
              </>
            )}
          </Button>

          {/* Detected Company Contact Details */}
          {emailResult.companyDetails && (
            <Card className="shadow-card border-nyay-indigo/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-nyay-indigo/10 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-nyay-indigo" />
                    </div>
                    <CardTitle className="text-lg">Detected Company Contact Details</CardTitle>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    emailResult.companyDetails.confidence === 'high' 
                      ? 'bg-green-100 text-green-700' 
                      : emailResult.companyDetails.confidence === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-orange-100 text-orange-700'
                  }`}>
                    AI-detected ({emailResult.companyDetails.confidence})
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3">
                  {emailResult.companyDetails.email && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Mail className="w-4 h-4 text-nyay-indigo shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium truncate">{emailResult.companyDetails.email}</p>
                      </div>
                    </div>
                  )}
                  {emailResult.companyDetails.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Phone className="w-4 h-4 text-nyay-indigo shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Customer Support / Helpline</p>
                        <p className="text-sm font-medium">{emailResult.companyDetails.phone}</p>
                      </div>
                    </div>
                  )}
                  {emailResult.companyDetails.website && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Globe className="w-4 h-4 text-nyay-indigo shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Website</p>
                        <p className="text-sm font-medium truncate">{emailResult.companyDetails.website}</p>
                      </div>
                    </div>
                  )}
                  {emailResult.companyDetails.address && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <MapPin className="w-4 h-4 text-nyay-indigo shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Registered Office Address</p>
                        <p className="text-sm font-medium">{emailResult.companyDetails.address}</p>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleCopyContacts}
                >
                  {copiedContacts ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Contact Details
                    </>
                  )}
                </Button>

                <div className="flex items-start gap-2 text-xs text-muted-foreground mt-2">
                  <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                  <p>Company contact details are AI-detected from publicly available information and should be verified before use.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          {emailResult.tips && emailResult.tips.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What to Do Next</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {emailResult.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <ChevronRight className="w-4 h-4 text-nyay-indigo shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
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
          <div className="w-12 h-12 rounded-xl bg-nyay-indigo/10 flex items-center justify-center mb-3">
            <Mail className="w-6 h-6 text-nyay-indigo" />
          </div>
          <CardTitle>NyayMail - Email Generator</CardTitle>
          <p className="text-sm text-muted-foreground">
            Generate a professional legal email or complaint letter.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Case Type *</Label>
            <Select value={formData.caseType} onValueChange={(v) => updateField("caseType", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select case type" />
              </SelectTrigger>
              <SelectContent>
                {caseTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="oppositeParty">Company / Opposite Party Name *</Label>
            <Input
              id="oppositeParty"
              value={formData.oppositeParty}
              onChange={(e) => updateField("oppositeParty", e.target.value)}
              placeholder="Name of company or person you're complaining against"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="incidentDate">Date of Incident</Label>
              <Input
                id="incidentDate"
                type="date"
                value={formData.incidentDate}
                onChange={(e) => updateField("incidentDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount Involved (₹)</Label>
              <Input
                id="amount"
                value={formData.amount}
                onChange={(e) => updateField("amount", e.target.value)}
                placeholder="e.g., 25000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="problem">Describe Your Problem *</Label>
            <Textarea
              id="problem"
              value={formData.problem}
              onChange={(e) => updateField("problem", e.target.value)}
              placeholder="Explain the issue in detail..."
              rows={4}
            />
          </div>

          {formData.caseType === "Consumer Court" && (
            <div className="space-y-3 p-4 rounded-xl bg-muted/50">
              <Label>Consumer Complaint Registered on NCH?</Label>
              <RadioGroup
                value={formData.consumerComplaintRegistered}
                onValueChange={(v) => updateField("consumerComplaintRegistered", v)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="nch-yes" />
                  <Label htmlFor="nch-yes" className="cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="nch-no" />
                  <Label htmlFor="nch-no" className="cursor-pointer">No</Label>
                </div>
              </RadioGroup>

              {formData.consumerComplaintRegistered === "yes" && (
                <div className="space-y-2">
                  <Label htmlFor="complaintId">Complaint ID</Label>
                  <Input
                    id="complaintId"
                    value={formData.complaintId}
                    onChange={(e) => updateField("complaintId", e.target.value)}
                    placeholder="NCH complaint reference number"
                  />
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="additionalDetails">Additional Details (Optional)</Label>
            <Textarea
              id="additionalDetails"
              value={formData.additionalDetails}
              onChange={(e) => updateField("additionalDetails", e.target.value)}
              placeholder="Any other relevant information..."
              rows={3}
            />
          </div>

          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={handleGenerate}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Generate Email
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NyayMail;
