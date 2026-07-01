import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Plus, UserCheck, Calendar } from 'lucide-react';

interface Hackathon {
  id: number;
  name: string;
  dates: string | null;
  status: string;
  team_status: string | null;
  notes: string | null;
}

export const Hackathons: React.FC = () => {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [name, setName] = useState('');
  const [dates, setDates] = useState('');
  const [teamStatus, setTeamStatus] = useState('Solo');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchHackathons = async () => {
    try {
      const res = await axios.get('/api/hackathons');
      setHackathons(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/hackathons', {
        name,
        dates: dates || null,
        status: 'Registered',
        team_status: teamStatus,
        notes: notes || null
      });
      setName('');
      setDates('');
      setNotes('');
      fetchHackathons();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-200">Hackathon Competition Hub</h2>
        <p className="text-xs text-slate-400 mt-1">Track devpost registration dates, hack timelines, and team slots</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Competitions Registered */}
        <div className="lg:col-span-2 space-y-4">
          {hackathons.map(hack => (
            <div key={hack.id} className="glass-card p-6 border border-white/5 flex justify-between items-start hover:border-brand-violet/20 transition-all">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
                    <Award className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-bold text-slate-200 text-base">{hack.name}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-normal pl-12">{hack.notes}</p>
                {hack.dates && (
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pl-12">
                    <Calendar className="h-3 w-3" />
                    <span>Dates: {hack.dates}</span>
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="inline-block text-[9px] bg-brand-violet/15 text-brand-neon px-2.5 py-0.5 rounded font-bold uppercase tracking-wider mb-2">
                  {hack.status}
                </span>
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>{hack.team_status}</span>
                </div>
              </div>
            </div>
          ))}
          {hackathons.length === 0 && (
            <div className="glass-card p-12 text-center text-slate-500 italic text-sm">No registered hackathons logged yet. Tell the AI "Find hackathons next month" to auto-discover and load.</div>
          )}
        </div>

        {/* Log Competition */}
        <div>
          <div className="glass-card p-6 border border-white/5 space-y-5">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Plus className="h-4.5 w-4.5 text-brand-cyan" /> Add Hackathon Entry
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Competition Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Smart India Hackathon"
                  className="glass-input text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Execution Dates</label>
                <input
                  type="text"
                  value={dates}
                  onChange={e => setDates(e.target.value)}
                  placeholder="e.g. Dec 10-15, 2026"
                  className="glass-input text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Team Mode</label>
                <select
                  value={teamStatus}
                  onChange={e => setTeamStatus(e.target.value)}
                  className="glass-input text-xs"
                >
                  <option value="Solo">Solo</option>
                  <option value="Looking for Team">Looking for Team</option>
                  <option value="Team Formed">Team Formed</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Smart City domain, focuses on IoT."
                  className="glass-input text-xs h-24 resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full neon-button-purple py-3 rounded-xl font-bold text-xs tracking-wide"
              >
                Log Hackathon
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
