import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, Briefcase, Calendar, Wallet, 
  ChevronRight, Activity, Zap, ShieldCheck
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface HomeProps {
  setView: (view: any) => void;
  onSetQuickPrompt: (prompt: string) => void;
}

export const Home: React.FC<HomeProps> = ({ setView, onSetQuickPrompt }) => {
  const { profile, user } = useAuth();
  const [internshipCount, setInternshipCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Financial Graph Data
  const financialData = [
    { name: 'Mon', expense: 12 },
    { name: 'Tue', expense: 28 },
    { name: 'Wed', expense: 8 },
    { name: 'Thu', expense: 45 },
    { name: 'Fri', expense: 20 },
    { name: 'Sat', expense: 55 },
    { name: 'Sun', expense: 15 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [interns, events, expenses] = await Promise.all([
          axios.get('/api/internships'),
          axios.get('/api/calendar'),
          axios.get('/api/expenses')
        ]);
        setInternshipCount(interns.data.length);
        setEventCount(events.data.length);
        
        const total = expenses.data.reduce((sum: number, item: any) => sum + item.amount, 0);
        setExpenseTotal(total);
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const prompts = [
    'I need opportunities next month.',
    'I have vacation in July.',
    'Review my resume and find missing skills.',
    'Help me create a study plan for exams.',
  ];

  const handlePromptClick = (prompt: string) => {
    onSetQuickPrompt(prompt);
    setView('chat');
  };

  const agentsList = [
    { name: 'Planner Agent', status: 'Standby / Listening', color: 'bg-brand-purple shadow-neon' },
    { name: 'Internship Matcher', status: 'Ready', color: 'bg-green-500 shadow-green-500/50' },
    { name: 'Hackathon Scraper', status: 'Ready', color: 'bg-green-500 shadow-green-500/50' },
    { name: 'Scholarship Portal', status: 'Ready', color: 'bg-green-500 shadow-green-500/50' },
    { name: 'ATS Optimizer', status: 'Ready', color: 'bg-green-500 shadow-green-500/50' },
    { name: 'Study Scheduler', status: 'Ready', color: 'bg-green-500 shadow-green-500/50' },
    { name: 'Financial Auditor', status: 'Ready', color: 'bg-green-500 shadow-green-500/50' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="glass-card p-8 border border-white/5 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-80 h-full bg-brand-violet/10 rounded-full blur-[80px]" />
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}!
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-lg">
            Your agents are active and monitor opportunities. You can chat with your Planner Agent directly or upload a resume to update your shared memory profile.
          </p>
        </div>
        <button 
          onClick={() => setView('chat')}
          className="neon-button-purple px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 group shrink-0"
        >
          Open Co-pilot Chat
          <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* CGPA */}
        <div className="glass-card p-6 border border-white/5 flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-brand-violet/10 border border-brand-violet/20 flex items-center justify-center text-brand-neon">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 tracking-wider font-bold">Academic GPA</span>
            <p className="text-xl font-extrabold text-slate-200 mt-0.5">{profile?.cgpa || '0.0'} / 10</p>
          </div>
        </div>

        {/* Applied Internships */}
        <div className="glass-card p-6 border border-white/5 flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 tracking-wider font-bold">Applications</span>
            <p className="text-xl font-extrabold text-slate-200 mt-0.5">{internshipCount} Active</p>
          </div>
        </div>

        {/* Calendar Events */}
        <div className="glass-card p-6 border border-white/5 flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 tracking-wider font-bold">Calendar Tasks</span>
            <p className="text-xl font-extrabold text-slate-200 mt-0.5">{eventCount} Events</p>
          </div>
        </div>

        {/* Expenses */}
        <div className="glass-card p-6 border border-white/5 flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 tracking-wider font-bold">Total Expenses</span>
            <p className="text-xl font-extrabold text-slate-200 mt-0.5">${expenseTotal.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Main Content Splitting */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column (prompts + financial chart) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Prompts */}
          <div className="glass-card p-6 border border-white/5">
            <h3 className="font-bold text-sm text-slate-200 mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-brand-cyan" /> Suggested Autonomous Commands
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {prompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptClick(p)}
                  className="p-3.5 rounded-xl border border-white/5 hover:border-brand-violet/20 bg-white/5 hover:bg-brand-violet/5 text-left text-xs font-medium text-slate-300 hover:text-brand-neon transition-all leading-normal flex items-start justify-between"
                >
                  <span className="max-w-[90%]">{p}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Recharts Expenditure Progress */}
          <div className="glass-card p-6 border border-white/5">
            <h3 className="font-bold text-sm text-slate-200 mb-6 flex items-center gap-2">
              <Activity className="h-4 w-4 text-brand-neon animate-pulse" /> Weekly Expenditure Analytics
            </h3>
            <div className="h-60 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={financialData}>
                  <defs>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0b0b0f', 
                      borderColor: 'rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      color: '#f8fafc' 
                    }} 
                  />
                  <Area type="monotone" dataKey="expense" stroke="#a78bfa" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right column (agent lists) */}
        <div>
          <div className="glass-card p-6 border border-white/5 h-full flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-200 mb-6 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Active Agents Nodes
              </h3>
              <div className="space-y-4">
                {agentsList.map((agent, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${agent.color}`} />
                      <span className="text-xs font-semibold text-slate-300">{agent.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">{agent.status}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-white/5 text-[10px] text-slate-500 leading-normal flex items-start gap-2">
              <Zap className="h-4 w-4 text-brand-cyan shrink-0 mt-0.5" />
              <span>CampusCopilot's Graph monitors background activities in real-time. If you query about trips or budgets, the respective agent will fire up automatically.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
