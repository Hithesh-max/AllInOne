import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, Calendar, Star, Plus, CheckCircle, Clock } from 'lucide-react';

interface Internship {
  id: number;
  company: string;
  role: string;
  status: string;
  deadline: string | null;
  match_score: number | null;
  notes: string | null;
}

export const Internships: React.FC = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [matchScore, setMatchScore] = useState(85);
  const [loading, setLoading] = useState(true);

  const fetchInternships = async () => {
    try {
      const res = await axios.get('/api/internships');
      setInternships(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/internships', {
        company,
        role,
        status: 'Applied',
        deadline: deadline || null,
        match_score: matchScore,
        notes: notes || null
      });
      setCompany('');
      setRole('');
      setDeadline('');
      setNotes('');
      fetchInternships();
    } catch (err) {
      console.error(err);
    }
  };

  const columns = ['Applied', 'Interviewing', 'Offered', 'Rejected'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-200">Internship Application Board</h2>
          <p className="text-xs text-slate-400 mt-1">Track career openings and matches parsed from your resume profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kanban Board columns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {columns.map(col => {
              const items = internships.filter(item => item.status === col);
              return (
                <div key={col} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-brand-cyan" /> {col}
                    </span>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300 font-semibold">{items.length}</span>
                  </div>
                  <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                    {items.map(item => (
                      <div key={item.id} className="p-4 rounded-xl bg-dark-700/50 border border-white/5 space-y-2 hover:border-brand-cyan/20 transition-all">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm text-slate-200">{item.role}</h4>
                          {item.match_score && (
                            <span className="text-[9px] bg-brand-cyan/15 text-brand-cyan px-2 py-0.5 rounded font-bold">
                              {item.match_score}% Match
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{item.company}</p>
                        {item.deadline && (
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-2">
                            <Calendar className="h-3 w-3" />
                            <span>Deadline: {item.deadline}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {items.length === 0 && (
                      <div className="text-center py-6 text-xs text-slate-500 italic">No applications in this phase.</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Application Form */}
        <div>
          <div className="glass-card p-6 border border-white/5 space-y-5">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Plus className="h-4.5 w-4.5 text-brand-cyan" /> Log New Application
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Company Name</label>
                <input
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="e.g. Google"
                  className="glass-input text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Job Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="e.g. Frontend Developer Intern"
                  className="glass-input text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Deadline Date</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="glass-input text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Deducted Match Score (%)</label>
                <input
                  type="number"
                  value={matchScore}
                  onChange={e => setMatchScore(Number(e.target.value))}
                  min="0"
                  max="100"
                  className="glass-input text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Requires React hooks knowledge. Interview next Friday."
                  className="glass-input text-xs h-20 resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full neon-button-purple py-3 rounded-xl font-bold text-xs tracking-wide"
              >
                Add Application
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
