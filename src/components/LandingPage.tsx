import { Scale, ShieldCheck, MessageSquareText, Mail, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingPageProps {
  onAccountClick: () => void;
}

const features = [
  {
    icon: MessageSquareText,
    title: "NyayScan",
    description: "AI-powered case analyzer that understands your legal situation and guides you step-by-step.",
    color: "text-nyay-teal",
    bgColor: "bg-nyay-teal/10",
  },
  {
    icon: Users,
    title: "Find Lawyers",
    description: "Connect with verified lawyers specialized in your case type, location, and budget.",
    color: "text-nyay-gold",
    bgColor: "bg-nyay-gold/10",
  },
  {
    icon: Mail,
    title: "NyayMail",
    description: "Generate professional legal emails and complaints with AI assistance.",
    color: "text-nyay-indigo",
    bgColor: "bg-nyay-indigo/10",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Guidance",
    description: "Get reliable legal information tailored to Indian laws and procedures.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
];

const LandingPage = ({ onAccountClick }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-nyay-gold/5 to-transparent" />
        
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <header className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-hero">
                <Scale className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Nyay<span className="text-nyay-gold">Buddy</span>
              </span>
            </div>
            <Button variant="gold" onClick={onAccountClick}>
              Account
            </Button>
          </header>

          {/* Hero Content */}
          <div className="max-w-4xl mx-auto text-center py-16 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-nyay-gold/10 text-nyay-gold text-sm font-medium mb-6">
              <ShieldCheck className="w-4 h-4" />
              <span>AI-Powered Legal Assistance for India</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
              Don't Know Your{" "}
              <span className="text-gradient-hero">Legal Rights?</span>
              <br />
              We'll Guide You.
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              NyayBuddy helps you understand legal procedures, analyze your case with AI, 
              and connect you with the right lawyers — all in simple language.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="xl" onClick={onAccountClick}>
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="xl" onClick={onAccountClick}>
                I'm a Lawyer
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need for Legal Help
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From understanding your case to finding the right lawyer, NyayBuddy has you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-card shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "1", title: "Describe Your Issue", desc: "Tell us about your legal problem in your own words." },
                { step: "2", title: "Get AI Analysis", desc: "Our AI analyzes your case and suggests next steps." },
                { step: "3", title: "Connect & Resolve", desc: "Find lawyers or file complaints with guided assistance." },
              ].map((item, index) => (
                <div key={item.step} className="text-center animate-slide-up" style={{ animationDelay: `${index * 0.15}s` }}>
                  <div className="w-16 h-16 rounded-full bg-gradient-hero text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Take the First Legal Step?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of Indians who've found legal clarity with NyayBuddy.
          </p>
          <Button variant="gold" size="xl" onClick={onAccountClick}>
            Start Now — It's Free
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              <span className="font-semibold">NyayBuddy</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              NyayBuddy provides AI-assisted legal guidance and lawyer discovery. 
              It does not replace professional legal consultation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
