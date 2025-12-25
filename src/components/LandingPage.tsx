import { Scale, ShieldCheck, MessageSquareText, Mail, Users, ArrowRight, Gavel, BookOpen, FileCheck, Award, CheckCircle, Star, Phone, Clock, Building2, AlertCircle, MapPin, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import snehhImage from "@/assets/snehh-chatbot.png";

interface LandingPageProps {
  onAccountClick: () => void;
}

const features = [
  {
    icon: MessageSquareText,
    title: "NyayScan",
    description: "AI-powered case analyzer that understands your legal situation and provides step-by-step guidance.",
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
    description: "Generate professional legal emails and formal complaints with AI assistance.",
    color: "text-nyay-indigo",
    bgColor: "bg-nyay-indigo/10",
  },
  {
    icon: FileCheck,
    title: "NyayNotice",
    description: "Draft and send legal notices for consumer disputes, property matters, and more.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
];

const stats = [
  { number: "10,000+", label: "Cases Analyzed" },
  { number: "500+", label: "Verified Lawyers" },
  { number: "98%", label: "User Satisfaction" },
  { number: "24/7", label: "AI Assistance" },
];

const testimonials = [
  {
    name: "Rajesh Kumar",
    location: "Delhi",
    text: "NyayBuddy helped me understand my property dispute and connected me with the right lawyer. The AI analysis was spot on!",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    location: "Mumbai",
    text: "I was confused about consumer rights. NyayBuddy's guidance helped me file a successful complaint and get my refund.",
    rating: 5,
  },
  {
    name: "Amit Patel",
    location: "Ahmedabad",
    text: "As a first-time legal user, the simple language and step-by-step process made everything less intimidating.",
    rating: 5,
  },
];

const LandingPage = ({ onAccountClick }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col">
        {/* Background - Warm Indian Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-nyay-cream via-background to-nyay-sandalwood/20" />
          
          {/* Rangoli-inspired corner pattern - Top Left */}
          <svg className="absolute top-0 left-0 w-64 h-64 text-nyay-gold/10" viewBox="0 0 200 200" fill="none">
            <circle cx="0" cy="0" r="150" stroke="currentColor" strokeWidth="1" />
            <circle cx="0" cy="0" r="120" stroke="currentColor" strokeWidth="1" />
            <circle cx="0" cy="0" r="90" stroke="currentColor" strokeWidth="1" />
            <path d="M0 0 L100 50 L50 100 Z" fill="currentColor" opacity="0.3" />
            <path d="M0 60 Q30 30 60 0" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M0 90 Q45 45 90 0" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
          
          {/* Rangoli-inspired corner pattern - Bottom Right */}
          <svg className="absolute bottom-0 right-0 w-64 h-64 text-nyay-terracotta/10 rotate-180" viewBox="0 0 200 200" fill="none">
            <circle cx="0" cy="0" r="150" stroke="currentColor" strokeWidth="1" />
            <circle cx="0" cy="0" r="120" stroke="currentColor" strokeWidth="1" />
            <circle cx="0" cy="0" r="90" stroke="currentColor" strokeWidth="1" />
            <path d="M0 0 L100 50 L50 100 Z" fill="currentColor" opacity="0.3" />
            <path d="M0 60 Q30 30 60 0" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
          
          {/* Warm decorative glow elements */}
          <div className="absolute top-20 right-20 w-80 h-80 bg-nyay-gold/8 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-nyay-terracotta/5 rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <header className="relative z-10 container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-nyay-indigo to-nyay-indigo-light shadow-lg">
                  <Scale className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold text-foreground tracking-tight">
                  Nyay<span className="text-nyay-gold">Buddy</span>
                </span>
                <p className="text-[10px] text-muted-foreground tracking-wider uppercase">Your Legal Companion</p>
              </div>
            </div>
            
            <Button variant="gold" onClick={onAccountClick} className="shadow-md">
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </nav>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 container mx-auto px-4 flex items-center">
          <div className="grid lg:grid-cols-2 gap-16 items-center w-full py-12">
            {/* Left Content */}
            <div className="animate-slide-up">
              {/* Warm badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-nyay-gold/15 border border-nyay-gold/30 text-nyay-terracotta text-sm font-medium mb-6">
                <Scale className="w-4 h-4" />
                <span>Trusted by 10,000+ Indians</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-6">
                Your Legal Rights,{" "}
                <span className="text-nyay-gold">Simplified</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl">
                Don't let legal confusion hold you back. NyayBuddy understands your problem, 
                explains your rights in simple Hindi or English, and connects you with verified advocates.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Button variant="hero" size="xl" onClick={onAccountClick} className="group shadow-lg">
                  <Scale className="w-5 h-5 mr-2" />
                  <span>Analyze My Case Free</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" size="lg" onClick={onAccountClick} className="border-2">
                  <Users className="w-4 h-4 mr-2" />
                  Find an Advocate
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-accent" />
                  <span>100% Confidential</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-nyay-gold" />
                  <span>Bar Council Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-nyay-terracotta" />
                  <span>24/7 AI Support</span>
                </div>
              </div>
            </div>

            {/* Right Content - Case Analysis Preview */}
            <div className="relative animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="relative">
                {/* Main Card */}
                <Card className="bg-card border border-border shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-nyay-indigo to-nyay-indigo-light px-6 py-4">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-nyay-gold" />
                      <span className="text-primary-foreground font-semibold">AI Case Analysis</span>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    {/* Sample Issue */}
                    <div className="mb-5 pb-4 border-b border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Your Issue</p>
                      <p className="text-foreground">"My landlord is not returning my security deposit..."</p>
                    </div>

                    {/* Analysis Results */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/10 border border-accent/20">
                        <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Strong Case Identified</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Consumer Protection Act applies</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-nyay-gold/10 border border-nyay-gold/20">
                        <Building2 className="w-5 h-5 text-nyay-gold shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Relevant Authority</p>
                          <p className="text-xs text-muted-foreground mt-0.5">District Consumer Forum</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-nyay-terracotta/10 border border-nyay-terracotta/20">
                        <Gavel className="w-5 h-5 text-nyay-terracotta shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Recommended Action</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Send a legal notice first</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Floating badges */}
                <div className="absolute -top-3 -right-3 bg-nyay-gold text-foreground shadow-lg rounded-xl px-4 py-2 animate-pulse-glow">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-current" />
                    <div>
                      <p className="text-xs font-bold">4.9/5 Rating</p>
                      <p className="text-[10px] opacity-80">2000+ Reviews</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-3 -left-3 bg-card shadow-lg rounded-xl px-4 py-2 border border-border">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    <div>
                      <p className="text-xs font-bold text-foreground">100% Free</p>
                      <p className="text-[10px] text-muted-foreground">No Hidden Charges</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="relative z-10 border-t border-border bg-card/60 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-nyay-indigo">{stat.number}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-subtle relative overflow-hidden">
        {/* Decorative border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-nyay-gold/30 to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-nyay-gold/15 text-nyay-terracotta text-sm font-medium mb-4">
              <Gavel className="w-4 h-4" />
              <span>Comprehensive Legal Tools</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Everything You Need for{" "}
              <span className="text-nyay-gold">Legal Help</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From understanding your case to drafting legal notices, NyayBuddy has all the tools to fight for your rights.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="group bg-card hover:bg-card/80 border border-border hover:border-nyay-gold/30 shadow-card hover:shadow-xl transition-all duration-500 hover:-translate-y-2 animate-slide-up overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 relative">
                  <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  
                  <div className="mt-4 flex items-center text-sm font-medium text-nyay-indigo opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-nyay-gold/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg">Simple steps to get legal clarity</p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connection Line */}
              <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-1 bg-gradient-to-r from-nyay-indigo via-nyay-gold to-accent rounded-full" />
              
              {[
                { step: "1", title: "Describe Your Problem", desc: "Tell us about your legal issue in simple words — Hindi or English, we understand both.", icon: MessageSquareText, color: "from-nyay-indigo to-nyay-indigo-light" },
                { step: "2", title: "AI Analyzes Your Case", desc: "Our legal AI reviews your situation against Indian laws and suggests the best course of action.", icon: BookOpen, color: "from-nyay-gold to-nyay-gold-light" },
                { step: "3", title: "Take Action", desc: "Send legal notices, connect with advocates, or file complaints — all with guided assistance.", icon: Gavel, color: "from-accent to-nyay-teal-light" },
              ].map((item, index) => (
                <div key={item.step} className="relative text-center animate-slide-up" style={{ animationDelay: `${index * 0.15}s` }}>
                  <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${item.color} text-primary-foreground flex items-center justify-center mx-auto mb-6 shadow-xl relative z-10`}>
                    <item.icon className="w-10 h-10" />
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-card border-4 border-background flex items-center justify-center font-bold text-sm text-foreground shadow-md z-20">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-muted-foreground text-lg">Real stories from real people across India</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card border border-border hover:border-nyay-gold/30 transition-colors animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-nyay-gold text-nyay-gold" />
                    ))}
                  </div>
                  <p className="text-foreground mb-6 leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-nyay-indigo to-nyay-gold flex items-center justify-center text-primary-foreground font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {testimonial.location}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Snehh Section */}
      <section className="py-24 bg-gradient-to-br from-nyay-teal/5 via-background to-nyay-gold/5 relative overflow-hidden">
        {/* Decorative rangoli corners */}
        <svg className="absolute top-0 left-0 w-40 h-40 text-nyay-gold/8" viewBox="0 0 100 100" fill="none">
          <path d="M0 0 Q50 20 20 50 Q-10 80 0 100" stroke="currentColor" strokeWidth="0.5" />
          <path d="M0 0 Q30 30 0 60" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="10" cy="10" r="3" fill="currentColor" />
          <circle cx="5" cy="25" r="2" fill="currentColor" />
          <circle cx="25" cy="5" r="2" fill="currentColor" />
        </svg>
        <svg className="absolute bottom-0 right-0 w-40 h-40 text-accent/8 rotate-180" viewBox="0 0 100 100" fill="none">
          <path d="M0 0 Q50 20 20 50 Q-10 80 0 100" stroke="currentColor" strokeWidth="0.5" />
          <path d="M0 0 Q30 30 0 60" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="10" cy="10" r="3" fill="currentColor" />
          <circle cx="5" cy="25" r="2" fill="currentColor" />
          <circle cx="25" cy="5" r="2" fill="currentColor" />
        </svg>
        
        <div className="absolute top-20 right-20 w-64 h-64 bg-nyay-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-nyay-teal/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            
            {/* Image */}
            <div className="relative animate-fade-in order-2 md:order-1">
              <div className="relative w-72 h-72 md:w-96 md:h-96 mx-auto">
                {/* Decorative rings */}
                <div className="absolute inset-0 rounded-full border-2 border-nyay-gold/20 animate-pulse" />
                <div className="absolute inset-4 rounded-full border border-nyay-teal/30" />
                
                {/* Image container */}
                <div className="absolute inset-8 rounded-full overflow-hidden shadow-2xl ring-4 ring-nyay-gold/30">
                  <img 
                    src={snehhImage} 
                    alt="Snehh - Your AI Legal Companion" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Floating badges */}
                <div className="absolute -top-2 right-8 bg-card px-3 py-1.5 rounded-full shadow-lg border border-border animate-float">
                  <span className="text-sm font-medium text-nyay-teal flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Powered
                  </span>
                </div>
                <div className="absolute bottom-4 -left-4 bg-card px-3 py-1.5 rounded-full shadow-lg border border-border animate-float" style={{ animationDelay: "0.5s" }}>
                  <span className="text-sm font-medium text-nyay-gold flex items-center gap-1">
                    <Heart className="w-3 h-3" /> 24/7 Support
                  </span>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="order-1 md:order-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-nyay-teal/10 text-nyay-teal text-sm font-medium mb-6">
                <MessageSquareText className="w-4 h-4" />
                <span>Your AI Legal Companion</span>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                Meet <span className="text-nyay-gold">Snehh</span>
              </h2>
              
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Snehh is your compassionate AI legal assistant who understands the emotional weight of legal troubles. She's here to listen, guide, and support you through every step of your legal journey.
              </p>
              
              <ul className="space-y-4 mb-8">
                {[
                  "Understands Hindi & English — talk naturally",
                  "Available 24/7 for instant legal guidance",
                  "Empathetic support during stressful times",
                  "Explains complex laws in simple words"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground">
                    <div className="w-6 h-6 rounded-full bg-nyay-gold/20 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-nyay-gold" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              
              <Button variant="gold" size="lg" onClick={onAccountClick} className="group">
                Chat with Snehh
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6">
              <Scale className="w-4 h-4" />
              <span>Start Your Legal Journey Today</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
              Don't Let Legal Problems Hold You Back
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of Indians who've found legal clarity and justice with NyayBuddy. Your first case analysis is completely free.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gold" size="xl" onClick={onAccountClick} className="shadow-xl hover:shadow-2xl transition-all group">
                Start Free Case Analysis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="xl" onClick={onAccountClick} className="border-white/30 text-primary-foreground hover:bg-white/10">
                Register as Lawyer
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* Footer */}
      <footer className="relative bg-slate-900 text-slate-300">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-nyay-indigo via-nyay-gold to-nyay-teal" />
        
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-nyay-indigo to-nyay-teal">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">Nyay<span className="text-nyay-gold">Buddy</span></span>
                <p className="text-[10px] text-slate-400 tracking-wider uppercase">Legal Assistance Platform</p>
              </div>
            </div>
            
            {/* Links with hover expand */}
            <div className="flex flex-wrap gap-8 md:gap-12">
              {/* Services */}
              <div className="group">
                <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2 cursor-pointer">
                  Services
                  <span className="text-xs text-slate-500 group-hover:text-nyay-gold transition-colors duration-300">+more</span>
                </h4>
                <ul className="space-y-2">
                  {["AI Case Analysis", "Find Lawyers"].map((item, i) => (
                    <li key={i}>
                      <span className="text-sm text-slate-400 hover:text-nyay-gold transition-colors cursor-pointer">{item}</span>
                    </li>
                  ))}
                  <div className="overflow-hidden max-h-0 group-hover:max-h-40 transition-all duration-500 ease-out opacity-0 group-hover:opacity-100">
                    <div className="space-y-2 pt-2">
                      {["Legal Notices", "NyayMail", "Consumer Help"].map((item, i) => (
                        <li key={i} style={{ transitionDelay: `${i * 50}ms` }} className="translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                          <span className="text-sm text-slate-400 hover:text-nyay-gold transition-colors cursor-pointer">{item}</span>
                        </li>
                      ))}
                    </div>
                  </div>
                </ul>
              </div>
              
              {/* Practice Areas */}
              <div className="group">
                <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2 cursor-pointer">
                  Practice Areas
                  <span className="text-xs text-slate-500 group-hover:text-nyay-gold transition-colors duration-300">+more</span>
                </h4>
                <ul className="space-y-2">
                  {["Consumer Rights", "Property Law"].map((item, i) => (
                    <li key={i}>
                      <span className="text-sm text-slate-400 hover:text-nyay-gold transition-colors cursor-pointer">{item}</span>
                    </li>
                  ))}
                  <div className="overflow-hidden max-h-0 group-hover:max-h-40 transition-all duration-500 ease-out opacity-0 group-hover:opacity-100">
                    <div className="space-y-2 pt-2">
                      {["Family Law", "Criminal Defense", "Labour Law"].map((item, i) => (
                        <li key={i} style={{ transitionDelay: `${i * 50}ms` }} className="translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                          <span className="text-sm text-slate-400 hover:text-nyay-gold transition-colors cursor-pointer">{item}</span>
                        </li>
                      ))}
                    </div>
                  </div>
                </ul>
              </div>
              
              {/* Legal */}
              <div className="group">
                <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2 cursor-pointer">
                  Legal
                  <span className="text-xs text-slate-500 group-hover:text-nyay-gold transition-colors duration-300">+more</span>
                </h4>
                <ul className="space-y-2">
                  {["Terms", "Privacy"].map((item, i) => (
                    <li key={i}>
                      <span className="text-sm text-slate-400 hover:text-nyay-gold transition-colors cursor-pointer">{item}</span>
                    </li>
                  ))}
                  <div className="overflow-hidden max-h-0 group-hover:max-h-40 transition-all duration-500 ease-out opacity-0 group-hover:opacity-100">
                    <div className="space-y-2 pt-2">
                      {["Disclaimer", "Refund Policy", "Contact"].map((item, i) => (
                        <li key={i} style={{ transitionDelay: `${i * 50}ms` }} className="translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                          <span className="text-sm text-slate-400 hover:text-nyay-gold transition-colors cursor-pointer">{item}</span>
                        </li>
                      ))}
                    </div>
                  </div>
                </ul>
              </div>
              
              {/* Contact */}
              <div>
                <h4 className="font-semibold text-white text-sm mb-3">Contact</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-slate-400">
                    <Mail className="w-3 h-3 text-nyay-gold" />
                    support@nyaybuddy.in
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-400">
                    <Phone className="w-3 h-3 text-nyay-gold" />
                    1800-XXX-XXXX
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Bottom */}
          <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>© 2025 NyayBuddy</span>
              <span>•</span>
              <span className="flex items-center gap-1">Made with <span className="text-red-500">❤</span> in India</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Operational</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-500 hover:text-nyay-gold cursor-pointer transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </span>
                <span className="text-slate-500 hover:text-nyay-gold cursor-pointer transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </span>
                <span className="text-slate-500 hover:text-nyay-gold cursor-pointer transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;