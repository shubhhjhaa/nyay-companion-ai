import { useState } from "react";
import { Scale, X, User, Briefcase, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (userType: "user" | "lawyer") => void;
}

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh"
];

const practiceAreas = [
  "Consumer Court", "Family Law", "Criminal Law", "Property Disputes",
  "Labour Law", "Cyber Crime", "Corporate Law", "Tax Law", "Civil Law",
  "Constitutional Law", "Banking & Finance", "Intellectual Property"
];

const AuthModal = ({ isOpen, onClose, onAuthSuccess }: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [userType, setUserType] = useState<"user" | "lawyer">("user");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Common fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  // Lawyer specific fields
  const [practiceArea, setPracticeArea] = useState("");
  const [experience, setExperience] = useState("");
  const [barCouncilId, setBarCouncilId] = useState("");

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setMobile("");
    setState("");
    setCity("");
    setPracticeArea("");
    setExperience("");
    setBarCouncilId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "login") {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Fetch user's actual profile to get their registered user_type
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', authData.user.id)
          .single();

        if (profileError) throw profileError;

        const actualUserType = profile?.user_type || 'user';

        // Validate that selected user type matches the registered type
        if (actualUserType !== userType) {
          await supabase.auth.signOut();
          toast.error(`This account is registered as a ${actualUserType}. Please select the correct account type.`);
          return;
        }

        toast.success("Welcome back!");
        onAuthSuccess(actualUserType as "user" | "lawyer");
      } else {
        // Register
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
              mobile,
              state,
              city,
              user_type: userType,
              ...(userType === "lawyer" && {
                practice_area: practiceArea,
                experience: parseInt(experience),
                bar_council_id: barCouncilId,
              }),
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          toast.success("Account created successfully!");
          onAuthSuccess(userType);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto m-4 bg-card rounded-2xl shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-card z-10 p-6 border-b border-border">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
              <Scale className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {mode === "login" ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mode === "login" ? "Sign in to continue" : "Join NyayBuddy today"}
              </p>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <button
              onClick={() => { setMode("login"); resetForm(); }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                mode === "login"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setMode("register"); resetForm(); }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                mode === "register"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* User Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">I am a</Label>
            <RadioGroup
              value={userType}
              onValueChange={(value) => setUserType(value as "user" | "lawyer")}
              className="grid grid-cols-2 gap-3"
            >
              <Label
                htmlFor="user"
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  userType === "user"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value="user" id="user" />
                <User className="w-5 h-5 text-primary" />
                <span className="font-medium">User</span>
              </Label>
              <Label
                htmlFor="lawyer"
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  userType === "lawyer"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value="lawyer" id="lawyer" />
                <Briefcase className="w-5 h-5 text-primary" />
                <span className="font-medium">Lawyer</span>
              </Label>
            </RadioGroup>
          </div>

          {/* Common Fields */}
          <div className="space-y-4">
            {mode === "register" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Select value={state} onValueChange={setState} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        {indianStates.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Enter city"
                      required
                    />
                  </div>
                </div>

                {/* Lawyer-specific fields */}
                {userType === "lawyer" && (
                  <>
                    <div className="space-y-2">
                      <Label>Practice Area</Label>
                      <Select value={practiceArea} onValueChange={setPracticeArea} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Practice Area" />
                        </SelectTrigger>
                        <SelectContent>
                          {practiceAreas.map((area) => (
                            <SelectItem key={area} value={area}>{area}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="experience">Years of Experience</Label>
                        <Input
                          id="experience"
                          type="number"
                          min="0"
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          placeholder="e.g., 5"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="barCouncilId">Bar Council ID</Label>
                        <Input
                          id="barCouncilId"
                          value={barCouncilId}
                          onChange={(e) => setBarCouncilId(e.target.value)}
                          placeholder="e.g., MH/1234/2020"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <Button type="submit" variant="hero" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Please wait...
              </>
            ) : mode === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to NyayBuddy's Terms of Service and Privacy Policy.
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
