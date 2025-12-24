import { useState, useEffect } from "react";
import { User, Briefcase, Languages, Clock, MapPin, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LawyerProfile {
  id: string;
  full_name: string | null;
  practice_area: string | null;
  experience: number | null;
  city: string | null;
  state: string | null;
  mobile: string | null;
  bar_council_id: string | null;
}

const LawyerProfileSettings = () => {
  const [profile, setProfile] = useState<LawyerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [availability, setAvailability] = useState<'available' | 'busy' | 'offline'>('available');
  const [languages, setLanguages] = useState<string[]>([]);
  const [newLanguage, setNewLanguage] = useState("");
  const [workingHours, setWorkingHours] = useState({
    start: "09:00",
    end: "18:00",
    days: "Mon-Fri"
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          practice_area: profile.practice_area,
          experience: profile.experience,
          city: profile.city,
          state: profile.state,
          mobile: profile.mobile,
          bar_council_id: profile.bar_council_id
        })
        .eq('id', profile.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const addLanguage = () => {
    if (newLanguage && !languages.includes(newLanguage)) {
      setLanguages([...languages, newLanguage]);
      setNewLanguage("");
    }
  };

  const removeLanguage = (lang: string) => {
    setLanguages(languages.filter(l => l !== lang));
  };

  const practiceAreas = [
    "Consumer Court", "Family Law", "Criminal Law", "Property Disputes",
    "Labour Law", "Cyber Crime", "Corporate Law", "Civil Law", "Tax Law"
  ];

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-nyay-indigo/10 flex items-center justify-center">
          <User className="w-6 h-6 text-nyay-indigo" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Profile Settings</h2>
          <p className="text-muted-foreground text-sm">Manage your professional profile</p>
        </div>
      </div>

      {/* Availability Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-nyay-gold" />
            Availability Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {(['available', 'busy', 'offline'] as const).map((status) => (
              <Button
                key={status}
                variant={availability === status ? 'gold' : 'outline'}
                onClick={() => setAvailability(status)}
                className="flex-1"
              >
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  status === 'available' ? 'bg-green-500' :
                  status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                }`} />
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Your availability helps users know when to expect a response.
          </p>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={profile?.full_name || ''}
                onChange={(e) => setProfile(prev => prev ? {...prev, full_name: e.target.value} : null)}
                placeholder="Adv. Full Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Bar Council ID</Label>
              <Input
                value={profile?.bar_council_id || ''}
                onChange={(e) => setProfile(prev => prev ? {...prev, bar_council_id: e.target.value} : null)}
                placeholder="XX/1234/2020"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={profile?.city || ''}
                onChange={(e) => setProfile(prev => prev ? {...prev, city: e.target.value} : null)}
                placeholder="City"
              />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input
                value={profile?.state || ''}
                onChange={(e) => setProfile(prev => prev ? {...prev, state: e.target.value} : null)}
                placeholder="State"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mobile Number</Label>
            <Input
              value={profile?.mobile || ''}
              onChange={(e) => setProfile(prev => prev ? {...prev, mobile: e.target.value} : null)}
              placeholder="+91 XXXXX XXXXX"
            />
          </div>
        </CardContent>
      </Card>

      {/* Professional Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-nyay-teal" />
            Professional Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Practice Area</Label>
            <Select 
              value={profile?.practice_area || ''} 
              onValueChange={(v) => setProfile(prev => prev ? {...prev, practice_area: v} : null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your primary practice area" />
              </SelectTrigger>
              <SelectContent>
                {practiceAreas.map((area) => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Years of Experience</Label>
            <Input
              type="number"
              value={profile?.experience || ''}
              onChange={(e) => setProfile(prev => prev ? {...prev, experience: parseInt(e.target.value) || 0} : null)}
              placeholder="10"
              min={0}
              max={50}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Languages className="w-4 h-4" />
              Languages Spoken
            </Label>
            <div className="flex gap-2">
              <Input
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                placeholder="Add language"
                onKeyDown={(e) => e.key === 'Enter' && addLanguage()}
              />
              <Button variant="outline" onClick={addLanguage}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {languages.map((lang) => (
                <Badge 
                  key={lang} 
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeLanguage(lang)}
                >
                  {lang} ×
                </Badge>
              ))}
              {languages.length === 0 && (
                <p className="text-sm text-muted-foreground">No languages added yet</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-nyay-gold" />
            Working Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={workingHours.start}
                onChange={(e) => setWorkingHours({...workingHours, start: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="time"
                value={workingHours.end}
                onChange={(e) => setWorkingHours({...workingHours, end: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Working Days</Label>
              <Select value={workingHours.days} onValueChange={(v) => setWorkingHours({...workingHours, days: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mon-Fri">Mon-Fri</SelectItem>
                  <SelectItem value="Mon-Sat">Mon-Sat</SelectItem>
                  <SelectItem value="All Days">All Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button 
        variant="gold" 
        size="lg" 
        className="w-full"
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <>Saving...</>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Save Profile
          </>
        )}
      </Button>
    </div>
  );
};

export default LawyerProfileSettings;
