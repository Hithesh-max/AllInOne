import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GraduationCap, Plus, Calendar, Clock, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Timeline from '../components/Timeline';
import { initialScholarships } from '../data';

interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: string;
  deadline: string;
  description: string;
  aboutText: string;
  locationText: string;
  teamSize: string;
  platform: string;
  registeredCount: number;
  benefits?: string[];
  tracks?: string[];
  isApplied: boolean;
  eligibility: {
    categories: string[];
    incomeLimit: number;
    states: string[];
    genders: string[];
    degrees: string[];
    years: string[];
  };
  timeline?: Array<{ stageName: string; status: 'Completed' | 'Pending' | 'Failed' | 'Not Yet'; deadline?: string; daysLeft?: number; details?: string; fileNameRequired?: string; fileUploaded?: boolean }>;
}

interface DbScholarship {
  id: number;
  name: string;
  criteria: string | null;
  status: string;
  deadline: string | null;
  notes: string | null;
  timeline: Array<{ stageName: string; status: 'Completed' | 'Pending' | 'Failed' | 'Not Yet'; deadline?: string; daysLeft?: number; details?: string; fileNameRequired?: string; fileUploaded?: boolean }>;
}

export const Scholarships: React.FC = () => {
  const { profile: authProfile } = useAuth();
  
  const [discoverList, setDiscoverList] = useState<Scholarship[]>([]);
  const [appliedList, setAppliedList] = useState<DbScholarship[]>([]);
  
  // Local profile state for eligibility survey
  const [surveyCategory, setSurveyCategory] = useState('General');
  const [surveyIncome, setSurveyIncome] = useState(250000);
  const [surveyState, setSurveyState] = useState('Karnataka');
  const [surveyGender, setSurveyGender] = useState('Male');
  const [surveyDegree, setSurveyDegree] = useState('BTech');
  const [surveyYear, setSurveyYear] = useState('3rd');

  // States for forms and details
  const [customName, setCustomName] = useState('');
  const [customCriteria, setCustomCriteria] = useState('');
  const [customDeadline, setCustomDeadline] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  
  const [selectedSchol, setSelectedSchol] = useState<DbScholarship | null>(null);
  const [detailOp, setDetailOp] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync with authProfile on mount
  useEffect(() => {
    if (authProfile) {
      setSurveyCategory(authProfile.category || 'General');
      setSurveyState(authProfile.state || 'Karnataka');
      setSurveyGender(authProfile.gender || 'Male');
      setSurveyDegree(authProfile.degree || 'BTech');
      setSurveyYear(authProfile.year || '3rd');
    }
  }, [authProfile]);

  const fetchDbScholarships = async () => {
    try {
      const res = await axios.get('/api/scholarships');
      const dbList = res.data;
      setAppliedList(dbList);

      // Sync isApplied flag dynamically for all items in discover list
      setDiscoverList(prev => prev.map(d => ({
        ...d,
        isApplied: dbList.some((item: any) => item.name === d.name)
      })));

      if (selectedSchol) {
        const fresh = dbList.find((item: DbScholarship) => item.id === selectedSchol.id);
        if (fresh) setSelectedSchol(fresh);
      }
    } catch (err) {
      console.error("Failed to load db scholarships", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      const res = await axios.get('/api/scholarships');
      const dbList = res.data;
      setAppliedList(dbList);
      
      const discoverRes = await axios.get('/api/discover/scholarships');
      const apiDiscoverList = discoverRes.data.map((s: any) => ({
        id: s.id.toString(),
        name: s.name,
        provider: s.provider,
        platform: "Web",
        description: s.description,
        fee: 0,
        teamSize: "Solo",
        registeredCount: 0,
        locationText: "Global",
        aboutText: s.description,
        amount: s.amount || "Varies",
        deadline: s.deadline || "Rolling",
        isApplied: dbList.some((item: any) => item.name === s.name),
        url: s.url || "",
        eligibility: {
          categories: ["General", "OBC", "SC", "ST", "Minority", "EWS"],
          incomeLimit: 1000000,
          states: ["All"],
          genders: ["All"],
          degrees: ["All"],
          years: ["All"]
        },
        timeline: [
          { stageName: "Application Submission", status: "Pending", details: "Complete your document submissions." },
          { stageName: "Document Verification", status: "Pending", deadline: s.deadline, details: "Wait for provider to verify documents." }
        ]
      }));
      setDiscoverList(apiDiscoverList as any);
      setLoading(false);
    };
    init();
  }, []);

  const handleCreateCustomSchol = async (e: React.FormEvent) => {
    e.preventDefault();
    const defaultTimeline = [
      { stageName: "Application Submitted", status: "Completed", details: "Logged manually" },
      { stageName: "Review Board", status: "Pending", deadline: customDeadline || undefined, details: "Awaiting documents check" }
    ];
    try {
      await axios.post('/api/scholarships', {
        name: customName,
        criteria: customCriteria || null,
        status: 'Applied',
        deadline: customDeadline || null,
        notes: customNotes || null,
        timeline: defaultTimeline
      });
      setCustomName('');
      setCustomCriteria('');
      setCustomDeadline('');
      setCustomNotes('');
      fetchDbScholarships();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyFromCatalog = async (item: Scholarship) => {
    const defaultTimeline = item.timeline || [
      { 
        stageName: "Application Submission", 
        status: "Pending", 
        details: "Complete your document submissions and submit application on the portal. Once submitted, click 'Mark Stage as Completed' below.",
        fileNameRequired: "submission_receipt.pdf"
      },
      { 
        stageName: "Nodal Verification", 
        status: "Pending", 
        deadline: item.deadline, 
        details: "Wait for college coordinator nodal review and board validation." 
      },
      {
        stageName: "State/Trust Board Merit Review",
        status: "Pending",
        details: "Academic scholarship board reviews applications based on income tier and CGPA merit listings."
      },
      {
        stageName: "Document Match Authentication",
        status: "Pending",
        details: "Provide final bank account link details and pass matching checks.",
        fileNameRequired: "bank_details_confirmation.pdf"
      },
      {
        stageName: "Grant Disbursal & Fund Transfer",
        status: "Pending",
        details: "Scholarship fund transfer complete. Log your award disbursal details."
      }
    ];
    try {
      // Split the ISO date to YYYY-MM-DD so that FastAPI/Pydantic validation doesn't throw a 422 error!
      const formattedDate = item.deadline ? item.deadline.split('T')[0] : null;

      await axios.post('/api/scholarships', {
        name: item.name,
        criteria: `Max Income Limit: ₹${item.eligibility.incomeLimit.toLocaleString('en-IN')}`,
        status: 'In Progress',
        deadline: formattedDate,
        notes: item.description,
        timeline: defaultTimeline
      });
      
      await fetchDbScholarships();
      
      // Auto-close details drawer so the new sidebar timeline becomes visible!
      setDetailOp(null);

      // Open the exact link where we found it!
      const targetUrl = item.url || "https://scholarships.gov.in/";
      window.open(targetUrl, '_blank');
    } catch (err) {
      console.error("Failed to apply scholarship from catalog", err);
    }
  };

  const handleUntrack = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axios.delete(`/api/scholarships/${id}`);
      if (selectedSchol?.id === id) {
        setSelectedSchol(null);
      }
      await fetchDbScholarships();
    } catch (err) {
      console.error("Failed to untrack scholarship", err);
    }
  };

  const handleUploadFile = async (opportunityId: string, stageName: string, fileName: string) => {
    if (!selectedSchol) return;
    
    const updatedTimeline = selectedSchol.timeline.map(stage => {
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
      const res = await axios.put(`/api/scholarships/${selectedSchol.id}`, {
        ...selectedSchol,
        timeline: updatedTimeline
      });
      setSelectedSchol(res.data);
      fetchDbScholarships();
    } catch (err) {
      console.error("Failed to update scholarship stages", err);
    }
  };

  // Dynamic eligibility calculations based on survey filters
  const eligibleDiscoverList = discoverList.filter(s => {
    const matchesCategory = s.eligibility.categories.includes(surveyCategory) || s.eligibility.categories.includes('All');
    const matchesIncome = surveyIncome <= s.eligibility.incomeLimit;
    const matchesState = s.eligibility.states.includes('All') || s.eligibility.states.includes(surveyState);
    const matchesGender = s.eligibility.genders.includes('All') || s.eligibility.genders.includes(surveyGender);
    const matchesDegree = s.eligibility.degrees.includes('All') || s.eligibility.degrees.includes(surveyDegree);
    const matchesYear = s.eligibility.years.includes('All') || s.eligibility.years.includes(surveyYear);

    return matchesCategory && matchesIncome && matchesState && matchesGender && matchesDegree && matchesYear;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-200">Scholarship & Financial Aid</h2>
        <p className="text-xs text-slate-400 mt-1">Verify post-matric limits, state quotas, and family income eligibility checklists</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SURVEY FILTER PROFILE SURVEY */}
        <div className="glass-card p-6 border border-white/5 space-y-5 h-fit">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-brand-cyan" /> Eligibility Profile Survey
          </h3>
          <div className="space-y-3.5 text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Social Category</label>
              <select 
                value={surveyCategory} 
                onChange={e => setSurveyCategory(e.target.value)} 
                className="glass-input"
              >
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
                <option value="Minority">Minority</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Annual Family Income (INR)</label>
              <input
                type="number"
                value={surveyIncome}
                onChange={e => setSurveyIncome(Number(e.target.value))}
                className="glass-input"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 inline-block">Limit check: ₹{surveyIncome.toLocaleString('en-IN')}</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">State of Domicile</label>
              <select 
                value={surveyState} 
                onChange={e => setSurveyState(e.target.value)} 
                className="glass-input"
              >
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Delhi">Delhi</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Gender</label>
              <select 
                value={surveyGender} 
                onChange={e => setSurveyGender(e.target.value)} 
                className="glass-input"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Degree course</label>
              <select 
                value={surveyDegree} 
                onChange={e => setSurveyDegree(e.target.value)} 
                className="glass-input"
              >
                <option value="BTech">B.Tech Engineering</option>
                <option value="MBA">MBA Management</option>
                <option value="MCA">MCA Computer Apps</option>
                <option value="Diploma">Polytechnic Diploma</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Study Year</label>
              <select 
                value={surveyYear} 
                onChange={e => setSurveyYear(e.target.value)} 
                className="glass-input"
              >
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
              </select>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 leading-normal border-t border-white/5 pt-4">
            ℹ️ Filter results are updated in real-time. Matches are calculated automatically against state quotas, gender reservations, and income ceilings.
          </div>
        </div>

        {/* MID COLUMN: Discover Eligible List */}
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <GraduationCap className="h-4.5 w-4.5 text-brand-cyan" /> Eligible Programs
            </h3>
            <span className="text-[10px] bg-brand-cyan/25 text-brand-cyan px-2.5 py-0.5 rounded font-bold">
              {eligibleDiscoverList.filter(s => !s.isApplied).length} Matches
            </span>
          </div>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {eligibleDiscoverList.filter(s => !s.isApplied).map(item => (
              <div 
                key={item.id} 
                onClick={() => setDetailOp(item)}
                className="glass-card p-5 border border-white/5 hover:border-brand-cyan/20 transition-all cursor-pointer space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-slate-200">{item.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.provider}</p>
                  </div>
                  <span className="text-[10px] bg-brand-cyan/15 text-brand-cyan px-2 py-0.5 rounded font-bold whitespace-nowrap">
                    {item.amount}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                <div className="flex justify-between items-center pt-2 border-t border-white/5 text-[10px] text-slate-500">
                  <span>Income Limit: <strong className="text-slate-400">₹{item.eligibility.incomeLimit.toLocaleString('en-IN')}</strong></span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailOp(item);
                    }}
                    className="px-2 py-0.5 bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan rounded font-bold"
                  >
                    View details
                  </button>
                </div>
              </div>
            ))}
            {eligibleDiscoverList.filter(s => !s.isApplied).length === 0 && (
              <div className="text-center py-12 text-slate-500 italic text-xs border border-white/5 rounded-2xl bg-white/5">
                No eligible scholarship programs found matching your current survey options.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Database Applications & Timeline */}
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-brand-purple" /> Tracked Applications
            </h3>
            <span className="text-[10px] bg-brand-purple/20 text-brand-neon px-2.5 py-0.5 rounded font-bold">
              {appliedList.length} Applied
            </span>
          </div>

          <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1">
            {appliedList.map(item => {
              const isSelected = selectedSchol?.id === item.id;
              return (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedSchol(item)}
                  className={`glass-card p-5 border cursor-pointer hover:border-brand-purple/20 transition-all flex justify-between items-center ${
                    isSelected ? 'border-brand-purple/60 shadow-neon' : 'border-white/5'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-sm text-slate-200">{item.name}</h4>
                    {item.deadline && <span className="text-[9px] text-slate-500 mt-1 inline-block">Deadline: {item.deadline.split('T')[0]}</span>}
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
              <div className="text-center py-12 text-slate-500 italic text-xs border border-white/5 rounded-2xl bg-white/5">
                No active scholarship applications tracked. Click Apply on eligible items or log one manually below!
              </div>
            )}
          </div>

          {/* Timeline Node */}
          {selectedSchol && (
            <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Timeline
                opportunityId={selectedSchol.id.toString()}
                opportunityName={selectedSchol.name}
                stages={selectedSchol.timeline || []}
                onUploadFile={handleUploadFile}
              />
            </div>
          )}

          {/* Log Custom Form */}
          <div className="glass-card p-6 border border-white/5 space-y-4">
            <h4 className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-brand-purple" /> Track External Aid Program
            </h4>
            <form onSubmit={handleCreateCustomSchol} className="space-y-3">
              <input
                type="text"
                placeholder="Program Name"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                className="glass-input text-xs"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Qualifying Criteria"
                  value={customCriteria}
                  onChange={e => setCustomCriteria(e.target.value)}
                  className="glass-input text-xs"
                />
                <input
                  type="date"
                  value={customDeadline}
                  onChange={e => setCustomDeadline(e.target.value)}
                  className="glass-input text-xs"
                />
              </div>
              <textarea
                placeholder="Notes or document guidelines..."
                value={customNotes}
                onChange={e => setCustomNotes(e.target.value)}
                className="glass-input text-xs h-16 resize-none"
              />
              <button
                type="submit"
                className="w-full neon-button-purple py-2.5 rounded-xl font-bold text-xs tracking-wide"
              >
                Log Program
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
                  Scholarship Opportunity
                </span>
                <h2 className="text-xl font-bold text-slate-200 mt-2">{detailOp.name}</h2>
                <p className="text-xs text-slate-400">{detailOp.provider}</p>
              </div>
              <button className="text-slate-400 hover:text-white font-bold text-sm bg-white/5 h-8 w-8 rounded-full flex items-center justify-center" onClick={() => setDetailOp(null)}>✕</button>
            </div>

            <div className="border-t border-white/5 pt-6 space-y-4 text-xs text-slate-300">
              <div>
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[10px] mb-1.5">About the program</h4>
                <p className="leading-relaxed text-slate-400">{detailOp.aboutText || detailOp.description}</p>
              </div>

              {detailOp.eligibility && (
                <div className="p-3.5 rounded-xl bg-brand-cyan/5 border border-brand-cyan/20 space-y-2">
                  <div className="font-bold text-slate-200">Strict Eligibility Constraints:</div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                    <div>Category: <strong>{detailOp.eligibility.categories.join(', ')}</strong></div>
                    <div>Domicile States: <strong>{detailOp.eligibility.states.join(', ')}</strong></div>
                    <div>Income Cap: <strong>₹{detailOp.eligibility.incomeLimit.toLocaleString('en-IN')} / year</strong></div>
                    <div>Degree: <strong>{detailOp.eligibility.degrees.join(', ')}</strong></div>
                  </div>
                </div>
              )}

              {detailOp.benefits && (
                <div>
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[10px] mb-1.5">Grant Rewards</h4>
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
                  1. Click below to open the portal and submit your documents.
                  <br />
                  2. We have added this to your local **Timeline Tracker** in the sidebar so you can upload document receipts and track verification stages.
                </p>
                <p className="text-[9px] text-slate-500 italic">
                  {detailOp.url ? '🟢 Direct link: Redirecting to official scholarship portal.' : 'ℹ️ Catalog example: Redirecting to platform homepage.'}
                </p>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Financial Aid Grant Value</span>
                <span className="font-bold text-slate-200 text-base">{detailOp.amount}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Registration deadline</span>
                <span className="font-bold text-slate-200">{detailOp.deadline.split('T')[0]}</span>
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
