import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Plus, Calendar, Clock, Sparkles } from 'lucide-react';
import Timeline from '../components/Timeline';
import { initialContests } from '../data';

interface CodingContest {
  id: string;
  title: string;
  host: string;
  platform: string;
  description: string;
  fee: number;
  teamSize: string;
  registeredCount: number;
  locationText: string;
  aboutText?: string;
  tracks?: string[];
  benefits?: string[];
  isApplied: boolean;
  date: string;
  time: string;
  duration: string;
  contestPlatform: string;
  timeline?: Array<{ stageName: string; status: 'Completed' | 'Pending' | 'Failed' | 'Not Yet'; deadline?: string; daysLeft?: number; details?: string; fileNameRequired?: string; fileUploaded?: boolean }>;
}

export const Contests: React.FC = () => {
  const [contests, setContests] = useState<CodingContest[]>([]);
  const [platformFilter, setPlatformFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedContest, setSelectedContest] = useState<CodingContest | null>(null);
  const [detailOp, setDetailOp] = useState<CodingContest | null>(null);

  useEffect(() => {
    // Load contests from initial dataset
    const loaded = initialContests.map(c => ({
      ...c,
      timeline: c.timeline || [
        { stageName: "Registration", status: "Completed", details: "Contest entry confirmed" },
        { stageName: "Contest Live", status: "Pending", deadline: `${c.date}T${c.time}:00Z`, details: "Solve algorithmic problems" }
      ]
    }));
    setContests(loaded);
  }, []);

  const handleRegister = (contestId: string) => {
    setContests(prev => prev.map(c => {
      if (c.id === contestId) {
        return {
          ...c,
          isApplied: true,
          registeredCount: c.registeredCount + 1
        };
      }
      return c;
    }));
    
    // Update selected and drawer states if open
    if (selectedContest?.id === contestId) {
      setSelectedContest(prev => prev ? { ...prev, isApplied: true, registeredCount: prev.registeredCount + 1 } : null);
    }
    if (detailOp?.id === contestId) {
      setDetailOp(prev => prev ? { ...prev, isApplied: true, registeredCount: prev.registeredCount + 1 } : null);
    }
  };

  const filteredContests = contests.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.host.toLowerCase().includes(search.toLowerCase());
    const matchPlatform = platformFilter === 'All' || c.contestPlatform === platformFilter;
    return matchSearch && matchPlatform;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-200">👨💻 Coding Contests Hub</h2>
        <p className="text-xs text-slate-400 mt-1">Check weekly competitive coding rounds from Codeforces, LeetCode, CodeChef, and AtCoder</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Search and Discover */}
        <div className="lg:col-span-2 space-y-6">
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
            <input
              type="text"
              placeholder="Search contests..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="glass-input text-xs max-w-xs"
            />
            <div className="flex gap-2 overflow-x-auto max-w-full">
              {['All', 'Codeforces', 'LeetCode', 'CodeChef', 'HackerRank', 'AtCoder'].map(plat => (
                <button
                  key={plat}
                  onClick={() => setPlatformFilter(plat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    platformFilter === plat ? 'bg-brand-purple text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {plat}
                </button>
              ))}
            </div>
          </div>

          {/* List of Contests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredContests.map(contest => {
              const isSelected = selectedContest?.id === contest.id;
              return (
                <div
                  key={contest.id}
                  onClick={() => setSelectedContest(contest)}
                  className={`p-5 rounded-2xl bg-dark-700/40 border transition-all cursor-pointer space-y-4 hover:border-brand-purple/20 ${
                    isSelected ? 'border-brand-purple/60 shadow-neon' : 'border-white/5'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{contest.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{contest.host}</p>
                    </div>
                    <span className="text-[10px] bg-brand-purple/20 text-brand-neon px-2.5 py-0.5 rounded font-bold">
                      {contest.contestPlatform}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">{contest.description}</p>

                  <div className="text-[10px] text-slate-500 grid grid-cols-2 gap-2 border-t border-white/5 pt-3">
                    <div>🕒 Date: {contest.date} @ {contest.time}</div>
                    <div>⏳ Duration: {contest.duration}</div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] text-slate-400">
                      👥 {contest.registeredCount.toLocaleString()} coders
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailOp(contest);
                      }}
                      className="px-3 py-1 bg-brand-purple/10 text-brand-neon hover:bg-brand-purple/20 rounded text-[10px] font-bold"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline Node */}
          {selectedContest && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Timeline
                opportunityId={selectedContest.id}
                opportunityName={selectedContest.title}
                stages={selectedContest.timeline || []}
                onUploadFile={() => {}}
              />
            </div>
          )}
        </div>

        {/* Right: Enrolled Contests */}
        <div className="space-y-6">
          <div className="glass-card p-6 border border-white/5 space-y-4">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-brand-purple" /> Enrolled Contests
            </h3>
            <div className="space-y-3">
              {contests.filter(c => c.isApplied).map(contest => (
                <div key={contest.id} className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-xs text-slate-200">{contest.title}</h5>
                    <p className="text-[9px] text-slate-400 mt-0.5">{contest.date} @ {contest.time}</p>
                  </div>
                  <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">
                    Registered
                  </span>
                </div>
              ))}
              {contests.filter(c => c.isApplied).length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500 italic">No enrolled contests yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Slide-out details drawer overlay */}
      {detailOp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end" onClick={() => setDetailOp(null)}>
          <div className="w-full max-w-xl h-full bg-dark-800 border-l border-white/5 p-8 flex flex-col space-y-6 overflow-y-auto animate-in slide-in-from-right duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] bg-brand-purple/20 text-brand-neon px-2.5 py-0.5 rounded font-bold">
                  {detailOp.contestPlatform}
                </span>
                <h2 className="text-xl font-bold text-slate-200 mt-2">{detailOp.title}</h2>
                <p className="text-xs text-slate-400">{detailOp.host}</p>
              </div>
              <button className="text-slate-400 hover:text-white font-bold text-sm bg-white/5 h-8 w-8 rounded-full flex items-center justify-center" onClick={() => setDetailOp(null)}>✕</button>
            </div>

            <div className="border-t border-white/5 pt-6 space-y-4 text-xs text-slate-300">
              <div>
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[10px] mb-1.5">About the contest</h4>
                <p className="leading-relaxed text-slate-400">{detailOp.aboutText || detailOp.description}</p>
              </div>

              {detailOp.tracks && (
                <div>
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[10px] mb-1.5">Duration and divisions</h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                    {detailOp.tracks.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              )}

              {detailOp.benefits && (
                <div>
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[10px] mb-1.5">Leaderboard Rewards</h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                    {detailOp.benefits.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                </div>
              )}
            </div>

            <div className="border-t border-white/5 pt-6 space-y-4 mt-auto">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Enrolled Coders</span>
                <span className="font-bold text-slate-200">{detailOp.registeredCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Participation Slot</span>
                <span className="font-bold text-slate-200">{detailOp.teamSize}</span>
              </div>

              {detailOp.isApplied ? (
                <button className="w-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 py-3 rounded-xl font-bold text-xs uppercase" disabled>
                  ✓ Registered & Confirmed
                </button>
              ) : (
                <button
                  onClick={() => handleRegister(detailOp.id)}
                  className="w-full neon-button-purple py-3 rounded-xl font-bold text-xs tracking-wide"
                >
                  Register Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
