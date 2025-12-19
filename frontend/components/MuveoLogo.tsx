'use client';

import { useEffect, useState } from 'react';

interface MuveoLogoProps {
  className?: string;
  size?: number;
}

export function MuveoLogo({ className = "", size = 40 }: MuveoLogoProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <div 
        style={{ width: size, height: size }}
        className={className}
        aria-hidden="true"
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="muveo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(175, 80%, 50%)" />
          <stop offset="100%" stopColor="hsl(280, 70%, 60%)" />
        </linearGradient>
        <linearGradient id="muveo-gradient-2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(175, 80%, 60%)" />
          <stop offset="50%" stopColor="hsl(220, 70%, 55%)" />
          <stop offset="100%" stopColor="hsl(280, 70%, 55%)" />
        </linearGradient>
      </defs>
      
      {/* Outer rounded square with gradient border */}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="12"
        fill="none"
        stroke="url(#muveo-gradient)"
        strokeWidth="2.5"
      />
      
      {/* Waveform bars forming a play button shape */}
      <g transform="translate(12, 10)">
        {/* Left wave bars */}
        <rect x="0" y="8" width="3" height="12" rx="1.5" fill="url(#muveo-gradient-2)" opacity="0.7" />
        <rect x="5" y="4" width="3" height="20" rx="1.5" fill="url(#muveo-gradient-2)" opacity="0.85" />
        <rect x="10" y="0" width="3" height="28" rx="1.5" fill="url(#muveo-gradient-2)" />
        
        {/* Center/right forming arrow */}
        <rect x="15" y="4" width="3" height="20" rx="1.5" fill="url(#muveo-gradient-2)" opacity="0.85" />
        <rect x="20" y="8" width="3" height="12" rx="1.5" fill="url(#muveo-gradient-2)" opacity="0.7" />
      </g>
      
      {/* Play triangle overlay */}
      <path
        d="M20 16 L32 24 L20 32 Z"
        fill="url(#muveo-gradient)"
        opacity="0.3"
      />
    </svg>
  );
}

