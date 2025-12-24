import { useEffect, useState } from "react";
import { Scale } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(onComplete, 500);
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-hero transition-opacity duration-500 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex flex-col items-center gap-6 animate-scale-in">
        {/* Logo */}
        <div className="relative">
          <div className="absolute inset-0 bg-nyay-gold/30 blur-3xl rounded-full animate-pulse-glow" />
          <div className="relative flex items-center justify-center w-28 h-28 rounded-2xl bg-card/10 backdrop-blur-sm border border-primary-foreground/20 shadow-2xl">
            <Scale className="w-14 h-14 text-nyay-gold" strokeWidth={1.5} />
          </div>
        </div>

        {/* App Name */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-primary-foreground tracking-tight">
            Nyay<span className="text-nyay-gold">Buddy</span>
          </h1>
          <p className="mt-3 text-primary-foreground/80 text-lg font-medium">
            Your Legal Companion
          </p>
        </div>

        {/* Loading indicator */}
        <div className="mt-8 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-nyay-gold animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-8 text-primary-foreground/50 text-sm font-medium">
        Powered by AI • Made for India
      </div>
    </div>
  );
};

export default SplashScreen;
