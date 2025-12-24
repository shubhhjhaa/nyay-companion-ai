import { useState, useEffect } from "react";
import { Heart, MapPin, Star, Phone, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getLawyerById, Lawyer } from "@/data/lawyers";

interface SavedLawyerRecord {
  id: string;
  lawyer_id: string;
  created_at: string;
}

interface SavedLawyersProps {
  onContactLawyer?: (lawyerId: string) => void;
}

const SavedLawyers = ({ onContactLawyer }: SavedLawyersProps) => {
  const [savedLawyers, setSavedLawyers] = useState<(SavedLawyerRecord & { lawyer?: Lawyer })[]>([]);
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

      // Enrich with lawyer data from dummy data
      const enriched = (data || []).map(record => ({
        ...record,
        lawyer: getLawyerById(record.lawyer_id)
      }));

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
            <Card key={record.id} className="hover:shadow-lg transition-all">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center text-lg font-bold text-primary-foreground shrink-0">
                      {record.lawyer?.name?.split(" ").slice(-1)[0].charAt(0) || '?'}
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
                          toast.success(`Contact request sent to ${record.lawyer.name}`);
                        }
                      }}
                    >
                      <Phone className="w-4 h-4 mr-1" />
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