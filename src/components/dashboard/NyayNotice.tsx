import { useState } from "react";
import { FileText, Send, Loader2, Copy, Check, ChevronRight, Download, Phone, Globe, MapPin, Mail, AlertCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { jsPDF } from "jspdf";

type Step = "sender" | "recipient" | "transaction" | "problem" | "actions" | "relief" | "generating" | "result";

interface CompanyDetails {
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  confidence: "high" | "medium" | "low";
}

interface NoticeResult {
  noticeContent: string;
  subject: string;
  summary: string;
  recommendedDeadline: string;
  nextSteps: string[];
  sendingInstructions: string[];
  companyDetails: CompanyDetails | null;
  legalForum: string;
}

interface NyayNoticeProps {
  onFindLawyers?: (caseType: string) => void;
}

const NyayNotice = ({ onFindLawyers }: NyayNoticeProps) => {
  const [step, setStep] = useState<Step>("sender");
  const [noticeResult, setNoticeResult] = useState<NoticeResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedContacts, setCopiedContacts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Sender
    senderName: "",
    senderAddress: "",
    senderCity: "",
    senderState: "",
    senderPincode: "",
    senderMobile: "",
    senderEmail: "",
    // Recipient
    recipientName: "",
    recipientAddress: "",
    branchAddress: "",
    // Transaction
    relationshipType: "",
    transactionDate: "",
    orderId: "",
    amountPaid: "",
    // Problem
    problemDescription: "",
    issueNature: "",
    lossDescription: "",
    // Previous Actions
    customerCareContacted: "",
    nchComplaint: "",
    complaintId: "",
    policeComplaint: "",
    // Relief
    resolutionType: "",
    amountDemanded: "",
    otherRelief: "",
    responseTime: "15",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const steps: { id: Step; label: string }[] = [
    { id: "sender", label: "Your Details" },
    { id: "recipient", label: "Recipient" },
    { id: "transaction", label: "Transaction" },
    { id: "problem", label: "Problem" },
    { id: "actions", label: "Previous Actions" },
    { id: "relief", label: "Relief" },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  const validateStep = (): boolean => {
    switch (step) {
      case "sender":
        if (!formData.senderName || !formData.senderAddress || !formData.senderCity || !formData.senderState || !formData.senderPincode) {
          toast.error("Please fill all required sender details");
          return false;
        }
        break;
      case "recipient":
        if (!formData.recipientName) {
          toast.error("Please enter recipient name");
          return false;
        }
        break;
      case "transaction":
        if (!formData.relationshipType) {
          toast.error("Please select relationship type");
          return false;
        }
        break;
      case "problem":
        if (!formData.problemDescription || !formData.issueNature) {
          toast.error("Please describe the problem and select issue nature");
          return false;
        }
        break;
      case "relief":
        if (!formData.resolutionType) {
          toast.error("Please select what resolution you want");
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    const idx = currentStepIndex;
    if (idx < steps.length - 1) {
      setStep(steps[idx + 1].id);
    }
  };

  const prevStep = () => {
    const idx = currentStepIndex;
    if (idx > 0) {
      setStep(steps[idx - 1].id);
    }
  };

  const handleGenerate = async () => {
    if (!validateStep()) return;

    setIsLoading(true);
    setStep("generating");

    try {
      const { data, error } = await supabase.functions.invoke("nyaynotice", {
        body: { formData },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setNoticeResult(data.notice);
      setStep("result");
    } catch (error: any) {
      console.error("Notice generation error:", error);
      toast.error(error.message || "Failed to generate legal notice. Please try again.");
      setStep("relief");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!noticeResult) return;
    await navigator.clipboard.writeText(noticeResult.noticeContent);
    setCopied(true);
    toast.success("Legal notice copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyContacts = async () => {
    if (!noticeResult?.companyDetails) return;
    const details = noticeResult.companyDetails;
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

  const handleDownloadPDF = () => {
    if (!noticeResult) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    const lineHeight = 6;
    
    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("LEGAL NOTICE", pageWidth / 2, 25, { align: "center" });
    
    // Separator line
    doc.setLineWidth(0.5);
    doc.line(margin, 30, pageWidth - margin, 30);
    
    // Subject
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    const subjectLines = doc.splitTextToSize(`Subject: ${noticeResult.subject}`, maxWidth);
    doc.text(subjectLines, margin, 40);
    
    let yPos = 40 + (subjectLines.length * lineHeight) + 5;
    
    // Content - Process the text properly
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    // Clean and split the content
    const cleanContent = noticeResult.noticeContent
      .replace(/\\n/g, '\n')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');
    
    const paragraphs = cleanContent.split('\n');
    
    paragraphs.forEach((paragraph: string) => {
      if (paragraph.trim() === '') {
        yPos += lineHeight / 2;
        return;
      }
      
      const lines = doc.splitTextToSize(paragraph.trim(), maxWidth);
      
      lines.forEach((line: string) => {
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = 25;
        }
        doc.text(line, margin, yPos);
        yPos += lineHeight;
      });
      
      yPos += 2; // Small gap between paragraphs
    });

    // Footer disclaimer
    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(128, 128, 128);
    doc.text("Generated by NyayBuddy - AI Legal Notice Generator", pageWidth / 2, footerY, { align: "center" });

    doc.save(`Legal_Notice_${formData.recipientName.replace(/\s+/g, '_')}.pdf`);
    toast.success("PDF downloaded successfully!");
  };

  const resetForm = () => {
    setStep("sender");
    setNoticeResult(null);
    setFormData({
      senderName: "", senderAddress: "", senderCity: "", senderState: "", senderPincode: "",
      senderMobile: "", senderEmail: "", recipientName: "", recipientAddress: "", branchAddress: "",
      relationshipType: "", transactionDate: "", orderId: "", amountPaid: "", problemDescription: "",
      issueNature: "", lossDescription: "", customerCareContacted: "", nchComplaint: "",
      complaintId: "", policeComplaint: "", resolutionType: "", amountDemanded: "", otherRelief: "", responseTime: "15",
    });
  };

  if (step === "generating") {
    return (
      <div className="max-w-xl mx-auto">
        <Card className="shadow-card">
          <CardContent className="py-16 text-center">
            <Loader2 className="w-16 h-16 text-nyay-indigo mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold mb-2">Generating Your Legal Notice...</h3>
            <p className="text-muted-foreground">Creating a professional, legally compliant notice.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "result" && noticeResult) {
    return (
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={resetForm}>← Create Another Notice</Button>

        <div className="space-y-6">
          {/* Summary */}
          <Card className="shadow-card border-l-4 border-l-nyay-indigo">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-2">Legal Notice Generated</h2>
              <p className="text-muted-foreground">{noticeResult.summary}</p>
              <div className="flex gap-3 mt-3">
                <span className="text-xs px-2 py-1 rounded-full bg-nyay-indigo/10 text-nyay-indigo">
                  Response Deadline: {noticeResult.recommendedDeadline} days
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  Forum: {noticeResult.legalForum}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Notice Content */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Legal Notice</Label>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed bg-muted/30 p-4 rounded-lg max-h-96 overflow-y-auto font-mono">
                {noticeResult.noticeContent}
              </div>
            </CardContent>
          </Card>

          {/* Download PDF */}
          <Button variant="gold" size="lg" className="w-full" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-2" />
            Download Legal Notice (PDF)
          </Button>

          {/* Company Contact Details */}
          {noticeResult.companyDetails && (
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
                    noticeResult.companyDetails.confidence === 'high' ? 'bg-green-100 text-green-700' :
                    noticeResult.companyDetails.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    AI-detected ({noticeResult.companyDetails.confidence})
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3">
                  {noticeResult.companyDetails.email && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Mail className="w-4 h-4 text-nyay-indigo shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium truncate">{noticeResult.companyDetails.email}</p>
                      </div>
                    </div>
                  )}
                  {noticeResult.companyDetails.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Phone className="w-4 h-4 text-nyay-indigo shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Helpline</p>
                        <p className="text-sm font-medium">{noticeResult.companyDetails.phone}</p>
                      </div>
                    </div>
                  )}
                  {noticeResult.companyDetails.website && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Globe className="w-4 h-4 text-nyay-indigo shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Website</p>
                        <p className="text-sm font-medium truncate">{noticeResult.companyDetails.website}</p>
                      </div>
                    </div>
                  )}
                  {noticeResult.companyDetails.address && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <MapPin className="w-4 h-4 text-nyay-indigo shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Registered Office</p>
                        <p className="text-sm font-medium">{noticeResult.companyDetails.address}</p>
                      </div>
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={handleCopyContacts}>
                  {copiedContacts ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copiedContacts ? "Copied!" : "Copy Contact Details"}
                </Button>
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                  <p>Contact details are AI-detected from publicly available sources. Please verify before use.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* How to Send */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How to Send This Notice</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {noticeResult.sendingInstructions.map((instruction, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <ChevronRight className="w-4 h-4 text-nyay-teal shrink-0 mt-0.5" />
                    <span>{instruction}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What Happens Next</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {noticeResult.nextSteps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-nyay-gold/10 text-nyay-gold text-sm font-medium flex items-center justify-center shrink-0">{i + 1}</span>
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Lawyer Recommendation */}
          <Card className="bg-gradient-hero text-primary-foreground">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Users className="w-10 h-10" />
                  <div>
                    <h3 className="text-lg font-semibold">Need a Lawyer's Assistance?</h3>
                    <p className="text-primary-foreground/80 text-sm">Connect with lawyers specialized in {formData.issueNature || 'your case type'}</p>
                  </div>
                </div>
                <Button variant="gold" onClick={() => onFindLawyers?.(formData.issueNature || "Consumer Court")}>
                  Find Lawyers
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="p-4 rounded-xl bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground">
              <AlertCircle className="w-3 h-3 inline mr-1" />
              This legal notice is AI-generated for assistance purposes and should be reviewed before sending. NyayBuddy does not replace professional legal advice.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Form Steps
  return (
    <div className="max-w-xl mx-auto">
      <Card className="shadow-card">
        <CardHeader>
          <div className="w-12 h-12 rounded-xl bg-nyay-indigo/10 flex items-center justify-center mb-3">
            <FileText className="w-6 h-6 text-nyay-indigo" />
          </div>
          <CardTitle>NyayNotice - Legal Notice Generator</CardTitle>
          <p className="text-sm text-muted-foreground">Generate a professional legal notice step by step.</p>
          
          {/* Progress */}
          <div className="flex gap-1 mt-4">
            {steps.map((s, i) => (
              <div key={s.id} className={`h-1.5 flex-1 rounded-full ${i <= currentStepIndex ? 'bg-nyay-indigo' : 'bg-muted'}`} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Step {currentStepIndex + 1} of {steps.length}: {steps[currentStepIndex]?.label}</p>
        </CardHeader>

        <CardContent className="space-y-5">
          {step === "sender" && (
            <>
              <div className="space-y-2">
                <Label>Your Full Name *</Label>
                <Input value={formData.senderName} onChange={(e) => updateField("senderName", e.target.value)} placeholder="Full name as per ID" />
              </div>
              <div className="space-y-2">
                <Label>Full Address *</Label>
                <Textarea value={formData.senderAddress} onChange={(e) => updateField("senderAddress", e.target.value)} placeholder="House No, Area, Landmark" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input value={formData.senderCity} onChange={(e) => updateField("senderCity", e.target.value)} placeholder="City" />
                </div>
                <div className="space-y-2">
                  <Label>State *</Label>
                  <Input value={formData.senderState} onChange={(e) => updateField("senderState", e.target.value)} placeholder="State" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pincode *</Label>
                  <Input value={formData.senderPincode} onChange={(e) => updateField("senderPincode", e.target.value)} placeholder="6-digit pincode" />
                </div>
                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <Input value={formData.senderMobile} onChange={(e) => updateField("senderMobile", e.target.value)} placeholder="+91 XXXXX XXXXX" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email ID</Label>
                <Input type="email" value={formData.senderEmail} onChange={(e) => updateField("senderEmail", e.target.value)} placeholder="your@email.com" />
              </div>
            </>
          )}

          {step === "recipient" && (
            <>
              <div className="space-y-2">
                <Label>Company / Person Name *</Label>
                <Input value={formData.recipientName} onChange={(e) => updateField("recipientName", e.target.value)} placeholder="Name of company or person" />
              </div>
              <div className="space-y-2">
                <Label>Registered Office Address</Label>
                <Textarea value={formData.recipientAddress} onChange={(e) => updateField("recipientAddress", e.target.value)} placeholder="Registered office address (if known)" rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Branch Address (if applicable)</Label>
                <Textarea value={formData.branchAddress} onChange={(e) => updateField("branchAddress", e.target.value)} placeholder="Branch or local office address" rows={2} />
              </div>
            </>
          )}

          {step === "transaction" && (
            <>
              <div className="space-y-2">
                <Label>Relationship Type *</Label>
                <Select value={formData.relationshipType} onValueChange={(v) => updateField("relationshipType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select relationship" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Buyer-Seller">Buyer - Seller</SelectItem>
                    <SelectItem value="Service Provider-Customer">Service Provider - Customer</SelectItem>
                    <SelectItem value="Employer-Employee">Employer - Employee</SelectItem>
                    <SelectItem value="Landlord-Tenant">Landlord - Tenant</SelectItem>
                    <SelectItem value="Bank-Customer">Bank - Customer</SelectItem>
                    <SelectItem value="Insurance-Policyholder">Insurance - Policyholder</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date of Purchase/Agreement</Label>
                  <Input type="date" value={formData.transactionDate} onChange={(e) => updateField("transactionDate", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Amount Paid (₹)</Label>
                  <Input value={formData.amountPaid} onChange={(e) => updateField("amountPaid", e.target.value)} placeholder="e.g., 25000" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Invoice / Order ID</Label>
                <Input value={formData.orderId} onChange={(e) => updateField("orderId", e.target.value)} placeholder="Reference number" />
              </div>
            </>
          )}

          {step === "problem" && (
            <>
              <div className="space-y-2">
                <Label>Nature of Issue *</Label>
                <Select value={formData.issueNature} onValueChange={(v) => updateField("issueNature", v)}>
                  <SelectTrigger><SelectValue placeholder="Select issue type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Delay in Delivery">Delay in Delivery</SelectItem>
                    <SelectItem value="Deficiency of Service">Deficiency of Service</SelectItem>
                    <SelectItem value="Non-Delivery">Non-Delivery of Product/Service</SelectItem>
                    <SelectItem value="Defective Product">Defective Product</SelectItem>
                    <SelectItem value="Fraud/Cheating">Fraud / Cheating</SelectItem>
                    <SelectItem value="Refund Not Processed">Refund Not Processed</SelectItem>
                    <SelectItem value="Warranty Not Honored">Warranty Not Honored</SelectItem>
                    <SelectItem value="Unauthorized Charges">Unauthorized Charges</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Describe the Issue in Detail *</Label>
                <Textarea value={formData.problemDescription} onChange={(e) => updateField("problemDescription", e.target.value)} placeholder="Explain what happened, include dates and specifics..." rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Loss or Harassment Faced</Label>
                <Textarea value={formData.lossDescription} onChange={(e) => updateField("lossDescription", e.target.value)} placeholder="Any financial loss, mental harassment, or inconvenience..." rows={2} />
              </div>
            </>
          )}

          {step === "actions" && (
            <>
              <div className="space-y-3">
                <Label>Have you contacted Customer Care?</Label>
                <RadioGroup value={formData.customerCareContacted} onValueChange={(v) => updateField("customerCareContacted", v)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="cc-yes" />
                    <Label htmlFor="cc-yes" className="cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="cc-no" />
                    <Label htmlFor="cc-no" className="cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-3">
                <Label>Complaint registered on National Consumer Helpline (NCH)?</Label>
                <RadioGroup value={formData.nchComplaint} onValueChange={(v) => updateField("nchComplaint", v)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="nch-yes" />
                    <Label htmlFor="nch-yes" className="cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="nch-no" />
                    <Label htmlFor="nch-no" className="cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>
              {formData.nchComplaint === "Yes" && (
                <div className="space-y-2">
                  <Label>Complaint ID</Label>
                  <Input value={formData.complaintId} onChange={(e) => updateField("complaintId", e.target.value)} placeholder="NCH complaint reference number" />
                </div>
              )}
              <div className="space-y-3">
                <Label>Police complaint filed?</Label>
                <RadioGroup value={formData.policeComplaint} onValueChange={(v) => updateField("policeComplaint", v)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="police-yes" />
                    <Label htmlFor="police-yes" className="cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="police-no" />
                    <Label htmlFor="police-no" className="cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </>
          )}

          {step === "relief" && (
            <>
              <div className="space-y-2">
                <Label>What Resolution Do You Want? *</Label>
                <Select value={formData.resolutionType} onValueChange={(v) => updateField("resolutionType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select resolution type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Refund">Full Refund</SelectItem>
                    <SelectItem value="Replacement">Replacement</SelectItem>
                    <SelectItem value="Compensation">Compensation for Damages</SelectItem>
                    <SelectItem value="Refund and Compensation">Refund + Compensation</SelectItem>
                    <SelectItem value="Service Completion">Complete the Service</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount Demanded (₹)</Label>
                <Input value={formData.amountDemanded} onChange={(e) => updateField("amountDemanded", e.target.value)} placeholder="Total amount you're demanding" />
              </div>
              {formData.resolutionType === "Other" && (
                <div className="space-y-2">
                  <Label>Describe Other Relief</Label>
                  <Textarea value={formData.otherRelief} onChange={(e) => updateField("otherRelief", e.target.value)} placeholder="Describe what you want..." rows={2} />
                </div>
              )}
              <div className="space-y-2">
                <Label>Response Time Limit</Label>
                <Select value={formData.responseTime} onValueChange={(v) => updateField("responseTime", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days (Urgent)</SelectItem>
                    <SelectItem value="15">15 days (Standard)</SelectItem>
                    <SelectItem value="30">30 days (Extended)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-4">
            {currentStepIndex > 0 && (
              <Button variant="outline" onClick={prevStep} className="flex-1">
                ← Previous
              </Button>
            )}
            {currentStepIndex < steps.length - 1 ? (
              <Button variant="gold" onClick={nextStep} className="flex-1">
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button variant="hero" onClick={handleGenerate} className="flex-1" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Generate Legal Notice
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NyayNotice;