import { useState, useEffect } from "react";
import { Heart, MapPin, Star, Trash2, BadgeCheck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getLawyerById, Lawyer as DummyLawyer } from "@/data/lawyers";

interface LawyerData {
  id: string;
  name: string;
  city: string;
  state: string;
  specialization: string;
  rating: number;
  experience: number;
  profileImage: string;
  isReal: boolean;
}

interface SavedLawyerRecord {
  id: string;
  lawyer_id: string;
  created_at: string;
}

interface SavedLawyersProps {
  onContactLawyer?: (lawyerId: string) => void;
}

const getAvatarUrl = (name: string) => {
  const bgColors = ['0D9488', '6366F1', 'D97706', 'DC2626', '7C3AED', '059669'];
  const randomColor = bgColors[Math.abs(name.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % bgColors.length];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${randomColor}&color=fff&size=200&bold=true`;
};

const SavedLawyers = ({ onContactLawyer }: SavedLawyersProps) => {
  const [savedLawyers, setSavedLawyers] = useState<(SavedLawyerRecord & { lawyer?: LawyerData })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSavedLawyers();
  }, []);

  const fetchSavedLawyers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_lawyers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrich with lawyer data
      const enrichedPromises = (data || []).map(async (record) => {
        // First check if it's a real lawyer (UUID format)
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(record.lawyer_id);
        
        if (isUuid) {
          // Try to fetch from profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', record.lawyer_id)
            .eq('user_type', 'lawyer')
            .maybeSingle();

          if (profile) {
            return {
              ...record,
              lawyer: {
                id: profile.id,
                name: profile.full_name ? `Adv. ${profile.full_name}` : 'Unknown Lawyer',
                city: profile.city || 'Not specified',
                state: profile.state || 'Not specified',
                specialization: profile.practice_area || 'General Practice',
                rating: 4.5,
                experience: profile.experience || 0,
                profileImage: getAvatarUrl(profile.full_name || 'Lawyer'),
                isReal: true
              }
            };
          }
        }
        
        // Fall back to dummy data
        const dummyLawyer = getLawyerById(record.lawyer_id);
        if (dummyLawyer) {
          return {
            ...record,
            lawyer: {
              id: dummyLawyer.id,
              name: dummyLawyer.name,
              city: dummyLawyer.city,
              state: dummyLawyer.state,
              specialization: dummyLawyer.specialization,
              rating: dummyLawyer.rating,
              experience: dummyLawyer.experience,
              profileImage: dummyLawyer.profileImage,
              isReal: false
            }
          };
        }

        return { ...record, lawyer: undefined };
      });

      const enriched = await Promise.all(enrichedPromises);
      setSavedLawyers(enriched);
    } catch (error) {
      console.error('Error fetching saved lawyers:', error);
      toast.error('Failed to load saved lawyers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_lawyers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSavedLawyers(prev => prev.filter(l => l.id !== id));
      toast.success('Lawyer removed from saved list');
    } catch (error) {
      console.error('Error removing lawyer:', error);
      toast.error('Failed to remove lawyer');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/3 mx-auto"></div>
              <div className="h-24 bg-muted rounded"></div>
              <div className="h-24 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
          <Heart className="w-6 h-6 text-destructive" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Saved Lawyers</h2>
          <p className="text-muted-foreground text-sm">Your favorite lawyers for quick access</p>
        </div>
      </div>

      {savedLawyers.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Saved Lawyers</h3>
            <p className="text-muted-foreground text-sm">
              Save lawyers while browsing to access them quickly later.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {savedLawyers.map((record) => (
            <Card key={record.id} className={`hover:shadow-lg transition-all ${record.lawyer?.isReal ? 'ring-2 ring-nyay-teal/30' : ''}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="relative">
                      {record.lawyer?.profileImage ? (
                        <img 
                          src={record.lawyer.profileImage} 
                          alt={record.lawyer.name}
                          className="w-14 h-14 rounded-xl object-cover shadow-sm"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-hero flex items-center justify-center text-lg font-bold text-primary-foreground shrink-0">
                          ?
                        </div>
                      )}
                      {record.lawyer?.isReal && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-nyay-teal rounded-full flex items-center justify-center">
                          <BadgeCheck className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{record.lawyer?.name || 'Unknown Lawyer'}</h3>
                      {record.lawyer && (
                        <>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {record.lawyer.city}, {record.lawyer.state}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center gap-1 text-sm text-nyay-gold">
                              <Star className="w-3 h-3 fill-current" />
                              {record.lawyer.rating}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {record.lawyer.specialization}
                            </span>
                            {record.lawyer.isReal && (
                              <span className="text-xs bg-nyay-teal/10 text-nyay-teal px-2 py-0.5 rounded-full">
                                Verified
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemove(record.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => {
                        if (record.lawyer) {
                          onContactLawyer?.(record.lawyer_id);
                          toast.success(`Starting chat with ${record.lawyer.name}`);
                        }
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Contact
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedLawyers;
