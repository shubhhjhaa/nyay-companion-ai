import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SplashScreen from "@/components/SplashScreen";
import LandingPage from "@/components/LandingPage";
import AuthModal from "@/components/AuthModal";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        // Check user type from metadata
        const userType = session.user.user_metadata?.user_type || "user";
        if (userType === "lawyer") {
          navigate("/lawyer-dashboard");
        } else {
          navigate("/user-dashboard");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuthSuccess = (userType: "user" | "lawyer") => {
    setShowAuthModal(false);
    if (userType === "lawyer") {
      navigate("/lawyer-dashboard");
    } else {
      navigate("/user-dashboard");
    }
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <>
      <LandingPage onAccountClick={() => setShowAuthModal(true)} />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default Index;
