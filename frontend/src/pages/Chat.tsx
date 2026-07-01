import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Send, Brain, Sparkles, Cpu, RefreshCw, 
  User, Database, Layers, ArrowUpRight
} from 'lucide-react';

interface ChatProps {
  quickPrompt: string;
  clearQuickPrompt: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  activeAgents?: string[];
}

export const Chat: React.FC<ChatProps> = ({ quickPrompt, clearQuickPrompt }) => {
  const { profile, refreshProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi there! I am your CampusCopilot. Ask me anything, like: "I have vacation in July" or "Find internships matching my skills". I will coordinate my sub-agents to manage it.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [session_id] = useState(() => Math.random().toString(36).substring(7));
  const [activeRunningAgents, setActiveRunningAgents] = useState<string[]>([]);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Trigger quick prompt if passed from dashboard
  useEffect(() => {
    if (quickPrompt) {
      setInput(quickPrompt);
      clearQuickPrompt();
    }
  }, [quickPrompt]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setLoading(true);
    setActiveRunningAgents(['planner_agent']);

    try {
      const res = await axios.post('/api/chat', {
        session_id,
        content: userText
      });
      
      const data = res.data;
      
      // Simulate real-time agent coordination sequence
      if (data.active_agents && data.active_agents.length > 0) {
        setActiveRunningAgents(['planner_agent', ...data.active_agents]);
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response,
        activeAgents: data.active_agents
      }]);
      
      // Refresh memory inspector
      await refreshProfile();
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Error: Failed to communicate with the Planner Agent. Make sure the backend server is running.' 
      }]);
    } finally {
      setLoading(false);
      setActiveRunningAgents([]);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-140px)]">
      {/* Chat Conversation Pane */}
      <div className="lg:col-span-3 glass-card flex flex-col justify-between overflow-hidden border border-white/5 h-full">
        {/* Active Agents Header */}
        <div className="h-14 border-b border-white/5 px-6 flex items-center justify-between bg-dark-800/20">
          <div className="flex items-center gap-2">
            <Cpu className="h-4.5 w-4.5 text-brand-cyan animate-spin" style={{ animationDuration: '4s' }} />
            <span className="text-xs font-semibold text-slate-300">Active Workflow Nodes:</span>
            {activeRunningAgents.length > 0 ? (
              <div className="flex gap-2 animate-pulse">
                {activeRunningAgents.map((agent, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-brand-violet/20 border border-brand-violet/40 text-[9px] text-brand-neon font-bold uppercase tracking-wider">
                    {agent.replace('_node', '').replace('_agent', '')}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[10px] text-slate-500 font-medium">Idle (Waiting for input)</span>
            )}
          </div>
          <span className="text-[10px] text-slate-500">Session ID: {session_id}</span>
        </div>

        {/* Messaging Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 max-w-4xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${
                msg.role === 'user' 
                  ? 'bg-brand-cyan/15 border-brand-cyan/25 text-brand-cyan' 
                  : 'bg-brand-violet/15 border-brand-violet/25 text-brand-neon'
              }`}>
                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
              </div>
              <div className="space-y-2">
                <div className={`p-4 rounded-2xl text-sm leading-relaxed border ${
                  msg.role === 'user'
                    ? 'bg-brand-cyan/5 border-brand-cyan/10 text-slate-200 rounded-tr-none'
                    : 'bg-white/5 border-white/5 text-slate-300 rounded-tl-none'
                }`}>
                  {/* Markdown Renderer Simulated */}
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
                {msg.activeAgents && msg.activeAgents.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap items-center">
                    <span className="text-[9px] text-slate-500 font-bold uppercase mr-1">Coordinated:</span>
                    {msg.activeAgents.map((agent, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[9px] text-slate-400">
                        {agent.replace('_agent', '')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-4 max-w-xl">
              <div className="h-9 w-9 rounded-xl bg-brand-violet/15 border border-brand-violet/25 flex items-center justify-center text-brand-neon shrink-0">
                <Brain className="h-4 w-4 animate-bounce" />
              </div>
              <div className="space-y-1">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-slate-400 text-sm rounded-tl-none flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-brand-neon rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="h-2 w-2 bg-brand-neon rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="h-2 w-2 bg-brand-neon rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs font-medium ml-1">Planner Agent is reasoning...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-dark-800/10 flex gap-4 items-center">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Instruct CampusCopilot... (e.g. 'I need to check for internship opportunities next month')"
            className="flex-1 glass-input py-3.5 text-xs"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-3.5 rounded-xl bg-gradient-to-r from-brand-violet to-brand-purple text-white shadow-neon active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>
      </div>

      {/* Shared Vector/Profile Memory Inspector Drawer */}
      <div className="glass-card p-6 border border-white/5 overflow-y-auto flex flex-col justify-between h-full">
        <div>
          <h3 className="font-extrabold text-sm text-slate-200 mb-6 flex items-center gap-2">
            <Database className="h-4.5 w-4.5 text-brand-cyan" /> Memory Inspector
          </h3>
          
          <div className="space-y-6">
            {/* Academic Info */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" /> Academic Context
              </span>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Branch:</span><span className="font-semibold text-slate-200">{profile?.branch || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">CGPA:</span><span className="font-semibold text-slate-200">{profile?.cgpa || 'N/A'}</span></div>
              </div>
            </div>

            {/* Extracted Skills */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Extracted Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {profile?.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-brand-cyan/15 border border-brand-cyan/25 text-[10px] text-brand-cyan font-semibold">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No skills registered. Upload resume.</span>
                )}
              </div>
            </div>

            {/* Preferred companies */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                <ArrowUpRight className="h-3.5 w-3.5" /> Targets
              </span>
              <div className="flex flex-wrap gap-1.5">
                {profile?.preferred_companies && profile.preferred_companies.length > 0 ? (
                  profile.preferred_companies.map((company, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-brand-violet/15 border border-brand-violet/25 text-[10px] text-brand-neon font-semibold">
                      {company}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No target companies deduced yet.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={refreshProfile}
          className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-slate-200 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Sync Memory
        </button>
      </div>
    </div>
  );
};
