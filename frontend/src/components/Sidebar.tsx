import React from 'react';
import { 
  LayoutDashboard, MessageSquare, BookOpen, Briefcase, Award, 
  GraduationCap, FileText, Wallet, ShoppingCart, Heart, 
  Compass, Calendar, User, LogOut, Terminal, Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type ViewType = 
  | 'home' | 'chat' | 'study' | 'internships' | 'hackathons' 
  | 'scholarships' | 'contests' | 'resume' 
  | 'calendar' | 'settings' | 'profile' | 'news';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const { logout, user } = useAuth();

  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'AI Co-pilot Chat', icon: MessageSquare },
    { id: 'study', label: 'Study Planner', icon: BookOpen },
    { id: 'internships', label: 'Internships', icon: Briefcase },
    { id: 'hackathons', label: 'Hackathons', icon: Award },
    { id: 'scholarships', label: 'Scholarships', icon: GraduationCap },
    { id: 'contests', label: 'Coding Contests', icon: Terminal },
    { id: 'resume', label: 'ATS Resume Review', icon: FileText },
    { id: 'calendar', label: 'Calendar Events', icon: Calendar },
    { id: 'news', label: 'Tech News Hub', icon: Globe },
    { id: 'profile', label: 'User Profile', icon: User },
  ];

  return (
    <aside className="w-64 h-screen glass-card rounded-none border-r border-y-0 border-l-0 border-white/5 flex flex-col justify-between py-6">
      <div>
        {/* App Logo */}
        <div className="flex items-center gap-3 px-6 mb-6 cursor-pointer" onClick={() => setView('home')}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-violet to-brand-cyan flex items-center justify-center shadow-neon">
            <Terminal className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-brand-neon to-brand-cyan">CampusCopilot</h1>
            <span className="text-[10px] text-brand-cyan uppercase tracking-wider font-bold">Multi-Agent AI</span>
          </div>
        </div>

        {/* User Info Capsule */}
        <div className="mx-4 mb-5 p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-brand-violet/20 border border-brand-violet/40 flex items-center justify-center font-bold text-brand-neon">
            {user?.full_name?.charAt(0).toUpperCase() || 'S'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold truncate text-slate-200">{user?.full_name || 'Student'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-1 overflow-y-auto max-h-[50vh] pr-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id as ViewType)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-brand-violet/25 to-brand-purple/10 text-brand-neon border-l-4 border-brand-violet pl-3'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-brand-neon' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="px-3">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="h-4.5 w-4.5" />
          Logout
        </button>
      </div>
    </aside>
  );
};
