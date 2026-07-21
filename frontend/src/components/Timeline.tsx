'use client';

import React, { useState } from 'react';
import { Calendar, Upload, Check, Link2, Globe, Clock, Award } from 'lucide-react';
import type { TimelineStage } from '../data';

interface TimelineProps {
  opportunityId: string;
  opportunityName: string;
  stages: TimelineStage[];
  onUploadFile: (opportunityId: string, stageName: string, fileName: string) => void;
}

export default function Timeline({ opportunityId, opportunityName, stages, onUploadFile }: TimelineProps) {
  const [uploadingStage, setUploadingStage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  if (!stages || stages.length === 0) return null;

  // Helper to extract date codes dynamically to match the Unstop layout
  const getTimelineDateDetails = (stageName: string, deadline?: string) => {
    const name = stageName.toLowerCase();
    
    // Exact mapping for IKIGAI 2026 Indore timeline
    if (name.includes("round 1") || name.includes("online idea")) {
      return { day: "30", month: "Jun", rangeText: "30 Jun 26, 12:00 AM IST → 25 Jul 26, 11:59 PM IST" };
    }
    if (name.includes("screening") || name.includes("shortlisting")) {
      return { day: "30", month: "Jul", rangeText: "30 Jul 26, 12:00 AM IST → 05 Aug 26, 12:00 AM IST" };
    }
    if (name.includes("round 2") || name.includes("grand finale")) {
      return { day: "21", month: "Aug", rangeText: "21 Aug 26, 12:00 AM IST → 23 Aug 26, 12:00 AM IST" };
    }

    // Default parser for other opportunities
    if (deadline) {
      const d = new Date(deadline);
      if (!isNaN(d.getTime())) {
        return {
          day: String(d.getDate()),
          month: d.toLocaleString('en-US', { month: 'short' }),
          rangeText: d.toLocaleString('en-US', { 
            month: 'short', day: 'numeric', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
          })
        };
      }
    }
    return { day: "15", month: "Jul", rangeText: "15 Jul 26 → 30 Jul 26" };
  };

  const handleManualComplete = (stageName: string, fileNameRequired?: string) => {
    onUploadFile(opportunityId, stageName, fileNameRequired || 'receipt_verified.pdf');
  };

  const handleUploadSimulate = (stageName: string, fileName: string) => {
    setUploadingStage(stageName);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadingStage(null);
            onUploadFile(opportunityId, stageName, fileName);
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  // Determine platform name dynamically based on project names
  const getPlatformLabel = () => {
    const name = opportunityName.toLowerCase();
    if (name.includes("national scholarship") || name.includes("pragati") || name.includes("nsp")) {
      return "NSP Portal";
    }
    if (name.includes("reliance") || name.includes("tata") || name.includes("hdfc") || name.includes("buddy4study")) {
      return "Buddy4Study";
    }
    if (name.includes("imagine cup") || name.includes("devpost")) {
      return "Devpost";
    }
    if (name.includes("bengal") || name.includes("devfolio")) {
      return "Devfolio";
    }
    return "unstop";
  };

  return (
    <div className="glass-card p-6 border border-white/5 space-y-6">
      {/* Title block */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h3 className="font-extrabold text-sm text-slate-200">{opportunityName}</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Stages and deadline tracks synced with official listings.</p>
        </div>
        <span className="px-2.5 py-1 rounded bg-brand-cyan/20 border border-brand-cyan/30 text-[9px] font-bold text-brand-cyan uppercase tracking-wider">
          {stages.every(s => s.status === 'Completed') ? 'Finished' : 'In Progress'}
        </span>
      </div>

      {/* Vertical Timeline Stack */}
      <div className="space-y-8 relative pl-1">
        {stages.map((stage, idx) => {
          const dateInfo = getTimelineDateDetails(stage.stageName, stage.deadline);
          const isCompleted = stage.status === 'Completed';
          const isPending = stage.status === 'Pending';
          const isUploading = uploadingStage === stage.stageName;

          return (
            <div key={idx} className="flex gap-5 items-start relative">
              {/* Date Bubble Column on Left */}
              <div className="flex flex-col items-center shrink-0 w-12 select-none relative">
                <div className={`w-11 h-11 rounded-xl border flex flex-col items-center justify-center text-center font-extrabold text-[10px] z-10 transition-all ${
                  isCompleted 
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-md shadow-emerald-500/10' 
                    : isPending
                    ? 'bg-brand-cyan/15 border-brand-cyan/40 text-brand-cyan shadow-md shadow-brand-cyan/10 animate-pulse'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}>
                  <span className="text-xs leading-none font-bold">{dateInfo.day}</span>
                  <span className="uppercase text-[8px] leading-none mt-0.5 font-extrabold">{dateInfo.month}</span>
                </div>

                {/* Vertical Dotted connector line */}
                {idx < stages.length - 1 && (
                  <div className={`absolute top-11 bottom-[-32px] w-[2px] border-l-2 border-dashed z-0 ${
                    isCompleted ? 'border-emerald-500/30' : 'border-white/10'
                  }`} />
                )}
              </div>

              {/* Detail Card on Right */}
              <div className={`flex-1 glass-card p-5 border transition-all relative hover:bg-white/[0.02] ${
                isCompleted 
                  ? 'border-emerald-500/15' 
                  : isPending
                  ? 'border-brand-cyan/30 shadow-md shadow-brand-cyan/5 bg-brand-cyan/[0.01]'
                  : 'border-white/5'
              }`}>
                {/* Card Header */}
                <div className="flex justify-between items-start gap-4 mb-2.5">
                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      {dateInfo.rangeText}
                    </div>
                    <h4 className="font-extrabold text-xs text-slate-200">{stage.stageName}</h4>
                  </div>
                  {/* Platform Badge */}
                  <span className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-bold text-slate-400">
                    On <span className="text-brand-cyan font-extrabold capitalize">{getPlatformLabel()}</span>
                  </span>
                </div>

                {/* Body Text */}
                <div className="text-[11px] text-slate-400 leading-relaxed whitespace-pre-line space-y-1">
                  {stage.details}
                </div>

                {/* Interactive Action Buttons block */}
                <div className="pt-3.5 border-t border-white/5 mt-3 flex flex-wrap gap-2 items-center">
                  {isCompleted ? (
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg">
                      <Check className="h-3.5 w-3.5" />
                      <span>STAGE COMPLETED & VERIFIED</span>
                    </div>
                  ) : (
                    <>
                      {stage.fileNameRequired && (
                        <button
                          disabled={isUploading}
                          onClick={() => handleUploadSimulate(stage.stageName, stage.fileNameRequired || 'receipt.pdf')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-cyan/15 border border-brand-cyan/25 text-[10px] font-bold text-brand-cyan hover:bg-brand-cyan/20 active:scale-95 transition-all disabled:opacity-50"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          <span>{isUploading ? `Uploading ${uploadProgress}%...` : `Submit ${stage.fileNameRequired}`}</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleManualComplete(stage.stageName, stage.fileNameRequired)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 hover:bg-white/10 active:scale-95 transition-all"
                      >
                        <span>Mark Completed</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
