import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle class definition
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;
      }

      draw(ctx: CanvasRenderingContext2D, color: string) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
    }

    const particles: Particle[] = Array.from({ length: 65 }, () => new Particle());
    let mouse = { x: -9999, y: -9999 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Determine theme based particle color
      const pColor = theme === 'dark' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(124, 58, 237, 0.18)';
      const lineColor = theme === 'dark' ? 'rgba(6, 182, 212, 0.05)' : 'rgba(139, 92, 246, 0.08)';

      particles.forEach((p, idx) => {
        p.update();
        p.draw(ctx, pColor);

        // Lines between particles
        for (let i = idx + 1; i < particles.length; i++) {
          const other = particles[i];
          const dist = Math.hypot(p.x - other.x, p.y - other.y);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // Lines to mouse
        const mouseDist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (mouseDist < 160) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = theme === 'dark' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(139, 92, 246, 0.12)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};
