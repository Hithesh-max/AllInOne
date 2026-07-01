import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FileText, Upload, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

export const Resume: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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
      const res = await axios.post('/api/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(res.data);
      setFile(null);
      await refreshProfile();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to upload and parse resume. Make sure it is a valid PDF.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-200">ATS Resume Optimizer</h2>
        <p className="text-xs text-slate-400 mt-1">Upload your PDF resume to extract text, check keyword matches, and generate cover letters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Zone & Text Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8 border border-white/5 text-center space-y-5">
            <div className="h-14 w-14 rounded-2xl bg-brand-violet/10 border border-brand-violet/20 flex items-center justify-center text-brand-neon mx-auto">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-200 text-base">Select Resume File</h3>
              <p className="text-xs text-slate-400 mt-1">Only PDF format resumes are accepted. Maximum size 5MB.</p>
            </div>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-white/10 rounded-xl cursor-pointer bg-dark-700/20 hover:bg-dark-700/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileText className="h-8 w-8 text-slate-500 mb-2" />
                    <p className="text-xs text-slate-300 font-semibold">{file ? file.name : 'Choose local file'}</p>
                  </div>
                  <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex gap-2 text-xs text-red-400 items-center justify-center">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading || !file}
                className="w-full neon-button-purple py-3.5 rounded-xl font-bold text-xs tracking-wide disabled:opacity-50"
              >
                {uploading ? 'Parsing PDF text...' : 'Upload & Analyze Resume'}
              </button>
            </form>
          </div>

          {/* Parsed Snippet or confirmation */}
          {result && (
            <div className="glass-card p-6 border border-white/5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <CheckCircle className="h-4.5 w-4.5" />
                <span>Successfully Parsed: {result.filename}</span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Extracted Snippet preview:</p>
                <p className="text-xs text-slate-400 leading-relaxed italic truncate-3-lines">
                  "{result.extracted_text_snippet}..."
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Improvements Report Panel */}
        <div>
          <div className="glass-card p-6 border border-white/5 space-y-6">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-brand-purple" /> AI ATS Improvement Report
            </h3>

            {profile?.resume_text ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Current ATS Score:</span>
                    <span className="text-sm font-bold text-brand-cyan">78 / 100</span>
                  </div>
                  <div className="w-full bg-dark-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-brand-cyan h-2" style={{ width: '78%' }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Recommended Upgrades:</span>
                  <ul className="text-xs text-slate-400 space-y-2 leading-relaxed pl-4 list-disc">
                    <li>Add keyword **CI/CD** or **Docker** (High density demand for backend roles).</li>
                    <li>Add description of a **microservices project** involving Redis caches.</li>
                    <li>Rewrite bullet points starting with strong action verbs (e.g. *Optimized*, *Architected*).</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Drafted Cover Letter:</span>
                  <div className="p-3 rounded-lg bg-dark-700/50 border border-white/5 text-[11px] text-slate-400 leading-normal max-h-32 overflow-y-auto">
                    Dear Hiring Manager, 

                    I am thrilled to submit my application for the Software Engineer Intern role. Having analyzed my credentials including skills in Python and React, I believe I can bring immediate value to your core development squads...
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500 italic leading-normal">
                No resume is currently stored in your memory drawer. Upload a PDF resume above to start optimizing your credentials.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
