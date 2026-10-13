import React, { useEffect, useRef } from 'react';

export type AmbientTheme = 'AURUM' | 'CELESTIAL' | 'VELVET';

interface AmbientBackgroundProps {
  theme: AmbientTheme;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle system configuration
    const particleCount = 42;
    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      maxAlpha: number;
    }[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.8 + 0.8,
        alpha: Math.random() * 0.5,
        maxAlpha: Math.random() * 0.4 + 0.2,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.005;
      ctx.clearRect(0, 0, width, height);

      // Color scheme based on theme
      const goldColor =
        theme === 'AURUM'
          ? 'rgba(255, 215, 0, '
          : theme === 'CELESTIAL'
          ? 'rgba(96, 165, 250, '
          : 'rgba(245, 158, 11, ';

      // Render subtle connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Update position
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Wrap around bounds
        if (p1.x < 0) p1.x = width;
        if (p1.x > width) p1.x = 0;
        if (p1.y < 0) p1.y = height;
        if (p1.y > height) p1.y = 0;

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 160) {
            const lineAlpha = (1 - dist / 160) * 0.12;
            ctx.beginPath();
            ctx.strokeStyle = `${goldColor}${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${goldColor}${p1.maxAlpha * 0.6})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  // Atmospheric background gradients per theme
  const getGradientClasses = () => {
    switch (theme) {
      case 'AURUM':
        return 'from-[#07090D] via-[#090C12] to-[#050608]';
      case 'CELESTIAL':
        return 'from-[#050811] via-[#070B16] to-[#04060B]';
      case 'VELVET':
        return 'from-[#0A090D] via-[#0D0B12] to-[#070609]';
      default:
        return 'from-[#07090D] via-[#090C12] to-[#050608]';
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      {/* Base rich gradient backdrop */}
      <div className={`absolute inset-0 bg-gradient-to-b ${getGradientClasses()} transition-colors duration-1000`} />

      {/* Atmospheric glowing radial orbs */}
      <div
        className={`absolute -top-40 left-1/4 h-[550px] w-[550px] rounded-full blur-[140px] opacity-20 transition-all duration-1000 ${
          theme === 'AURUM'
            ? 'bg-[#FFD700]'
            : theme === 'CELESTIAL'
            ? 'bg-[#38BDF8]'
            : 'bg-[#F59E0B]'
        }`}
      />
      <div
        className={`absolute top-1/2 -right-40 h-[600px] w-[600px] rounded-full blur-[160px] opacity-15 transition-all duration-1000 ${
          theme === 'AURUM'
            ? 'bg-[#D97706]'
            : theme === 'CELESTIAL'
            ? 'bg-[#6366F1]'
            : 'bg-[#DC2626]'
        }`}
      />
      <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-[#1E293B] blur-[150px] opacity-25" />

      {/* Subtle geometric grid texture */}
      <div className="absolute inset-0 bg-grid-subtle opacity-30" />

      {/* Interactive Particle & Constellation Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
};
