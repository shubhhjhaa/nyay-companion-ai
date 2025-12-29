import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SplashScreen from "@/components/SplashScreen";
import LandingPage from "@/components/LandingPage";
import AuthModal from "@/components/AuthModal";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session on mount (not during active authentication)
    const checkExistingSession = async () => {
      if (isAuthenticating) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', session.user.id)
          .maybeSingle();
        
        const userType = profile?.user_type || "user";
        if (userType === "lawyer") {
          navigate("/lawyer-dashboard");
        } else {
          navigate("/user-dashboard");
        }
      }
    };

    checkExistingSession();
  }, [navigate, isAuthenticating]);

  const handleAuthSuccess = (userType: "user" | "lawyer") => {
    setIsAuthenticating(false);
    setShowAuthModal(false);
    if (userType === "lawyer") {
      navigate("/lawyer-dashboard");
    } else {
      navigate("/user-dashboard");
    }
  };

  const handleOpenAuthModal = () => {
    setIsAuthenticating(true);
    setShowAuthModal(true);
  };

  const handleCloseAuthModal = () => {
    setIsAuthenticating(false);
    setShowAuthModal(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <>
      <LandingPage onAccountClick={handleOpenAuthModal} />
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleCloseAuthModal}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default Index;
