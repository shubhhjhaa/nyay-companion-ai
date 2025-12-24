import { useState, useEffect } from "react";
import { Star, Send, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getLawyerById, Lawyer } from "@/data/lawyers";

interface LawyerFeedbackProps {
  lawyerId: string;
  caseId?: string;
  lawyerName?: string;
  onComplete?: () => void;
}

const LawyerFeedback = ({ lawyerId, caseId, lawyerName, onComplete }: LawyerFeedbackProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);

  useEffect(() => {
    const lawyerData = getLawyerById(lawyerId);
    setLawyer(lawyerData || null);
  }, [lawyerId]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('lawyer_reviews')
        .insert({
          user_id: user.id,
          lawyer_id: lawyerId,
          case_id: caseId || null,
          rating,
          feedback: feedback.trim() || null
        });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("Thank you for your feedback!");
      setTimeout(() => onComplete?.(), 2000);
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      if (error.code === '23505') {
        toast.error("You've already reviewed this case");
      } else {
        toast.error("Failed to submit feedback");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-md mx-auto shadow-card">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Feedback Submitted!</h3>
          <p className="text-muted-foreground">
            Your review helps other users find great lawyers.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto shadow-card">
      <CardHeader>
        <CardTitle className="text-lg">Rate Your Experience</CardTitle>
        <p className="text-sm text-muted-foreground">
          How was your experience with {lawyerName || lawyer?.name || 'this lawyer'}?
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Star Rating */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`w-10 h-10 ${
                  star <= (hoverRating || rating)
                    ? 'text-nyay-gold fill-nyay-gold'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
        </div>

        <div className="text-center">
          <span className="text-sm text-muted-foreground">
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Very Good"}
            {rating === 5 && "Excellent"}
          </span>
        </div>

        {/* Feedback Text */}
        <div className="space-y-2">
          <Textarea
            placeholder="Share your experience (optional)..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
          />
        </div>

        <Button
          variant="gold"
          size="lg"
          className="w-full"
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Feedback
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Your feedback helps future users choose better lawyers.
        </p>
      </CardContent>
    </Card>
  );
};

export default LawyerFeedback;