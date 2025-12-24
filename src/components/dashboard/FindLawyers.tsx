import { useState } from "react";
import { MapPin, ChevronRight, Star, Phone, Clock, Languages, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { indianStates, citiesByState, caseTypes } from "@/data/caseTypes";
import { getLawyersFiltered, Lawyer } from "@/data/lawyers";

const FindLawyers = () => {
  const [step, setStep] = useState<"select" | "results" | "profile">(
    "select"
  );
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCaseType, setSelectedCaseType] = useState("");
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);

  const handleSearch = () => {
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
      // If no exact match, get lawyers by case type only
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

  const handleContact = (lawyer: Lawyer) => {
    toast.success(`Message sent to ${lawyer.name}. They will contact you soon!`);
  };

  if (step === "profile" && selectedLawyer) {
    return (
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => setStep("results")}>
          ← Back to Results
        </Button>

        <Card className="shadow-card">
          <CardContent className="p-8">
            <div className="flex items-start gap-6 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-hero flex items-center justify-center text-2xl font-bold text-primary-foreground">
                {selectedLawyer.name.split(" ").slice(-1)[0].charAt(0)}
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

            <Button
              variant="gold"
              size="lg"
              className="w-full mt-6"
              onClick={() => handleContact(selectedLawyer)}
            >
              <Phone className="w-4 h-4 mr-2" />
              Contact Lawyer
            </Button>
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
            {lawyers.map((lawyer) => (
              <Card
                key={lawyer.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
                onClick={() => {
                  setSelectedLawyer(lawyer);
                  setStep("profile");
                }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center text-lg font-bold text-primary-foreground shrink-0">
                      {lawyer.name.split(" ").slice(-1)[0].charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{lawyer.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {lawyer.city}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="flex items-center gap-1 text-sm text-nyay-gold">
                          <Star className="w-3 h-3 fill-current" />
                          {lawyer.rating}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {lawyer.experience} yrs exp
                        </span>
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
            Select your location and case type to find specialized lawyers
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>State</Label>
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
