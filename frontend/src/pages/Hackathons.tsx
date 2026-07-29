import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Plus, Calendar, Clock, Search, ShieldCheck, UserCheck } from 'lucide-react';
import Timeline from '../components/Timeline';
import { initialHackathons } from '../data';

interface Hackathon {
  id: string;
  title: string;
  host: string;
  platform: string;
  description: string;
  fee: number;
  teamSize: string;
  registeredCount: number;
  locationText: string;
  aboutText: string;
  tracks?: string[];
  benefits?: string[];
  tags: string[];
  mode: 'Online' | 'Offline';
  scale: 'College' | 'National' | 'International';
  registrationDeadline: string;
  date: string;
  url: string;
  isApplied: boolean;
  timeline?: Array<{ stageName: string; status: 'Completed' | 'Pending' | 'Failed' | 'Not Yet'; deadline?: string; daysLeft?: number; details?: string; fileNameRequired?: string; fileUploaded?: boolean }>;
}

interface DbHackathon {
  id: number;
  name: string;
  dates: string | null;
  status: string;
  team_status: string;
  notes: string | null;
  timeline: Array<{ stageName: string; status: 'Completed' | 'Pending' | 'Failed' | 'Not Yet'; deadline?: string; daysLeft?: number; details?: string; fileNameRequired?: string; fileUploaded?: boolean }>;
}

export const Hackathons: React.FC = () => {
  const [discoverList, setDiscoverList] = useState<Hackathon[]>([]);
  const [appliedList, setAppliedList] = useState<DbHackathon[]>([]);
  
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('All');
  
  // States for forms and details
  const [name, setName] = useState('');
  const [formDates, setFormDates] = useState('');
  const [teamStatus, setTeamStatus] = useState('Solo');
  const [notes, setNotes] = useState('');
  
  const [selectedHack, setSelectedHack] = useState<DbHackathon | null>(null);
  const [detailOp, setDetailOp] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDbRegistrations = async () => {
    try {
      const res = await axios.get('/api/hackathons');
      const dbList = res.data;
      setAppliedList(dbList);

      // Sync isApplied flag dynamically for all items in discover list
      setDiscoverList(prev => prev.map(d => ({
        ...d,
        isApplied: dbList.some((item: any) => item.name === d.title)
      })));

      if (selectedHack) {
        const fresh = dbList.find((item: DbHackathon) => item.id === selectedHack.id);
        if (fresh) setSelectedHack(fresh);
      }
    } catch (err) {
      console.error("Failed to load db hackathons", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      const res = await axios.get('/api/hackathons');
      const dbList = res.data;
      setAppliedList(dbList);
      
      const discoverRes = await axios.get('/api/discover/hackathons');
      const apiDiscoverList = discoverRes.data.map((h: any) => ({
        id: h.id.toString(),
        title: h.title,
        host: h.host,
        platform: h.platform,
        description: h.description,
        fee: 0,
        teamSize: "Any",
        registeredCount: 0,
        locationText: h.mode || "Online",
        aboutText: h.description,
        tracks: [],
        benefits: [],
        isApplied: dbList.some((item: any) => item.name === h.title),
        tags: h.tags || [],
        mode: h.mode || "Online",
        scale: h.scale || "Global",
        registrationDeadline: h.registration_deadline || "",
        date: h.date || "",
        url: h.url || "",
        timeline: [
          { stageName: "Registration", status: "Pending", details: "Complete registration on platform." },
          { stageName: "Idea Submission", status: "Pending", deadline: h.registration_deadline, details: "Submit your solution." }
        ]
      }));
      setDiscoverList(apiDiscoverList as any);
      setLoading(false);
    };
    init();
  }, []);

  const handleCreateCustomHack = async (e: React.FormEvent) => {
    e.preventDefault();
    const defaultTimeline = [
      { stageName: "Registration", status: "Completed", details: "Registered manually" },
      { stageName: "Idea PPT Submission", status: "Pending", deadline: formDates || undefined, details: "Submit solution proposal slide deck" }
    ];
    try {
      await axios.post('/api/hackathons', {
        name,
        dates: formDates || null,
        status: 'Registered',
        team_status: teamStatus,
        notes: notes || null,
        timeline: defaultTimeline
      });
      setName('');
      setFormDates('');
      setNotes('');
      fetchDbRegistrations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyFromCatalog = async (item: Hackathon) => {
    const defaultTimeline = item.timeline || [
      { 
        stageName: "Registration & Fee Payment", 
        status: "Pending", 
        details: `Complete registration and pay the ${item.fee === 0 ? 'Free' : `₹${item.fee}`} fee on Unstop/Portal. Once complete, click 'Mark Stage as Completed' below.` 
      },
      { 
        stageName: "Idea PPT Submission", 
        status: "Pending", 
        deadline: item.registrationDeadline, 
        details: "Submit your solution pitch deck or source repository link.",
        fileNameRequired: "proposal_deck.pdf"
      },
      {
        stageName: "Prototype Development & Git Code",
        status: "Pending",
        details: "Build the code prototype and submit your active GitHub repository URL or project codebase.",
        fileNameRequired: "github_repo_link.txt"
      },
      {
        stageName: "Pre-Finalist Evaluation",
        status: "Pending",
        details: "Technical jury audits code submissions and shortlists teams for physical rounds."
      },
      {
        stageName: "Grand Finale Presentation",
        status: "Pending",
        details: "Travel to the final venue chapter for physical live demo pitching and award winners selection."
      }
    ];
    try {
      let formattedDate = null;
      if (item.registrationDeadline && item.registrationDeadline !== "Rolling") {
        try {
          formattedDate = new Date(item.registrationDeadline).toISOString().split('T')[0];
        } catch(e) {}
      }

      const targetUrl = item.url || "https://unstop.com";
      const newWindow = window.open('about:blank', '_blank');

      await axios.post('/api/hackathons', {
        name: item.title,
        status: 'Registered',
        date: formattedDate || item.date,
        notes: item.description,
        timeline: defaultTimeline
      });
      
      await fetchDbRegistrations();
      setDetailOp(null);

      if (newWindow) {
        newWindow.location.href = targetUrl;
      } else {
        window.open(targetUrl, '_blank');
      }
    } catch (err) {
      console.error("Failed to register from catalog", err);
    }
  };

  const handleUntrack = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axios.delete(`/api/hackathons/${id}`);
      if (selectedHack?.id === id) {
        setSelectedHack(null);
      }
      await fetchDbRegistrations();
    } catch (err) {
      console.error("Failed to untrack hackathon", err);
    }
  };

  const handleUploadFile = async (opportunityId: string, stageName: string, fileName: string) => {
    if (!selectedHack) return;
    
    const updatedTimeline = selectedHack.timeline.map(stage => {
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
      const res = await axios.put(`/api/hackathons/${selectedHack.id}`, {
        ...selectedHack,
        timeline: updatedTimeline
      });
      setSelectedHack(res.data);
      fetchDbRegistrations();
    } catch (err) {
      console.error("Failed to update hackathon stages timeline", err);
    }
  };

  const filteredDiscoverList = discoverList.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || item.host.toLowerCase().includes(search.toLowerCase());
    
    if (filterTag === 'All') return matchesSearch;
    return matchesSearch && item.tags.includes(filterTag);
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-200">National & Global Hackathons</h2>
        <p className="text-xs text-slate-400 mt-1">Discover team competitions on Devpost and track active registration milestones</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: Discover and Search Catalog */}
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Award className="h-4.5 w-4.5 text-brand-violet" /> Discover Hackathons
            </h3>
            <span className="text-[10px] bg-brand-violet/20 text-brand-neon px-2.5 py-0.5 rounded font-bold">
              {filteredDiscoverList.filter(i => !i.isApplied).length} Competitions Open
            </span>
          </div>

          {/* Search bar and filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search hackathons, technologies, or hosts..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="glass-input pl-10 text-xs"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
              {['All', 'AI', 'Web Dev', 'Blockchain', 'Open Innovation', 'Healthcare', 'Hardware', 'IoT'].map(tag => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                    filterTag === tag ? 'bg-brand-violet text-white animate-pulse' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Cards List */}
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {filteredDiscoverList.filter(i => !i.isApplied).map(item => (
              <div 
                key={item.id} 
                onClick={() => setDetailOp(item)}
                className="glass-card p-5 border border-white/5 hover:border-brand-violet/25 transition-all cursor-pointer flex justify-between items-start"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🏆</span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{item.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.host} • <span className="text-brand-neon font-bold">{item.platform}</span></p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal line-clamp-2">{item.description}</p>
                  
                  <div className="flex gap-4 text-[10px] text-slate-500 pt-1 border-t border-white/5">
                    <div>💰 Entry: <strong>{item.fee === 0 ? 'Free' : `₹${item.fee}`}</strong></div>
                    <div>👥 Size: <strong>{item.teamSize}</strong></div>
                    <div>⏳ Deadline: <strong>{item.registrationDeadline ? item.registrationDeadline.split('T')[0] : "Rolling"}</strong></div>
                  </div>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end justify-between h-full">
                  <span className="text-[10px] bg-brand-violet/15 text-brand-neon px-2.5 py-0.5 rounded font-bold uppercase">
                    {item.scale}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailOp(item);
                    }}
                    className="mt-6 px-3 py-1 bg-brand-violet/10 hover:bg-brand-violet/20 text-brand-neon rounded text-[10px] font-bold transition-all"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
            {filteredDiscoverList.filter(i => !i.isApplied).length === 0 && (
              <div className="text-center py-12 text-slate-500 italic text-sm border border-white/5 rounded-2xl bg-white/5">
                No matching hackathons cataloged. Try resetting tags.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Registrations & Timelines */}
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-brand-cyan" /> Registered Competitions
            </h3>
            <span className="text-[10px] bg-brand-cyan/20 text-brand-cyan px-2.5 py-0.5 rounded font-bold">
              {appliedList.length} Tracks Active
            </span>
          </div>

          {/* Applied Cards list */}
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            {appliedList.map(item => {
              const isSelected = selectedHack?.id === item.id;
              return (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedHack(item)}
                  className={`glass-card p-5 border cursor-pointer hover:border-brand-cyan/20 transition-all flex justify-between items-center ${
                    isSelected ? 'border-brand-cyan/60 shadow-cyan' : 'border-white/5'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-sm text-slate-200">{item.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Dates: {item.dates || 'Awaited'}</p>
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-500 mt-1">
                      <UserCheck className="h-3 w-3" />
                      <span>{item.team_status}</span>
                    </div>
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
                No active registrations tracked. Apply to hackathons on the left or add a custom competition below!
              </div>
            )}
          </div>

          {/* Timeline node */}
          {selectedHack && (
            <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Timeline
                opportunityId={selectedHack.id.toString()}
                opportunityName={selectedHack.name}
                stages={selectedHack.timeline || []}
                onUploadFile={handleUploadFile}
              />
            </div>
          )}

          {/* Custom Add Form */}
          <div className="glass-card p-6 border border-white/5 space-y-4">
            <h4 className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-brand-cyan" /> Track External Competition
            </h4>
            <form onSubmit={handleCreateCustomHack} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Hackathon Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="glass-input text-xs"
                  required
                />
                <input
                  type="text"
                  placeholder="Event Dates"
                  value={formDates}
                  onChange={e => setFormDates(e.target.value)}
                  className="glass-input text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Participation Slot</label>
                <select
                  value={teamStatus}
                  onChange={e => setTeamStatus(e.target.value)}
                  className="glass-input text-xs"
                >
                  <option value="Solo">Solo Entry</option>
                  <option value="Looking for Team">Looking for Team</option>
                  <option value="Team Formed">Team Formed</option>
                </select>
              </div>
              <textarea
                placeholder="Description or notes..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="glass-input text-xs h-16 resize-none"
              />
              <button
                type="submit"
                className="w-full neon-button-cyan py-2.5 rounded-xl font-bold text-xs tracking-wide"
              >
                Log Competition
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
                <span className="text-[10px] bg-brand-violet/20 text-brand-neon px-2.5 py-0.5 rounded font-bold uppercase">
                  {detailOp.scale} Hackathon
                </span>
                <h2 className="text-xl font-bold text-slate-200 mt-2">{detailOp.title}</h2>
                <p className="text-xs text-slate-400">{detailOp.host}</p>
              </div>
              <button className="text-slate-400 hover:text-white font-bold text-sm bg-white/5 h-8 w-8 rounded-full flex items-center justify-center" onClick={() => setDetailOp(null)}>✕</button>
            </div>

            <div className="border-t border-white/5 pt-6 space-y-4 text-xs text-slate-300">
              <div>
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[10px] mb-1.5">About the competition</h4>
                <p className="leading-relaxed text-slate-400">{detailOp.aboutText || detailOp.description}</p>
              </div>

              {detailOp.tracks && (
                <div>
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[10px] mb-1.5">Tracks & categories</h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                    {detailOp.tracks.map((t, idx) => <li key={idx}>{t}</li>)}
                  </ul>
                </div>
              )}

              {detailOp.benefits && (
                <div>
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[10px] mb-1.5">Prizes & Bounties</h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                    {detailOp.benefits.map((b, idx) => <li key={idx}>{b}</li>)}
                  </ul>
                </div>
              )}
            </div>

            <div className="border-t border-white/5 pt-4 space-y-3.5 mt-auto">
              <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-[10px] text-slate-400 leading-normal space-y-1">
                <div className="font-bold text-slate-300">📌 Next Steps for Registration:</div>
                <p>
                  {detailOp.fee > 0 
                    ? `1. Click below to open the portal and complete the ₹${detailOp.fee} fee payment.` 
                    : '1. Click below to register on the external portal (free).'
                  }
                  <br />
                  2. We have added this to your local **Timeline Tracker** in the sidebar so you can upload documents and log milestones.
                </p>
                <p className="text-[9px] text-slate-500 italic">
                  {detailOp.url ? '🟢 Direct link: Redirecting to official hackathon listing.' : 'ℹ️ Catalog example: Redirecting to platform homepage.'}
                </p>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Registration Fee</span>
                <span className="font-bold text-slate-200 text-base">{detailOp.fee === 0 ? 'Free' : `₹${detailOp.fee}`}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Event Dates</span>
                <span className="font-bold text-slate-200">{detailOp.date}</span>
              </div>

              {detailOp.isApplied ? (
                <button className="w-full bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 py-3 rounded-xl font-bold text-xs uppercase" disabled>
                  ✓ Added to Tracker (Active in Sidebar)
                </button>
              ) : (
                <button
                  onClick={() => handleApplyFromCatalog(detailOp)}
                  className="w-full neon-button-purple py-3 rounded-xl font-bold text-xs tracking-wide"
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
