import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, Upload, Sparkles, CheckCircle, AlertCircle, 
  Copy, Check, RefreshCw, Award, BookOpen, AlertTriangle,
  FileCheck, ShieldAlert, ArrowRight, Eye, Link2, Globe, Flag
} from 'lucide-react';

export const Resume: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'score' | 'skills' | 'projects' | 'bullets' | 'letter'>('score');
  const [copied, setCopied] = useState(false);

  // Fetch analysis if resume already exists in profile
  const fetchAnalysis = async () => {
    if (!profile?.resume_text) return;
    setAnalyzing(true);
    setError(null);
    try {
      const res = await axios.get('/api/resume/analyze');
      setAnalysis(res.data);
    } catch (err: any) {
      console.error(err);
      setError('Could not fetch resume analysis. Try re-uploading your PDF.');
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    if (profile?.resume_text && !analysis && !analyzing) {
      fetchAnalysis();
    }
  }, [profile?.resume_text]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('/api/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setFile(null);
      await refreshProfile();
      
      // Trigger live analysis
      setAnalyzing(true);
      const res = await axios.get('/api/resume/analyze');
      setAnalysis(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to upload and parse resume. Ensure it is a valid PDF.');
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const handleCopy = () => {
    if (!analysis?.cover_letter) return;
    navigator.clipboard.writeText(analysis.cover_letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine score color classes
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5';
    if (score >= 60) return 'text-amber-400 border-amber-500/30 bg-amber-500/5';
    return 'text-red-400 border-red-500/30 bg-red-500/5';
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title block */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-200">ATS Resume Optimizer & AI Workspace</h2>
          <p className="text-xs text-slate-400 mt-1">Upload your PDF resume to extract credentials, check keyword compatibility, improve action verbs, and generate drafts.</p>
        </div>
        {profile?.resume_text && (
          <button 
            onClick={fetchAnalysis}
            disabled={analyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 text-[11px] text-slate-300 hover:bg-white/10 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${analyzing ? 'animate-spin' : ''}`} />
            <span>Re-analyze</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Zone & Text Preview */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 border border-white/5 text-center space-y-5">
            <div className="h-12 w-12 rounded-2xl bg-brand-violet/10 border border-brand-violet/20 flex items-center justify-center text-brand-neon mx-auto">
              <Upload className="h-5.5 w-5.5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-200 text-sm">Upload New Resume</h3>
              <p className="text-[10px] text-slate-400 mt-1">Accepts PDF files only. Maximum limit 5MB.</p>
            </div>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-28 border border-dashed border-white/10 rounded-xl cursor-pointer bg-dark-700/20 hover:bg-dark-700/40 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-4 pb-4 px-3 text-center">
                    <FileText className="h-7 w-7 text-slate-500 mb-1" />
                    <p className="text-[11px] text-slate-300 font-bold truncate max-w-full">{file ? file.name : 'Select local PDF file'}</p>
                  </div>
                  <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex gap-2 text-[10px] text-red-400 items-center justify-center leading-normal">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="text-left">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading || !file}
                className="w-full neon-button-purple py-3 rounded-xl font-bold text-xs tracking-wider disabled:opacity-50 disabled:active:scale-100 transition-all"
              >
                {uploading ? 'Processing PDF text...' : 'Upload & Analyze Resume'}
              </button>
            </form>
          </div>

          {/* Database File Memory Drawer Status */}
          {profile?.resume_text && (
            <div className="glass-card p-5 border border-white/5 space-y-3.5">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold border-b border-white/5 pb-2.5">
                <FileCheck className="h-4.5 w-4.5" />
                <span>Active Resume Stored in Profile</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                  <span>Document Snippet Drawer</span>
                  <Eye className="h-3 w-3" />
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-[10px] text-slate-400 leading-relaxed font-mono max-h-40 overflow-y-auto">
                  {profile.resume_text.substring(0, 400)}...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI ATS Analysis Workspace Hub */}
        <div className="lg:col-span-2">
          {analyzing ? (
            <div className="glass-card p-12 border border-white/5 flex flex-col items-center justify-center text-center space-y-4 h-[450px] justify-center">
              <RefreshCw className="h-8 w-8 text-brand-purple animate-spin" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-200">AI ATS Analyzer is Reasoning...</h4>
                <p className="text-xs text-slate-400 max-w-sm">Comparing resume keywords against top industry roles, evaluating action-verb metrics, and drafting personalized cover letters.</p>
              </div>
            </div>
          ) : analysis ? (
            <div className="glass-card p-6 border border-white/5 space-y-6 flex flex-col justify-between min-h-[500px]">
              {/* Tab Navigation header */}
              <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
                <button
                  onClick={() => setActiveTab('score')}
                  className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all border ${
                    activeTab === 'score' 
                      ? 'bg-brand-purple/20 border-brand-purple/40 text-brand-neon' 
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Score & Layout
                </button>
                <button
                  onClick={() => setActiveTab('skills')}
                  className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all border ${
                    activeTab === 'skills' 
                      ? 'bg-brand-purple/20 border-brand-purple/40 text-brand-neon' 
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Skills & Courses
                </button>
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all border ${
                    activeTab === 'projects' 
                      ? 'bg-brand-purple/20 border-brand-purple/40 text-brand-neon' 
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Projects Checkup
                </button>
                <button
                  onClick={() => setActiveTab('bullets')}
                  className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all border ${
                    activeTab === 'bullets' 
                      ? 'bg-brand-purple/20 border-brand-purple/40 text-brand-neon' 
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Bullet Enhancer
                </button>
                <button
                  onClick={() => setActiveTab('letter')}
                  className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all border ${
                    activeTab === 'letter' 
                      ? 'bg-brand-purple/20 border-brand-purple/40 text-brand-neon' 
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Letter & Speech
                </button>
              </div>

              {/* Tab Content Panels */}
              <div className="flex-1 py-2">
                {/* TAB 1: SCORE & LAYOUT */}
                {activeTab === 'score' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-6 items-center border-b border-white/5 pb-6">
                      {/* Radial Score Gauge */}
                      <div className={`h-24 w-24 shrink-0 rounded-full border-2 flex flex-col items-center justify-center font-extrabold ${getScoreColor(analysis.ats_score)}`}>
                        <span className="text-3xl">{analysis.ats_score}</span>
                        <span className="text-[10px] tracking-wider uppercase opacity-80">ATS Score</span>
                      </div>
                      
                      {/* Score Explanation */}
                      <div className="space-y-1 text-center sm:text-left">
                        <h4 className="text-sm font-extrabold text-white">Your ATS Compatibility Rating</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {analysis.ats_score >= 80 
                            ? 'Excellent! Your resume has a strong keyword density and matches target software engineering standards. It is ready to pass ATS screens.' 
                            : analysis.ats_score >= 60 
                            ? 'Good foundation, but lacks critical toolsets and action-oriented metrics. Add missing keywords and rewrite vague descriptors.'
                            : 'Caution: Score is low. We recommend checking section headings, adding essential toolsets, and expanding on impact.'}
                        </p>
                      </div>
                    </div>

                    {/* ATS formatting Checklist */}
                    <div className="space-y-3">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">ATS Layout Checkup:</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs">
                          <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                          <span>File Format Supported (PDF)</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs">
                          <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                          <span>Contact Information Present</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs">
                          <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                          <span>Standard Section Titles Used</span>
                        </div>
                        <div className={`flex items-center gap-2 p-3 rounded-lg text-xs ${analysis.formatting_issues?.length > 0 ? 'bg-amber-500/5 border-amber-500/20 text-amber-400' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'}`}>
                          {analysis.formatting_issues?.length > 0 ? (
                            <>
                              <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                              <span>{analysis.formatting_issues[0]}</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                              <span>Optimal Word Count Range</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Formatting Inconsistencies Warning box */}
                    {analysis.inconsistencies && analysis.inconsistencies.length > 0 && (
                      <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 space-y-2">
                        <span className="text-[10px] font-bold uppercase text-red-400 tracking-wider flex items-center gap-1.5">
                          <ShieldAlert className="h-4 w-4" /> Layout & Content Inconsistencies
                        </span>
                        <ul className="text-xs text-slate-300 list-disc pl-4 space-y-1.5 leading-relaxed">
                          {analysis.inconsistencies.map((issue: string, idx: number) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: SKILLS & COURSES */}
                {activeTab === 'skills' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Keywords Found */}
                      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-3">
                        <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" /> Detected Keywords ({analysis.skills_found?.length || 0})
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {analysis.skills_found && analysis.skills_found.map((skill: string, idx: number) => (
                            <span key={idx} className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Keywords Missing */}
                      <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 space-y-3">
                        <span className="text-[10px] font-bold uppercase text-red-400 tracking-wider flex items-center gap-1">
                          <ShieldAlert className="h-4 w-4" /> Recommended Missing Keywords ({analysis.skills_missing?.length || 0})
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {analysis.skills_missing && analysis.skills_missing.map((skill: string, idx: number) => (
                            <span key={idx} className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 border border-red-500/20 text-red-400">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Certification Recommendations Table */}
                    {analysis.certification_recommendations && analysis.certification_recommendations.length > 0 && (
                      <div className="space-y-3">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                          <Award className="h-4 w-4 text-brand-cyan" /> Recommended Certification Courses:
                        </span>
                        <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/2">
                          <table className="min-w-full divide-y divide-white/5 text-[11px] text-left">
                            <thead className="bg-white/5 font-extrabold text-slate-300">
                              <tr>
                                <th className="px-4 py-2 border-r border-white/5 font-bold uppercase tracking-wider">Skill Lacking Proof</th>
                                <th className="px-4 py-2 font-bold uppercase tracking-wider">Target Course / Exam to Take</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-slate-400">
                              {analysis.certification_recommendations.map((cert: any, idx: number) => (
                                <tr key={idx} className="hover:bg-white/2">
                                  <td className="px-4 py-2.5 border-r border-white/5 font-bold text-brand-cyan">{cert.skill}</td>
                                  <td className="px-4 py-2.5 italic text-slate-300">{cert.course}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: PROJECTS CHECKUP */}
                {activeTab === 'projects' && (
                  <div className="space-y-4">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                      <Link2 className="h-4 w-4 text-brand-purple" /> Project Link Verification:
                    </span>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {analysis.project_checkup && analysis.project_checkup.map((proj: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl border border-white/5 bg-white/2 space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <h4 className="font-extrabold text-white flex items-center gap-1.5">
                              <Globe className="h-3.5 w-3.5 text-brand-cyan" /> {proj.project}
                            </h4>
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                              {proj.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-normal pl-5">
                            {proj.recommendation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: BULLET ENHANCER */}
                {activeTab === 'bullets' && (
                  <div className="space-y-4">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Before & After Bullet Rewrites:</span>
                    
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                      {analysis.bullet_upgrades && analysis.bullet_upgrades.map((upgrade: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl border border-white/5 bg-white/2 space-y-3 text-xs">
                          {/* Original Weak Point */}
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase font-bold text-red-400 tracking-wider">Original Weak Description:</span>
                            <p className="text-slate-400 line-through pl-2 italic">"{upgrade.original}"</p>
                          </div>
                          
                          {/* Bullet Transition arrow */}
                          <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[9px] pl-2 uppercase">
                            <ArrowRight className="h-3 w-3 text-brand-cyan" /> Upgraded with Action Verbs & Metrics:
                          </div>

                          {/* Upgraded Strong Point */}
                          <div className="flex justify-between items-start gap-4 p-2.5 rounded-lg bg-brand-cyan/5 border border-brand-cyan/10">
                            <p className="text-slate-200 font-medium leading-relaxed pl-1">
                              {upgrade.upgraded}
                            </p>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(upgrade.upgraded);
                              }}
                              className="p-1 rounded bg-white/5 border border-white/5 text-slate-400 hover:text-white active:scale-90 transition-all shrink-0"
                              title="Copy Upgraded Bullet"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 5: LETTER & SPEECH */}
                {activeTab === 'letter' && (
                  <div className="space-y-6">
                    {/* Oral Language Suggestion box */}
                    {analysis.language_suggestions && analysis.language_suggestions.length > 0 && (
                      <div className="p-4 rounded-xl bg-brand-purple/10 border border-brand-purple/20 space-y-2">
                        <span className="text-[10px] font-bold uppercase text-brand-neon tracking-wider flex items-center gap-1.5">
                          <Flag className="h-4 w-4 text-brand-neon" /> Language Proficiency Suggestions
                        </span>
                        <ul className="text-xs text-slate-300 list-disc pl-4 space-y-1.5 leading-relaxed">
                          {analysis.language_suggestions.map((s: string, idx: number) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Cover Letter Editor */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Drafted Cover Letter:</span>
                        <button
                          onClick={handleCopy}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-cyan/15 border border-brand-cyan/25 text-[10px] font-bold text-brand-cyan hover:bg-brand-cyan/20 active:scale-95 transition-all"
                        >
                          {copied ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy Letter</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-4 rounded-xl bg-dark-700/50 border border-white/5 text-xs text-slate-300 font-medium leading-relaxed max-h-[220px] overflow-y-auto whitespace-pre-line font-mono select-all">
                        {analysis.cover_letter}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary stats footer */}
              <div className="h-10 border-t border-white/5 pt-4 flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                <span>ATS Grading Standards: 2026 Edition</span>
                <span>Coordinated: Resume Agent</span>
              </div>
            </div>
          ) : (
            <div className="glass-card border border-white/5 flex flex-col items-center justify-center text-center p-12 h-[450px] space-y-6">
              <div className="h-16 w-16 rounded-full bg-brand-violet/5 border border-brand-violet/10 flex items-center justify-center text-brand-neon shadow-neon">
                <FileText className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-200 text-sm">No Resume Review Available</h4>
                <p className="text-xs text-slate-400 max-w-sm leading-normal">
                  Your AI resume workspace is currently empty. Upload your PDF resume in the left panel, and our AI nodes will analyze your text.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
