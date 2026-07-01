import React from 'react';
import { Terminal, ArrowRight, Brain, Briefcase, Award, GraduationCap, FileText, Wallet, Heart, Compass, Shield } from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onGetStarted }) => {
  const capabilities = [
    { name: 'AI Planner Agent', desc: 'The central reasoning engine coordinates multiple sub-agents dynamically.', icon: Brain, color: 'text-brand-purple border-brand-purple/20' },
    { name: 'Internship Matching', desc: 'Scrape opportunities, match resumes, estimate ATS scores, and generate prep guides.', icon: Briefcase, color: 'text-brand-cyan border-brand-cyan/20' },
    { name: 'Hackathon Scraper', desc: 'Track Devfolio/Devpost deadlines, verify eligibility, and structure team rules.', icon: Award, color: 'text-yellow-400 border-yellow-400/20' },
    { name: 'Scholarship Finder', desc: 'Scan post-matric portals and filter grants by CGPA, branches, and income limits.', icon: GraduationCap, color: 'text-emerald-400 border-emerald-400/20' },
    { name: 'Resume Optimizer', desc: 'Review bullet points, suggest projects, missing keywords, and draft cover letters.', icon: FileText, color: 'text-pink-400 border-pink-400/20' },
    { name: 'Finance & Saving', desc: 'Log expenses, forecast month-end balances, and alert when takeout spikes.', icon: Wallet, color: 'text-amber-500 border-amber-500/20' },
    { name: 'Hydration & Calorie Hub', desc: 'Track weights, log calorie intake, and generate high-protein meal blueprints.', icon: Heart, color: 'text-red-400 border-red-400/20' },
    { name: 'Itinerary Travel Agent', desc: 'Draft day-by-day vacation maps, packing lists, weather alarms, and travel budgets.', icon: Compass, color: 'text-indigo-400 border-indigo-400/20' }
  ];

  return (
    <div className="min-h-screen bg-dark-900 overflow-x-hidden text-slate-100 flex flex-col justify-between">
      {/* Background Neon Blurs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-violet/10 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-cyan/5 rounded-full blur-[120px] animate-pulse-glow" />

      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto w-full px-8 h-20 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-violet to-brand-cyan flex items-center justify-center shadow-neon">
            <Terminal className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-wide">CampusCopilot AI</h1>
            <span className="text-[10px] text-brand-cyan uppercase tracking-wider font-semibold">Autonomous Student Co-Pilot</span>
          </div>
        </div>

        <button 
          onClick={onGetStarted}
          className="px-5 py-2.5 rounded-xl border border-white/10 hover:border-brand-purple/50 bg-white/5 hover:bg-white/10 text-sm font-semibold transition-all duration-200"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 py-16 text-center z-10 relative flex-1 flex flex-col justify-center items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-violet/10 border border-brand-violet/30 text-brand-neon text-xs font-semibold mb-6 animate-bounce">
          <Shield className="h-3.5 w-3.5" />
          Next-Gen Autonomous Multi-Agent Platform
        </div>
        
        <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight max-w-4xl mb-6">
          Your Personal AI <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-neon via-brand-purple to-brand-cyan">
            Career & Student Assistant
          </span>
        </h2>
        
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
          CampusCopilot autonomously parses requests, delegates to specialized agents, maintains session memory, and streamlines student life from one unified glassmorphic panel.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <button 
            onClick={onGetStarted}
            className="neon-button-purple px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 group text-base"
          >
            Launch Assistant
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <a 
            href="#features"
            className="px-8 py-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 font-bold transition-all text-base block"
          >
            Explore Agents
          </a>
        </div>

        {/* Feature Cards Grid */}
        <section id="features" className="w-full pt-12">
          <h3 className="text-2xl font-bold text-slate-200 mb-2">Powered by LangGraph Agentic Workflows</h3>
          <p className="text-slate-400 text-sm max-w-lg mx-auto mb-10">
            CampusCopilot's Planner dynamically triggers, executes, and merges findings from specialized agent cores.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <div key={i} className="glass-card p-6 text-left hover:border-white/10 hover:-translate-y-1 transition-all duration-300">
                  <div className={`h-11 w-11 rounded-xl bg-white/5 border flex items-center justify-center mb-4 ${cap.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-slate-200 mb-1 text-base">{cap.name}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">{cap.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="h-16 border-t border-white/5 flex items-center justify-center text-xs text-slate-500 z-10 relative">
        &copy; {new Date().getFullYear()} CampusCopilot AI. Developed with LangGraph and FastAPI.
      </footer>
    </div>
  );
};
