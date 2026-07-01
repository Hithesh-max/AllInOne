import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GraduationCap, Plus, DollarSign, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Scholarship {
  id: number;
  name: string;
  criteria: string | null;
  status: string;
  deadline: string | null;
  notes: string | null;
}

export const Scholarships: React.FC = () => {
  const { profile } = useAuth();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [name, setName] = useState('');
  const [criteria, setCriteria] = useState('');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchScholarships = async () => {
    try {
      const res = await axios.get('/api/scholarships');
      setScholarships(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/scholarships', {
        name,
        criteria: criteria || null,
        status: 'Bookmarked',
        deadline: deadline || null,
        notes: notes || null
      });
      setName('');
      setCriteria('');
      setDeadline('');
      setNotes('');
      fetchScholarships();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-200">Scholarship & Financial Aid</h2>
        <p className="text-xs text-slate-400 mt-1">Verify post-matric limits, income thresholds, and application CGPA minimums</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Scholarships List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Eligibility Criteria Quick Check */}
          <div className="p-4 rounded-2xl bg-brand-cyan/5 border border-brand-cyan/20 flex gap-4 text-slate-300 text-xs leading-normal">
            <Sparkles className="h-5 w-5 text-brand-cyan shrink-0" />
            <div>
              <h4 className="font-bold text-slate-200 mb-0.5">Deducted Credentials Check:</h4>
              <p>Your current registered CGPA is **{profile?.cgpa || '0.0'}**. In order to qualify for NSP Merit-cum-Means, your CGPA must be greater than **7.5**, and annual family income must be below **$3,000** (2.5 LPA).</p>
            </div>
          </div>

          <div className="space-y-4">
            {scholarships.map(scholar => (
              <div key={scholar.id} className="glass-card p-6 border border-white/5 flex justify-between items-start hover:border-brand-cyan/25 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan">
                      <GraduationCap className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="font-bold text-slate-200 text-base">{scholar.name}</h3>
                  </div>
                  <p className="text-xs text-slate-400 pl-12 leading-relaxed">{scholar.notes}</p>
                  {scholar.criteria && (
                    <p className="text-[10px] text-slate-500 pl-12">
                      <span className="font-bold">Requirements:</span> {scholar.criteria}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block text-[9px] bg-brand-cyan/15 text-brand-cyan px-2.5 py-0.5 rounded font-bold uppercase tracking-wider mb-2">
                    {scholar.status}
                  </span>
                  {scholar.deadline && (
                    <div className="text-[9px] text-slate-500">Apply by {scholar.deadline}</div>
                  )}
                </div>
              </div>
            ))}
            {scholarships.length === 0 && (
              <div className="glass-card p-12 text-center text-slate-500 italic text-sm">No scholarship entries logged. Ask the AI: "Are there scholarships available for my profile?"</div>
            )}
          </div>
        </div>

        {/* Add Entry Form */}
        <div>
          <div className="glass-card p-6 border border-white/5 space-y-5">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Plus className="h-4.5 w-4.5 text-brand-cyan" /> Add Scholarship Program
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Program Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. NSP Merit-cum-Means"
                  className="glass-input text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Qualifying Criteria</label>
                <input
                  type="text"
                  value={criteria}
                  onChange={e => setCriteria(e.target.value)}
                  placeholder="e.g. CGPA > 7.5, Income < 2.5 LPA"
                  className="glass-input text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Closing Date</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="glass-input text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Requires income certificates, post-matric guidelines apply."
                  className="glass-input text-xs h-24 resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full neon-button-purple py-3 rounded-xl font-bold text-xs tracking-wide"
              >
                Log Scholarship
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
