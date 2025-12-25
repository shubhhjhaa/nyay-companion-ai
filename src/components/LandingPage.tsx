import { Scale, ShieldCheck, MessageSquareText, Mail, Users, ArrowRight, Gavel, BookOpen, FileCheck, Award, CheckCircle, Star, Phone, Clock, Building2, AlertCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_hsl(230_65%_25%_/_0.08)_0%,_transparent_50%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_hsl(38_92%_50%_/_0.06)_0%,_transparent_50%)]" />
          
          {/* Decorative Elements */}
          <div className="absolute top-20 right-10 w-72 h-72 bg-nyay-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-nyay-indigo/5 rounded-full blur-3xl" />
          
          {/* Legal Pattern Grid */}
          <div className="absolute inset-0 opacity-[0.015]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Header */}
        <header className="relative z-10 container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-hero shadow-lg">
                  <Scale className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-nyay-gold rounded-full flex items-center justify-center">
                  <span className="text-[8px] font-bold text-nyay-indigo">AI</span>
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold text-foreground tracking-tight">
                  Nyay<span className="text-nyay-gold">Buddy</span>
                </span>
                <p className="text-[10px] text-muted-foreground tracking-wider uppercase">Legal Assistance Platform</p>
              </div>
            </div>
            
            <Button variant="gold" onClick={onAccountClick} className="shadow-lg hover:shadow-xl transition-shadow">
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </nav>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 container mx-auto px-4 flex items-center">
          <div className="grid lg:grid-cols-2 gap-12 items-center w-full py-12">
            {/* Left Content */}
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-nyay-indigo/10 border border-nyay-indigo/20 text-nyay-indigo text-sm font-medium mb-6">
                <Gavel className="w-4 h-4" />
                <span>Trusted by 10,000+ Indians</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.1] mb-6">
                Your Legal Rights,{" "}
                <span className="relative">
                  <span className="text-gradient-hero">Simplified</span>
                  <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                    <path d="M2 6C50 2 150 2 198 6" stroke="hsl(38 92% 50%)" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl">
                Don't let legal confusion hold you back. NyayBuddy's AI understands your problem, 
                explains your rights in simple Hindi/English, and connects you with verified lawyers.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Button variant="hero" size="xl" onClick={onAccountClick} className="group shadow-xl hover:shadow-2xl transition-all">
                  <span>Analyze My Case Free</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" size="xl" onClick={onAccountClick} className="border-2">
                  <Phone className="w-4 h-4 mr-2" />
                  Talk to a Lawyer
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                  <span>100% Confidential</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-nyay-gold" />
                  <span>Bar Council Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-nyay-teal" />
                  <span>24/7 AI Support</span>
                </div>
              </div>
            </div>

            {/* Right Content - Legal Illustration Card */}
            <div className="relative animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="relative">
                {/* Main Card */}
                <Card className="bg-card/80 backdrop-blur-xl border-2 border-border/50 shadow-2xl overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-hero" />
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-hero flex items-center justify-center">
                        <BookOpen className="w-7 h-7 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-foreground">Legal Case Analysis</h3>
                        <p className="text-sm text-muted-foreground">AI-Powered Assessment</p>
                      </div>
                    </div>

                    {/* Sample Analysis UI */}
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-muted/50 border border-border">
                        <p className="text-sm text-muted-foreground mb-2">Your Issue:</p>
                        <p className="text-foreground font-medium">"My landlord is not returning security deposit..."</p>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-muted-foreground">AI analyzing your case...</span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                          <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-green-800 dark:text-green-300">Strong Case Identified</p>
                            <p className="text-xs text-green-700 dark:text-green-400">Consumer Protection Act applies</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-nyay-gold/10 border border-nyay-gold/30">
                          <Gavel className="w-5 h-5 text-nyay-gold shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Recommended: Legal Notice</p>
                            <p className="text-xs text-muted-foreground">Send formal notice before court</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-card shadow-xl rounded-xl p-3 border border-border animate-pulse-glow">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-nyay-gold/20 flex items-center justify-center">
                      <Star className="w-4 h-4 text-nyay-gold" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">4.9/5 Rating</p>
                      <p className="text-[10px] text-muted-foreground">2000+ Reviews</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-card shadow-xl rounded-xl p-3 border border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">SSL Encrypted</p>
                      <p className="text-[10px] text-muted-foreground">Data Protected</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="relative z-10 border-t border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-gradient-hero">{stat.number}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-subtle relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(230_65%_25%_/_0.03)_0%,_transparent_70%)]" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-nyay-teal/10 text-nyay-teal text-sm font-medium mb-4">
              <Building2 className="w-4 h-4" />
              <span>Comprehensive Legal Tools</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Everything You Need for{" "}
              <span className="text-gradient-hero">Legal Help</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From understanding your case to drafting legal notices, NyayBuddy has all the tools to fight for your rights.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="group bg-card hover:bg-card/80 border-2 border-transparent hover:border-nyay-gold/30 shadow-card hover:shadow-xl transition-all duration-500 hover:-translate-y-2 animate-slide-up overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-nyay-gold/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-nyay-indigo/5 rounded-full blur-3xl" />
        
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
              <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-1 bg-gradient-to-r from-nyay-indigo via-nyay-gold to-nyay-teal rounded-full" />
              
              {[
                { step: "1", title: "Describe Your Problem", desc: "Tell us about your legal issue in simple words — Hindi or English, we understand both.", icon: MessageSquareText, color: "from-nyay-indigo to-nyay-indigo-light" },
                { step: "2", title: "AI Analyzes Your Case", desc: "Our legal AI reviews your situation against Indian laws and suggests the best course of action.", icon: BookOpen, color: "from-nyay-gold to-nyay-gold-light" },
                { step: "3", title: "Take Action", desc: "Send legal notices, connect with lawyers, or file complaints — all with guided assistance.", icon: Gavel, color: "from-nyay-teal to-nyay-teal-light" },
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
            <p className="text-muted-foreground text-lg">Real stories from real people</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card border-2 hover:border-nyay-gold/30 transition-colors animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-nyay-gold text-nyay-gold" />
                    ))}
                  </div>
                  <p className="text-foreground mb-6 leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M20 0L0 20h40z\'/%3E%3C/g%3E%3C/svg%3E')]" />
        
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
      <footer className="relative bg-slate-900 text-slate-300 overflow-hidden">
        
        {/* Decorative Top Border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-nyay-indigo via-nyay-gold to-nyay-teal" />
        
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 pt-16 pb-8">
          <div className="grid md:grid-cols-12 gap-10 lg:gap-16 mb-12">
            
            {/* Brand & About Section */}
            <div className="md:col-span-4 animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-nyay-indigo to-nyay-teal shadow-lg">
                  <Scale className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-white tracking-tight">
                    Nyay<span className="text-nyay-gold">Buddy</span>
                  </span>
                  <p className="text-[10px] text-slate-400 tracking-wider uppercase">Legal Assistance Platform</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                India's trusted AI-powered legal assistance platform helping citizens understand their legal rights and connect with Bar Council verified advocates.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-nyay-gold" />
                  <span>support@nyaybuddy.in</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-nyay-gold" />
                  <span>+91 1800-XXX-XXXX (Toll Free)</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-nyay-gold mt-0.5" />
                  <span>New Delhi, India</span>
                </div>
              </div>
            </div>
            
            {/* Our Services */}
            <div className="md:col-span-2 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <h4 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">
                Our Services
              </h4>
              <ul className="space-y-3">
                {["AI Case Analysis", "Find Verified Lawyers", "Legal Notices", "NyayMail Drafting", "Consumer Grievance", "Document Scanning"].map((item, i) => (
                  <li key={i}>
                    <span className="text-sm text-slate-400 hover:text-nyay-gold transition-colors duration-300 cursor-pointer">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Practice Areas */}
            <div className="md:col-span-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <h4 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">
                Practice Areas
              </h4>
              <ul className="space-y-3">
                {["Consumer Rights", "Property & Real Estate", "Family & Matrimonial", "Criminal Defense", "Labour & Employment", "Civil Litigation"].map((item, i) => (
                  <li key={i}>
                    <span className="text-sm text-slate-400 hover:text-nyay-gold transition-colors duration-300 cursor-pointer">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Quick Links */}
            <div className="md:col-span-2 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <h4 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">
                Quick Links
              </h4>
              <ul className="space-y-3">
                {["About Us", "How It Works", "For Lawyers", "FAQs", "Blog", "Careers"].map((item, i) => (
                  <li key={i}>
                    <span className="text-sm text-slate-400 hover:text-nyay-gold transition-colors duration-300 cursor-pointer">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Legal */}
            <div className="md:col-span-2 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <h4 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">
                Legal
              </h4>
              <ul className="space-y-3">
                {["Terms of Service", "Privacy Policy", "Cookie Policy", "Disclaimer", "Refund Policy", "Grievance Officer"].map((item, i) => (
                  <li key={i}>
                    <span className="text-sm text-slate-400 hover:text-nyay-gold transition-colors duration-300 cursor-pointer">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Trust & Compliance Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-10 py-8 border-y border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">256-bit SSL Encryption</p>
                <p className="text-xs text-slate-400">Your data is secure with us</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center">
                <Award className="w-6 h-6 text-nyay-gold" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Bar Council Verified</p>
                <p className="text-xs text-slate-400">All lawyers are verified</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-nyay-teal" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">IT Act Compliant</p>
                <p className="text-xs text-slate-400">Following Indian IT laws</p>
              </div>
            </div>
          </div>
          
          {/* Disclaimer Banner */}
          <div className="mb-8 p-5 rounded-lg bg-slate-800/50 border border-slate-700 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white mb-2">Important Legal Disclaimer</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  NyayBuddy is an AI-powered legal technology platform and does not constitute a law firm. The information provided through our services is for general informational purposes only and should not be construed as legal advice. For specific legal matters, we strongly recommend consulting with a qualified advocate enrolled with the Bar Council of India. NyayBuddy facilitates connection between users and verified legal professionals but does not provide legal representation. Use of this platform is subject to our Terms of Service.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="bg-slate-950 py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                <p className="text-sm text-slate-400">
                  © 2025 NyayBuddy Technologies Pvt. Ltd. All rights reserved.
                </p>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <span>Made with</span>
                  <span className="text-red-500">❤</span>
                  <span>in India for Indians</span>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>All Systems Operational</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-500 hover:text-nyay-gold cursor-pointer transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                  </span>
                  <span className="text-slate-500 hover:text-nyay-gold cursor-pointer transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  </span>
                  <span className="text-slate-500 hover:text-nyay-gold cursor-pointer transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;