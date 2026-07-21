import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Send, Brain, Sparkles, Cpu, RefreshCw, 
  User, Database, Layers, ArrowUpRight,
  Paperclip, FileText, FileCode, X
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

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let currentListItems: React.ReactNode[] = [];
  let currentTableRows: string[][] = [];
  let inTable = false;

  const flushList = (key: number) => {
    if (currentListItems.length > 0) {
      renderedElements.push(
        <ul key={`list-${key}`} className="list-disc pl-5 mb-4 space-y-1.5 text-slate-300">
          {currentListItems}
        </ul>
      );
      currentListItems = [];
    }
  };

  const parseInlineStyles = (text: string) => {
    // Regex matches bold (**text**), code (`code`), markdown links ([text](url)), and plain URLs (https://...)
    const parts = text.split(/(\*\*.*?\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s()<>]+)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-extrabold text-brand-neon">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={idx} className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-[10px] text-brand-cyan">{part.slice(1, -1)}</code>;
      }
      if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
        const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (match) {
          const [, linkText, linkUrl] = match;
          return (
            <a 
              key={idx} 
              href={linkUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="text-brand-cyan hover:underline font-bold inline-flex items-center gap-0.5"
            >
              {linkText} <ArrowUpRight className="h-3 w-3 inline" />
            </a>
          );
        }
      }
      if (part.startsWith('http://') || part.startsWith('https://')) {
        return (
          <a 
            key={idx} 
            href={part} 
            target="_blank" 
            rel="noreferrer" 
            className="text-brand-cyan hover:underline font-bold inline-flex items-center gap-0.5 break-all"
          >
            {part} <ArrowUpRight className="h-3 w-3 inline shrink-0" />
          </a>
        );
      }
      return part;
    });
  };

  const flushTable = (key: number) => {
    if (currentTableRows.length > 0) {
      const headers = currentTableRows[0];
      const dataRows = currentTableRows.slice(1);
      const filteredDataRows = dataRows.filter(row => !row.every(cell => cell.trim().match(/^:?-+:?$/)));

      renderedElements.push(
        <div key={`table-wrapper-${key}`} className="overflow-x-auto my-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-neon bg-slate-50/50 dark:bg-dark-900/40">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-white/10 text-xs text-left">
            <thead className="bg-slate-100 dark:bg-white/5 font-extrabold text-slate-800 dark:text-slate-200">
              <tr>
                {headers.map((header, hIdx) => (
                  <th key={hIdx} className="px-4 py-3 border-r border-slate-200 dark:border-white/5 last:border-0 uppercase tracking-wider font-extrabold text-[10px]">
                    {parseInlineStyles(header.trim())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
              {filteredDataRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-100/40 dark:hover:bg-white/2 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-3 border-r border-slate-200 dark:border-white/5 last:border-0 font-medium">
                      {parseInlineStyles(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      currentTableRows = [];
      inTable = false;
    }
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('|')) {
      if (!inTable) {
        flushList(index);
        inTable = true;
      }
      let cells = trimmedLine.split('|');
      if (cells[0] === '') cells.shift();
      if (cells[cells.length - 1] === '') cells.pop();
      currentTableRows.push(cells);
    } else {
      if (inTable) {
        flushTable(index);
      }

      if (trimmedLine.startsWith('### ')) {
        flushList(index);
        const text = trimmedLine.replace('### ', '');
        renderedElements.push(
          <h4 key={index} className="text-sm font-extrabold text-white mt-5 mb-2 flex items-center gap-1.5 border-b border-white/5 pb-1">
            {parseInlineStyles(text)}
          </h4>
        );
      } else if (trimmedLine.startsWith('## ')) {
        flushList(index);
        const text = trimmedLine.replace('## ', '');
        renderedElements.push(
          <h3 key={index} className="text-base font-extrabold text-white mt-6 mb-3 flex items-center gap-1.5 border-b border-white/10 pb-1.5">
            {parseInlineStyles(text)}
          </h3>
        );
      } else if (trimmedLine.startsWith('# ')) {
        flushList(index);
        const text = trimmedLine.replace('# ', '');
        renderedElements.push(
          <h2 key={index} className="text-lg font-extrabold text-white mt-8 mb-4 border-b border-white/20 pb-2">
            {parseInlineStyles(text)}
          </h2>
        );
      } else if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
        const text = trimmedLine.slice(2);
        currentListItems.push(
          <li key={`li-${index}`} className="text-xs leading-relaxed text-slate-300 ml-1">
            {parseInlineStyles(text)}
          </li>
        );
      } else if (trimmedLine === '') {
        flushList(index);
      } else {
        flushList(index);
        renderedElements.push(
          <p key={index} className="text-xs text-slate-300 leading-relaxed mb-3">
            {parseInlineStyles(trimmedLine)}
          </p>
        );
      }
    }
  });

  flushList(lines.length);
  flushTable(lines.length);

  return <div className="markdown-body space-y-1">{renderedElements}</div>;
};

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

  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [activeDocument, setActiveDocument] = useState<{ filename: string; chunks: number } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setUploadingDoc(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Uploading and indexing document: ${file.name}...` 
      }]);
      
      const res = await axios.post('/api/chat/upload-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const data = res.data;
      
      setActiveDocument({
        filename: data.filename,
        chunks: data.chunk_count
      });
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `🎉 Successfully indexed document **${data.filename}** into the RAG vector space. Feel free to query it or use the study shortcut buttons in the Memory Inspector sidebar!` 
      }]);
      
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.detail || 'Failed to upload and parse document.';
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ Error: ${errMsg}` 
      }]);
    } finally {
      setUploadingDoc(false);
      e.target.value = '';
    }
  };

  const runShortcutQuery = async (type: 'summary' | 'quiz' | 'concepts' | 'flashcards') => {
    if (!activeDocument || loading) return;
    
    let queryText = "";
    if (type === 'summary') {
      queryText = `Please generate a comprehensive summary of the uploaded document: ${activeDocument.filename}. Use bullet points and headers.`;
    } else if (type === 'quiz') {
      queryText = `Please generate a 5-question multiple-choice quiz based on the uploaded document: ${activeDocument.filename}. Include the answer key at the bottom.`;
    } else if (type === 'concepts') {
      queryText = `Please extract the key concepts and glossary definitions from the uploaded document: ${activeDocument.filename}.`;
    } else if (type === 'flashcards') {
      queryText = `Please generate study flashcards (Q&A format) covering the main topics of the uploaded document: ${activeDocument.filename}.`;
    }
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: queryText }]);
    setLoading(true);
    setActiveRunningAgents(['planner_agent']);
    
    try {
      const res = await axios.post('/api/chat', {
        session_id,
        content: queryText,
        active_document: activeDocument ? activeDocument.filename : undefined
      });
      
      const data = res.data;
      
      if (data.active_agents && data.active_agents.length > 0) {
        setActiveRunningAgents(['planner_agent', ...data.active_agents]);
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response,
        activeAgents: data.active_agents
      }]);
      
      await refreshProfile();
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Error: Failed to process study command.' 
      }]);
    } finally {
      setLoading(false);
      setActiveRunningAgents([]);
    }
  };

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
        content: userText,
        active_document: activeDocument ? activeDocument.filename : undefined
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
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-line">{msg.content}</p>
                  ) : (
                    <MarkdownRenderer content={msg.content} />
                  )}
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
        <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-dark-800/10 flex gap-4 items-center relative">
          <label className={`p-3.5 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-brand-cyan hover:bg-white/10 hover:border-brand-cyan/30 cursor-pointer transition-all active:scale-95 flex items-center justify-center shrink-0 ${uploadingDoc ? 'animate-pulse pointer-events-none' : ''}`}>
            <input 
              type="file" 
              accept=".pdf,.txt,.md,.json,.png,.jpg,.jpeg" 
              onChange={handleFileUpload} 
              className="hidden" 
              disabled={uploadingDoc || loading}
            />
            {uploadingDoc ? <RefreshCw className="h-4.5 w-4.5 animate-spin" /> : <Paperclip className="h-4.5 w-4.5" />}
          </label>
          
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={activeDocument ? `Ask questions about ${activeDocument.filename}...` : "Instruct CampusCopilot... (or click clip icon to upload note/photo)"}
            className="flex-1 glass-input py-3.5 text-xs"
            disabled={loading || uploadingDoc}
          />
          <button
            type="submit"
            disabled={loading || uploadingDoc || !input.trim()}
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

            {/* RAG Document Workspace */}
            <div className="space-y-2 border-t border-white/5 pt-6">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-brand-cyan" /> RAG Document Workspace
              </span>
              {activeDocument ? (
                <div className="p-3.5 rounded-xl bg-brand-cyan/5 border border-brand-cyan/20 space-y-3.5 text-xs text-left">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 truncate">
                      <FileCode className="h-4 w-4 text-brand-cyan shrink-0" />
                      <span className="font-semibold text-slate-200 truncate">{activeDocument.filename}</span>
                    </div>
                    <button 
                      onClick={() => setActiveDocument(null)} 
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Remove Document"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  
                  <div className="text-[10px] text-slate-400">
                    Indexed Chunks: <strong className="text-slate-200">{activeDocument.chunks}</strong>
                  </div>
                  
                  {/* Shortcut buttons */}
                  <div className="space-y-2 pt-1 font-sans">
                    <button
                      onClick={() => runShortcutQuery("summary")}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 hover:bg-brand-cyan/15 hover:text-brand-cyan border border-white/5 transition-all text-left text-[11px] flex items-center gap-2 font-semibold"
                    >
                      <span>📝</span> Summarize Document
                    </button>
                    <button
                      onClick={() => runShortcutQuery("quiz")}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 hover:bg-brand-cyan/15 hover:text-brand-cyan border border-white/5 transition-all text-left text-[11px] flex items-center gap-2 font-semibold"
                    >
                      <span>❓</span> Generate 5-Question Quiz
                    </button>
                    <button
                      onClick={() => runShortcutQuery("concepts")}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 hover:bg-brand-cyan/15 hover:text-brand-cyan border border-white/5 transition-all text-left text-[11px] flex items-center gap-2 font-semibold"
                    >
                      <span>💡</span> Extract Key Concepts
                    </button>
                    <button
                      onClick={() => runShortcutQuery("flashcards")}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 hover:bg-brand-cyan/15 hover:text-brand-cyan border border-white/5 transition-all text-left text-[11px] flex items-center gap-2 font-semibold"
                    >
                      <span>📇</span> Make Study Flashcards
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-white/10 text-center space-y-2">
                  <p className="text-[11px] text-slate-500 italic">No study document loaded yet. Click the paperclip icon in the input bar to upload a PDF/TXT or Photo note!</p>
                </div>
              )}
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
