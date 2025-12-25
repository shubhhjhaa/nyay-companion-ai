import { useState, useEffect } from "react";
import { Scale, ArrowRight, Lightbulb, Route, CheckCircle2, Brain, FileText, Bell, MessageCircle, Compass, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LandingPageProps {
  onAccountClick: () => void;
}

const features = [
  {
    icon: Brain,
    title: "AI Case Understanding",
    description: "Identify what kind of legal issue you're facing with clear explanations.",
  },
  {
    icon: Route,
    title: "Step-by-Step Guidance",
    description: "See the logical path forward based on your specific situation.",
  },
  {
    icon: FileText,
    title: "Complaint & Notice Drafting",
    description: "Create formal documents when you decide to take action.",
  },
  {
    icon: Bell,
    title: "Smart Escalation Suggestions",
    description: "Know when and how to escalate, if needed.",
  },
  {
    icon: MessageCircle,
    title: "Built-in AI Assistant (Snehh)",
    description: "Ask questions anytime and get thoughtful answers.",
  },
];

const LandingPage = ({ onAccountClick }: LandingPageProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-nyay-indigo to-nyay-indigo-light">
                <Scale className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-lg font-semibold text-foreground tracking-tight">
                Nyay<span className="text-nyay-gold">Buddy</span>
              </span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onAccountClick}
              className="text-sm"
            >
              Sign In
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="container mx-auto px-4">
          <div 
            className={`max-w-3xl mx-auto text-center transition-all duration-700 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground leading-tight tracking-tight mb-6">
              Understand your legal situation{" "}
              <span className="text-nyay-indigo">before taking the next step</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
              NyayBuddy helps you make sense of legal issues, explains your options, and guides you with clarity.
            </p>

            <div className="flex flex-col items-center gap-4">
              <Button 
                variant="hero" 
                size="xl" 
                onClick={onAccountClick}
                className="group px-8"
              >
                <span>Understand My Issue</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Clear guidance. No pressure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground text-center mb-4">
              How it works
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
              A simple process to help you understand and decide
            </p>

            <div className="grid md:grid-cols-3 gap-8 md:gap-6">
              {[
                {
                  step: "1",
                  title: "Understand",
                  description: "Describe what happened. NyayBuddy helps identify what kind of issue this is.",
                  icon: Lightbulb,
                  color: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
                },
                {
                  step: "2",
                  title: "Decide",
                  description: "See the possible paths — complaints, notices, portals, or next steps.",
                  icon: Route,
                  color: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400",
                },
                {
                  step: "3",
                  title: "Act (If Needed)",
                  description: "Move forward with the option that fits your situation.",
                  icon: CheckCircle2,
                  color: "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400",
                },
              ].map((item, index) => (
                <div 
                  key={item.step}
                  className={`relative transition-all duration-500 ease-out ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <Card className="h-full bg-card border border-border/60 hover:border-border hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Step {item.step}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                  
                  {/* Connector Arrow */}
                  {index < 2 && (
                    <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <ChevronRight className="w-6 h-6 text-border" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Self-Awareness Message */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div 
            className={`max-w-2xl mx-auto text-center transition-all duration-700 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-nyay-indigo/10 mb-4">
              <Compass className="w-6 h-6 text-nyay-indigo" />
            </div>
            <p className="text-lg text-foreground/80 leading-relaxed">
              "Many legal issues can be handled without rushing into formal action."
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground text-center mb-4">
              Tools for self-guidance
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
              Simple features designed to help you understand and navigate
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`group p-5 rounded-xl bg-card border border-border/60 hover:border-border hover:shadow-sm transition-all duration-300 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-nyay-indigo/10 flex items-center justify-center shrink-0 group-hover:bg-nyay-indigo/15 transition-colors">
                      <feature.icon className="w-5 h-5 text-nyay-indigo" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
              Ready to understand your situation?
            </h2>
            <p className="text-muted-foreground mb-8">
              Start with a clear picture of where you stand.
            </p>
            <Button 
              variant="hero" 
              size="xl" 
              onClick={onAccountClick}
              className="group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Professional Support - Subtle */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-muted mb-4">
              <Shield className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              When additional support is required
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              Some situations may need professional assistance. NyayBuddy helps users reach the right support at the right time.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-nyay-indigo to-nyay-indigo-light">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-foreground">
                Nyay<span className="text-nyay-gold">Buddy</span>
              </span>
            </div>
            
            <p className="text-xs text-muted-foreground text-center max-w-md">
              NyayBuddy provides AI-assisted legal guidance. It does not replace professional legal consultation when required.
            </p>
            
            <p className="text-xs text-muted-foreground">
              © 2025 NyayBuddy
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;