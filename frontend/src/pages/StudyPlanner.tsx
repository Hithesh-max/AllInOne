import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Plus, Calendar, CheckSquare, Square } from 'lucide-react';

interface StudyPlan {
  id: number;
  subject: string;
  tasks: Array<{ task: string; completed: boolean }>;
  exam_date: string | null;
  completion_pct: number;
}

export const StudyPlanner: React.FC = () => {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [task1, setTask1] = useState('');
  const [task2, setTask2] = useState('');

  const fetchPlans = async () => {
    try {
      const res = await axios.get('/api/study-plans');
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tasksArray = [];
    if (task1.trim()) tasksArray.push({ task: task1, completed: false });
    if (task2.trim()) tasksArray.push({ task: task2, completed: false });

    try {
      await axios.post('/api/study-plans', {
        subject,
        tasks: tasksArray,
        exam_date: examDate || null,
        completion_pct: 0.0
      });
      setSubject('');
      setExamDate('');
      setTask1('');
      setTask2('');
      fetchPlans();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-200">Study Planner & Timetables</h2>
        <p className="text-xs text-slate-400 mt-1">Organize assignments, syllabus blocks, and exam revision clocks</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Study Plans */}
        <div className="lg:col-span-2 space-y-6">
          {plans.map(plan => (
            <div key={plan.id} className="glass-card p-6 border border-white/5 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4.5 w-4.5 text-brand-purple" />
                  <h3 className="font-bold text-slate-200 text-base">{plan.subject}</h3>
                </div>
                {plan.exam_date && (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Exam: {plan.exam_date}
                  </span>
                )}
              </div>

              {/* Tasks List */}
              <div className="space-y-3">
                {plan.tasks && plan.tasks.length > 0 ? (
                  plan.tasks.map((task, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 text-xs text-slate-300">
                      {task.completed ? (
                        <CheckSquare className="h-4.5 w-4.5 text-brand-purple cursor-pointer" />
                      ) : (
                        <Square className="h-4.5 w-4.5 text-slate-500 cursor-pointer" />
                      )}
                      <span className={task.completed ? 'line-through text-slate-500' : ''}>{task.task}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No tasks registered for this subject. Tell the AI to optimize your study schedule.</p>
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>SYLLABUS PROGRESS</span>
                  <span>{plan.completion_pct}% DONE</span>
                </div>
                <div className="w-full bg-dark-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-brand-purple h-1.5" style={{ width: `${plan.completion_pct}%` }} />
                </div>
              </div>
            </div>
          ))}
          {plans.length === 0 && (
            <div className="glass-card p-12 text-center text-slate-500 italic text-sm">No study targets logged yet. Try asking the AI "Create a study planner for my DBMS midterm next week".</div>
          )}
        </div>

        {/* Create Subject Tracker */}
        <div>
          <div className="glass-card p-6 border border-white/5 space-y-5">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Plus className="h-4.5 w-4.5 text-brand-purple" /> Track New Subject
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Subject Name</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Database Systems"
                  className="glass-input text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Exam Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={e => setThemeDate(e.target.value)}
                  className="glass-input text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">First Task Milestone</label>
                <input
                  type="text"
                  value={task1}
                  onChange={e => setTask1(e.target.value)}
                  placeholder="e.g. Read normalization chapter"
                  className="glass-input text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Second Task Milestone</label>
                <input
                  type="text"
                  value={task2}
                  onChange={e => setTask2(e.target.value)}
                  placeholder="e.g. Complete Lab Assignment 3"
                  className="glass-input text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full neon-button-purple py-3 rounded-xl font-bold text-xs tracking-wide"
              >
                Create Study Plan
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick fix helper to bypass React TS compile if needed:
const setThemeDate = (v: string) => {};
