import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Layers, Sparkles, Wallet, CheckCircle } from 'lucide-react';

export const Profile: React.FC = () => {
  const { profile, user, updateProfile } = useAuth();
  
  const [branch, setBranch] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [skills, setSkills] = useState('');
  const [companies, setCompanies] = useState('');
  const [budget, setBudget] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setBranch(profile.branch || '');
      setCgpa(profile.cgpa?.toString() || '');
      setSkills(profile.skills?.join(', ') || '');
      setCompanies(profile.preferred_companies?.join(', ') || '');
      setBudget(profile.budget?.toString() || '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setLoading(true);

    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      const companiesArray = companies.split(',').map(c => c.trim()).filter(Boolean);

      await updateProfile({
        branch,
        cgpa: cgpa ? parseFloat(cgpa) : 0,
        skills: skillsArray,
        preferred_companies: companiesArray,
        budget: budget ? parseFloat(budget) : 0,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-200">Shared Profile Memory</h2>
        <p className="text-xs text-slate-400 mt-1">Configure academic records, skill tags, and preferences that seed the Planner's memory</p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex gap-3 text-emerald-200 text-xs items-center">
          <CheckCircle className="h-5 w-5 text-emerald-400" />
          <span>Profile memory successfully synchronized.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-8 border border-white/5 space-y-6">
        {/* User Card */}
        <div className="flex items-center gap-4 pb-6 border-b border-white/5">
          <div className="h-12 w-12 rounded-full bg-brand-violet/20 border border-brand-violet/40 flex items-center justify-center font-bold text-brand-neon text-lg">
            {user?.full_name?.charAt(0).toUpperCase() || 'S'}
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-200">{user?.full_name || 'Student'}</h3>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" /> Branch / Department</label>
            <input
              type="text"
              value={branch}
              onChange={e => setBranch(e.target.value)}
              placeholder="e.g. Computer Science & Engineering"
              className="glass-input text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> CGPA / Grade</label>
            <input
              type="number"
              step="0.01"
              value={cgpa}
              onChange={e => setCgpa(e.target.value)}
              placeholder="e.g. 8.5"
              className="glass-input text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5" /> Monthly Spending Budget ($)</label>
            <input
              type="number"
              step="1"
              value={budget}
              onChange={e => setBudget(e.target.value)}
              placeholder="e.g. 500"
              className="glass-input text-xs"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Registered Skills (comma-separated)</label>
          <input
            type="text"
            value={skills}
            onChange={e => setSkills(e.target.value)}
            placeholder="e.g. Python, React, SQL, HTML, Data Structures"
            className="glass-input text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Target / Preferred Companies (comma-separated)</label>
          <input
            type="text"
            value={companies}
            onChange={e => setCompanies(e.target.value)}
            placeholder="e.g. Google, Meta, Microsoft, Stripe"
            className="glass-input text-xs"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full neon-button-purple py-3.5 rounded-xl font-bold text-xs tracking-wide"
        >
          {loading ? 'Saving updates...' : 'Save & Update Shared Memory'}
        </button>
      </form>
    </div>
  );
};
