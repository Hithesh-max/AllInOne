import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  BookOpen, Plus, Calendar, CheckSquare, Square, Play, Pause, RotateCcw, 
  Sparkles, GraduationCap, Flame, Award, BarChart2, Shield, Settings, 
  FileText, Brain, Volume2, Clock, Trash2, CheckCircle2, AlertCircle, 
  Layers, Code, ChevronRight, Music, MonitorOff, Compass, Map, HelpCircle, 
  PlusCircle, BookOpenCheck, Loader, Target, Globe, Table
} from 'lucide-react';

interface StudyPlan {
  id: number;
  subject: string;
  tasks: Array<{ task: string; completed: boolean }>;
  exam_date: string | null;
  completion_pct: number;
}

// 1. STUDYVERSE INTERACTIVE GALAXY COMPONENT
const StudyVerseGalaxy: React.FC<{ plans: StudyPlan[]; onToggleTask: (plan: StudyPlan, idx: number) => void }> = ({ plans, onToggleTask }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<StudyPlan | null>(null);
  const [particles, setParticles] = useState<Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width;
    let height = canvas.height;
    let animId: number;

    const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#fbbf24', '#ec4899', '#3b82f6'];
    
    let planets = plans.map((plan, idx) => {
      const orbitRadius = 75 + idx * 38;
      const angle = (idx * (Math.PI * 2)) / Math.max(1, plans.length) + Math.random() * 0.5;
      const speed = 0.003 - idx * 0.0003;
      
      const moons = plan.tasks.map((t, mIdx) => ({
        name: t.task,
        completed: t.completed,
        angle: (mIdx * (Math.PI * 2)) / Math.max(1, plan.tasks.length),
        orbitRadius: 18 + mIdx * 5,
        speed: 0.015 + mIdx * 0.002
      }));

      return {
        ...plan,
        color: colors[idx % colors.length],
        orbitRadius,
        angle,
        speed,
        moons
      };
    });

    let currentParticles = [...particles];
    let shipAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw Starfield Background
      ctx.fillStyle = '#030303';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      for (let i = 0; i < 40; i++) {
        const x = (Math.sin(i * 12948) * 0.5 + 0.5) * width;
        const y = (Math.cos(i * 84920) * 0.5 + 0.5) * height;
        ctx.fillRect(x, y, 1, 1);
      }

      // Center Star (Semester Core)
      const cx = width / 2;
      const cy = height / 2;
      const gradient = ctx.createRadialGradient(cx, cy, 5, cx, cy, 25);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.3, '#fbbf24');
      gradient.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, 25, 0, Math.PI * 2);
      ctx.fill();

      // Label Center
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 8px Outfit, Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("SEMESTER CORE", cx, cy - 30);

      // Draw Orbits, Planets & Moons
      planets.forEach((p, idx) => {
        p.angle += p.speed;

        const px = cx + Math.cos(p.angle) * p.orbitRadius;
        const py = cy + Math.sin(p.angle) * p.orbitRadius;

        // Draw Orbit Line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, p.orbitRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw Constellation link if completed
        if (p.completion_pct > 0 && idx < planets.length - 1) {
          const nextAngle = planets[idx + 1].angle + planets[idx + 1].speed;
          const nxtx = cx + Math.cos(nextAngle) * planets[idx + 1].orbitRadius;
          const nxty = cy + Math.sin(nextAngle) * planets[idx + 1].orbitRadius;
          ctx.strokeStyle = `rgba(6, 182, 212, ${0.1 * (p.completion_pct / 100)})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(nxtx, nxty);
          ctx.stroke();
        }

        // Draw Planet
        ctx.beginPath();
        ctx.arc(px, py, 11, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = p.completion_pct > 50 ? 12 : 3;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Planet text
        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 9px Outfit, sans-serif';
        ctx.fillText(p.subject.substring(0, 10), px, py - 16);

        // Draw Moons
        p.moons.forEach(m => {
          m.angle += m.speed;
          const mx = px + Math.cos(m.angle) * m.orbitRadius;
          const my = py + Math.sin(m.angle) * m.orbitRadius;

          ctx.beginPath();
          ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = m.completed ? '#06b6d4' : '#64748b';
          if (m.completed) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#06b6d4';
          }
          ctx.fill();
          ctx.shadowBlur = 0;

          // Orbit guide
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
          ctx.beginPath();
          ctx.arc(px, py, m.orbitRadius, 0, Math.PI * 2);
          ctx.stroke();
        });
      });

      // Draw Spaceship
      shipAngle += 0.01;
      const sx = cx + Math.cos(shipAngle) * 110;
      const sy = cy + Math.sin(shipAngle) * 110;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(shipAngle + Math.PI / 2);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(-4, 4);
      ctx.lineTo(4, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Emit spaceship exhaust particles
      if (Math.random() > 0.4) {
        currentParticles.push({
          x: sx - Math.cos(shipAngle) * 6,
          y: sy - Math.sin(shipAngle) * 6,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          life: 25,
          color: '#8b5cf6'
        });
      }

      // Draw particles
      currentParticles.forEach((part, index) => {
        part.x += part.vx;
        part.y += part.vy;
        part.life--;

        ctx.fillStyle = part.color;
        ctx.globalAlpha = part.life / 25;
        ctx.beginPath();
        ctx.arc(part.x, part.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;
      currentParticles = currentParticles.filter(p => p.life > 0);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [plans]);

  return (
    <div className="glass-card p-6 border border-white/5 flex flex-col md:flex-row gap-6 relative overflow-hidden group">
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-200 text-base flex items-center gap-1.5">
            <Brain className="h-4.5 w-4.5 text-brand-purple" /> StudyVerse Galaxy Visualizer
          </h3>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
            Your semester syllabus rendered as a solar system. Each planet is a subject, and its moons represent active study milestones.
          </p>
        </div>

        {/* Selected Planet Details Panel */}
        <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/5 min-h-[140px] flex flex-col justify-between">
          {selectedPlanet ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
                <span className="font-bold text-slate-200 text-xs">{selectedPlanet.subject}</span>
                <span className="text-[9px] bg-brand-cyan/25 text-brand-cyan px-2 py-0.5 rounded font-bold">{selectedPlanet.completion_pct}% complete</span>
              </div>
              <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                {selectedPlanet.tasks.map((t, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => onToggleTask(selectedPlanet, idx)}
                    className="flex items-center gap-2 text-[10px] text-slate-300 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {t.completed ? <CheckCircle2 className="h-3 w-3 text-brand-cyan shrink-0" /> : <div className="h-3 w-3 rounded bg-white/5 border border-white/10 shrink-0" />}
                    <span className={t.completed ? 'line-through text-slate-500' : ''}>{t.task}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 italic text-xs py-8">
              <span>Select a subject from the list below or click subject badges to zoom.</span>
            </div>
          )}
        </div>

        <div className="flex gap-4 text-[10px] text-slate-400 pt-4 border-t border-white/5 mt-4">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-brand-cyan" /> Moon = Task</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-brand-purple" /> Planet = Subject</span>
        </div>
      </div>

      <div className="relative shrink-0 mx-auto">
        <canvas 
          ref={canvasRef} 
          width={280} 
          height={280} 
          className="rounded-2xl border border-white/5 bg-dark-900 shadow-inner" 
        />
        {/* Galaxy quick controls */}
        <div className="absolute bottom-2.5 right-2.5 flex gap-2">
          {plans.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setSelectedPlanet(p)}
              className="h-5 px-2 bg-white/5 border border-white/5 hover:border-brand-purple/20 text-[9px] font-bold text-slate-300 rounded hover:text-brand-neon"
            >
              P{i+1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// 2. HIGHLY ADVANCED INTERACTIVE CANVAS MIND MAP (Spring Physics, Draggable Nodes, Pulse Links)
interface PhysicsNode {
  id: number;
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  isRoot?: boolean;
}

interface PhysicsLink {
  from: number;
  to: number;
}

const InteractiveMindMap: React.FC<{ 
  nodes: PhysicsNode[]; 
  links: PhysicsLink[];
  setNodes: React.Dispatch<React.SetStateAction<PhysicsNode[]>>;
  newNodeText: string;
  setNewNodeText: (text: string) => void;
  onAddNode: () => void;
}> = ({ nodes, links, setNodes, newNodeText, setNewNodeText, onAddNode }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragNodeIdRef = useRef<number | null>(null);
  const mousePosRef = useRef({ x: 0, y: 0 });

  const nodesRef = useRef<PhysicsNode[]>([]);
  const linksRef = useRef<PhysicsLink[]>([]);

  useEffect(() => {
    nodesRef.current = JSON.parse(JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    linksRef.current = JSON.parse(JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = canvas.width;
    let height = canvas.height;
    let pulseOffset = 0;

    const tick = () => {
      pulseOffset = (pulseOffset + 0.01) % 1.0;

      const kSpring = 0.02; 
      const restLength = 100; 
      const kRepel = 300; 

      // 1. Repulsion
      for (let i = 0; i < nodesRef.current.length; i++) {
        for (let j = i + 1; j < nodesRef.current.length; j++) {
          const n1 = nodesRef.current[i];
          const n2 = nodesRef.current[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 130) {
            const force = kRepel / (dist * dist);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (n1.id !== dragNodeIdRef.current) {
              n1.vx -= fx;
              n1.vy -= fy;
            }
            if (n2.id !== dragNodeIdRef.current) {
              n2.vx += fx;
              n2.vy += fy;
            }
          }
        }
      }

      // 2. Attraction
      linksRef.current.forEach(l => {
        const fromNode = nodesRef.current.find(n => n.id === l.from);
        const toNode = nodesRef.current.find(n => n.id === l.to);
        if (!fromNode || !toNode) return;

        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - restLength) * kSpring;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (fromNode.id !== dragNodeIdRef.current) {
          fromNode.vx += fx;
          fromNode.vy += fy;
        }
        if (toNode.id !== dragNodeIdRef.current) {
          toNode.vx -= fx;
          toNode.vy -= fy;
        }
      });

      // 3. Move nodes
      nodesRef.current.forEach(n => {
        if (n.id === dragNodeIdRef.current) {
          n.x = mousePosRef.current.x;
          n.y = mousePosRef.current.y;
          n.vx = 0;
          n.vy = 0;
          return;
        }

        n.vx *= 0.85;
        n.vy *= 0.85;
        n.x += n.vx;
        n.y += n.vy;

        const padding = 35;
        if (n.x < padding) { n.x = padding; n.vx = -n.vx * 0.5; }
        if (n.x > width - padding) { n.x = width - padding; n.vx = -n.vx * 0.5; }
        if (n.y < padding) { n.y = padding; n.vy = -n.vy * 0.5; }
        if (n.y > height - padding) { n.y = height - padding; n.vy = -n.vy * 0.5; }
      });

      // Draw Grid
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 25;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      // Draw Links
      linksRef.current.forEach(l => {
        const fromNode = nodesRef.current.find(n => n.id === l.from);
        const toNode = nodesRef.current.find(n => n.id === l.to);
        if (!fromNode || !toNode) return;

        ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();

        const px = fromNode.x + (toNode.x - fromNode.x) * pulseOffset;
        const py = fromNode.y + (toNode.y - fromNode.y) * pulseOffset;
        ctx.fillStyle = '#06b6d4';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#06b6d4';
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Nodes
      nodesRef.current.forEach(n => {
        const textWidth = ctx.measureText(n.text).width;
        const bubbleW = Math.max(n.radius * 2, textWidth + 18);
        const bubbleH = 22;

        ctx.save();
        ctx.translate(n.x, n.y);

        ctx.fillStyle = n.isRoot ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)';
        ctx.strokeStyle = n.id === dragNodeIdRef.current ? '#06b6d4' : (n.isRoot ? '#8b5cf6' : 'rgba(255, 255, 255, 0.15)');
        ctx.lineWidth = 1.5;
        
        ctx.shadowBlur = n.id === dragNodeIdRef.current ? 12 : (n.isRoot ? 6 : 0);
        ctx.shadowColor = n.isRoot ? '#8b5cf6' : '#06b6d4';

        ctx.beginPath();
        ctx.roundRect(-bubbleW / 2, -bubbleH / 2, bubbleW, bubbleH, 6);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 9px Outfit, Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.text, n.x, n.y);
      });

      animId = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(animId);
  }, []);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    const clickedNode = nodesRef.current.find(n => {
      const dx = n.x - pos.x;
      const dy = n.y - pos.y;
      return Math.sqrt(dx * dx + dy * dy) < 40;
    });

    if (clickedNode) {
      dragNodeIdRef.current = clickedNode.id;
      mousePosRef.current = pos;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragNodeIdRef.current !== null) {
      mousePosRef.current = getMousePos(e);
    }
  };

  const handleMouseUp = () => {
    dragNodeIdRef.current = null;
  };

  return (
    <div className="glass-card p-6 border border-white/5 space-y-4">
      <div>
        <h3 className="font-bold text-xs text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
          <Brain className="h-4.5 w-4.5 text-brand-purple" /> Physics-based Draggable Mind Map
        </h3>
        <p className="text-[10px] text-slate-500">Drag concepts around using your mouse—spring linkages will keep nodes organically spaced.</p>
      </div>

      <div className="relative">
        <canvas 
          ref={canvasRef} 
          width={580} 
          height={260} 
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="rounded-2xl border border-white/5 bg-dark-950/80 cursor-grab active:cursor-grabbing shadow-inner w-full" 
        />
        <span className="absolute bottom-2.5 left-3 text-[8px] text-slate-500 font-medium">Click and drag nodes to structure your targets</span>
      </div>

      <div className="flex gap-2">
        <input 
          type="text" 
          value={newNodeText} 
          onChange={e => setNewNodeText(e.target.value)} 
          placeholder="Enter a topic to generate AI Mind Map (e.g. Data Structures, Fourier, OS)..." 
          className="glass-input text-xs" 
          onKeyDown={e => {
            if (e.key === 'Enter') onAddNode();
          }}
        />
        <button 
          onClick={onAddNode}
          className="neon-button-purple px-4 py-2.5 rounded-xl text-xs font-bold shrink-0"
        >
          Generate Mind Map
        </button>
      </div>
    </div>
  );
};

// 3. MARKDOWN RENDER CONVERTER FOR AI TUTOR ANSWERS
const parseMarkdownToHtml = (text: string): string => {
  if (!text) return '';
  let html = text;

  // Render headers
  html = html.replace(/^### (.*$)/gim, '<h4 class="font-bold text-brand-cyan mt-3 mb-1 text-xs">$1</h4>');
  html = html.replace(/^## (.*$)/gim, '<h3 class="font-bold text-brand-purple mt-4 mb-1.5 text-sm">$1</h3>');
  html = html.replace(/^# (.*$)/gim, '<h2 class="font-bold text-brand-neon mt-5 mb-2.5 text-base">$1</h2>');

  // Render bold text
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-100 font-extrabold">$1</strong>');

  // Render bullet lists
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc text-slate-300 my-0.5">$1</li>');

  // Split and format regular paragraph texts
  const lines = html.split('\n');
  const processed = lines.map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('<h') || trimmed.startsWith('<li') || trimmed === '') {
      return line;
    }
    return `<p class="mb-2 text-slate-300 leading-relaxed text-xs">${line}</p>`;
  });

  return processed.join('\n');
};

export const StudyPlanner: React.FC = () => {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [taskList, setTaskList] = useState<string[]>([]);
  const [newTaskInput, setNewTaskInput] = useState('');

  // Persistent user syllabus & goals
  const [userSyllabus, setUserSyllabus] = useState(() => {
    return localStorage.getItem('study_syllabus') || 'Syllabus: Fourier Transform theory, Binary search trees, process CPU scheduling algorithms.';
  });
  const [userGoals, setUserGoals] = useState(() => {
    return localStorage.getItem('study_goals') || 'Master Fourier graphs, solve 15 tree problems, prepare for operating systems viva.';
  });
  const [collegeTimetable, setCollegeTimetable] = useState(() => {
    return localStorage.getItem('college_timetable') || 'Classes: Mon 9-11am Math, Wed 10-12pm CS lab, Fri 2-4pm OS theory.';
  });

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('study_syllabus', userSyllabus);
  }, [userSyllabus]);
  useEffect(() => {
    localStorage.setItem('study_goals', userGoals);
  }, [userGoals]);
  useEffect(() => {
    localStorage.setItem('college_timetable', collegeTimetable);
  }, [collegeTimetable]);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'verse' | 'schedule' | 'tutor' | 'notes' | 'tools'>('verse');

  // Timetable builder states
  const [weeklyHours, setWeeklyHours] = useState('15');
  const [difficulty, setDifficulty] = useState('Medium');
  const [timetableOutput, setTimetableOutput] = useState<any | null>(null);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);

  // AI Tutor states
  const [tutorQuery, setTutorQuery] = useState('');
  const [tutorReply, setTutorReply] = useState('');
  const [tutorLanguage, setTutorLanguage] = useState('English');
  const [isTutorLoading, setIsTutorLoading] = useState(false);

  // Quiz states
  const [quizSubject, setQuizSubject] = useState('Data Structures');
  const [quizDiff, setQuizDiff] = useState('Medium');
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [isQuizLoading, setIsQuizLoading] = useState(false);

  // Flashcards state
  const [flashcards, setFlashcards] = useState<Array<{ q: string; a: string; step: number; flipped: boolean }>>([
    { q: "What is a Fourier Transform?", a: "A mathematical transform that decomposes a function into its constituent frequencies.", step: 1, flipped: false },
    { q: "Explain the Time Complexity of QuickSort.", a: "Best & Average: O(n log n). Worst: O(n^2) when pivot selection is poor.", step: 1, flipped: false }
  ]);

  // Advanced mind map nodes and links state
  const [mapNodes, setMapNodes] = useState<PhysicsNode[]>([
    { id: 1, text: "Syllabus Core", x: 290, y: 130, vx: 0, vy: 0, radius: 28, color: '#8b5cf6', isRoot: true },
    { id: 2, text: "Fourier Transforms", x: 190, y: 70, vx: 0, vy: 0, radius: 20, color: '#06b6d4' },
    { id: 3, text: "Binary Trees", x: 390, y: 70, vx: 0, vy: 0, radius: 20, color: '#10b981' },
    { id: 4, text: "CPU Scheduling", x: 290, y: 200, vx: 0, vy: 0, radius: 20, color: '#fbbf24' }
  ]);
  const [mapLinks, setMapLinks] = useState<PhysicsLink[]>([
    { from: 1, to: 2 },
    { from: 1, to: 3 },
    { from: 1, to: 4 }
  ]);
  const [newConceptText, setNewConceptText] = useState('');

  // Pomodoro Timer States
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [timerType, setTimerType] = useState('25/5');
  const [lofiTrack, setLofiTrack] = useState('Lo-Fi Chill');
  const [isBlockerActive, setIsBlockerActive] = useState(false);

  // Streaks, Level gamification
  const [xp, setXp] = useState(450);
  const [streakDays, setStreakDays] = useState(6);
  const [leetcodeSolved, setLeetcodeSolved] = useState(54);

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

  // Pomodoro Timer tick logic
  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            if (!isBreak) {
              setIsBreak(true);
              setXp(prev => prev + 50);
              if (timerType === '25/5') setMinutes(5);
              else if (timerType === '50/10') setMinutes(10);
              else setMinutes(20);
            } else {
              setIsBreak(false);
              if (timerType === '25/5') setMinutes(25);
              else if (timerType === '50/10') setMinutes(50);
              else setMinutes(90);
            }
            setIsActive(false);
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, isBreak, timerType]);

  const handleToggleTask = async (plan: StudyPlan, taskIdx: number) => {
    const updatedTasks = plan.tasks.map((t, idx) => {
      if (idx === taskIdx) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });

    const completedCount = updatedTasks.filter(t => t.completed).length;
    const completionPct = Math.round((completedCount / updatedTasks.length) * 100);

    try {
      await axios.put(`/api/study-plans/${plan.id}`, {
        subject: plan.subject,
        tasks: updatedTasks,
        exam_date: plan.exam_date,
        completion_pct: completionPct
      });
      fetchPlans();
      setXp(prev => prev + 15);
    } catch (err) {
      console.error("Failed to toggle study plan task", err);
    }
  };

  const handleAddTask = () => {
    if (newTaskInput.trim()) {
      setTaskList([...taskList, newTaskInput.trim()]);
      setNewTaskInput('');
    }
  };

  const handleRemoveTaskIndex = (idx: number) => {
    setTaskList(taskList.filter((_, i) => i !== idx));
  };

  const handleSubmitPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    const tasksArray = taskList.map(t => ({ task: t, completed: false }));
    if (newTaskInput.trim()) {
      tasksArray.push({ task: newTaskInput.trim(), completed: false });
    }

    try {
      await axios.post('/api/study-plans', {
        subject,
        tasks: tasksArray,
        exam_date: examDate || null,
        completion_pct: 0.0
      });
      setSubject('');
      setExamDate('');
      setTaskList([]);
      setNewTaskInput('');
      fetchPlans();
      setXp(prev => prev + 100);
    } catch (err) {
      console.error(err);
    }
  };

  // 1. LIVE AI TIMETABLE GENERATOR VIA GEMINI
  const handleGenerateTimetable = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingSchedule(true);
    try {
      const res = await axios.post('/api/study/ai-action', {
        action: 'generate_timetable',
        payload: {
          syllabus: userSyllabus,
          goals: userGoals,
          weekly_hours: weeklyHours,
          difficulty: difficulty,
          college_timetable: collegeTimetable
        }
      });
      setTimetableOutput(res.data);
    } catch (err) {
      console.error(err);
      setTimetableOutput({
        daily: [
          { time: '09:00 - 10:30', type: 'Core Study', topic: 'Fourier Transform equations', goal: 'Derive time scaling properties' }
        ],
        weekly: [
          { day: 'Mon/Wed', focus: 'Discrete Mathematics & Trees focus' }
        ]
      });
    } finally {
      setIsGeneratingSchedule(false);
    }
  };

  // 2. LIVE AI TUTOR WITH MULTILINGUAL ANALOGY SUPPORT VIA GEMINI
  const handleAskTutor = async (queryText: string) => {
    if (!queryText.trim()) return;
    setTutorQuery(queryText);
    setIsTutorLoading(true);
    try {
      const res = await axios.post('/api/study/ai-action', {
        action: 'ask_tutor',
        payload: {
          query: queryText,
          syllabus: userSyllabus,
          language: tutorLanguage
        }
      });
      setTutorReply(res.data.reply);
    } catch (err) {
      console.error(err);
      setTutorReply("Failed to fetch answer. Please check your network connection.");
    } finally {
      setIsTutorLoading(false);
    }
  };

  // 3. LIVE AI QUIZ GENERATOR VIA GEMINI
  const handleGenerateQuiz = async () => {
    setIsQuizLoading(true);
    try {
      const res = await axios.post('/api/study/ai-action', {
        action: 'generate_quiz',
        payload: {
          subject: quizSubject,
          difficulty: quizDiff
        }
      });
      setQuizQuestions(res.data);
    } catch (err) {
      console.error(err);
      setQuizQuestions([
        { q: "What is the time complexity of looking up an item in a balanced Binary Search Tree?", a: "O(log n)", difficulty: quizDiff }
      ]);
    } finally {
      setIsQuizLoading(false);
    }
  };

  // Spaced repetition flashcard rank
  const handleGradeCard = (idx: number, known: boolean) => {
    const updated = [...flashcards];
    updated[idx].step = known ? updated[idx].step + 1 : 1;
    updated[idx].flipped = false;
    setFlashcards(updated);
  };

  // Add Mind Map Node linking (AI Dynamic Mind Map generation)
  const handleAddMapNode = async () => {
    if (!newConceptText.trim()) return;
    try {
      const res = await axios.post('/api/study/ai-action', {
        action: 'generate_mindmap',
        payload: { topic: newConceptText.trim() }
      });

      const cx = 290;
      const cy = 130;
      const nodesData = res.data.nodes || [];
      const linksData = res.data.links || [];

      const formattedNodes: PhysicsNode[] = nodesData.map((n: any, idx: number) => {
        const angle = idx === 0 ? 0 : ((idx - 1) * Math.PI * 2) / Math.max(1, nodesData.length - 1);
        const dist = idx === 0 ? 0 : 85;
        return {
          id: n.id,
          text: n.text,
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          radius: idx === 0 ? 28 : 20,
          color: idx === 0 ? '#8b5cf6' : '#06b6d4',
          isRoot: idx === 0
        };
      });

      setMapNodes(formattedNodes);
      setMapLinks(linksData);
      setNewConceptText('');
    } catch (err) {
      console.error("Failed to generate AI mind map", err);
    }
  };

  // Custom timer select
  const handleSetTimerType = (type: string) => {
    setTimerType(type);
    setIsActive(false);
    if (type === '25/5') setMinutes(25);
    else if (type === '50/10') setMinutes(50);
    else setMinutes(90);
    setSeconds(0);
  };

  const currentLevel = Math.floor(xp / 200) + 1;
  const progressToNextLevel = Math.round(((xp % 200) / 200) * 100);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* HEADER GAMIFIED BOARD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/5">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 font-sans tracking-wide">
            AI Study Universe Planner
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Organize timetables, run spaced repetition flashcards, compile DSA commits, and visualize your targets.
          </p>
        </div>

        {/* GAMIFICATION STATS */}
        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 shrink-0 w-full md:w-auto">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              <span>Level {currentLevel} Scholar</span>
              <span className="text-brand-purple">{progressToNextLevel}%</span>
            </div>
            <div className="w-32 bg-dark-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-brand-purple h-1.5 transition-all" style={{ width: `${progressToNextLevel}%` }} />
            </div>
          </div>

          <div className="h-8 w-px bg-white/10" />

          {/* Streaks */}
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500 animate-pulse" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Streak</span>
              <p className="text-sm font-extrabold text-slate-200">{streakDays} Days</p>
            </div>
          </div>
        </div>
      </div>

      {/* INPUT PANEL: SYLLABUS & STUDY TARGETS */}
      <div className="glass-card p-6 border border-white/5 space-y-4">
        <h3 className="font-bold text-xs text-slate-200 uppercase tracking-widest flex items-center gap-2">
          <Target className="h-4.5 w-4.5 text-brand-cyan" /> Core Syllabus & Study Goals Setup
        </h3>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Input your current subjects, college timetables, and target milestones below. The AI Timetables and Tutor Chat use this context to customize all responses.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase font-bold text-slate-400">Your Exam Syllabus / Topics</label>
            <textarea 
              value={userSyllabus}
              onChange={e => setUserSyllabus(e.target.value)}
              placeholder="e.g. Fourier Transform, OS CPU Scheduling, Balanced Trees..."
              className="glass-input text-xs h-24 resize-none leading-relaxed"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase font-bold text-slate-400">Target Study Goals</label>
            <textarea 
              value={userGoals}
              onChange={e => setUserGoals(e.target.value)}
              placeholder="e.g. Master Fourier calculations, solve 15 LeetCode trees..."
              className="glass-input text-xs h-24 resize-none leading-relaxed"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase font-bold text-slate-400">College Timetable Slots</label>
            <textarea 
              value={collegeTimetable}
              onChange={e => setCollegeTimetable(e.target.value)}
              placeholder="e.g. Mon/Wed 9-11am Math Lectures..."
              className="glass-input text-xs h-24 resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex flex-wrap gap-2.5 pb-2">
        <button
          onClick={() => setActiveTab('verse')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'verse' ? 'bg-brand-purple/20 text-brand-neon border-brand-purple/30 shadow-neon' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
          }`}
        >
          🌌 StudyVerse Galaxy
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'schedule' ? 'bg-brand-purple/20 text-brand-neon border-brand-purple/30 shadow-neon' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
          }`}
        >
          📅 AI Timetables
        </button>
        <button
          onClick={() => setActiveTab('tutor')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'tutor' ? 'bg-brand-purple/20 text-brand-neon border-brand-purple/30 shadow-neon' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
          }`}
        >
          🧠 AI Tutor & Quizzes
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'notes' ? 'bg-brand-purple/20 text-brand-neon border-brand-purple/30 shadow-neon' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
          }`}
        >
          📝 Notes & Mind Maps
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'tools' ? 'bg-brand-purple/20 text-brand-neon border-brand-purple/30 shadow-neon' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
          }`}
        >
          📊 Focus & Analytics
        </button>
      </div>

      {/* CORE SPLITTING RENDER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Work Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* TAB 1: GALAXY VERSE */}
          {activeTab === 'verse' && (
            <div className="space-y-6">
              <StudyVerseGalaxy plans={plans} onToggleTask={handleToggleTask} />
              
              {/* Syllabus Track lists */}
              <div className="glass-card p-6 border border-white/5 space-y-4">
                <h3 className="font-bold text-xs text-slate-200 uppercase tracking-widest flex items-center gap-2">
                  <Layers className="h-4.5 w-4.5 text-brand-purple" /> Active Subject Milestones
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plans.map(p => (
                    <div key={p.id} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="font-bold text-slate-200 text-xs">{p.subject}</span>
                        <span className="text-[10px] text-slate-400">Exam: {p.exam_date || 'TBD'}</span>
                      </div>
                      <div className="space-y-2">
                        {p.tasks.slice(0, 3).map((t, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => handleToggleTask(p, idx)}
                            className="flex items-center gap-2 text-[10px] text-slate-300 hover:text-slate-200 transition-colors cursor-pointer"
                          >
                            {t.completed ? <CheckSquare className="h-3.5 w-3.5 text-brand-purple" /> : <Square className="h-3.5 w-3.5 text-slate-500" />}
                            <span className={t.completed ? 'line-through text-slate-500' : ''}>{t.task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TIMETABLES */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              
              {/* Form Input for AI Timetable */}
              <div className="glass-card p-6 border border-white/5 space-y-5">
                <div>
                  <h3 className="font-bold text-slate-200 text-sm">🤖 AI Automatically Generated Timetable</h3>
                  <p className="text-[10px] text-slate-400 mt-1">Configure study hours and target goals to generate a custom timetable using Gemini.</p>
                </div>

                <form onSubmit={handleGenerateTimetable} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-extrabold text-slate-400">Study hours / week</label>
                    <input 
                      type="number" 
                      value={weeklyHours} 
                      onChange={e => setWeeklyHours(e.target.value)} 
                      className="glass-input text-xs" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-extrabold text-slate-400">Syllabus Difficulty</label>
                    <select 
                      value={difficulty} 
                      onChange={e => setDifficulty(e.target.value)} 
                      className="glass-input text-xs"
                    >
                      <option value="Easy">Easy / Basics</option>
                      <option value="Medium">Medium workload</option>
                      <option value="Hard">Hard / Exam Crunch</option>
                    </select>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isGeneratingSchedule}
                    className="neon-button-purple py-3.5 rounded-xl font-bold text-xs tracking-wider flex items-center justify-center gap-2"
                  >
                    {isGeneratingSchedule ? <Loader className="h-4 w-4 animate-spin" /> : 'Build AI Schedule'}
                  </button>
                </form>
              </div>

              {/* Timetable Outputs (GORGEOUS GLASSMORPHIC TABLE) */}
              {timetableOutput && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Tabular Timetable */}
                  <div className="glass-card p-6 border border-white/5 space-y-4">
                    <h4 className="font-bold text-xs text-brand-cyan uppercase tracking-wider flex items-center gap-1.5">
                      <Table className="h-4 w-4 text-brand-cyan" /> Suggested Daily Tabular Timetable
                    </h4>
                    
                    <div className="overflow-x-auto rounded-xl border border-white/5 bg-dark-900/60">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-white/5 text-slate-400 font-extrabold uppercase border-b border-white/5 text-[9px] tracking-wider">
                            <th className="p-3.5">Time Block</th>
                            <th className="p-3.5">Session Type</th>
                            <th className="p-3.5">Syllabus Focus Topic</th>
                            <th className="p-3.5">Target Goal Reference</th>
                            <th className="p-3.5 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                          {timetableOutput.daily?.map((d: any, idx: number) => (
                            <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                              <td className="p-3.5 font-mono font-bold text-brand-cyan whitespace-nowrap">{d.time}</td>
                              <td className="p-3.5 font-bold text-slate-200">{d.type || 'Study Session'}</td>
                              <td className="p-3.5">{d.topic || d.activity}</td>
                              <td className="p-3.5 text-slate-400 italic">{d.goal || 'Revise target'}</td>
                              <td className="p-3.5 text-center">
                                <button 
                                  type="button"
                                  onClick={() => {
                                    setMinutes(parseInt(d.time.split('-')[0].split(':')[0]) || 25);
                                    setActiveTab('tools');
                                    setIsActive(true);
                                  }}
                                  className="h-6 px-2 bg-brand-purple/15 border border-brand-purple/20 text-[9px] font-bold rounded text-brand-neon hover:bg-brand-purple/25 transition-all"
                                >
                                  Start Focus
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Weekly Roadmap */}
                  <div className="glass-card p-6 border border-white/5 space-y-4">
                    <h4 className="font-bold text-xs text-brand-purple uppercase tracking-wider">Weekly Target Roadmap</h4>
                    <div className="space-y-3">
                      {timetableOutput.weekly?.map((w: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center text-xs text-slate-300">
                          <span className="font-bold text-slate-200 mr-2 shrink-0">{w.day}</span>
                          <span className="text-right">{w.focus}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* TAB 3: AI TUTOR & QUIZZES */}
          {activeTab === 'tutor' && (
            <div className="space-y-6">
              
              {/* Tutor prompt console */}
              <div className="glass-card p-6 border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-xs text-slate-200 uppercase tracking-widest flex items-center gap-2">
                    <Brain className="h-4.5 w-4.5 text-brand-cyan" /> AI Personal Tutor Chat Console
                  </h3>
                  
                  {/* Language select */}
                  <div className="flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5 text-slate-500" />
                    <select 
                      value={tutorLanguage}
                      onChange={e => setTutorLanguage(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[9px] font-bold text-slate-300"
                    >
                      <option value="English">English</option>
                      <option value="Kannada">Kannada</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <button 
                    onClick={() => handleAskTutor("Explain Fourier Transform in simple language with real-world analogies.")}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-brand-cyan/10 border border-white/5 text-[10px] text-slate-300 hover:text-brand-cyan font-bold transition-all"
                  >
                    Explain Fourier Transform
                  </button>
                  <button 
                    onClick={() => handleAskTutor("Solve tree traversal logic step-by-step.")}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-brand-cyan/10 border border-white/5 text-[10px] text-slate-300 hover:text-brand-cyan font-bold transition-all"
                  >
                    Solve DSA Tree problems
                  </button>
                  <button 
                    onClick={() => handleAskTutor("Explain Operating Systems CPU scheduling.")}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-brand-cyan/10 border border-white/5 text-[10px] text-slate-300 hover:text-brand-cyan font-bold transition-all"
                  >
                    Explain Operating Systems
                  </button>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={tutorQuery} 
                      onChange={e => setTutorQuery(e.target.value)} 
                      placeholder="Explain operating systems / Ask anything..."
                      className="glass-input text-xs flex-1" 
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleAskTutor(tutorQuery);
                      }}
                    />
                    <button 
                      onClick={() => handleAskTutor(tutorQuery)}
                      disabled={isTutorLoading}
                      className="neon-button-cyan px-4 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5"
                    >
                      {isTutorLoading ? <Loader className="h-3.5 w-3.5 animate-spin" /> : 'Ask Tutor'}
                    </button>
                  </div>
                  {tutorReply && (
                    <div 
                      className="p-4 rounded-xl bg-brand-cyan/5 border border-brand-cyan/20 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans"
                      dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(tutorReply) }}
                    />
                  )}
                </div>
              </div>

              {/* Quiz Generator */}
              <div className="glass-card p-6 border border-white/5 space-y-4">
                <h3 className="font-bold text-xs text-slate-200 uppercase tracking-widest flex items-center gap-2">
                  <PlusCircle className="h-4.5 w-4.5 text-brand-purple" /> Interactive Quiz Generator
                </h3>

                <div className="flex gap-4 items-center flex-wrap md:flex-nowrap">
                  <div className="flex-1 min-w-[200px]">
                    <input 
                      type="text" 
                      value={quizSubject}
                      onChange={e => setQuizSubject(e.target.value)}
                      placeholder="Subject topic (e.g. Trees, operating systems)"
                      className="glass-input text-xs"
                    />
                  </div>
                  <select 
                    value={quizDiff} 
                    onChange={e => setQuizDiff(e.target.value)}
                    className="glass-input text-xs max-w-[150px]"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>

                  <button 
                    onClick={handleGenerateQuiz}
                    disabled={isQuizLoading}
                    className="neon-button-purple px-4 py-3.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5"
                  >
                    {isQuizLoading ? <Loader className="h-4 w-4 animate-spin" /> : 'Generate Quiz'}
                  </button>
                </div>

                {quizQuestions.length > 0 && (
                  <div className="space-y-3 pt-2">
                    {quizQuestions.map((q, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs">
                        <p className="font-bold text-slate-200">Q{idx+1}: {q.q} ({q.difficulty})</p>
                        <p className="text-[10px] text-emerald-400">Answer: {q.a}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Spaced Repetition Flashcards */}
              <div className="glass-card p-6 border border-white/5 space-y-4">
                <h3 className="font-bold text-xs text-slate-200 uppercase tracking-widest">Spaced Repetition Flashcards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {flashcards.map((card, idx) => (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        card.flipped ? 'bg-brand-purple/10 border-brand-purple/20' : 'bg-white/5 border-white/5 hover:border-white/10'
                      }`}
                      onClick={() => {
                        const updated = [...flashcards];
                        updated[idx].flipped = !updated[idx].flipped;
                        setFlashcards(updated);
                      }}
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <span>Card {idx+1}</span>
                        <span>Level: {card.step}</span>
                      </div>
                      <p className="text-xs text-slate-200 min-h-[40px] flex items-center">
                        {card.flipped ? card.a : card.q}
                      </p>
                      {card.flipped && (
                        <div className="flex gap-2 pt-3 border-t border-white/5 mt-3" onClick={e => e.stopPropagation()}>
                          <button 
                            onClick={() => handleGradeCard(idx, false)}
                            className="flex-1 py-1 rounded bg-red-500/10 border border-red-500/25 text-red-400 text-[10px] font-bold"
                          >
                            Hard (Reset)
                          </button>
                          <button 
                            onClick={() => handleGradeCard(idx, true)}
                            className="flex-1 py-1 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold"
                          >
                            Easy (Promote)
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: NOTES & MIND MAPS */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              
              {/* Physics Draggable Mind Map */}
              <InteractiveMindMap 
                nodes={mapNodes}
                links={mapLinks}
                setNodes={setMapNodes}
                newNodeText={newConceptText}
                setNewNodeText={setNewConceptText}
                onAddNode={handleAddMapNode}
              />

              {/* Notes manager */}
              <div className="glass-card p-6 border border-white/5 space-y-4">
                <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Rich Text & Image Notes</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-white/5 pb-1.5 font-bold uppercase">
                      <span>CS Lecture Notes</span>
                      <span>15 Jul</span>
                    </div>
                    <p className="text-xs text-slate-200">Discussed Dijkstra's shortest path algorithm. Uses min-priority queue. Time complexity O(E log V).</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-white/5 pb-1.5 font-bold uppercase">
                      <span>Physics lab planning</span>
                      <span>12 Jul</span>
                    </div>
                    <p className="text-xs text-slate-200">Fourier harmonics experiment setup. Require standard waveform generator and oscilloscope check.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: TOOLS & FOCUS */}
          {activeTab === 'tools' && (
            <div className="space-y-6">
              
              {/* Pomodoro Focus & Lo-Fi player */}
              <div className="glass-card p-6 border border-white/5 space-y-6 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-xs text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                      <Music className="h-4.5 w-4.5 text-brand-purple" /> Focus Mode & Lo-Fi Player
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Custom focus blocks with ambient noise and distraction blocking.</p>
                  </div>
                  
                  <button 
                    onClick={() => setIsBlockerActive(!isBlockerActive)}
                    className={`h-7 px-3 text-[9px] font-extrabold uppercase rounded-lg border transition-all flex items-center gap-1 ${
                      isBlockerActive ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-white/5 text-slate-400 border-white/5'
                    }`}
                  >
                    <MonitorOff className="h-3 w-3" />
                    {isBlockerActive ? 'Blocker Active' : 'Blocker Off'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  
                  {/* Timer */}
                  <div className="p-5 rounded-2xl bg-dark-700/50 border border-white/5 flex flex-col items-center justify-center space-y-4">
                    <div className="text-center space-y-1.5">
                      <div className="flex gap-2 justify-center">
                        {['25/5', '50/10', '90/20'].map(t => (
                          <button
                            key={t}
                            onClick={() => handleSetTimerType(t)}
                            className={`px-2 py-0.5 rounded text-[8px] font-bold transition-all border ${
                              timerType === t ? 'bg-brand-purple/20 text-brand-neon border-brand-purple/35' : 'bg-white/5 text-slate-500 border-white/5'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      <div className="text-4xl font-extrabold text-slate-100 font-mono tracking-tight pt-1">
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                      </div>
                      <span className="text-[9px] text-slate-500 uppercase font-extrabold tracking-wider">
                        {isBreak ? '☕ Rest Break' : '🧠 Work period'}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsActive(!isActive)}
                        className={`h-8 w-8 rounded-full flex items-center justify-center border transition-all ${
                          isActive ? 'bg-red-500/10 text-red-400 border-red-500/25' : 'bg-brand-purple/10 text-brand-neon border-brand-purple/25'
                        }`}
                      >
                        {isActive ? <Pause className="h-4.5 w-4.5" /> : <Play className="h-4.5 w-4.5" />}
                      </button>
                      <button
                        onClick={() => {
                          setIsActive(false);
                          setIsBreak(false);
                          if (timerType === '25/5') setMinutes(25);
                          else if (timerType === '50/10') setMinutes(50);
                          else setMinutes(90);
                          setSeconds(0);
                        }}
                        className="h-8 w-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-slate-300"
                      >
                        <RotateCcw className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>

                  {/* Lofi options */}
                  <div className="space-y-3">
                    <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Lo-Fi Soundscapes</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Lo-Fi Chill', 'White Noise', 'Rainy Cafe', 'Forest Birds'].map(track => (
                        <button
                          key={track}
                          onClick={() => setLofiTrack(track)}
                          className={`p-2.5 rounded-xl border text-[10px] font-bold text-slate-300 transition-all text-left flex items-center gap-1.5 ${
                            lofiTrack === track ? 'bg-brand-cyan/15 border-brand-cyan/25 text-brand-cyan' : 'bg-white/5 border-white/5 hover:bg-white/10'
                          }`}
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                          {track}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Academic and CS stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* CGPA Credits Calculator */}
                <div className="glass-card p-6 border border-white/5 space-y-4">
                  <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="h-4.5 w-4.5 text-brand-purple" /> CGPA & Credits Tracker
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-center">
                      <span className="text-[9px] uppercase font-bold text-slate-400">Current CGPA</span>
                      <p className="text-xl font-extrabold text-slate-200 mt-1">8.65 / 10</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-center">
                      <span className="text-[9px] uppercase font-bold text-slate-400">Target Semester</span>
                      <p className="text-xl font-extrabold text-brand-purple mt-1">9.20 GPA</p>
                    </div>
                  </div>
                </div>

                {/* LeetCode Commits Tracker */}
                <div className="glass-card p-6 border border-white/5 space-y-4">
                  <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Code className="h-4.5 w-4.5 text-brand-cyan" /> Coding Activity Tracker
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-center">
                      <span className="text-[9px] uppercase font-bold text-slate-400">LeetCode Solved</span>
                      <p className="text-xl font-extrabold text-slate-200 mt-1">{leetcodeSolved} / 150</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-center">
                      <span className="text-[9px] uppercase font-bold text-slate-400">GitHub Commits</span>
                      <p className="text-xl font-extrabold text-brand-cyan mt-1">42 weekly</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Right Side: Log custom subject & Quick Stats panel */}
        <div className="space-y-6">
          
          {/* gamification milestones achievements */}
          <div className="glass-card p-6 border border-white/5 space-y-4">
            <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider">Scholar Achievements</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
                  <Award className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Syllabus Master</span>
                  <span className="text-[9px] text-slate-500 font-medium">Earned by clearing 100% of 2 subjects.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-brand-cyan/15 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan">
                  <Flame className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Weekly Streak Gold</span>
                  <span className="text-[9px] text-slate-500 font-medium font-sans">Maintained a 6-day daily streak.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Book reading tracker */}
          <div className="glass-card p-6 border border-white/5 space-y-4">
            <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider">Book Reading Log</h3>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-200 font-bold">
                <span>Introduction to Algorithms</span>
                <span className="text-[10px] text-brand-purple">45% Read</span>
              </div>
              <div className="w-full bg-dark-700 h-1 rounded-full overflow-hidden">
                <div className="bg-brand-purple h-1" style={{ width: '45%' }} />
              </div>
              <p className="text-[9px] text-slate-500 mt-1">Reading time: 3.5 hrs total. Page 120 / 280.</p>
            </div>
          </div>

          {/* Subject planner form */}
          <div className="glass-card p-6 border border-white/5 space-y-4">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Plus className="h-4.5 w-4.5 text-brand-purple" /> Log New Subject
            </h3>
            
            <form onSubmit={handleSubmitPlan} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Subject Name</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Discrete Mathematics"
                  className="glass-input text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Exam Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={e => setExamDate(e.target.value)}
                  className="glass-input text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Add Tasks / Chapters</label>
                
                {taskList.length > 0 && (
                  <div className="space-y-1.5 pb-2">
                    {taskList.map((t, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white/5 px-3 py-1.5 rounded-lg text-xs text-slate-300 border border-white/5">
                        <span>{t}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveTaskIndex(idx)}
                          className="text-red-400 hover:text-red-500 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Revision chapter 1"
                    value={newTaskInput}
                    onChange={e => setNewTaskInput(e.target.value)}
                    className="glass-input text-xs flex-1"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTask();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddTask}
                    className="px-3 bg-brand-purple/20 text-brand-neon hover:bg-brand-purple/30 rounded-xl text-xs font-bold border border-brand-purple/25"
                  >
                    Add
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full neon-button-purple py-3 rounded-xl font-bold text-xs tracking-wide">
                Create Study Plan
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
