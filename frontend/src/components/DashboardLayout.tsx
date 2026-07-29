import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Sun, Moon, Settings, Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import type { ViewType } from './Sidebar';
import { useTheme } from '../context/ThemeContext';
import { ParticleBackground } from './ParticleBackground';

interface DashboardLayoutProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ currentView, setView, children }) => {
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await axios.get('/api/notifications');
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };
    fetchNotifs();
    // Poll every 5 minutes
    const interval = setInterval(fetchNotifs, 300000);
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id: number) => {
    try {
      await axios.post(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-dark-900 text-slate-100">
      <ParticleBackground />
      {/* Sidebar Navigation */}
      <Sidebar currentView={currentView} setView={setView} />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 bg-dark-800/40 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-slate-400 hover:text-slate-200">
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="font-semibold text-lg capitalize tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400">
              {currentView === 'home' ? 'Student Workspace Dashboard' : `${currentView} Control Panel`}
            </h2>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-all"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* Notifications Menu Trigger */}
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-all relative"
            >
              <Bell className="h-4.5 w-4.5" />
              {notifications.length > 0 && (
                <>
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-brand-cyan rounded-full animate-ping" />
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-brand-cyan rounded-full" />
                </>
              )}
            </button>

            <button 
              onClick={() => setView('profile')}
              className="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-all"
            >
              <Settings className="h-4.5 w-4.5" />
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 glass-card p-4 border border-white/10 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
                  <h3 className="font-semibold text-sm text-slate-200">System Notifications</h3>
                  <button className="text-[10px] text-brand-cyan hover:underline font-medium">Clear All</button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500 italic">No new notifications.</div>
                  ) : notifications.map(notif => (
                    <div key={notif.id} onClick={() => markRead(notif.id)} className="p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="flex justify-between items-start mb-0.5">
                        <h4 className="font-semibold text-xs text-brand-neon">{notif.title}</h4>
                        <span className="text-[9px] text-brand-cyan font-bold uppercase">{notif.type}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-normal">{notif.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 overflow-y-auto p-8 relative animate-slide-in-up" key={currentView}>
          {children}
        </main>
      </div>
    </div>
  );
};
