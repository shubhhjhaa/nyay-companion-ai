import { useState, useEffect } from "react";
import { MapPin, ChevronRight, Star, Phone, Clock, Languages, BadgeCheck, Heart, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { indianStates, citiesByState, caseTypes } from "@/data/caseTypes";
import { dummyLawyers, Lawyer as DummyLawyer } from "@/data/lawyers";
import { supabase } from "@/integrations/supabase/client";

interface Lawyer {
  id: string;
  name: string;
  city: string;
  state: string;
  specialization: string;
  experience: number;
  languages: string[];
  barCouncilId: string;
  availability: string;
  rating: number;
  casesWon: number;
  profileImage: string;
  isReal?: boolean;
}

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

interface NyayScanData {
  caseDescription: string;
  analysis: CaseAnalysis | null;
}

interface FindLawyersProps {
  prefillCaseType?: string;
  onClear?: () => void;
  onConnectLawyer?: (lawyerId: string, caseType: string, caseId: string) => void;
  nyayScanData?: NyayScanData | null;
}

const getAvatarUrl = (name: string) => {
  const bgColors = ['0D9488', '6366F1', 'D97706', 'DC2626', '7C3AED', '059669'];
  const randomColor = bgColors[Math.abs(name.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % bgColors.length];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${randomColor}&color=fff&size=200&bold=true`;
};

const FindLawyers = ({ prefillCaseType, onClear, onConnectLawyer, nyayScanData }: FindLawyersProps) => {
  const [step, setStep] = useState<"select" | "results" | "profile">("select");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCaseType, setSelectedCaseType] = useState(prefillCaseType || "");
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [savedLawyerIds, setSavedLawyerIds] = useState<Set<string>>(new Set());
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (prefillCaseType) {
      setSelectedCaseType(prefillCaseType);
    }
    fetchSavedLawyers();
  }, [prefillCaseType]);

  const fetchSavedLawyers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('saved_lawyers')
        .select('lawyer_id')
        .eq('user_id', user.id);

      if (data) {
        setSavedLawyerIds(new Set(data.map(d => d.lawyer_id)));
      }
    } catch (error) {
      console.error('Error fetching saved lawyers:', error);
    }
  };

  const fetchRealLawyers = async (caseType: string, state?: string, city?: string): Promise<Lawyer[]> => {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'lawyer');

      if (caseType) {
        query = query.ilike('practice_area', `%${caseType}%`);
      }
      if (state) {
        query = query.ilike('state', `%${state}%`);
      }
      if (city) {
        query = query.ilike('city', `%${city}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(profile => ({
        id: profile.id,
        name: profile.full_name ? `Adv. ${profile.full_name}` : 'Unknown Lawyer',
        city: profile.city || 'Not specified',
        state: profile.state || 'Not specified',
        specialization: profile.practice_area || 'General Practice',
        experience: profile.experience || 0,
        languages: ['English', 'Hindi'],
        barCouncilId: profile.bar_council_id || 'Not registered',
        availability: 'Mon-Fri, 10 AM - 6 PM',
        rating: 4.5,
        casesWon: Math.floor(Math.random() * 100) + 50,
        profileImage: getAvatarUrl(profile.full_name || 'Lawyer'),
        isReal: true
      }));
    } catch (error) {
      console.error('Error fetching real lawyers:', error);
      return [];
    }
  };

  const handleSearch = async () => {
    if (!selectedState) {
      toast.error("Please select a state");
      return;
    }
    if (!selectedCaseType) {
      toast.error("Please select a case type");
      return;
    }

    setIsSearching(true);

    try {
      // Fetch real lawyers from database
      const realLawyers = await fetchRealLawyers(
        selectedCaseType,
        selectedState,
        selectedCity || undefined
      );

      // Filter dummy lawyers
      const filteredDummy = dummyLawyers.filter((lawyer) => {
        let match = true;
        if (selectedCaseType) {
          match = match && lawyer.specialization.toLowerCase() === selectedCaseType.toLowerCase();
        }
        if (selectedState) {
          match = match && lawyer.state.toLowerCase() === selectedState.toLowerCase();
        }
        if (selectedCity) {
          match = match && lawyer.city.toLowerCase() === selectedCity.toLowerCase();
        }
        return match;
      }).map(l => ({ ...l, isReal: false }));

      // Combine real lawyers first, then dummy
      const combinedLawyers = [...realLawyers, ...filteredDummy];

      if (combinedLawyers.length === 0) {
        // Show lawyers by type only
        const byTypeDummy = dummyLawyers.filter(l => 
          l.specialization.toLowerCase() === selectedCaseType.toLowerCase()
        ).map(l => ({ ...l, isReal: false }));
        
        const byTypeReal = await fetchRealLawyers(selectedCaseType);
        
        setLawyers([...byTypeReal, ...byTypeDummy]);
        if (byTypeReal.length + byTypeDummy.length > 0) {
          toast.info(`Showing ${selectedCaseType} lawyers from all locations`);
        }
      } else {
        setLawyers(combinedLawyers);
        if (realLawyers.length > 0) {
          toast.success(`Found ${realLawyers.length} verified lawyer(s) in your area`);
        }
      }
      setStep("results");
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search lawyers');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveLawyer = async (lawyer: Lawyer, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to save lawyers");
        return;
      }

      if (savedLawyerIds.has(lawyer.id)) {
        const { error } = await supabase
          .from('saved_lawyers')
          .delete()
          .eq('user_id', user.id)
          .eq('lawyer_id', lawyer.id);

        if (error) throw error;
        
        setSavedLawyerIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(lawyer.id);
          return newSet;
        });
        toast.success(`Removed ${lawyer.name} from saved lawyers`);
      } else {
        const { error } = await supabase
          .from('saved_lawyers')
          .insert({
            user_id: user.id,
            lawyer_id: lawyer.id
          });

        if (error) throw error;
        
        setSavedLawyerIds(prev => new Set([...prev, lawyer.id]));
        toast.success(`${lawyer.name} added to saved lawyers`);
      }
    } catch (error) {
      console.error('Error saving lawyer:', error);
      toast.error("Failed to save lawyer");
    }
  };

  const handleConnect = async (lawyer: Lawyer, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsConnecting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to connect with lawyers");
        setIsConnecting(false);
        return;
      }

      // Get user profile for name and location
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name, city, state')
        .eq('id', user.id)
        .single();

      const userName = userProfile?.full_name || 'User';
      const userLocation = userProfile?.city && userProfile?.state 
        ? `${userProfile.city}, ${userProfile.state}` 
        : '';

      let caseDescription = `Consultation with ${lawyer.name} for ${selectedCaseType || 'General'} matter`;
      let aiAnalysis = null;

      // If we have NyayScan data, generate AI summary
      if (nyayScanData?.caseDescription) {
        toast.loading('Generating detailed case summary with AI...');
        
        try {
          const { data: summaryData, error: summaryError } = await supabase.functions.invoke('generate-case-summary', {
            body: {
              caseDescription: nyayScanData.caseDescription,
              caseType: selectedCaseType,
              analysis: nyayScanData.analysis,
              userName,
              userLocation
            }
          });

          if (summaryError) {
            console.error('Error generating summary:', summaryError);
          } else if (summaryData?.summary) {
            caseDescription = summaryData.summary;
            aiAnalysis = {
              ...nyayScanData.analysis,
              generatedSummary: summaryData.summary
            };
          }
        } catch (aiError) {
          console.error('AI summary generation failed:', aiError);
          // Continue with basic description if AI fails
        }
        
        toast.dismiss();
      }

      // Create a case for this connection
      const { data: newCase, error: caseError } = await supabase
        .from('cases')
        .insert({
          user_id: user.id,
          lawyer_id: lawyer.id,
          case_type: selectedCaseType || 'General Consultation',
          description: caseDescription,
          status: 'pending',
          ai_analysis: aiAnalysis
        })
        .select()
        .single();

      if (caseError) throw caseError;

      // Send the AI-generated case summary as the first message in the chat
      if (caseDescription && caseDescription.length > 50) {
        const messageContent = `📋 **Case Summary**\n\n${caseDescription}`;
        
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            content: messageContent,
            sender_id: user.id,
            receiver_id: lawyer.id,
            case_id: newCase.id,
            case_type: selectedCaseType || 'General Consultation',
            status: 'pending'
          });

        if (messageError) {
          console.error('Error sending case summary message:', messageError);
        }
      }

      // Send notification to lawyer if they're a real lawyer
      if (lawyer.isReal) {
        await supabase.from('notifications').insert({
          user_id: lawyer.id,
          title: 'New Case Request',
          message: `You have a new ${selectedCaseType || 'consultation'} case request from ${userName}${userLocation ? ` (${userLocation})` : ''}`,
          type: 'case_request',
          case_id: newCase.id
        });
      }

      toast.success(`Connected with ${lawyer.name}! Case summary sent to chat.`);
      
      if (onConnectLawyer && newCase) {
        onConnectLawyer(lawyer.id, selectedCaseType, newCase.id);
      }
    } catch (error) {
      console.error('Error connecting with lawyer:', error);
      toast.error("Failed to create case. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  if (step === "profile" && selectedLawyer) {
    const isSaved = savedLawyerIds.has(selectedLawyer.id);
    
    return (
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => setStep("results")}>
          ← Back to Results
        </Button>

        <Card className="shadow-card">
          <CardContent className="p-8">
            <div className="flex items-start gap-6 mb-6">
              <div className="relative">
                <img 
                  src={selectedLawyer.profileImage} 
                  alt={selectedLawyer.name}
                  className="w-24 h-24 rounded-2xl object-cover shadow-md"
                />
                {selectedLawyer.isReal && (
                  <div className="absolute -top-2 -right-2 bg-nyay-teal text-primary-foreground text-xs px-2 py-0.5 rounded-full font-medium">
                    Verified
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground">{selectedLawyer.name}</h2>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4" />
                  {selectedLawyer.city}, {selectedLawyer.state}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1 text-nyay-gold">
                    <Star className="w-4 h-4 fill-current" />
                    {selectedLawyer.rating}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {selectedLawyer.casesWon} cases won
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-1">
                  <BadgeCheck className="w-4 h-4 text-nyay-teal" />
                  Specialization
                </div>
                <p className="text-muted-foreground">{selectedLawyer.specialization}</p>
              </div>

              <div className="p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-1">
                  <Clock className="w-4 h-4 text-nyay-gold" />
                  Experience & Availability
                </div>
                <p className="text-muted-foreground">
                  {selectedLawyer.experience} years • {selectedLawyer.availability}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-1">
                  <Languages className="w-4 h-4 text-nyay-indigo" />
                  Languages
                </div>
                <p className="text-muted-foreground">{selectedLawyer.languages.join(", ")}</p>
              </div>

              <div className="p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-1">
                  <BadgeCheck className="w-4 h-4 text-accent" />
                  Bar Council ID
                </div>
                <p className="text-muted-foreground font-mono">{selectedLawyer.barCouncilId}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                size="lg"
                className={`flex-1 ${isSaved ? 'text-destructive border-destructive' : ''}`}
                onClick={() => handleSaveLawyer(selectedLawyer)}
              >
                <Heart className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                {isSaved ? 'Saved' : 'Save Lawyer'}
              </Button>
              <Button
                variant="gold"
                size="lg"
                className="flex-1"
                onClick={() => handleConnect(selectedLawyer)}
                disabled={isConnecting}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {isConnecting ? 'Connecting...' : 'Connect Now'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "results") {
    const realCount = lawyers.filter(l => l.isReal).length;
    
    return (
      <div>
        <Button variant="ghost" className="mb-4" onClick={() => setStep("select")}>
          ← Change Search
        </Button>

        <h2 className="text-2xl font-bold mb-2">
          {selectedCaseType} Lawyers
          {selectedCity && ` in ${selectedCity}`}
          {selectedState && !selectedCity && ` in ${selectedState}`}
        </h2>
        <p className="text-muted-foreground mb-6">
          {lawyers.length} lawyers found
          {realCount > 0 && <span className="text-nyay-teal ml-2">({realCount} verified)</span>}
        </p>

        {lawyers.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">No lawyers found matching your criteria.</p>
              <Button variant="outline" className="mt-4" onClick={() => setStep("select")}>
                Try Different Search
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lawyers.map((lawyer) => {
              const isSaved = savedLawyerIds.has(lawyer.id);
              
              return (
                <Card
                  key={lawyer.id}
                  className={`cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden ${lawyer.isReal ? 'ring-2 ring-nyay-teal/30' : ''}`}
                  onClick={() => {
                    setSelectedLawyer(lawyer);
                    setStep("profile");
                  }}
                >
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <img 
                            src={lawyer.profileImage} 
                            alt={lawyer.name}
                            className="w-14 h-14 rounded-xl object-cover shadow-sm"
                          />
                          {lawyer.isReal && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-nyay-teal rounded-full flex items-center justify-center">
                              <BadgeCheck className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{lawyer.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {lawyer.city}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-1 text-sm text-nyay-gold">
                              <Star className="w-3 h-3 fill-current" />
                              {lawyer.rating}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {lawyer.experience} yrs
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-3 mb-3 truncate">
                        {lawyer.specialization} • {lawyer.casesWon} cases won
                      </p>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`flex-1 ${isSaved ? 'text-destructive border-destructive' : ''}`}
                          onClick={(e) => handleSaveLawyer(lawyer, e)}
                        >
                          <Heart className={`w-3 h-3 mr-1 ${isSaved ? 'fill-current' : ''}`} />
                          {isSaved ? 'Saved' : 'Save'}
                        </Button>
                        <Button
                          variant="gold"
                          size="sm"
                          className="flex-1"
                          onClick={(e) => handleConnect(lawyer, e)}
                          disabled={isConnecting}
                        >
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Connect
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <Card className="shadow-card">
        <CardHeader>
          <div className="w-12 h-12 rounded-xl bg-nyay-gold/10 flex items-center justify-center mb-3">
            <MapPin className="w-6 h-6 text-nyay-gold" />
          </div>
          <CardTitle>Find Lawyers Near You</CardTitle>
          <p className="text-sm text-muted-foreground">
            {prefillCaseType 
              ? `Select your location to find ${prefillCaseType} lawyers nearby`
              : "Select your location and case type to find specialized lawyers"
            }
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {prefillCaseType && (
            <div className="p-3 rounded-xl bg-nyay-teal/10 border border-nyay-teal/20">
              <p className="text-sm text-nyay-teal font-medium">
                Case Type: {prefillCaseType} (detected by NyayScan)
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>State *</Label>
            <Select value={selectedState} onValueChange={(v) => { setSelectedState(v); setSelectedCity(""); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                {indianStates.map((state) => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>City</Label>
            <Select
              value={selectedCity}
              onValueChange={setSelectedCity}
              disabled={!selectedState}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedState ? "Select City (optional)" : "Select State first"} />
              </SelectTrigger>
              <SelectContent>
                {selectedState &&
                  citiesByState[selectedState]?.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {!prefillCaseType && (
            <div className="space-y-2">
              <Label>Type of Case *</Label>
              <Select value={selectedCaseType} onValueChange={setSelectedCaseType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Case Type" />
                </SelectTrigger>
                <SelectContent>
                  {caseTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button variant="gold" size="lg" className="w-full" onClick={handleSearch} disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Find Lawyers'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FindLawyers;
