import { useState, useEffect } from "react";
import { MapPin, ChevronRight, Star, Phone, Clock, Languages, BadgeCheck, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { indianStates, citiesByState, caseTypes } from "@/data/caseTypes";
import { getLawyersFiltered, Lawyer } from "@/data/lawyers";
import { supabase } from "@/integrations/supabase/client";

interface FindLawyersProps {
  prefillCaseType?: string;
  onClear?: () => void;
  onConnectLawyer?: (lawyerId: string, caseType: string) => void;
}

const FindLawyers = ({ prefillCaseType, onClear, onConnectLawyer }: FindLawyersProps) => {
  const [step, setStep] = useState<"select" | "results" | "profile">("select");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCaseType, setSelectedCaseType] = useState(prefillCaseType || "");
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [savedLawyerIds, setSavedLawyerIds] = useState<Set<string>>(new Set());

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

  const handleSearch = () => {
    if (!selectedState) {
      toast.error("Please select a state");
      return;
    }
    if (!selectedCaseType) {
      toast.error("Please select a case type");
      return;
    }

    const filtered = getLawyersFiltered(
      selectedCaseType,
      selectedState || undefined,
      selectedCity || undefined
    );

    if (filtered.length === 0) {
      const byType = getLawyersFiltered(selectedCaseType);
      setLawyers(byType);
      if (byType.length > 0) {
        toast.info(`Showing ${selectedCaseType} lawyers from all locations`);
      }
    } else {
      setLawyers(filtered);
    }
    setStep("results");
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
        // Unsave
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
        // Save
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

  const handleConnect = (lawyer: Lawyer, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (onConnectLawyer) {
      onConnectLawyer(lawyer.id, selectedCaseType);
    } else {
      toast.success(`Connection request sent to ${lawyer.name}!`);
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
              <img 
                src={selectedLawyer.profileImage} 
                alt={selectedLawyer.name}
                className="w-24 h-24 rounded-2xl object-cover shadow-md"
              />
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
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Connect Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "results") {
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
        <p className="text-muted-foreground mb-6">{lawyers.length} lawyers found</p>

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
                  className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden"
                  onClick={() => {
                    setSelectedLawyer(lawyer);
                    setStep("profile");
                  }}
                >
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        <img 
                          src={lawyer.profileImage} 
                          alt={lawyer.name}
                          className="w-14 h-14 rounded-xl object-cover shadow-sm"
                        />
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
                <SelectValue placeholder="Select State (optional)" />
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

          <Button variant="gold" size="lg" className="w-full" onClick={handleSearch}>
            Find Lawyers
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FindLawyers;
