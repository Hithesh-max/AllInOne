import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, Calendar, Plus, Clock, Search, ShieldCheck } from 'lucide-react';
import Timeline from '../components/Timeline';
import { initialInternships } from '../data';

interface Internship {
  id: string; // From mock data
  company: string;
  role: string;
  platform: string;
  description: string;
  fee: number;
  teamSize: string;
  registeredCount: number;
  locationText: string;
  aboutText: string;
  stipend: string;
  stipendValue: number;
  location: 'Remote' | 'On-site' | 'Hybrid';
  field: 'Software' | 'AI' | 'Mechanical' | 'ECE' | 'Civil';
  deadline: string;
  isApplied: boolean;
  timeline?: Array<{ stageName: string; status: 'Completed' | 'Pending' | 'Failed' | 'Not Yet'; deadline?: string; daysLeft?: number; details?: string; fileNameRequired?: string; fileUploaded?: boolean }>;
}

interface DbInternship {
  id: number; // DB ID
  company: string;
  role: string;
  status: string;
  deadline: string | null;
  match_score: number | null;
  notes: string | null;
  timeline: Array<{ stageName: string; status: 'Completed' | 'Pending' | 'Failed' | 'Not Yet'; deadline?: string; daysLeft?: number; details?: string; fileNameRequired?: string; fileUploaded?: boolean }>;
}

export const Internships: React.FC = () => {
  const [discoverList, setDiscoverList] = useState<Internship[]>([]);
  const [appliedList, setAppliedList] = useState<DbInternship[]>([]);
  
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('All');
  
  // States for forms and details
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [matchScore, setMatchScore] = useState(85);
  
  const [selectedApp, setSelectedApp] = useState<DbInternship | null>(null);
  const [detailOp, setDetailOp] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDbApplications = async () => {
    try {
      const res = await axios.get('/api/internships');
      const dbList = res.data;
      setAppliedList(dbList);

      // Sync isApplied flag dynamically for all items in discover list
      setDiscoverList(prev => prev.map(d => ({
        ...d,
        isApplied: dbList.some((item: any) => item.role === d.role && item.company === d.company)
      })));

      if (selectedApp) {
        const fresh = dbList.find((item: DbInternship) => item.id === selectedApp.id);
        if (fresh) setSelectedApp(fresh);
      }
    } catch (err) {
      console.error("Failed to load db applications", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      const res = await axios.get('/api/internships');
      const dbList = res.data;
      setAppliedList(dbList);
      
      // Load and set the mock list
      const parsedMockList = initialInternships.map(i => ({
        ...i,
        isApplied: dbList.some((item: any) => item.role === i.role && item.company === i.company),
        timeline: i.timeline || [
          { 
            stageName: "Application Submission", 
            status: "Pending", 
            details: "Submit your resume and details on the company careers portal. Once complete, click 'Mark Stage as Completed' below.",
            fileNameRequired: "resume_submitted.pdf"
          },
          { 
            stageName: "OA / Interview Stages", 
            status: "Pending", 
            deadline: i.deadline, 
            details: "Complete Online Assessment requests and prepare for core DSA rounds." 
          }
        ]
      }));
      setDiscoverList(parsedMockList as any);
      setLoading(false);
    };
    init();
  }, []);

  const handleCreateCustomApp = async (e: React.FormEvent) => {
    e.preventDefault();
    const defaultTimeline = [
      { stageName: "Resume Review", status: "Completed", details: "Logged application manually" },
      { stageName: "OA Round", status: "Pending", deadline: formDeadline || undefined, details: "Awaiting test link" }
    ];
    try {
      await axios.post('/api/internships', {
        company,
        role,
        status: 'Applied',
        deadline: formDeadline || null,
        match_score: matchScore,
        notes: notes || null,
        timeline: defaultTimeline
      });
      setCompany('');
      setRole('');
      setFormDeadline('');
      setNotes('');
      fetchDbApplications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyFromCatalog = async (item: Internship) => {
    // Add to DB
    const defaultTimeline = item.timeline || [
      { 
        stageName: "Application Submission", 
        status: "Pending", 
        details: "Submit your resume and details on the company careers portal. Once complete, click 'Mark Stage as Completed' below.",
        fileNameRequired: "resume_submitted.pdf"
      },
      { 
        stageName: "Online Assessment (OA)", 
        status: "Pending", 
        details: "Complete Online Assessment requests and prepare for core DSA rounds." 
      },
      {
        stageName: "Technical Interview Round 1",
        status: "Pending",
        details: "Live interview with SDE panel covering DSA algorithms and project architecture."
      },
      {
        stageName: "System Design & Managerial Round",
        status: "Pending",
        details: "Interview round with engineering manager evaluating scalability, APIs, and leadership principles."
      },
      {
        stageName: "HR Offer Review & Letter Signing",
        status: "Pending",
        details: "Verify compensation terms and sign the official internship offer letter.",
        fileNameRequired: "signed_offer_letter.pdf"
      }
    ];
    try {
      // Split the ISO date to YYYY-MM-DD so that FastAPI/Pydantic validation doesn't throw a 422 error!
      const formattedDate = item.deadline ? item.deadline.split('T')[0] : null;

      await axios.post('/api/internships', {
        company: item.company,
        role: item.role,
        status: 'In Progress',
        deadline: formattedDate,
        match_score: item.stipendValue > 30000 ? 95 : 82,
        notes: item.description,
        timeline: defaultTimeline
      });
      
      await fetchDbApplications();
      
      // Auto-close details drawer so the new sidebar timeline becomes visible!
      setDetailOp(null);

      // Open the exact link where we found it!
      const targetUrl = item.url || "https://careers.google.com";
      window.open(targetUrl, '_blank');
    } catch (err) {
      console.error("Failed to apply from catalog", err);
    }
  };

  const handleUntrack = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axios.delete(`/api/internships/${id}`);
      if (selectedApp?.id === id) {
        setSelectedApp(null);
      }
      await fetchDbApplications();
    } catch (err) {
      console.error("Failed to untrack internship", err);
    }
  };

  const handleUploadFile = async (opportunityId: string, stageName: string, fileName: string) => {
    if (!selectedApp) return;
    
    const updatedTimeline = selectedApp.timeline.map(stage => {
      if (stage.stageName === stageName) {
        return { 
          ...stage, 
          status: 'Completed' as const, 
          fileUploaded: true, 
          details: `Document uploaded: ${fileName}. Verified successfully.` 
        };
      }
      return stage;
    });

    try {
      const res = await axios.put(`/api/internships/${selectedApp.id}`, {
        ...selectedApp,
        timeline: updatedTimeline
      });
      setSelectedApp(res.data);
      fetchDbApplications();
    } catch (err) {
      console.error("Failed to update stages timeline", err);
    }
  };

  const filteredDiscoverList = discoverList.filter(item => {
    const matchesSearch = item.company.toLowerCase().includes(search.toLowerCase()) || item.role.toLowerCase().includes(search.toLowerCase());
    
    if (filterTag === 'All') return matchesSearch;
    if (filterTag === 'Remote') return matchesSearch && item.location === 'Remote';
    if (filterTag === 'Paid') return matchesSearch && item.stipendValue >= 30000;
    if (filterTag === 'Software') return matchesSearch && item.field === 'Software';
    if (filterTag === 'AI') return matchesSearch && item.field === 'AI';
    if (filterTag === 'ECE') return matchesSearch && item.field === 'ECE';
    
    return matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-200">Recommended Internships & Careers</h2>
        <p className="text-xs text-slate-400 mt-1">Discover industry career openings and track active application timelines</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: Discover and Search Catalog */}
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Briefcase className="h-4.5 w-4.5 text-brand-cyan" /> Discover Openings
            </h3>
            <span className="text-[10px] bg-brand-cyan/20 text-brand-cyan px-2.5 py-0.5 rounded font-bold">
              {filteredDiscoverList.filter(i => !i.isApplied).length} Positions Available
            </span>
          </div>

          {/* Search bar and filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search company, skills, or role..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="glass-input pl-10 text-xs"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
              {['All', 'Remote', 'Paid', 'Software', 'AI', 'ECE'].map(tag => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                    filterTag === tag ? 'bg-brand-cyan text-slate-900' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {tag === 'Paid' ? 'Stipend > ₹30k' : tag}
                </button>
              ))}
            </div>
          </div>

          {/* Opportunities Cards List */}
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {filteredDiscoverList.filter(i => !i.isApplied).map(item => (
              <div 
                key={item.id} 
                onClick={() => setDetailOp(item)}
                className="glass-card p-5 border border-white/5 hover:border-brand-cyan/20 transition-all cursor-pointer flex justify-between items-start"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">💼</span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{item.role}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.company} • <span className="text-brand-cyan font-bold">{item.platform}</span></p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal line-clamp-2">{item.description}</p>
                  
                  <div className="flex gap-4 text-[10px] text-slate-500 pt-1 border-t border-white/5">
                    <div>💰 Stipend: <strong>{item.stipend}</strong></div>
                    <div>📍 Location: <strong>{item.locationText}</strong></div>
                  </div>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end justify-between h-full">
                  <span className="text-[10px] bg-brand-cyan/15 text-brand-cyan px-2.5 py-0.5 rounded font-bold uppercase">
                    {item.field}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailOp(item);
                    }}
                    className="mt-6 px-3 py-1 bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan rounded text-[10px] font-bold transition-all"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
            {filteredDiscoverList.filter(i => !i.isApplied).length === 0 && (
              <div className="text-center py-12 text-slate-500 italic text-sm border border-white/5 rounded-2xl bg-white/5">
                No matching open careers cataloged. Try resetting filters.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Pipelines & Timelines */}
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-brand-purple" /> Applied & Tracked
            </h3>
            <span className="text-[10px] bg-brand-purple/20 text-brand-neon px-2.5 py-0.5 rounded font-bold">
              {appliedList.length} Active Pipelines
            </span>
          </div>

          {/* Applied Cards list */}
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            {appliedList.map(item => {
              const isSelected = selectedApp?.id === item.id;
              return (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedApp(item)}
                  className={`glass-card p-5 border cursor-pointer hover:border-brand-purple/20 transition-all flex justify-between items-center ${
                    isSelected ? 'border-brand-purple/60 shadow-neon' : 'border-white/5'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-sm text-slate-200">{item.role}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.company}</p>
                    {item.deadline && (
                      <span className="text-[9px] text-slate-500 mt-1 inline-block">Closing Date: {item.deadline.split('T')[0]}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">
                      {item.status}
                    </span>
                    <button
                      onClick={(e) => handleUntrack(item.id, e)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-6 w-6 rounded-md flex items-center justify-center transition-all border border-transparent hover:border-red-500/20 font-bold"
                      title="Untrack Opportunity"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
            {appliedList.length === 0 && (
              <div className="text-center py-12 text-slate-500 italic text-sm border border-white/5 rounded-2xl bg-white/5">
                No active internship pipelines tracked. Apply to openings on the left or add a custom entry below!
              </div>
            )}
          </div>

          {/* Timeline node */}
          {selectedApp && (
            <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Timeline
                opportunityId={selectedApp.id.toString()}
                opportunityName={`${selectedApp.company} - ${selectedApp.role}`}
                stages={selectedApp.timeline || []}
                onUploadFile={handleUploadFile}
              />
            </div>
          )}

          {/* Custom Add Form */}
          <div className="glass-card p-6 border border-white/5 space-y-4">
            <h4 className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-brand-purple" /> Track External Application
            </h4>
            <form onSubmit={handleCreateCustomApp} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Company"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="glass-input text-xs"
                  required
                />
                <input
                  type="text"
                  placeholder="Role"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="glass-input text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={formDeadline}
                  onChange={e => setFormDeadline(e.target.value)}
                  className="glass-input text-xs"
                />
                <input
                  type="number"
                  placeholder="Match Score"
                  value={matchScore}
                  onChange={e => setMatchScore(Number(e.target.value))}
                  className="glass-input text-xs"
                />
              </div>
              <textarea
                placeholder="Description or notes..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="glass-input text-xs h-16 resize-none"
              />
              <button
                type="submit"
                className="w-full neon-button-purple py-2.5 rounded-xl font-bold text-xs tracking-wide"
              >
                Log Pipeline
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Slide-out details drawer overlay */}
      {detailOp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end" onClick={() => setDetailOp(null)}>
          <div className="w-full max-w-xl h-full bg-dark-800 border-l border-white/5 p-8 flex flex-col space-y-6 overflow-y-auto animate-in slide-in-from-right duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] bg-brand-cyan/20 text-brand-cyan px-2.5 py-0.5 rounded font-bold uppercase">
                  {detailOp.field} Internship
                </span>
                <h2 className="text-xl font-bold text-slate-200 mt-2">{detailOp.role}</h2>
                <p className="text-xs text-slate-400">{detailOp.company}</p>
              </div>
              <button className="text-slate-400 hover:text-white font-bold text-sm bg-white/5 h-8 w-8 rounded-full flex items-center justify-center" onClick={() => setDetailOp(null)}>✕</button>
            </div>

            <div className="border-t border-white/5 pt-6 space-y-4 text-xs text-slate-300">
              <div>
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[10px] mb-1.5">About the position</h4>
                <p className="leading-relaxed text-slate-400">{detailOp.aboutText || detailOp.description}</p>
              </div>

              {detailOp.tracks && (
                <div>
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[10px] mb-1.5">Curriculum modules</h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                    {detailOp.tracks.map((t, idx) => <li key={idx}>{t}</li>)}
                  </ul>
                </div>
              )}

              {detailOp.benefits && (
                <div>
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[10px] mb-1.5">Compensation & perks</h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                    {detailOp.benefits.map((b, idx) => <li key={idx}>{b}</li>)}
                  </ul>
                </div>
              )}
            </div>

            <div className="border-t border-white/5 pt-4 space-y-3.5 mt-auto">
              <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-[10px] text-slate-400 leading-normal space-y-1">
                <div className="font-bold text-slate-300">📌 Next Steps for Application:</div>
                <p>
                  1. Click below to open the portal and submit your resume/details.
                  <br />
                  2. We have added this to your local **Timeline Tracker** in the sidebar so you can upload documents and log interview dates.
                </p>
                <p className="text-[9px] text-slate-500 italic">
                  {detailOp.url ? '🟢 Direct link: Redirecting to official internship portal.' : 'ℹ️ Catalog example: Redirecting to platform homepage.'}
                </p>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Monthly Stipend</span>
                <span className="font-bold text-slate-200 text-base">{detailOp.stipend}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Location layout</span>
                <span className="font-bold text-slate-200">{detailOp.locationText}</span>
              </div>

              {detailOp.isApplied ? (
                <button className="w-full bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 py-3 rounded-xl font-bold text-xs uppercase" disabled>
                  ✓ Added to Tracker (Active in Sidebar)
                </button>
              ) : (
                <button
                  onClick={() => handleApplyFromCatalog(detailOp)}
                  className="w-full neon-button-cyan py-3 rounded-xl font-bold text-xs tracking-wide"
                >
                  Open Portal & Add to Tracker
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
