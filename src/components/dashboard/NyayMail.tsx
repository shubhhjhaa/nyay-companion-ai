import { useState, useEffect, useRef } from "react";
import { Mail, Send, Loader2, Copy, Check, ChevronRight, Phone, Globe, MapPin, AlertCircle, Trash2, Reply, Upload, Image, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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

interface SavedEmail {
  id: string;
  email_type: string;
  subject: string;
  body: string;
  opposite_party: string | null;
  case_type: string | null;
  parent_email_id: string | null;
  created_at: string;
}

const NyayMail = () => {
  const [step, setStep] = useState<"form" | "generating" | "result">("form");
  const [emailResult, setEmailResult] = useState<EmailResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedContacts, setCopiedContacts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savedEmails, setSavedEmails] = useState<SavedEmail[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(true);
  
  // Reply modal state
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<SavedEmail | null>(null);
  const [replyMethod, setReplyMethod] = useState<"text" | "image">("text");
  const [companyReplyText, setCompanyReplyText] = useState("");
  const [replyImage, setReplyImage] = useState<File | null>(null);
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    fetchSavedEmails();
  }, []);

  const fetchSavedEmails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_emails')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedEmails(data || []);
    } catch (error) {
      console.error('Error fetching saved emails:', error);
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const saveEmail = async (email: EmailResult, emailType: string = 'original', parentId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to save emails");
        return;
      }

      const { error } = await supabase
        .from('saved_emails')
        .insert({
          user_id: user.id,
          email_type: emailType,
          subject: email.subject,
          body: email.body,
          opposite_party: formData.oppositeParty || null,
          case_type: formData.caseType || null,
          parent_email_id: parentId || null
        });

      if (error) throw error;
      
      toast.success("Email saved successfully!");
      fetchSavedEmails();
    } catch (error) {
      console.error('Error saving email:', error);
      toast.error("Failed to save email");
    }
  };

  const deleteEmail = async (emailId: string) => {
    try {
      const { error } = await supabase
        .from('saved_emails')
        .delete()
        .eq('id', emailId);

      if (error) throw error;
      
      setSavedEmails(prev => prev.filter(e => e.id !== emailId));
      toast.success("Email deleted");
    } catch (error) {
      console.error('Error deleting email:', error);
      toast.error("Failed to delete email");
    }
  };

  const handleGenerateReply = async () => {
    if (!selectedEmail) return;
    
    if (replyMethod === "text" && !companyReplyText.trim()) {
      toast.error("Please paste the company's reply");
      return;
    }
    
    if (replyMethod === "image" && !replyImage) {
      toast.error("Please upload the company's reply image");
      return;
    }

    setIsGeneratingReply(true);

    try {
      let imageBase64 = null;
      
      if (replyMethod === "image" && replyImage) {
        const reader = new FileReader();
        imageBase64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(replyImage);
        });
      }

      const { data, error } = await supabase.functions.invoke("nyaymail-reply", {
        body: {
          companyReply: companyReplyText,
          originalEmail: {
            subject: selectedEmail.subject,
            body: selectedEmail.body
          },
          imageBase64
        },
      });

      if (error) throw error;
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Save the reply email
      await saveEmail(data.email, 'reply', selectedEmail.id);
      
      setEmailResult(data.email);
      setIsReplyModalOpen(false);
      setStep("result");
      setCompanyReplyText("");
      setReplyImage(null);
      toast.success("Reply email generated!");
    } catch (error: any) {
      console.error('Error generating reply:', error);
      toast.error(error.message || "Failed to generate reply");
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const openReplyModal = (email: SavedEmail) => {
    setSelectedEmail(email);
    setReplyMethod("text");
    setCompanyReplyText("");
    setReplyImage(null);
    setIsReplyModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setReplyImage(file);
    }
  };

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
      
      // Auto-save the generated email
      await saveEmail(data.email, 'original');
      
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
  });
  };

  const renderSavedEmails = () => (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-nyay-indigo" />
        Your Saved Emails
      </h3>
      
      {isLoadingEmails ? (
        <div className="text-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : savedEmails.length === 0 ? (
        <Card className="bg-muted/30">
          <CardContent className="py-8 text-center">
            <Mail className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No saved emails yet. Generate an email to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {savedEmails.map((email) => (
            <Card key={email.id} className={`shadow-sm hover:shadow-md transition-shadow ${email.email_type === 'reply' ? 'border-l-4 border-l-nyay-gold' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        email.email_type === 'reply' 
                          ? 'bg-nyay-gold/10 text-nyay-gold' 
                          : 'bg-nyay-indigo/10 text-nyay-indigo'
                      }`}>
                        {email.email_type === 'reply' ? 'Reply' : 'Original'}
                      </span>
                      {email.case_type && (
                        <span className="text-xs text-muted-foreground">{email.case_type}</span>
                      )}
                    </div>
                    <h4 className="font-medium text-sm truncate">{email.subject}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {email.opposite_party && `To: ${email.opposite_party} • `}
                      {formatDate(email.created_at)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {email.body.substring(0, 150)}...
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-nyay-gold border-nyay-gold/30 hover:bg-nyay-gold/10"
                      onClick={() => openReplyModal(email)}
                    >
                      <Reply className="w-3 h-3 mr-1" />
                      Reply
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => deleteEmail(email.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      <Dialog open={isReplyModalOpen} onOpenChange={setIsReplyModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Reply className="w-5 h-5 text-nyay-gold" />
              Generate Reply Email
            </DialogTitle>
            <DialogDescription>
              Paste the company's reply or upload a screenshot to generate a professional follow-up email.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedEmail && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Replying to:</p>
                <p className="text-sm font-medium truncate">{selectedEmail.subject}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>How do you want to provide the company's reply?</Label>
              <RadioGroup value={replyMethod} onValueChange={(v) => setReplyMethod(v as "text" | "image")} className="flex gap-4">
                <Label
                  htmlFor="method-text"
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    replyMethod === "text" ? "border-nyay-indigo bg-nyay-indigo/5" : "border-border"
                  }`}
                >
                  <RadioGroupItem value="text" id="method-text" />
                  <FileText className="w-4 h-4" />
                  Paste Text
                </Label>
                <Label
                  htmlFor="method-image"
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    replyMethod === "image" ? "border-nyay-indigo bg-nyay-indigo/5" : "border-border"
                  }`}
                >
                  <RadioGroupItem value="image" id="method-image" />
                  <Image className="w-4 h-4" />
                  Upload Image
                </Label>
              </RadioGroup>
            </div>

            {replyMethod === "text" && (
              <div className="space-y-2">
                <Label htmlFor="companyReply">Company's Reply</Label>
                <Textarea
                  id="companyReply"
                  value={companyReplyText}
                  onChange={(e) => setCompanyReplyText(e.target.value)}
                  placeholder="Paste the company's email reply here..."
                  rows={6}
                />
              </div>
            )}

            {replyMethod === "image" && (
              <div className="space-y-2">
                <Label>Upload Screenshot of Company's Reply</Label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {replyImage ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(replyImage)}
                      alt="Uploaded reply"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      className="absolute top-2 right-2"
                      onClick={() => setReplyImage(null)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-nyay-indigo/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload or drag & drop</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </div>
            )}

            <Button
              variant="gold"
              className="w-full"
              onClick={handleGenerateReply}
              disabled={isGeneratingReply}
            >
              {isGeneratingReply ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing & Generating Reply...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Generate Reply Email
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

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

        {/* Saved Emails Section */}
        <Separator className="my-8" />
        {renderSavedEmails()}
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

      {/* Saved Emails Section */}
      {renderSavedEmails()}
    </div>
  );
};

export default NyayMail;
