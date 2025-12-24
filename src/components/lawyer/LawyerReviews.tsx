import { useState, useEffect } from "react";
import { Star, MessageSquare, User, Calendar, ThumbsUp, ThumbsDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  feedback: string | null;
  created_at: string;
  user_id: string;
  user_name?: string;
  case_type?: string;
}

const LawyerReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    average: 0,
    total: 0,
    fiveStars: 0,
    fourStars: 0,
    threeStars: 0,
    twoStars: 0,
    oneStar: 0
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('lawyer_reviews')
        .select('*')
        .eq('lawyer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrich with user names
      const enriched = await Promise.all((data || []).map(async (review) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', review.user_id)
          .maybeSingle();

        // Get case type if case_id exists
        let caseType = '';
        if (review.case_id) {
          const { data: caseData } = await supabase
            .from('cases')
            .select('case_type')
            .eq('id', review.case_id)
            .maybeSingle();
          caseType = caseData?.case_type || '';
        }

        return {
          ...review,
          user_name: profile?.full_name || 'Anonymous',
          case_type: caseType
        };
      }));

      setReviews(enriched);

      // Calculate stats
      const total = enriched.length;
      const average = total > 0 
        ? enriched.reduce((acc, r) => acc + r.rating, 0) / total 
        : 0;

      setStats({
        average: Math.round(average * 10) / 10,
        total,
        fiveStars: enriched.filter(r => r.rating === 5).length,
        fourStars: enriched.filter(r => r.rating === 4).length,
        threeStars: enriched.filter(r => r.rating === 3).length,
        twoStars: enriched.filter(r => r.rating === 2).length,
        oneStar: enriched.filter(r => r.rating === 1).length
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'text-nyay-gold fill-nyay-gold' 
                : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-48 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-nyay-gold/10 flex items-center justify-center">
          <Star className="w-6 h-6 text-nyay-gold" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Feedback & Ratings</h2>
          <p className="text-muted-foreground text-sm">See what clients say about your services</p>
        </div>
      </div>

      {/* Stats Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-5xl font-bold text-foreground">{stats.average}</p>
              <div className="flex items-center justify-center gap-1 my-2">
                {renderStars(Math.round(stats.average))}
              </div>
              <p className="text-sm text-muted-foreground">{stats.total} reviews</p>
            </div>
            
            <div className="flex-1 space-y-2">
              {[
                { stars: 5, count: stats.fiveStars },
                { stars: 4, count: stats.fourStars },
                { stars: 3, count: stats.threeStars },
                { stars: 2, count: stats.twoStars },
                { stars: 1, count: stats.oneStar },
              ].map(({ stars, count }) => (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-sm w-6">{stars}★</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-nyay-gold rounded-full transition-all"
                      style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
            <p className="text-muted-foreground text-sm">
              Client reviews will appear here after you close cases.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0">
                    {review.user_name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-foreground">{review.user_name}</p>
                      <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.rating)}
                      {review.case_type && (
                        <span className="text-xs text-muted-foreground">• {review.case_type}</span>
                      )}
                    </div>
                    {review.feedback && (
                      <p className="text-sm text-muted-foreground">{review.feedback}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Feedback is read-only and provided by clients after case closure.
      </p>
    </div>
  );
};

export default LawyerReviews;
