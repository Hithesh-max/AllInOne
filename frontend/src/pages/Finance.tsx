import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Wallet, Plus, AlertTriangle, Sparkles, TrendingDown, 
  ArrowUpRight, ArrowDownRight, Globe, Layers, Percent, 
  Calendar, Award, Activity, ShieldCheck, Clock, CheckCircle2, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Expense {
  id: number;
  category: string;
  amount: number;
  description: string | null;
  date: string;
}

// 1. ANIMATED 3D CANVAS GLOBE COMPONENT
const SphereGlobe: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // Generate nodes on a sphere representing transactions
    const numPoints = 60;
    const points: { x: number; y: number; z: number; color: string; size: number }[] = [];
    const colors = ['#06b6d4', '#8b5cf6', '#a78bfa', '#10b981', '#fbbf24'];
    
    for (let i = 0; i < numPoints; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 70; // Radius
      points.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        color: colors[i % colors.length],
        size: Math.random() * 2.5 + 1.5
      });
    }

    let angleX = 0.006;
    let angleY = 0.008;
    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw grid ring backgrounds
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      
      // Equatorial Ring
      ctx.beginPath();
      ctx.ellipse(width / 2, height / 2, 70, 20, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Outer boundary sphere
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 70, 0, Math.PI * 2);
      ctx.stroke();

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      // Render & Project Points
      points.forEach(p => {
        // Rotate points around X and Y axis
        const y1 = p.y * cosX - p.z * sinX;
        const z1 = p.z * cosX + p.y * sinX;
        const x2 = p.x * cosY - z1 * sinY;
        const z2 = z1 * cosY + p.x * sinY;

        p.x = x2;
        p.y = y1;
        p.z = z2;

        const focal = 150;
        const scale = focal / (focal + z2);
        const projX = x2 * scale + width / 2;
        const projY = y1 * scale + height / 2;

        // Depth buffer check (foreground is brighter, background is faded)
        if (z2 < 70) {
          ctx.beginPath();
          ctx.arc(projX, projY, p.size * scale, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 10 * scale;
          ctx.shadowColor = p.color;
          ctx.globalAlpha = Math.max(0.15, (focal - z2) / (focal + 70));
          ctx.fill();
          ctx.shadowBlur = 0; // reset shadow
        }
      });

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative flex items-center justify-center p-4">
      <canvas ref={canvasRef} width={180} height={180} className="relative z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-brand-violet/5 rounded-full blur-[30px] -z-10" />
    </div>
  );
};

// 2. PROGRESS RING PARTICLE BACKGROUND
const RingParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const particles: { x: number; y: number; vx: number; vy: number; alpha: number; color: string }[] = [];
    const colors = ['#06b6d4', '#8b5cf6', '#fbbf24'];

    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.2,
        color: colors[i % colors.length]
      });
    }

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} width={280} height={130} className="absolute inset-0 w-full h-full pointer-events-none -z-10" />;
};

export const Finance: React.FC = () => {
  const { profile } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  // Animated counts
  const [animatedNetWorth, setAnimatedNetWorth] = useState(0);
  const [animatedSavings, setAnimatedSavings] = useState(0);
  
  // Stock indices
  const [niftyIndex, setNiftyIndex] = useState(24380.50);
  const [niftyChange, setNiftyChange] = useState(0.45);
  const [tataPrice, setTataPrice] = useState(994.20);
  const [tataChange, setTataChange] = useState(-1.20);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get('/api/expenses');
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    
    // Simulate stock price updates
    const interval = setInterval(() => {
      setNiftyIndex(prev => {
        const delta = (Math.random() - 0.48) * 12;
        const newIdx = prev + delta;
        setNiftyChange((delta / prev) * 100);
        return newIdx;
      });
      setTataPrice(prev => {
        const delta = (Math.random() - 0.5) * 4;
        const newPrice = prev + delta;
        setTataChange((delta / prev) * 100);
        return newPrice;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const budget = profile?.budget || 20000; // default budget in rupees
  const allowance = 35000; // Monthly pocket money/allowance in INR
  const currentNetWorth = Math.max(10000, allowance - totalExpense + 45000); // including investment stack
  const remainingAllowance = Math.max(0, allowance - totalExpense);
  const budgetPercentage = Math.min(100, Math.round((totalExpense / budget) * 100));
  const isOverBudget = totalExpense > budget;

  const submitTransaction = async (amt: number, cat: string, desc: string) => {
    try {
      await axios.post('/api/expenses', {
        category: cat,
        amount: amt,
        description: desc || null
      });
      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    await submitTransaction(parseFloat(amount), category, description);
    setAmount('');
    setDescription('');
  };

  // Animate Net Worth counters
  useEffect(() => {
    if (loading) return;
    let startTimestamp: number | null = null;
    const duration = 1200;
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      setAnimatedNetWorth(progress * currentNetWorth);
      setAnimatedSavings(progress * remainingAllowance);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [loading, totalExpense]);

  // Indian quick log shortcuts
  const shortcuts = [
    { label: '☕ ₹150 Coffee', amt: 150.0, cat: 'Food', desc: 'Starbucks / Cafe Coffee' },
    { label: '🍔 ₹450 Lunch', amt: 450.0, cat: 'Food', desc: 'Swiggy / Zomato order' },
    { label: '📘 ₹1,200 Books', amt: 1200.0, cat: 'Books', desc: 'Engineering Course Reference' },
    { label: '🚇 ₹250 Metro', amt: 250.0, cat: 'Travel', desc: 'Metro smartcard recharge' },
  ];

  // Group by category
  const categorySummaryMap = expenses.reduce((acc: Record<string, number>, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const chartData = Object.keys(categorySummaryMap).map(cat => ({
    name: cat,
    amount: categorySummaryMap[cat]
  }));

  // Heatmap helper (simulate expense logs over past 12 weeks - 84 blocks)
  const heatmapDays = Array.from({ length: 84 }).map((_, idx) => {
    const rand = Math.random();
    let intensity = 'bg-white/[0.02] border border-white/5';
    let label = 'No spending';
    if (rand > 0.8) {
      intensity = 'bg-brand-violet/20 border border-brand-violet/25';
      label = 'Spent ₹100 - ₹500';
    } else if (rand > 0.65) {
      intensity = 'bg-brand-violet/40 border border-brand-violet/45';
      label = 'Spent ₹500 - ₹1,500';
    } else if (rand > 0.5) {
      intensity = 'bg-brand-cyan/60 border border-brand-cyan/70 shadow-[0_0_8px_rgba(6,182,212,0.25)]';
      label = 'Spent ₹1,500+ (High)';
    }
    return { intensity, label };
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 font-sans tracking-wide">
            Ultimate Financial Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track allowance capital flows, visualize expenditure heatmaps, and coordinate goal targets in Real-Time (INR).
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <div className="glass-card px-4 py-2 flex items-center gap-2 border border-white/5 text-[11px] font-bold text-slate-300">
            <span className="h-2 w-2 rounded-full bg-brand-cyan animate-pulse" />
            Vesting Balance Active
          </div>
        </div>
      </div>

      {/* TOP DECK: APPLE-UI CORE METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Animated Net Worth Counter */}
        <div className="glass-card p-6 border border-white/5 relative overflow-hidden flex flex-col justify-between group hover:border-brand-violet/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-full bg-brand-violet/5 rounded-full blur-[40px] -z-10" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-widest">Total Asset Net Worth</span>
            <ArrowUpRight className="h-4.5 w-4.5 text-brand-neon" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-100 tracking-tight">
              ₹{animatedNetWorth.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
              <span className="text-emerald-400 font-bold">+₹4,500 investments</span> this month
            </p>
          </div>
        </div>

        {/* Real-time cash savings */}
        <div className="glass-card p-6 border border-white/5 relative overflow-hidden flex flex-col justify-between group hover:border-brand-cyan/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-full bg-brand-cyan/5 rounded-full blur-[40px] -z-10" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-widest">Disposable Allowance Capital</span>
            <Wallet className="h-4.5 w-4.5 text-brand-cyan" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-100 tracking-tight">
              ₹{animatedSavings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1.5">
              Available balance of ₹{allowance.toLocaleString('en-IN')} allowance
            </p>
          </div>
        </div>

        {/* Monthly Budget Ring Progress */}
        <div className="glass-card p-6 border border-white/5 flex items-center justify-between group hover:border-yellow-500/20 transition-all duration-300">
          <div className="space-y-3 flex-1">
            <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-widest block">Monthly Budget utilization</span>
            <h4 className="text-xl font-extrabold text-slate-200">{budgetPercentage}% Spent</h4>
            <p className="text-[10px] text-slate-400">
              ₹{totalExpense.toLocaleString('en-IN')} / ₹{budget.toLocaleString('en-IN')} limit
            </p>
          </div>
          {/* Glowing Circular Progress Ring */}
          <div className="relative h-18 w-18 shrink-0 flex items-center justify-center">
            <svg className="h-full w-full -rotate-90">
              <circle cx="36" cy="36" r="28" className="stroke-white/[0.04] fill-none" strokeWidth="6" />
              <circle 
                cx="36" 
                cy="36" 
                r="28" 
                className={`fill-none transition-all duration-500 ${isOverBudget ? 'stroke-red-500' : 'stroke-brand-cyan'}`} 
                strokeWidth="6" 
                strokeDasharray={176} 
                strokeDashoffset={176 - (176 * budgetPercentage) / 100}
                strokeLinecap="round"
              />
            </svg>
            <Percent className="h-4.5 w-4.5 text-slate-400 absolute" />
          </div>
        </div>
      </div>

      {/* CORE GRAPHIC DECK: 3D GLOBE + CASH-FLOW RIVER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Animated 3D Spending Globe */}
        <div className="glass-card p-6 border border-white/5 flex flex-col justify-between relative overflow-hidden group">
          <div>
            <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-brand-cyan" /> Geographic Spending Globe
            </h3>
            <p className="text-[10px] text-slate-400">Rotates in 3D representing transactions and regional payment routes.</p>
          </div>
          <SphereGlobe />
          <div className="border-t border-white/5 pt-4 flex justify-between text-[10px] text-slate-400 font-medium">
            <span>🌐 Total nodes: 60</span>
            <span className="text-brand-cyan">Region: Mumbai (Active)</span>
          </div>
        </div>

        {/* Cash-Flow River Visualization */}
        <div className="lg:col-span-2 glass-card p-6 border border-white/5 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-brand-purple" /> Cash-Flow River Stream
              </h3>
              <p className="text-[10px] text-slate-400">Horizontal visual flow of income streaming into expenditure pools and savings.</p>
            </div>
            <span className="text-[10px] font-bold text-brand-neon uppercase tracking-wider">Live Sankey Stream</span>
          </div>

          {/* Interactive Flow Waves */}
          <div className="relative py-6 my-auto">
            {/* Wave Flows */}
            <svg className="w-full h-24" viewBox="0 0 500 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="flowWave" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              <path 
                d="M0,35 C150,10 150,90 300,45 C400,20 425,75 500,65 L500,85 C425,95 400,40 300,65 C150,110 150,30 0,55 Z" 
                fill="url(#flowWave)" 
                className="animate-pulse"
              />
              <path 
                d="M0,45 C150,30 150,75 300,55 C400,40 425,85 500,75 L500,95 C425,105 400,60 300,75 C150,95 150,50 0,65 Z" 
                fill="url(#flowWave)" 
                opacity="0.5"
              />
            </svg>

            {/* Labels overlay */}
            <div className="absolute inset-0 flex justify-between items-center px-4 pointer-events-none">
              <div className="text-left">
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Monthly Income</span>
                <p className="text-xs font-extrabold text-slate-200">₹{allowance.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-center translate-y-2">
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Expenditures</span>
                <p className="text-xs font-extrabold text-red-400">₹{totalExpense.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Net Savings</span>
                <p className="text-xs font-extrabold text-emerald-400">₹{remainingAllowance.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 flex gap-4 text-[10px] text-slate-400">
            <span>🚀 Savings Velocity: 62%</span>
            <span>💡 Stream efficiency: Healthy</span>
          </div>
        </div>
      </div>

      {/* CORE WORKFLOW SPLITTING */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Ledger & Contribution Grid */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI Advisor Panel */}
          <div className="glass-card p-5 border border-brand-cyan/20 bg-brand-cyan/5 flex gap-3 text-xs text-brand-cyan items-center relative overflow-hidden">
            <Sparkles className="h-5 w-5 text-brand-cyan shrink-0" />
            <div className="space-y-0.5">
              <p className="font-bold uppercase tracking-wider text-[9px] text-brand-cyan/60">CampusCopilot AI Insights</p>
              <p className="font-semibold leading-relaxed">
                {expenses.length === 0 
                  ? "AI Audit: Ledger is empty. Add transactions to generate personalized Rupee savings algorithms."
                  : isOverBudget 
                    ? "⚠️ AI warning: allowance ceiling breached! Pause entertainment allocations and utilize student transit passes."
                    : `🧠 You could save ₹3,500 this month by reducing food delivery. Food expenses occupy ${Math.round(((categorySummaryMap['Food'] || 0) / (totalExpense || 1)) * 100)}% of your ledger.`
                }
              </p>
            </div>
          </div>

          {/* 12-Week Contributions Heatmap */}
          <div className="glass-card p-6 border border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider">Expense Heatmap Calendar</h3>
                <p className="text-[10px] text-slate-500">Expenditure intensities tracked over the past 12 weeks.</p>
              </div>
              <Calendar className="h-4.5 w-4.5 text-brand-purple" />
            </div>

            {/* Heatmap Grid */}
            <div className="grid grid-cols-12 gap-1.5 select-none py-2">
              {heatmapDays.map((day, idx) => (
                <div 
                  key={idx} 
                  className={`h-4.5 w-full rounded-md transition-colors duration-300 cursor-pointer ${day.intensity}`} 
                  title={day.label}
                />
              ))}
            </div>
            
            <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold px-1 uppercase tracking-wider">
              <span>Past 12 weeks</span>
              <div className="flex items-center gap-1.5">
                <span>Frugal</span>
                <span className="h-2 w-2 rounded bg-white/[0.02]" />
                <span className="h-2 w-2 rounded bg-brand-violet/20" />
                <span className="h-2 w-2 rounded bg-brand-violet/40" />
                <span className="h-2 w-2 rounded bg-brand-cyan/60" />
                <span>Heavy</span>
              </div>
            </div>
          </div>

          {/* Area chart */}
          {chartData.length > 0 && (
            <div className="glass-card p-6 border border-white/5">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-4">Category Expenditures</h3>
              <div className="h-60 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0b0b0f', 
                        borderColor: 'rgba(255,255,255,0.08)',
                        borderRadius: '12px' 
                      }} 
                    />
                    <Area type="monotone" dataKey="amount" stroke="#06b6d4" fillOpacity={1} fill="url(#colorAmount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Ledger Records */}
          <div className="glass-card p-6 border border-white/5 space-y-4">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Transaction Ledger</h3>
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {expenses.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 hover:bg-white/10 transition-all">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-200">{item.category}</span>
                    <p className="text-[10px] text-slate-500">{item.description || 'No details specified'} • {item.date}</p>
                  </div>
                  <span className="font-extrabold text-red-400">-₹{item.amount.toFixed(2)}</span>
                </div>
              ))}
              {expenses.length === 0 && (
                <p className="text-center py-12 text-slate-500 italic text-xs">No transactions recorded. Log your first expense on the right.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right side form and goals */}
        <div className="space-y-8">
          
          {/* Goal progress rings card with stardust particles */}
          <div className="glass-card p-6 border border-white/5 space-y-4 relative overflow-hidden">
            <RingParticles />
            <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider">Goal Savings Progress</h3>
            
            <div className="space-y-4">
              {/* Goal 1 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">MacBook Air Savings</span>
                  <p className="text-xs font-bold text-slate-200 mt-0.5">₹42,000 / ₹85,000</p>
                </div>
                <div className="h-10 w-10 shrink-0 flex items-center justify-center relative">
                  <svg className="h-full w-full -rotate-90">
                    <circle cx="20" cy="20" r="15" className="stroke-white/[0.04] fill-none" strokeWidth="3" />
                    <circle cx="20" cy="20" r="15" className="stroke-brand-purple fill-none" strokeWidth="3" strokeDasharray={94} strokeDashoffset={94 - (94 * 49) / 100} strokeLinecap="round" />
                  </svg>
                  <span className="text-[8px] absolute font-extrabold text-brand-purple">49%</span>
                </div>
              </div>

              {/* Goal 2 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Emergency Corpus</span>
                  <p className="text-xs font-bold text-slate-200 mt-0.5">₹12,000 / ₹15,000</p>
                </div>
                <div className="h-10 w-10 shrink-0 flex items-center justify-center relative">
                  <svg className="h-full w-full -rotate-90">
                    <circle cx="20" cy="20" r="15" className="stroke-white/[0.04] fill-none" strokeWidth="3" />
                    <circle cx="20" cy="20" r="15" className="stroke-brand-cyan fill-none" strokeWidth="3" strokeDasharray={94} strokeDashoffset={94 - (94 * 80) / 100} strokeLinecap="round" />
                  </svg>
                  <span className="text-[8px] absolute font-extrabold text-brand-cyan">80%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Investment Portfolio Card */}
          <div className="glass-card p-6 border border-white/5 space-y-4">
            <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider">Investment Portfolio</h3>
            
            <div className="space-y-3">
              {/* Asset 1 */}
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-200">Nifty 50 Index</span>
                  <p className="text-[9px] text-slate-500 font-medium">Mutual Fund Allocation</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-200">₹{niftyIndex.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  <p className={`text-[9px] font-bold mt-0.5 flex items-center gap-0.5 justify-end ${niftyChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {niftyChange >= 0 ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                    {niftyChange >= 0 ? '+' : ''}{niftyChange.toFixed(2)}%
                  </p>
                </div>
              </div>

              {/* Asset 2 */}
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-200">Tata Motors Ltd.</span>
                  <p className="text-[9px] text-slate-500 font-medium">12 Shares held</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-200">₹{tataPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  <p className={`text-[9px] font-bold mt-0.5 flex items-center gap-0.5 justify-end ${tataChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tataChange >= 0 ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                    {tataChange >= 0 ? '+' : ''}{tataChange.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bill countdown timers */}
          <div className="glass-card p-6 border border-white/5 space-y-4">
            <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider">Bill Timelines</h3>
            
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="h-4.5 w-4.5 text-amber-400 animate-pulse" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Jio Fiber Broadband</span>
                    <p className="text-xs font-bold text-slate-200 mt-0.5">₹1,180 Dues</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold">2 days left</span>
              </div>
            </div>
          </div>

          {/* Achievement cards */}
          <div className="glass-card p-6 border border-white/5 space-y-4">
            <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider">Savings Achievements</h3>
            
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Award className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Frugal Master</span>
                  <span className="text-[9px] text-slate-500 font-medium">Logged no expenses for 3 consecutive days.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Expense Form */}
          <div className="glass-card p-6 border border-white/5 space-y-5">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Plus className="h-4.5 w-4.5 text-brand-cyan" /> Log Custom Expense
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Amount (INR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="e.g. 250.00"
                  className="glass-input text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="glass-input text-xs"
                >
                  <option value="Food">Food / Dining</option>
                  <option value="Books">Books / Academic</option>
                  <option value="Rent">Rent / Lodging</option>
                  <option value="Travel">Travel / Transit</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Other">Other / Misc</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Lunch with friends"
                  className="glass-input text-xs"
                />
              </div>
              <button type="submit" className="w-full neon-button-cyan py-3 rounded-xl font-bold text-xs tracking-wide">
                Log Transaction
              </button>
            </form>
          </div>

          {/* Quick Shortcuts */}
          <div className="glass-card p-6 border border-white/5 space-y-3.5">
            <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider">Quick Student Logs</h4>
            <div className="grid grid-cols-2 gap-2.5">
              {shortcuts.map((sc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => submitTransaction(sc.amt, sc.cat, sc.desc)}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-brand-cyan/15 text-[10px] text-slate-300 hover:text-brand-cyan border border-white/5 hover:border-brand-cyan/20 transition-all font-bold"
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
