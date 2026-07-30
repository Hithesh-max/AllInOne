import React from 'react';
import { 
  TerminalIcon, ArrowRight, Brain, Briefcase, Award, GraduationCap, 
  FileText, Wallet, Heart, Compass, Shield, Activity, Calendar, 
  TrendingUp, ChevronDown, Sparkles 
} from 'lucide-react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

try {
  gsap.registerPlugin(ScrollTrigger);
} catch (e) {
  console.error("ScrollTrigger registration failed:", e);
}

interface LandingProps {
  onGetStarted: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onGetStarted }) => {
  const [loading, setLoading] = React.useState(true);
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);
  const [runtimeError, setRuntimeError] = React.useState<string | null>(null);
  
  // Custom Cursor refs and state
  const cursorDotRef = React.useRef<HTMLDivElement>(null);
  const cursorRingRef = React.useRef<HTMLDivElement>(null);
  const [cursorHovered, setCursorHovered] = React.useState(false);
  const [cursorText, setCursorText] = React.useState("");

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // --- MAGNETIC BUTTON INTERACTION ---
  const handleMagneticMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      const btn = e.currentTarget;
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      gsap.to(btn, {
        x: x * 0.35,
        y: y * 0.35,
        duration: 0.3,
        ease: 'power2.out'
      });
    } catch (err: any) {
      setRuntimeError(`MagneticMove Error: ${err.message}\n${err.stack}`);
    }
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      gsap.to(e.currentTarget, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)'
      });
    } catch (err: any) {
      setRuntimeError(`MagneticLeave Error: ${err.message}\n${err.stack}`);
    }
  };

  // --- 3D INTERACTIVE CARD TILT ---
  const handleCardTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    try {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      
      const rotateX = (yc - y) / 10;
      const rotateY = (x - xc) / 10;
      
      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        scale: 1.02,
        duration: 0.35,
        ease: 'power2.out',
        transformPerspective: 800
      });
    } catch (err: any) {
      setRuntimeError(`CardTilt Error: ${err.message}\n${err.stack}`);
    }
  };

  const handleCardTiltLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    try {
      gsap.to(e.currentTarget, {
        rotateX: 0,
        rotateY: 0,
        scale: 1.0,
        duration: 0.5,
        ease: 'power2.out'
      });
    } catch (err: any) {
      setRuntimeError(`CardTiltLeave Error: ${err.message}\n${err.stack}`);
    }
  };

  const capabilities = [
    { name: 'AI Planner Agent', desc: 'The central reasoning engine coordinates multiple sub-agents dynamically.', icon: Brain, color: 'text-brand-purple border-brand-purple/20' },
    { name: 'Internship Matching', desc: 'Scrape opportunities, match resumes, estimate ATS scores, and generate prep guides.', icon: Briefcase, color: 'text-brand-cyan border-brand-cyan/20' },
    { name: 'Hackathon Scraper', desc: 'Track Devfolio/Devpost deadlines, verify eligibility, and structure team rules.', icon: Award, color: 'text-yellow-400 border-yellow-400/20' },
    { name: 'Scholarship Finder', desc: 'Scan post-matric portals and filter grants by CGPA, branches, and income limits.', icon: GraduationCap, color: 'text-emerald-400 border-emerald-400/20' },
    { name: 'Resume Optimizer', desc: 'Review bullet points, suggest projects, missing keywords, and draft cover letters.', icon: FileText, color: 'text-pink-400 border-pink-400/20' }
    ];

  const faqItems = [
    {
      q: "How does the AI Co-pilot recall past messages?",
      a: "CampusCopilot operates a local semantic vector database. Whenever you discuss goals, preferences, or tasks, your message and the AI response are indexed. On future prompts, it runs a semantic search to pull relevant context, allowing it to remember details across sessions."
    },
    {
      q: "What is the role of LangGraph in the platform?",
      a: "LangGraph coordinates our agentic chart state. The central Planner Node distributes student requests to specialized agents (Internships, Resume, Scholarships) based on your intent, aggregates their findings, and drafts a unified markdown output."
    },
    {
      q: "How are the Opportunities crawled?",
      a: "We perform real-time, sandboxed web crawls utilizing the Tavily API, targeting verified lists from Devfolio, NSP, Buddy4Study, Internshala, and Devpost. All results are sanitized of raw markdown images, navigation links, and redirects."
    },
    {
      q: "Does this require any manual calendar sync?",
      a: "No! The AI Planner automatically schedules relevant study, homework, or application deadlines to an integrated Calendar panel. You can check reminders, log study hours, and update CGPA metrics in real-time."
    }
  ];

  const stars = React.useMemo(() => {
    return Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      top: `${(Math.sin(i * 1.7) * 50 + 50).toFixed(1)}%`,
      left: `${(Math.cos(i * 2.3) * 50 + 50).toFixed(1)}%`,
      size: `${(Math.abs(Math.sin(i)) * 2 + 1).toFixed(1)}px`,
      duration: `${(Math.abs(Math.cos(i)) * 5 + 3).toFixed(1)}s`,
      delay: `${(Math.abs(Math.sin(i * 4)) * 4).toFixed(1)}s`
    }));
  }, []);

  const titleText = "import { CampusCopilot } from 'co-pilot';";
  const splitTitle = titleText.split(" ").map((word, wIdx) => (
    <span key={wIdx} className="inline-block whitespace-nowrap mr-3">
      {word.split("").map((char, cIdx) => (
        <span key={cIdx} className="hero-char inline-block opacity-0">
          {char}
        </span>
      ))}
    </span>
  ));

  // --- LOADER SEQUENCE ---
  React.useEffect(() => {
    try {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1800);
      return () => clearTimeout(timer);
    } catch (err: any) {
      setRuntimeError(`Loader Effect Error: ${err.message}\n${err.stack}`);
    }
  }, []);

  // --- LENIS SMOOTH SCROLL ---
  React.useEffect(() => {
    if (loading) return;

    try {
      const LenisConstructor = (Lenis as any).default || Lenis;
      if (!LenisConstructor) {
        throw new Error("Lenis module could not be resolved. It is undefined.");
      }
      const lenis = new LenisConstructor({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      let rafId: number;
      function raf(time: number) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);

      lenis.on('scroll', ScrollTrigger.update);

      return () => {
        lenis.destroy();
        cancelAnimationFrame(rafId);
      };
    } catch (err: any) {
      setRuntimeError(`Lenis Effect Error: ${err.message}\n${err.stack}`);
    }
  }, [loading]);

  // --- CUSTOM DUAL-PART CURSOR ---
  React.useEffect(() => {
    if (loading) return;

    try {
      const moveCursor = (e: MouseEvent) => {
        if (cursorDotRef.current) {
          gsap.set(cursorDotRef.current, {
            x: e.clientX,
            y: e.clientY
          });
        }
        if (cursorRingRef.current) {
          gsap.to(cursorRingRef.current, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.25,
            ease: 'power3.out'
          });
        }
      };

      window.addEventListener('mousemove', moveCursor);
      return () => window.removeEventListener('mousemove', moveCursor);
    } catch (err: any) {
      setRuntimeError(`Cursor Effect Error: ${err.message}\n${err.stack}`);
    }
  }, [loading]);

  // --- MOUSE PARALLAX ON HERO ELEMENTS ---
  React.useEffect(() => {
    if (loading) return;

    try {
      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const xOffset = (clientX - window.innerWidth / 2) * 0.015;
        const yOffset = (clientY - window.innerHeight / 2) * 0.015;

        gsap.to('.hero-parallax', {
          x: xOffset,
          y: yOffset,
          duration: 0.8,
          ease: 'power2.out'
        });
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    } catch (err: any) {
      setRuntimeError(`Parallax Effect Error: ${err.message}\n${err.stack}`);
    }
  }, [loading]);

  // --- HERO TIMELINE & SCROLLTRIGGER REVEALS ---
  React.useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      try {
        // 1. Hero entrance
        const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        heroTl.fromTo('.hero-bg-orb', 
          { scale: 0.8, opacity: 0 }, 
          { scale: 1.0, opacity: 1, duration: 1.5 }
        );

        heroTl.fromTo('.hero-badge', 
          { y: 30, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.6 }, 
          '-=1.0'
        );

        heroTl.fromTo('.hero-char', 
          { y: 60, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.02 }, 
          '-=0.8'
        );

        heroTl.fromTo('.hero-desc', 
          { y: 35, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.6 }, 
          '-=0.5'
        );

        heroTl.fromTo('.hero-btn-container', 
          { y: 30, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.6 }, 
          '-=0.4'
        );

        // 2. Continuous Floating Loop
        gsap.to('.float-decor', {
          y: 10,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          stagger: {
            each: 0.3,
            from: 'random'
          }
        });

        // 3. Staggered grid cards enter on viewport scroll
        gsap.fromTo('.stagger-card',
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.stagger-card-grid',
              start: 'top 85%'
            }
          }
        );

        // 4. Scroll-Triggered Progress Bar Update
        ScrollTrigger.create({
          onUpdate: (self) => {
            const bar = document.querySelector('.scroll-progress-line') as HTMLElement;
            if (bar) {
              bar.style.width = `${self.progress * 100}%`;
            }
          }
        });

        // 5. Parallax Section reveals using Clip-Paths
        const revealBlocks = gsap.utils.toArray('.reveal-block');
        revealBlocks.forEach((block: any) => {
          gsap.fromTo(block,
            { clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)", opacity: 0 },
            {
              clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)",
              opacity: 1,
              duration: 1.2,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: block,
                start: 'top 80%',
                toggleActions: 'play none none none'
              }
            }
          );
        });

        // 5b. Scroll-Triggered Card Morphing (Code -> Feature)
        const morphCards = gsap.utils.toArray('.hover-morph-card');
        morphCards.forEach((card: any) => {
          ScrollTrigger.create({
            trigger: card,
            start: 'top 55%',
            end: 'bottom 15%',
            toggleClass: 'is-morphed'
          });
        });

        // 6. Opposing Scroll Marquee Stacks
        gsap.fromTo('.marquee-row-1', 
          { xPercent: 0 },
          {
            xPercent: -20,
            scrollTrigger: {
              trigger: '.marquee-stack-container',
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1
            }
          }
        );

        gsap.fromTo('.marquee-row-2', 
          { xPercent: -25 },
          {
            xPercent: -5,
            scrollTrigger: {
              trigger: '.marquee-stack-container',
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1
            }
          }
        );

        gsap.fromTo('.marquee-row-3', 
          { xPercent: 0 },
          {
            xPercent: -20,
            scrollTrigger: {
              trigger: '.marquee-stack-container',
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1
            }
          }
        );

        // 7. Roadmap Synced Timeline: grow path and highlight nodes
        const roadmapTl = gsap.timeline({
          scrollTrigger: {
            trigger: '.roadmap-section',
            start: 'top 50%',
            end: 'bottom 75%',
            scrub: 0.5
          }
        });

        roadmapTl
          // Segment 1: Draw path to Node 1 (dashoffset 1200 down to 950)
          .to('#roadmap-draw-path', { strokeDashoffset: 950, duration: 1, ease: 'none' })
          // Highlight Node 1
          .to('.roadmap-node-1', { 
            scale: 1.25, 
            borderColor: '#06b6d4', 
            color: '#06b6d4', 
            boxShadow: '0 0 20px rgba(6,182,212,0.8)',
            duration: 0.25 
          })
          
          // Segment 2: Draw path to Node 2 (dashoffset 950 down to 800)
          .to('#roadmap-draw-path', { strokeDashoffset: 800, duration: 1, ease: 'none' })
          // Highlight Node 2
          .to('.roadmap-node-2', { 
            scale: 1.25, 
            borderColor: '#8b5cf6', 
            color: '#8b5cf6', 
            boxShadow: '0 0 20px rgba(139,92,246,0.8)',
            duration: 0.25 
          })
          
          // Segment 3: Draw path to Node 3 (dashoffset 800 down to 550)
          .to('#roadmap-draw-path', { strokeDashoffset: 550, duration: 1, ease: 'none' })
          // Highlight Node 3
          .to('.roadmap-node-3', { 
            scale: 1.25, 
            borderColor: '#06b6d4', 
            color: '#06b6d4', 
            boxShadow: '0 0 20px rgba(6,182,212,0.8)',
            duration: 0.25 
          })
          
          // Segment 4: Draw path to Node 4 (dashoffset 550 down to 0)
          .to('#roadmap-draw-path', { strokeDashoffset: 0, duration: 1, ease: 'none' })
          // Highlight Node 4
          .to('.roadmap-node-4', { 
            scale: 1.25, 
            borderColor: '#8b5cf6', 
            color: '#8b5cf6', 
            boxShadow: '0 0 20px rgba(139,92,246,0.8)',
            duration: 0.25 
          });

      } catch (err: any) {
        setRuntimeError(`Hero/Timeline GSAP Error: ${err.message}\n${err.stack}`);
      }
    });

    return () => ctx.revert();
  }, [loading]);

  const handleCursorHover = (text: string, hovered: boolean) => {
    setCursorHovered(hovered);
    setCursorText(hovered ? text : "");
  };

  // --- DIAGNOSTIC ERROR DISPLAY ---
  if (runtimeError) {
    return (
      <div className="min-h-screen bg-red-950/90 text-red-100 p-8 font-mono flex flex-col justify-center items-start gap-4">
        <h2 className="text-2xl font-bold border-b border-red-500/30 pb-2 w-full">⚠️ Runtime Error Detected</h2>
        <pre className="bg-black/50 p-6 rounded-xl border border-red-500/20 max-w-full overflow-x-auto w-full text-sm leading-relaxed">
          {runtimeError}
        </pre>
        <button 
          onClick={() => setRuntimeError(null)}
          className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition-all"
        >
          Dismiss &amp; Retry
        </button>
      </div>
    );
  }

  // --- LOADER OVERLAY COMPONENT ---
  if (loading) {
    return (
      <div className="loader-container fixed inset-0 bg-dark-900 z-50 flex flex-col items-center justify-center font-sans">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.15)_0,transparent_60%)]" />
        </div>
        <div className="loader-logo flex flex-col items-center gap-4 z-10">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-brand-violet to-brand-cyan flex items-center justify-center shadow-neon animate-pulse">
            <TerminalIcon className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-extrabold text-xl tracking-wide text-slate-100 uppercase font-mono">CampusCopilot</h1>
          <div className="w-48 h-[3px] bg-white/5 rounded-full overflow-hidden mt-6 border border-white/5">
            <div className="loader-bar h-full w-0 bg-gradient-to-r from-brand-cyan to-brand-purple rounded-full animate-fill-bar" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 overflow-x-hidden text-slate-100 flex flex-col justify-between relative font-mono custom-cursor-hide">
      
      {/* Scroll Progress Line */}
      <div className="scroll-progress-line fixed top-0 left-0 h-1 bg-gradient-to-r from-brand-cyan to-brand-purple z-50 transition-all duration-75" style={{ width: '0%' }} />

      {/* Cyberpunk Perspective grid background */}
      <div className="perspective-grid" />

      {/* Overhauled Precision Crosshair & Dashed Ring Cursor */}
      <div ref={cursorDotRef} className="custom-cursor-dot hidden md:block" />
      <div 
        ref={cursorRingRef} 
        className={`custom-cursor-ring hidden md:block ${cursorHovered ? 'custom-cursor-hovered' : ''}`}
      >
        {cursorHovered && <span className="custom-cursor-text">{cursorText}</span>}
      </div>

      {/* Star Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              animation: `twinkle ${star.duration} infinite ease-in-out ${star.delay}`,
              boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)'
            }}
          />
        ))}
      </div>

      {/* Floating Nebula Orbs */}
      <div className="hero-bg-orb absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-violet/10 rounded-full blur-[140px] animate-drift-orb pointer-events-none z-0" />
      <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] bg-brand-cyan/5 rounded-full blur-[140px] animate-drift-orb pointer-events-none z-0" style={{ animationDelay: '3s' }} />

      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto w-full px-8 h-20 flex items-center justify-between z-20 relative border-b border-white/5 bg-[#06040b]/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-violet to-brand-cyan flex items-center justify-center shadow-neon hover:scale-105 transition-all duration-300">
            <TerminalIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-none tracking-wide text-slate-100">CampusCopilot AI</h1>
            <span className="text-[9px] text-brand-cyan uppercase tracking-wider font-semibold">Autonomous Student Co-Pilot</span>
          </div>
        </div>

        <button 
          onClick={onGetStarted}
          onMouseEnter={() => handleCursorHover("ENTER", true)}
          onMouseLeave={() => handleCursorHover("", false)}
          className="px-5 py-2.5 rounded-xl border border-white/10 hover:border-brand-purple/50 bg-white/5 hover:bg-white/10 text-xs font-semibold transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.08)]"
        >
          Sign In
        </button>
      </header>

      {/* Main IDE Workspace Hero Wrapper */}
      <main className="max-w-7xl mx-auto w-full px-8 py-16 z-10 relative flex-1 flex flex-col justify-center items-center">
        
        {/* Full-size VS Code Mockup Window */}
        <div className="w-full rounded-2xl border border-white/15 bg-[#090710]/95 shadow-2xl overflow-hidden flex flex-col mb-16 relative">
          
          {/* Title Bar */}
          <div className="h-10 bg-[#06040b] border-b border-white/5 flex items-center justify-between px-4 text-[11px] text-slate-400 select-none">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-rose-500/80" />
              <div className="h-3 w-3 rounded-full bg-amber-500/80" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 text-slate-400 font-mono flex items-center gap-1.5">
                <TerminalIcon className="h-3 w-3 text-brand-cyan" /> ● Landing.tsx - CampusCopilot IDE
              </span>
            </div>
            <div className="flex items-center gap-4 font-mono text-[10px] hidden sm:flex">
              <span>File</span>
              <span>Edit</span>
              <span>Selection</span>
              <span>TerminalIcon</span>
              <span className="text-brand-cyan font-semibold">v1.3.0-live</span>
            </div>
          </div>

          <div className="flex flex-1 min-h-[500px]">
            {/* Left Activity Bar */}
            <div className="w-12 bg-[#050308] border-r border-white/5 flex flex-col items-center py-4 gap-6 text-slate-500 select-none">
              <TerminalIcon className="h-5 w-5 text-brand-cyan" />
              <Brain className="h-5 w-5 hover:text-slate-300 cursor-pointer" />
              <Briefcase className="h-5 w-5 hover:text-slate-300 cursor-pointer" />
              <Wallet className="h-5 w-5 hover:text-slate-300 cursor-pointer" />
            </div>

            {/* Folder Explorer Tree (left panel) */}
            <div className="w-52 bg-[#07050b] border-r border-white/5 p-4 text-left hidden md:block font-mono text-[11px] text-slate-400 select-none">
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Explorer</span>
              <div className="mt-4 space-y-2.5">
                <div className="text-brand-purple font-bold flex items-center gap-1">📁 CampusCopilot</div>
                <div className="pl-3.5 space-y-2">
                  <div className="text-slate-500">📁 backend</div>
                  <div className="pl-3 text-slate-400 hover:text-slate-200 cursor-pointer">📄 main.py</div>
                  <div className="pl-3 text-slate-400 hover:text-slate-200 cursor-pointer">📄 security.py</div>
                  <div className="pl-3 text-slate-400 hover:text-slate-200 cursor-pointer">📄 llm.py</div>
                  <div className="text-slate-500">📁 frontend</div>
                  <div className="pl-3">📁 src</div>
                  <div className="pl-6 text-brand-cyan hover:text-slate-200 cursor-pointer flex items-center gap-1 font-semibold">📄 Landing.tsx</div>
                  <div className="pl-6 text-slate-400 hover:text-slate-200 cursor-pointer">📄 App.tsx</div>
                  <div className="pl-6 text-slate-400 hover:text-slate-200 cursor-pointer">📄 index.css</div>
                </div>
              </div>
            </div>

            {/* Code Editor Body */}
            <div className="flex-1 bg-[#090710]/50 p-6 sm:p-10 flex flex-col justify-start items-start text-left relative font-mono mt-9">
              {/* Tab Selector */}
              <div className="absolute top-[-36px] left-0 right-0 h-9 bg-[#06040b] border-b border-white/5 flex text-[11px] select-none">
                <div className="px-4 py-2 border-r border-white/5 bg-[#090710] text-slate-200 border-t-2 border-t-brand-cyan flex items-center gap-2">
                  <span className="text-[9px] text-cyan-400 font-extrabold">TSX</span> Landing.tsx
                </div>
                <div className="px-4 py-2 border-r border-white/5 text-slate-500 flex items-center gap-2 hover:bg-[#0c0a15] cursor-pointer">
                  <span className="text-[9px] text-purple-400 font-extrabold">PY</span> llm.py
                </div>
                <div className="px-4 py-2 border-r border-white/5 text-slate-500 flex items-center gap-2 hover:bg-[#0c0a15] cursor-pointer">
                  <span className="text-[9px] text-cyan-400 font-extrabold">TS</span> App.tsx
                </div>
              </div>

              {/* Code Content */}
              <div className="w-full space-y-6">
                <div className="hero-badge inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-violet/15 border border-brand-violet/30 text-brand-neon text-[10px] font-bold shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-neon animate-pulse" />
                  import {"{"} CampusCopilot {"}"} from "@student/planner";
                </div>

                <div className="space-y-2">
                  <span className="text-slate-500 text-xs sm:text-sm block leading-none">// The Next-Gen Autonomous Multi-Agent Co-Pilot</span>
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-100 tracking-tight leading-normal max-w-3xl">
                    {splitTitle}
                  </h2>
                </div>

                {/* Micro Editor Code Box */}
                <pre className="w-full text-slate-300 text-xs sm:text-sm leading-relaxed select-none bg-black/40 p-5 rounded-xl border border-white/5 font-mono overflow-x-auto shadow-inner">
                  <code>
                    <span className="text-purple-400">const</span> <span className="text-blue-400">copilot</span> = <span className="text-purple-400">new</span> <span className="text-yellow-300">CampusCopilot</span>({"{"}
                    <br />
                    &nbsp;&nbsp;<span className="text-blue-300">student</span>: <span className="text-green-300">"Hithesh"</span>,
                    <br />
                    &nbsp;&nbsp;<span className="text-blue-300">scrapers</span>: [<span className="text-green-300">"Internships"</span>, <span className="text-green-300">"Hackathons"</span>, <span className="text-green-300">"Grants"</span>],
                    <br />
                    &nbsp;&nbsp;<span className="text-blue-300">memory</span>: <span className="text-purple-300">true</span> <span className="text-slate-500">// Vector DB storage</span>
                    <br />
                    {"}"});
                    <br /><br />
                    <span className="text-blue-400">copilot</span>.<span className="text-yellow-300">launchAssistant</span>();
                  </code>
                </pre>

                <p className="hero-desc text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  CampusCopilot parses user goals, delegates to specialized agents (Careers, Hackathons, Scholarships), updates calendars, and manages structured contexts from a unified IDE panel.
                </p>

                {/* Action Buttons */}
                <div className="hero-btn-container flex flex-col sm:flex-row gap-4 pt-2">
                  <button 
                    onClick={onGetStarted}
                    onMouseMove={handleMagneticMove}
                    onMouseLeave={handleMagneticLeave}
                    onMouseEnter={() => handleCursorHover("START", true)}
                    className="neon-button-purple px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 group text-xs tracking-wider transition-all duration-300"
                  >
                    Launch Assistant
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <a 
                    href="#details"
                    onMouseEnter={() => handleCursorHover("EXPLORE", true)}
                    onMouseLeave={() => handleCursorHover("", false)}
                    className="px-6 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/15 font-bold transition-all duration-300 text-xs block tracking-wider hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                  >
                    Explore Features
                  </a>
                </div>
              </div>

            </div>
          </div>

          {/* TerminalIcon Console footer panel */}
          <div className="bg-[#050308] border-t border-white/5 p-4 text-left font-mono text-[10px] text-slate-500 select-none">
            <div className="flex gap-4 border-b border-white/5 pb-2 mb-2 font-bold uppercase tracking-wider text-slate-400">
              <span className="text-brand-cyan">TerminalIcon</span>
              <span>Problems</span>
              <span>Output</span>
              <span>Debug Console</span>
            </div>
            <div className="space-y-1 text-slate-500">
              <p><span className="text-brand-purple">PS D:\antigrav\AllInOneAi\backend&gt;</span> python -m uvicorn app.main:app --port 8000</p>
              <p className="text-emerald-400">INFO:     Application startup complete. Uvicorn running on http://127.0.0.1:8000</p>
              <p className="text-slate-400">INFO:     127.0.0.1:58566 - "GET /api/internships HTTP/1.1" 200 OK</p>
              <p className="text-slate-400">INFO:     127.0.0.1:58569 - "GET /api/calendar HTTP/1.1" 200 OK</p>
            </div>
          </div>
        </div>

      </main>

      {/* 3. Infinite Running Text Marquee */}
      <section className="w-full py-4 border-y border-white/5 bg-[#090710]/50 backdrop-blur-md overflow-hidden z-10 relative select-none">
        <div className="animate-marquee flex whitespace-nowrap gap-12 text-[10px] uppercase tracking-[0.25em] font-extrabold text-slate-600 font-mono">
          <span>GET /api/internships/google-swe 200 OK</span>
          <span className="text-brand-cyan">·</span>
          <span>POST /api/hackathons/sih-2026/register 201 Created</span>
          <span className="text-brand-purple">·</span>
          <span>GET /api/contests/leetcode-384 200 OK</span>
          <span className="text-brand-cyan">·</span>
          <span>PUT /api/resume/ats-score 200 OK</span>
          <span className="text-brand-purple">·</span>
          
          {/* Duplicate for infinite loop */}
          <span>GET /api/internships/google-swe 200 OK</span>
          <span className="text-brand-cyan">·</span>
          <span>POST /api/hackathons/sih-2026/register 201 Created</span>
          <span className="text-brand-purple">·</span>
          <span>GET /api/contests/leetcode-384 200 OK</span>
          <span className="text-brand-cyan">·</span>
          <span>PUT /api/resume/ats-score 200 OK</span>
          <span className="text-brand-purple">·</span>
        </div>
      </section>

      {/* Interactive Statistic Cards Section */}
      <section className="max-w-7xl mx-auto w-full px-8 py-20 z-10 relative">
        <div className="text-left mb-10 space-y-1">
          <span className="text-xs text-brand-cyan uppercase tracking-widest font-extrabold font-mono">// System Metrics</span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-200">Platform Statistics</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
          
          {/* Stat Card 1 */}
          <div 
            onMouseMove={handleCardTilt}
            onMouseLeave={handleCardTiltLeave}
            onMouseEnter={() => handleCursorHover("DATA", true)}
            className="cyber-stat-card cursor-pointer group"
          >
            <div className="absolute top-5 right-5 h-2 w-2 rounded-full bg-brand-cyan group-hover:animate-ping opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold block mb-1">Target Audience</span>
            <h4 className="text-4xl font-black text-slate-300 stat-glow-text">Students</h4>
            <div className="stat-details">
              <p className="text-xs text-slate-400 leading-normal">
                Built specifically for college students to unify their academic, career, and productivity tracking in one dashboard.
              </p>
            </div>
          </div>

          {/* Stat Card 2 */}
          <div 
            onMouseMove={handleCardTilt}
            onMouseLeave={handleCardTiltLeave}
            onMouseEnter={() => handleCursorHover("DATA", true)}
            className="cyber-stat-card cursor-pointer group"
          >
            <div className="absolute top-5 right-5 h-2 w-2 rounded-full bg-brand-cyan group-hover:animate-ping opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold block mb-1">Active Modules</span>
            <h4 className="text-4xl font-black text-slate-300 stat-glow-text">7+</h4>
            <div className="stat-details">
              <p className="text-xs text-slate-400 leading-normal">
                Features integrated tracking for Scholarships, Hackathons, Internships, Contests, Resume parsing, and Study planning.
              </p>
            </div>
          </div>

          {/* Stat Card 3 */}
          <div 
            onMouseMove={handleCardTilt}
            onMouseLeave={handleCardTiltLeave}
            onMouseEnter={() => handleCursorHover("DATA", true)}
            className="cyber-stat-card cursor-pointer group"
          >
            <div className="absolute top-5 right-5 h-2 w-2 rounded-full bg-brand-cyan group-hover:animate-ping opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold block mb-1">Data Sources</span>
            <h4 className="text-4xl font-black text-slate-300 stat-glow-text">Live</h4>
            <div className="stat-details">
              <p className="text-xs text-slate-400 leading-normal">
                Real-time RSS feeds and API integrations constantly fetch the newest opportunities directly to your dashboard.
              </p>
            </div>
          </div>

          {/* Stat Card 4 */}
          <div 
            onMouseMove={handleCardTilt}
            onMouseLeave={handleCardTiltLeave}
            onMouseEnter={() => handleCursorHover("DATA", true)}
            className="cyber-stat-card cursor-pointer group"
          >
            <div className="absolute top-5 right-5 h-2 w-2 rounded-full bg-brand-cyan group-hover:animate-ping opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold block mb-1">Automation</span>
            <h4 className="text-4xl font-black text-slate-300 stat-glow-text">24/7</h4>
            <div className="stat-details">
              <p className="text-xs text-slate-400 leading-normal">
                Background worker nodes automatically sync data and refresh your application statuses continuously.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Alternate Visual Showcase Sections */}
      <section id="details" className="max-w-7xl mx-auto w-full px-8 py-20 z-10 relative space-y-36">
        
        {/* Detail Block 1: Opportunities Scraper */}
        <div className="reveal-block grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 space-y-5 text-left font-sans">
            <span className="text-xs text-brand-cyan uppercase tracking-widest font-extrabold font-mono">// Modules / Scraper</span>
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 leading-tight">
              Aggregated Opportunity Scraper
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Real-time background crawlers aggregate open positions, scholarship slots, and active hackathon registries directly to the local cache.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-brand-cyan" />
                Sanitizes DOM tags, redirects, and navigation menus.
              </li>
              <li className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-brand-cyan" />
                Syncs with Devfolio, NSP, Buddy4Study, and Devpost.
              </li>
            </ul>
          </div>

          {/* Hover Morph Card */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end">
            <div 
              onMouseMove={handleCardTilt}
              onMouseLeave={handleCardTiltLeave}
              className="hero-parallax hover-morph-card glass-card border border-white/5 hover:border-brand-cyan/25 transition-colors duration-300 group text-left relative"
            >
              {/* Front view: TypeScript Code */}
              <div 
                className="morph-view-code"
                onMouseEnter={() => handleCursorHover("CODE", true)}
                onMouseLeave={() => handleCursorHover("", false)}
              >
                <div className="flex justify-between items-center mb-4 select-none">
                  <span className="text-[10px] text-slate-500 font-mono">📄 opportunityScraper.ts</span>
                  <span className="h-2 w-2 rounded-full bg-brand-cyan animate-pulse" />
                </div>
                <pre className="text-slate-300 text-[11px] leading-relaxed font-mono overflow-x-auto bg-black/35 p-4 rounded-xl border border-white/5 flex-1">
                  <code>
                    <span className="text-purple-400">async function</span> <span className="text-yellow-300">getInternships</span>(query: <span className="text-teal-300">string</span>): <span className="text-teal-300">Promise&lt;Role[]&gt;</span> {"{"}
                    <br />
                    &nbsp;&nbsp;<span className="text-purple-400">const</span> searchQuery = <span className="text-green-300">`$Input: {"{query}"} internship`</span>;
                    <br />
                    &nbsp;&nbsp;<span className="text-purple-400">const</span> results = <span className="text-purple-400">await</span> <span className="text-yellow-300">searchWebTavily</span>(searchQuery);
                    <br />
                    &nbsp;&nbsp;<span className="text-purple-400">return</span> [...results, ...MOCK_ROLES];
                    <br />
                    {"}"}
                  </code>
                </pre>
              </div>

              {/* Back view: Feature Illustration */}
              <div 
                className="morph-view-feature"
                onMouseEnter={() => handleCursorHover("PREVIEW", true)}
                onMouseLeave={() => handleCursorHover("", false)}
              >
                <div className="flex justify-between items-center mb-4 select-none font-sans">
                  <span className="text-[10px] text-slate-400 font-mono tracking-widest font-extrabold uppercase">Live Opportunities Stream</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <div className="space-y-2.5 font-sans flex-1 flex flex-col justify-center">
                  <div className="p-3 rounded-xl bg-dark-700/60 border border-white/5 flex items-center gap-3">
                    <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20"><Activity className="h-4 w-4" /></div>
                    <div className="text-left"><h5 className="text-xs font-bold text-slate-200">NVIDIA Silicon Design Intern</h5><span className="text-[9px] text-brand-cyan">Match Score: 98% · ASIC &amp; VLSI</span></div>
                  </div>
                  <div className="p-3 rounded-xl bg-dark-700/60 border border-white/5 flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg border border-yellow-500/20"><Award className="h-4 w-4" /></div>
                    <div className="text-left"><h5 className="text-xs font-bold text-slate-200">Google STEP SWE Intern</h5><span className="text-[9px] text-yellow-400">Match Score: 92% · Python &amp; DSA</span></div>
                  </div>
                  <div className="p-3 rounded-xl bg-dark-700/60 border border-white/5 flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20"><GraduationCap className="h-4 w-4" /></div>
                    <div className="text-left"><h5 className="text-xs font-bold text-slate-200">L&amp;T E-Engineering Scholarship</h5><span className="text-[9px] text-emerald-400">Eligibility: CGPA &gt; 8.5 · NSP</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Block 2: Daily Productivity Hub */}
        <div className="reveal-block grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Hover Morph Card */}
          <div className="lg:col-span-7 flex justify-center lg:justify-start order-2 lg:order-1">
            <div 
              onMouseMove={handleCardTilt}
              onMouseLeave={handleCardTiltLeave}
              className="hero-parallax hover-morph-card glass-card border border-white/5 hover:border-brand-purple/25 transition-colors duration-300 group text-left relative"
            >
              {/* Front view: TypeScript Code */}
              <div 
                className="morph-view-code"
                onMouseEnter={() => handleCursorHover("CODE", true)}
                onMouseLeave={() => handleCursorHover("", false)}
              >
                <div className="flex justify-between items-center mb-4 select-none">
                  <span className="text-[10px] text-slate-500 font-mono">📄 studyPlanner.ts</span>
                  <Calendar className="h-3.5 w-3.5 text-brand-purple" />
                </div>
                <pre className="text-slate-300 text-[11px] leading-relaxed font-mono overflow-x-auto bg-black/35 p-4 rounded-xl border border-white/5 flex-1">
                  <code>
                    <span className="text-purple-400">const</span> <span className="text-yellow-300">scheduleExam</span> = (examDate: <span className="text-teal-300">string</span>, courseCode: <span className="text-teal-300">string</span>): <span className="text-teal-300">void</span> =&gt; {"{"}
                    <br />
                    &nbsp;&nbsp;<span className="text-purple-400">const</span> priority = daysLeft(examDate) &lt; 3 ? <span className="text-green-300">"CRITICAL"</span> : <span className="text-green-300">"NORMAL"</span>;
                    <br />
                    &nbsp;&nbsp;calendar.<span className="text-yellow-300">push</span>({"{ courseCode, examDate, priority }"});
                    <br />
                    &nbsp;&nbsp;alerts.<span className="text-yellow-300">trigger</span>(<span className="text-green-300">{"`Exam ${courseCode} logged!`"}</span>);
                    <br />
                    {"};"}
                  </code>
                </pre>
              </div>

              {/* Back view: Feature Illustration */}
              <div 
                className="morph-view-feature"
                onMouseEnter={() => handleCursorHover("PREVIEW", true)}
                onMouseLeave={() => handleCursorHover("", false)}
              >
                <div className="flex justify-between items-center mb-4 select-none font-sans">
                  <span className="text-[10px] text-slate-400 font-mono tracking-widest font-extrabold uppercase">Study Tasks Checklist</span>
                  <Calendar className="h-4 w-4 text-brand-purple" />
                </div>
                <div className="space-y-2.5 font-sans flex-1 flex flex-col justify-center">
                  <div className="p-3 rounded-xl border border-l-4 border-l-brand-purple bg-dark-700/60 border-white/5 text-left">
                    <span className="text-[9px] text-brand-purple uppercase tracking-wider font-bold">Upcoming Assignment</span>
                    <h5 className="text-xs font-bold text-slate-200 mt-0.5">Analog VLSI Lab Report Submission</h5>
                    <div className="flex justify-between items-center mt-2 text-[9px] text-slate-400"><span>Due: Tomorrow at 11:59 PM</span><span className="px-2 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple font-semibold">Priority</span></div>
                  </div>
                  <div className="p-3 rounded-xl border border-l-4 border-l-brand-cyan bg-dark-700/60 border-white/5 text-left">
                    <span className="text-[9px] text-brand-cyan uppercase tracking-wider font-bold">Exam Checklist</span>
                    <h5 className="text-xs font-bold text-slate-200 mt-0.5">Applied Engineering Math Midterm</h5>
                    <div className="flex justify-between items-center mt-2 text-[9px] text-slate-400"><span>Due: Friday in Hall C</span><span className="px-2 py-0.5 rounded-full bg-brand-cyan/20 text-brand-cyan font-semibold">Normal</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5 text-left order-1 lg:order-2 font-sans">
            <span className="text-xs text-brand-purple uppercase tracking-widest font-extrabold font-mono">// Modules / Planner</span>
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 leading-tight">
              Automated Study Scheduler
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Coordinate class lectures, assignments, and test schedules directly through the active calendar grids. Priority parameters are calculated automatically.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-brand-purple" />
                Color-coded warning thresholds mapped to deadlines.
              </li>
              <li className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-brand-purple" />
                Automatic sync of scraper opportunities to calendar lists.
              </li>
            </ul>
          </div>
        </div>

      </section>

      {/* 5. LangGraph Agent Flow Architecture Showcase */}
      <section className="reveal-block w-full py-24 border-t border-white/5 bg-dark-900/30 z-10 relative">
        <div className="max-w-7xl mx-auto px-8 text-center space-y-16">
          <div className="space-y-4 font-mono">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-[10px] font-bold uppercase tracking-wider">
              System Architecture
            </div>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-100">
              LangGraph State Orchestration
            </h3>
            <p className="text-slate-400 text-xs max-w-xl mx-auto leading-relaxed">
              Every request is parsed by a central Planner Node, which routes the task to specialized sub-agents, aggregates the data, and returns a unified layout.
            </p>
          </div>

          {/* Interactive Agent Workflow Visualizer */}
          <div className="glass-card max-w-4xl mx-auto p-8 relative overflow-hidden">
            {/* SVG Pulsing flow paths with animating particle beacons */}
            <div className="absolute inset-0 z-0 pointer-events-none hidden md:block">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                {/* Planner to Internship */}
                <path id="flow-intern" d="M 400 160 L 150 90" stroke="rgba(139, 92, 246, 0.15)" strokeWidth="2" fill="none" />
                <path d="M 400 160 L 150 90" stroke="#8b5cf6" strokeWidth="2" fill="none" className="animate-flow-pulse" />
                <circle r="4" fill="#8b5cf6">
                  <animateMotion dur="2.2s" repeatCount="indefinite" path="M 400 160 L 150 90" />
                </circle>
                
                {/* Planner to Hackathon */}
                <path id="flow-hack" d="M 400 160 L 150 230" stroke="rgba(139, 92, 246, 0.15)" strokeWidth="2" fill="none" />
                <path d="M 400 160 L 150 230" stroke="#8b5cf6" strokeWidth="2" fill="none" className="animate-flow-pulse" />
                <circle r="4" fill="#06b6d4">
                  <animateMotion dur="1.8s" repeatCount="indefinite" path="M 400 160 L 150 230" />
                </circle>

                {/* Planner to Resume */}
                <path id="flow-resume" d="M 400 160 L 650 90" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="2" fill="none" />
                <path d="M 400 160 L 650 90" stroke="#06b6d4" strokeWidth="2" fill="none" className="animate-flow-pulse" />
                <circle r="4" fill="#8b5cf6">
                  <animateMotion dur="2s" repeatCount="indefinite" path="M 400 160 L 650 90" />
                </circle>
                <circle r="4" fill="#06b6d4">
                  <animateMotion dur="2.4s" repeatCount="indefinite" path="M 400 160 L 650 230" />
                </circle>
              </svg>
            </div>

            {/* Nodes Layout */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-16 items-center min-h-[300px] font-mono">
              
              {/* Left Sub-Agents Column */}
              <div className="space-y-12">
                <div className="node-glow-purple p-4 rounded-2xl bg-dark-800/80 border border-brand-purple/30 flex items-center gap-4 hover:scale-105 transition-all duration-300">
                  <div className="p-2 bg-brand-purple/10 text-brand-purple rounded-xl border border-brand-purple/20">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h5 className="text-xs font-bold text-slate-100">Internship Node</h5>
                    <span className="text-[9px] text-slate-500">Scrapes &amp; Maps CV</span>
                  </div>
                </div>
                <div className="node-glow-purple p-4 rounded-2xl bg-dark-800/80 border border-brand-purple/30 flex items-center gap-4 hover:scale-105 transition-all duration-300">
                  <div className="p-2 bg-brand-purple/10 text-brand-purple rounded-xl border border-brand-purple/20">
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h5 className="text-xs font-bold text-slate-100">Hackathon Node</h5>
                    <span className="text-[9px] text-slate-500">Devpost / MLH Portal</span>
                  </div>
                </div>
              </div>

              {/* Central Router Node Column */}
              <div className="flex flex-col items-center justify-center">
                <div 
                  onMouseEnter={() => handleCursorHover("BRAIN", true)}
                  onMouseLeave={() => handleCursorHover("", false)}
                  className="h-28 w-28 rounded-full bg-gradient-to-tr from-brand-violet to-brand-cyan p-0.5 shadow-[0_0_35px_rgba(139,92,246,0.3)] animate-pulse hover:scale-105 transition-all duration-300 flex items-center justify-center cursor-pointer"
                >
                  <div className="h-full w-full rounded-full bg-dark-900 flex flex-col items-center justify-center">
                    <Brain className="h-8 w-8 text-brand-neon" />
                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-300 mt-2">AI Planner</span>
                  </div>
                </div>
              </div>

              {/* Right Sub-Agents Column */}
              <div className="space-y-12">
                <div className="node-glow-cyan p-4 rounded-2xl bg-dark-800/80 border border-brand-cyan/30 flex items-center gap-4 hover:scale-105 transition-all duration-300">
                  <div className="p-2 bg-brand-cyan/10 text-brand-cyan rounded-xl border border-brand-cyan/20">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h5 className="text-xs font-bold text-slate-100">Resume Node</h5>
                    <span className="text-[9px] text-slate-500">ATS Optimization</span>
                  </div>
                </div>
                <div className="node-glow-cyan p-4 rounded-2xl bg-dark-800/80 border border-brand-cyan/30 flex items-center gap-4 hover:scale-105 transition-all duration-300">
                  <div className="p-2 bg-brand-cyan/10 text-brand-cyan rounded-xl border border-brand-cyan/20">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h5 className="text-xs font-bold text-slate-100">Scholarship Node</h5>
                    <span className="text-[9px] text-slate-500">NSP & Eligibility Match</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 6. Capabilities Grid Section */}
      <section className="stagger-card-grid max-w-7xl mx-auto w-full px-8 py-20 z-10 relative">
        <div className="text-left space-y-2 mb-12">
          <span className="text-xs text-brand-purple uppercase tracking-widest font-extrabold font-mono">// Modules / Graph</span>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-200">
            Autonomous Sub-Agent Modules
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
          {capabilities.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <div 
                key={i} 
                onMouseMove={handleCardTilt}
                onMouseLeave={handleCardTiltLeave}
                onMouseEnter={() => handleCursorHover("AGENT", true)}
                className="stagger-card p-6 text-left border border-white/5 hover:border-white/10 bg-[#0a0712]/50 hover:-translate-y-2 transition-all duration-300 group cursor-pointer"
              >
                <div className={`h-10 w-10 rounded-xl bg-white/5 border flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 ${cap.color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <h4 className="font-bold text-slate-200 mb-1 text-base group-hover:text-white transition-colors">{cap.name}</h4>
                <p className="text-slate-400 text-xs leading-relaxed group-hover:text-slate-300 transition-colors">{cap.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3-Layer Opposing Scrolling Marquee Stacks */}
      <section className="py-20 z-10 relative bg-dark-950/20 border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 w-full text-left mb-10">
          <span className="text-xs text-brand-cyan uppercase tracking-widest font-extrabold font-mono">// Live Feeds</span>
          <h3 className="text-3xl sm:text-5xl font-extrabold text-slate-200 leading-tight">
            ⚡ Active Agent Stream Feeds
          </h3>
        </div>

        <div className="marquee-stack-container">
          {/* Row 1: Leftward moving internship targets */}
          <div className="marquee-stack-row marquee-row-1">
            {Array.from({ length: 3 }).map((_, rIdx) => (
              <React.Fragment key={rIdx}>
                <div className="inline-flex gap-6 select-none font-mono">
                  <div className="px-6 py-5 rounded-2xl bg-dark-800/60 border border-white/5 flex items-center gap-4 hover:border-brand-purple/30 transition-all min-w-[280px]">
                    <div className="p-2.5 bg-brand-purple/10 text-brand-purple rounded-xl border border-brand-purple/20"><Briefcase className="h-5 w-5" /></div>
                    <div className="text-left"><h5 className="text-xs font-bold text-slate-200">Google SWE Intern</h5><span className="text-[10px] text-slate-400">Mountain View · USA</span></div>
                  </div>
                  <div className="px-6 py-5 rounded-2xl bg-dark-800/60 border border-white/5 flex items-center gap-4 hover:border-brand-purple/30 transition-all min-w-[280px]">
                    <div className="p-2.5 bg-brand-purple/10 text-brand-purple rounded-xl border border-brand-purple/20"><Briefcase className="h-5 w-5" /></div>
                    <div className="text-left"><h5 className="text-xs font-bold text-slate-200">NVIDIA ASIC Architect</h5><span className="text-[10px] text-slate-400">Bengaluru · India</span></div>
                  </div>
                  <div className="px-6 py-5 rounded-2xl bg-dark-800/60 border border-white/5 flex items-center gap-4 hover:border-brand-purple/30 transition-all min-w-[280px]">
                    <div className="p-2.5 bg-brand-purple/10 text-brand-purple rounded-xl border border-brand-purple/20"><Briefcase className="h-5 w-5" /></div>
                    <div className="text-left"><h5 className="text-xs font-bold text-slate-200">Apple Hardware SWE</h5><span className="text-[10px] text-slate-400">Cupertino · USA</span></div>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Row 2: Rightward moving scholarship/hackathon targets */}
          <div className="marquee-stack-row marquee-row-2">
            {Array.from({ length: 3 }).map((_, rIdx) => (
              <React.Fragment key={rIdx}>
                <div className="inline-flex gap-6 select-none font-mono">
                  <div className="px-6 py-5 rounded-2xl bg-dark-800/60 border border-white/5 flex items-center gap-4 hover:border-brand-cyan/30 transition-all min-w-[280px]">
                    <div className="p-2.5 bg-brand-cyan/10 text-brand-cyan rounded-xl border border-brand-cyan/20"><Award className="h-5 w-5" /></div>
                    <div className="text-left"><h5 className="text-xs font-bold text-slate-200">Devfolio HackIndia</h5><span className="text-[10px] text-slate-400">Active · Prize: $30,000</span></div>
                  </div>
                  <div className="px-6 py-5 rounded-2xl bg-dark-800/60 border border-white/5 flex items-center gap-4 hover:border-brand-cyan/30 transition-all min-w-[280px]">
                    <div className="p-2.5 bg-brand-cyan/10 text-brand-cyan rounded-xl border border-brand-cyan/20"><GraduationCap className="h-5 w-5" /></div>
                    <div className="text-left"><h5 className="text-xs font-bold text-slate-200">NSP Merit Scholarship</h5><span className="text-[10px] text-slate-400">India Govt · Full Tuition</span></div>
                  </div>
                  <div className="px-6 py-5 rounded-2xl bg-dark-800/60 border border-white/5 flex items-center gap-4 hover:border-brand-cyan/30 transition-all min-w-[280px]">
                    <div className="p-2.5 bg-brand-cyan/10 text-brand-cyan rounded-xl border border-brand-cyan/20"><Award className="h-5 w-5" /></div>
                    <div className="text-left"><h5 className="text-xs font-bold text-slate-200">Devpost AI Summit</h5><span className="text-[10px] text-slate-400">Online · Global Hackathon</span></div>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Row 3: Leftward moving contest checklists */}
          <div className="marquee-stack-row marquee-row-3">
            {Array.from({ length: 3 }).map((_, rIdx) => (
              <React.Fragment key={rIdx}>
                <div className="inline-flex gap-6 select-none font-mono">
                  <div className="px-6 py-5 rounded-2xl bg-dark-800/60 border border-white/5 flex items-center gap-4 hover:border-brand-purple/30 transition-all min-w-[280px]">
                    <div className="p-2.5 bg-brand-purple/10 text-brand-purple rounded-xl border border-brand-purple/20"><TerminalIcon className="h-5 w-5" /></div>
                    <div className="text-left"><h5 className="text-xs font-bold text-slate-200">LeetCode Weekly 384</h5><span className="text-[10px] text-slate-400">CP contest · 90 mins</span></div>
                  </div>
                  <div className="px-6 py-5 rounded-2xl bg-dark-800/60 border border-white/5 flex items-center gap-4 hover:border-brand-purple/30 transition-all min-w-[280px]">
                    <div className="p-2.5 bg-brand-purple/10 text-brand-purple rounded-xl border border-brand-purple/20"><TerminalIcon className="h-5 w-5" /></div>
                    <div className="text-left"><h5 className="text-xs font-bold text-slate-200">Codeforces Div.2 Round</h5><span className="text-[10px] text-slate-400">Competitive · 2 hours</span></div>
                  </div>
                  <div className="px-6 py-5 rounded-2xl bg-dark-800/60 border border-white/5 flex items-center gap-4 hover:border-brand-purple/30 transition-all min-w-[280px]">
                    <div className="p-2.5 bg-brand-purple/10 text-brand-purple rounded-xl border border-brand-purple/20"><Calendar className="h-5 w-5" /></div>
                    <div className="text-left"><h5 className="text-xs font-bold text-slate-200">Midterm Preparation</h5><span className="text-[10px] text-slate-400">Study Calendar · Active</span></div>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Path-Drawing Roadmap Section */}
      <section className="roadmap-section max-w-5xl mx-auto w-full px-8 py-24 z-10 relative font-sans">
        <div className="text-center mb-24 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/30 text-brand-purple text-[10px] font-bold uppercase tracking-wider font-mono">
            Development Roadmaps
          </div>
          <h3 className="text-3xl sm:text-5xl font-extrabold text-slate-100">Project Vector Path</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">Scroll to trace the active development progress line through the project milestones.</p>
        </div>

        <div className="relative min-h-[800px] w-full">
          {/* Vertical Winding SVG Path */}
          <svg className="absolute left-1/2 -translate-x-1/2 top-0 h-full w-24 z-0 pointer-events-none hidden md:block" viewBox="0 0 100 800" preserveAspectRatio="none">
            <path d="M 50 0 L 50 180 L 15 280 L 85 450 L 50 600 L 50 800" stroke="rgba(255,255,255,0.04)" strokeWidth="4" fill="none" />
            <path id="roadmap-draw-path" d="M 50 0 L 50 180 L 15 280 L 85 450 L 50 600 L 50 800" stroke="#06b6d4" strokeWidth="4" fill="none" strokeDasharray="1200" strokeDashoffset="1200" />
          </svg>

          {/* Milestone Node 1: Top-Center (y=150) */}
          <div className="relative md:absolute md:top-[120px] md:left-1/2 md:-translate-x-1/2 md:w-[350px] z-10 text-center mb-16 md:mb-0">
            <div className="roadmap-node-1 inline-flex items-center justify-center h-10 w-10 rounded-full bg-dark-900 border border-slate-800 text-slate-500 mb-4 transition-all duration-300 font-mono">1</div>
            <h4 className="text-base font-bold text-slate-100">Phase 1: Agentic Planner Core</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              LangGraph state orchestration layer dividing requests to specialized sub-agents.
            </p>
            <span className="text-[9px] uppercase font-bold text-emerald-400 tracking-widest mt-2 block font-mono">Completed</span>
          </div>

          {/* Milestone Node 2: Left Bend (y=280) */}
          <div className="relative md:absolute md:top-[280px] md:left-[5%] md:w-[340px] z-10 text-center md:text-right mb-16 md:mb-0">
            <div className="roadmap-node-2 inline-flex items-center justify-center h-10 w-10 rounded-full bg-dark-900 border border-slate-800 text-slate-500 mb-4 transition-all duration-300 font-mono">2</div>
            <h4 className="text-base font-bold text-slate-100">Phase 2: Live Crawl Pipeline</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Background crawlers extracting and sanitizing lists from Devfolio, Devpost, and Buddy4Study.
            </p>
            <span className="text-[9px] uppercase font-bold text-emerald-400 tracking-widest mt-2 block font-mono">Completed</span>
          </div>

          {/* Milestone Node 3: Right Bend (y=450) */}
          <div className="relative md:absolute md:top-[450px] md:right-[5%] md:w-[340px] z-10 text-center md:text-left mb-16 md:mb-0">
            <div className="roadmap-node-3 inline-flex items-center justify-center h-10 w-10 rounded-full bg-dark-900 border border-slate-800 text-slate-500 mb-4 transition-all duration-300 font-mono">3</div>
            <h4 className="text-base font-bold text-slate-100">Phase 3: Semantic Vector Memory</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Zero-dependency local vector store indexing user goals across chats to build session memory.
            </p>
            <span className="text-[9px] uppercase font-bold text-emerald-400 tracking-widest mt-2 block font-mono">Completed</span>
          </div>

          {/* Milestone Node 4: Bottom-Center (y=620) */}
          <div className="relative md:absolute md:top-[620px] md:left-1/2 md:-translate-x-1/2 md:w-[350px] z-10 text-center">
            <div className="roadmap-node-4 inline-flex items-center justify-center h-10 w-10 rounded-full bg-dark-900 border border-slate-800 text-slate-500 mb-4 transition-all duration-300 font-mono">4</div>
            <h4 className="text-base font-bold text-slate-100">Phase 4: Collaborative Agent Meshes</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              Enabling sub-agent groups to solve complex multi-layered workflows autonomously.
            </p>
            <span className="text-[9px] uppercase font-bold text-brand-purple tracking-widest mt-2 block font-mono">In Development</span>
          </div>

        </div>
      </section>

      {/* 7. Collapsible FAQ Accordion Section */}
      <section className="reveal-block max-w-4xl mx-auto w-full px-8 py-20 z-10 relative">
        <h3 className="text-xl sm:text-2xl font-extrabold text-center text-slate-100 mb-12 font-mono">
          Frequently Asked Questions
        </h3>
        
        <div className="space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index} 
                className="glass-card overflow-hidden transition-all duration-300"
              >
                <button 
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="font-bold text-xs sm:text-sm text-slate-200 hover:text-white transition-colors font-mono">
                    {item.q}
                  </span>
                  <ChevronDown 
                    className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-cyan' : ''}`}
                  />
                </button>
                <div 
                  className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[200px] border-t border-white/5 p-5' : 'max-h-0'}`}
                  style={{ overflow: 'hidden' }}
                >
                  <p className="text-xs text-slate-400 leading-relaxed font-mono">
                    {item.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. Call to Action Glow Box */}
      <section className="reveal-block max-w-5xl mx-auto w-full px-8 py-24 z-10 relative">
        <div className="rounded-3xl p-12 bg-gradient-to-tr from-brand-violet/20 via-brand-purple/10 to-brand-cyan/20 border border-white/10 text-center space-y-8 shadow-[0_0_50px_rgba(139,92,246,0.15)]">
          <div className="float-decor h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-neon mx-auto shadow-neon">
            <Sparkles className="h-7 w-7" />
          </div>
          <h3 className="text-3xl sm:text-5xl font-extrabold text-slate-100">
            Supercharge Your Academic Journey
          </h3>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed font-sans">
            Consolidate study schedules, automate application scraping pipelines, log expenditures, and execute state-graph workflows today.
          </p>
          <button 
            onClick={onGetStarted}
            onMouseMove={handleMagneticMove}
            onMouseLeave={handleMagneticLeave}
            onMouseEnter={() => handleCursorHover("LAUNCH", true)}
            className="neon-button-purple px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 group text-xs tracking-wider mx-auto transition-all duration-300 font-sans"
          >
            Launch Assistant
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="h-16 border-t border-white/5 flex items-center justify-center text-[10px] text-slate-600 z-10 relative bg-dark-900/80 backdrop-blur-md font-mono">
        &copy; {new Date().getFullYear()} CampusCopilot AI. Compiled on Localhost:8000.
      </footer>
    </div>
  );
};
