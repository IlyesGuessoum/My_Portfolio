import React from 'react';
import { Zone } from '../types';

interface UIOverlayProps {
  activeZone: Zone | null;
  progress: number; // 0 to 1
  isMobile: boolean;
  onInput: (action: 'left' | 'right' | 'jump' | 'interact', active: boolean) => void;
  audioMuted: boolean;
  onToggleAudio: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ 
  activeZone, 
  progress, 
  isMobile, 
  onInput,
  audioMuted,
  onToggleAudio
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-40">
      
      {/* Top HUD */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-white drop-shadow-lg font-mono">
            PORTFOLIO<span className="text-cyan-400">.OS</span>
          </h1>
          <div className="flex items-center gap-2 text-xs text-gray-300 font-mono bg-black/50 px-3 py-1 rounded-full border border-gray-700">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
             ONLINE
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
            {/* Desktop Hint - Top Right */}
            <div className="hidden md:block text-gray-300 font-mono text-xs bg-black/80 px-4 py-2 rounded-lg border border-gray-700 shadow-lg backdrop-blur-md">
                 <span className="text-cyan-400 font-bold border border-cyan-900/50 bg-cyan-900/20 px-1 rounded">←</span> <span className="text-cyan-400 font-bold border border-cyan-900/50 bg-cyan-900/20 px-1 rounded">→</span> Move &nbsp;•&nbsp; <span className="text-cyan-400 font-bold border border-cyan-900/50 bg-cyan-900/20 px-1 rounded">SPACE</span> Jump &nbsp;•&nbsp; <span className="text-cyan-400 font-bold border border-cyan-900/50 bg-cyan-900/20 px-1 rounded">E</span> Interact
            </div>

            <div className="flex gap-4 items-center">
                <button 
                    onClick={onToggleAudio}
                    className="p-2 bg-black/50 hover:bg-white/10 border border-gray-700 rounded-lg text-white transition-all"
                >
                    {audioMuted ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                    )}
                </button>
            </div>
        </div>
      </div>

      {/* Mini-map / Progress Bar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-64 md:w-96 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
        <div 
          className="h-full bg-cyan-500 shadow-[0_0_10px_#22d3ee]"
          style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
        />
      </div>

      {/* Interaction Prompt - Sci-Fi HUD Style */}
      {activeZone && (
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 flex flex-col items-center z-50 animate-bounce">
          <div className="relative group cursor-pointer">
            {/* HUD Box */}
            <div className="bg-black/80 backdrop-blur-md border border-cyan-500/50 px-8 py-4 rounded-lg shadow-[0_0_30px_rgba(34,211,238,0.3)] relative overflow-hidden">
                {/* Scanning line effect */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400/50 animate-[scan_2s_linear_infinite]"></div>
                
                <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-cyan-500 font-mono tracking-[0.3em] uppercase opacity-70">System Alert</span>
                    <div className="flex items-center gap-3">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                        <span className="text-xl font-bold text-white font-mono tracking-wider drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">
                            {activeZone.triggerText || "INTERACT"}
                        </span>
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                    </div>
                </div>

                {/* Decorative corners */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400"></div>
            </div>
            
            {/* Connector Line to character */}
            <div className="w-[1px] h-12 bg-gradient-to-b from-cyan-500/50 to-transparent mx-auto mt-2"></div>
          </div>
        </div>
      )}

      {/* Mobile Controls */}
      <div className="flex justify-between items-end pb-8 pointer-events-auto">
        {/* Only show on mobile */}
        <div className={`flex gap-4 ${!isMobile ? 'hidden md:hidden' : 'flex'}`}>
            <button 
                className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full border border-white/20 active:bg-white/30 flex items-center justify-center"
                onTouchStart={() => onInput('left', true)}
                onTouchEnd={() => onInput('left', false)}
            >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button 
                className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full border border-white/20 active:bg-white/30 flex items-center justify-center"
                onTouchStart={() => onInput('right', true)}
                onTouchEnd={() => onInput('right', false)}
            >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
        </div>

        <div className={`flex gap-4 ${!isMobile ? 'hidden md:hidden' : 'flex'}`}>
            <button 
                className={`w-20 h-20 rounded-full border border-white/20 flex items-center justify-center font-bold text-white transition-all ${activeZone ? 'bg-cyan-500 shadow-[0_0_20px_#22d3ee]' : 'bg-white/10'}`}
                onTouchStart={() => onInput('interact', true)}
                onTouchEnd={() => onInput('interact', false)}
                onClick={() => onInput('interact', true)} // Fallback for click
            >
                INTERACT
            </button>
            <button 
                className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full border border-white/20 active:bg-white/30 flex items-center justify-center"
                onTouchStart={() => onInput('jump', true)}
                onTouchEnd={() => onInput('jump', false)}
            >
               <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            </button>
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;