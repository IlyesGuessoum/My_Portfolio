
import React, { useState, useEffect, useRef } from 'react';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import Modal from './components/Modal';
import { GameState, Zone, InputState } from './types';
import { PROJECTS, SKILLS, ABOUT_TEXT } from './constants';

function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.PLAYING);
  const [activeZone, setActiveZone] = useState<Zone | null>(null);
  const [activeModal, setActiveModal] = useState<Zone | null>(null);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false); // Default to ON for immersion
  
  // User Personalization State
  const [showLogin, setShowLogin] = useState(true);
  const [userName, setUserName] = useState('');
  const [tempName, setTempName] = useState('');

  // Input State (Ref to be shared with game loop)
  const inputRef = useRef<InputState>({
    left: false,
    right: false,
    jump: false,
    interact: false,
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);
    checkMobile();
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable game input if login modal is showing
      if (showLogin) return;

      if (gameState === GameState.MODAL_OPEN) {
        if (e.key === 'Escape') closeModal();
        return;
      }

      switch(e.key.toLowerCase()) {
        case 'arrowleft':
        case 'a':
          inputRef.current.left = true;
          break;
        case 'arrowright':
        case 'd':
          inputRef.current.right = true;
          break;
        case 'arrowup':
        case 'w':
        case ' ':
          inputRef.current.jump = true;
          break;
        case 'e':
        case 'enter':
          inputRef.current.interact = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (showLogin) return;

      switch(e.key.toLowerCase()) {
        case 'arrowleft':
        case 'a':
          inputRef.current.left = false;
          break;
        case 'arrowright':
        case 'd':
          inputRef.current.right = false;
          break;
        case 'arrowup':
        case 'w':
        case ' ':
          inputRef.current.jump = false;
          break;
        case 'e':
        case 'enter':
          inputRef.current.interact = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, showLogin]);

  const handleMobileInput = (action: keyof InputState, active: boolean) => {
    if (showLogin) return;
    inputRef.current[action] = active;
  };

  const handleZoneEnter = (zone: Zone | null) => {
    setActiveZone(zone);
  };

  const handleInteract = (zone: Zone) => {
    setActiveModal(zone);
    setGameState(GameState.MODAL_OPEN);
    // Reset inputs to stop movement when modal opens
    inputRef.current = { left: false, right: false, jump: false, interact: false };
  };

  const closeModal = () => {
    setActiveModal(null);
    setGameState(GameState.PLAYING);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim().length > 0) {
        setUserName(tempName.trim());
        setShowLogin(false);
        // Welcome Animation: Trigger a jump shortly after login closes
        setTimeout(() => {
            inputRef.current.jump = true;
            setTimeout(() => {
                inputRef.current.jump = false;
            }, 300);
        }, 500);
    }
  };

  // Content Renderers
  const renderModalContent = () => {
    if (!activeModal) return null;

    switch (activeModal.type) {
      case 'about':
        return (
          <div className="relative font-mono">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
              <svg className="w-32 h-32 text-cyan-500 animate-[spin_10s_linear_infinite]" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                 <circle cx="50" cy="50" r="45" strokeWidth="1" strokeDasharray="10 5" />
                 <path d="M50 0 L50 100 M0 50 L100 50" strokeWidth="0.5" />
              </svg>
            </div>

            <div className="flex flex-col md:flex-row gap-8 relative z-10">
              {/* Profile/Home Base Visual Column */}
              <div className="flex flex-col items-center gap-4 shrink-0">
                <div className="relative w-56 h-56 group bg-[#050b14] overflow-hidden rounded-2xl border border-cyan-500/50 shadow-[0_0_25px_rgba(34,211,238,0.15)]">
                  {/* Digital Grid Background */}
                  <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, rgba(34, 211, 238, 0.15) 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                  
                  {/* ULTRA-DETAILED ISOMETRIC CITADEL SVG */}
                  <svg className="absolute inset-0 w-full h-full p-2 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="gradBase" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#1e293b" />
                          <stop offset="100%" stopColor="#0f172a" />
                        </linearGradient>
                        <linearGradient id="gradGlass" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="rgba(34, 211, 238, 0.6)" />
                          <stop offset="100%" stopColor="rgba(6, 182, 212, 0.2)" />
                        </linearGradient>
                        <linearGradient id="gradGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#22d3ee" />
                          <stop offset="100%" stopColor="#0891b2" />
                        </linearGradient>
                      </defs>

                      {/* --- BASE PLATFORM (Isometric Hexagon) --- */}
                      <path d="M100 180 L160 150 L160 130 L100 160 L40 130 L40 150 Z" fill="url(#gradBase)" stroke="#0e7490" strokeWidth="2" />
                      <path d="M100 160 L160 130 L100 100 L40 130 Z" fill="#1e293b" opacity="0.8">
                        <animate attributeName="opacity" values="0.8;0.6;0.8" dur="4s" repeatCount="indefinite" />
                      </path>
                      {/* Grid on base */}
                      <path d="M100 160 L100 100 M40 130 L160 130" stroke="#0e7490" strokeWidth="0.5" />

                      {/* --- MAIN STRUCTURE --- */}
                      {/* Level 1 Block */}
                      <path d="M130 130 L130 90 L100 105 L70 90 L70 130 L100 145 Z" fill="#0f172a" stroke="#22d3ee" strokeWidth="1" />
                      
                      {/* Level 2 (Glass Atrium) */}
                      <path d="M125 90 L125 60 L100 75 L75 60 L75 90 L100 105 Z" fill="url(#gradGlass)" stroke="#a5f3fc" strokeWidth="1" />
                      {/* Internal light */}
                      <circle cx="100" cy="85" r="5" fill="#fef08a" className="animate-pulse" filter="blur(2px)" />

                      {/* Level 3 (Command Deck) */}
                      <path d="M115 60 L115 40 L100 50 L85 40 L85 60 L100 75 Z" fill="#1e293b" stroke="#22d3ee" strokeWidth="1" />
                      <path d="M100 40 L115 32 L100 24 L85 32 Z" fill="#22d3ee" className="animate-pulse" />

                      {/* --- DETAILS --- */}
                      {/* Energy Bridge */}
                      <path d="M130 110 L160 95" stroke="#22d3ee" strokeWidth="2" strokeDasharray="4 2" className="animate-[pulse_1s_linear_infinite]" />
                      <circle cx="160" cy="95" r="3" fill="#22d3ee" />

                      {/* Floating Data Cubes */}
                      <rect x="40" y="60" width="10" height="10" transform="rotate(45 45 65)" fill="url(#gradGlow)" className="animate-[bounce_3s_infinite]" />
                      <rect x="150" y="50" width="8" height="8" transform="rotate(45 154 54)" fill="url(#gradGlow)" className="animate-[bounce_4s_infinite]" />

                      {/* Flying Drone */}
                      <g className="animate-[spin_8s_linear_infinite] origin-[100px_80px]">
                         <circle cx="100" cy="20" r="2" fill="#f43f5e" />
                         <path d="M100 20 L100 80" stroke="#f43f5e" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.5" />
                      </g>
                      
                      {/* Holographic Rings */}
                      <ellipse cx="100" cy="130" rx="50" ry="25" stroke="#22d3ee" strokeWidth="0.5" fill="none" className="animate-[spin_10s_linear_infinite]" opacity="0.3" />
                  </svg>
                </div>
                
                {/* ID Card / Stats */}
                <div className="w-56 bg-black/40 border border-cyan-500/30 rounded-lg p-3 font-mono text-xs text-cyan-300">
                    <div className="flex justify-between border-b border-cyan-500/30 pb-1 mb-2">
                        <span>CLASS</span>
                        <span className="text-white">CYBER-DEV</span>
                    </div>
                    <div className="flex justify-between border-b border-cyan-500/30 pb-1 mb-2">
                        <span>LEVEL</span>
                        <span className="text-white">MAX_INT</span>
                    </div>
                    <div className="flex justify-between">
                        <span>ORIGIN</span>
                        <span className="text-white">NET_CITY</span>
                    </div>
                </div>
              </div>

              {/* Bio Content */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                    <h3 className="text-lg text-cyan-400 font-bold tracking-widest">USER_BIO_DECRYPTED</h3>
                </div>
                
                <p className="text-gray-300 leading-relaxed border-l-2 border-cyan-500/20 pl-4 py-1">
                  {ABOUT_TEXT}
                </p>

                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-cyan-900/10 border border-cyan-500/20 p-3 rounded">
                        <div className="text-cyan-500 text-xs mb-1">CURRENT STATUS</div>
                        <div className="text-white">OPEN TO WORK</div>
                    </div>
                    <div className="bg-cyan-900/10 border border-cyan-500/20 p-3 rounded">
                        <div className="text-cyan-500 text-xs mb-1">SPECIALIZATION</div>
                        <div className="text-white">FULL STACK</div>
                    </div>
                </div>

                <div className="pt-4">
                    <button className="group relative px-6 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500 text-cyan-400 hover:text-white transition-all overflow-hidden rounded">
                        <div className="absolute inset-0 w-full h-full bg-cyan-400/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></div>
                        <span className="relative font-bold tracking-wider flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            EXTRACT DATA LOG
                        </span>
                    </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="font-mono">
            {/* Header / Neural Net Viz */}
            <div className="mb-8 flex items-center justify-between border-b border-fuchsia-500/30 pb-4">
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 flex items-center justify-center">
                        <div className="absolute inset-0 border-2 border-fuchsia-500 rounded-full animate-ping opacity-20"></div>
                        <div className="w-4 h-4 bg-fuchsia-500 rounded-full shadow-[0_0_10px_#d946ef]"></div>
                    </div>
                    <h3 className="text-2xl text-fuchsia-400 tracking-widest font-bold">NEURAL_LINKS_ACTIVE</h3>
                </div>
                <div className="text-xs text-fuchsia-300/60">SYS_OPTIMIZED: 98%</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SKILLS.map((category) => (
                <div key={category.category} className="group relative bg-[#1a051d] border border-fuchsia-500/30 p-5 rounded-xl hover:border-fuchsia-500 transition-all duration-300 overflow-hidden">
                  {/* Hover Scan Effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-fuchsia-500/5 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-700"></div>

                  <h3 className="text-lg font-bold mb-4 text-fuchsia-200 border-l-4 border-fuchsia-500 pl-3">
                    {category.category.replace('_', ' ')}
                  </h3>
                  
                  <div className="space-y-4 relative z-10">
                    {category.items.map((skill) => (
                      <div key={skill.name}>
                        <div className="flex justify-between mb-1 text-xs tracking-wider text-fuchsia-100/80">
                          <span>{skill.name}</span>
                          <span className="font-bold">{skill.level}%</span>
                        </div>
                        {/* Segmented Progress Bar */}
                        <div className="flex gap-1 h-2">
                           {[...Array(10)].map((_, i) => (
                              <div 
                                key={i}
                                className={`flex-1 rounded-sm transition-all duration-500 ${
                                    i < skill.level / 10 
                                    ? 'bg-fuchsia-500 shadow-[0_0_5px_#d946ef]' 
                                    : 'bg-fuchsia-900/30'
                                }`}
                                style={{ 
                                    opacity: i < skill.level / 10 ? 1 : 0.3,
                                    animationDelay: `${i * 0.05}s` 
                                }}
                              />
                           ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className="font-mono text-amber-500">
             <div className="flex justify-between items-end mb-6 border-b-2 border-amber-500/20 pb-2">
                <h3 className="text-3xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                    MISSION_LOGS
                </h3>
                <span className="text-xs bg-amber-500/10 px-2 py-1 rounded text-amber-300 border border-amber-500/30">
                    CLASSIFIED FILES
                </span>
             </div>

            <div className="grid grid-cols-1 gap-12">
              {PROJECTS.map((project, index) => (
                <div key={project.id} className="relative group perspective-1000">
                  {/* Holographic Card Container */}
                  <div className="relative bg-[#0c0a00] border border-amber-500/30 rounded-lg p-1 overflow-hidden transition-all duration-300 group-hover:border-amber-400 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                    
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-500"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-500"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-500"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-500"></div>

                    <div className="flex flex-col md:flex-row gap-6 p-4">
                        {/* Image Holo-Projector */}
                        <div className="md:w-5/12 relative rounded overflow-hidden border border-amber-900/50">
                            <img 
                                src={project.image} 
                                alt={project.title} 
                                className="w-full h-48 md:h-full object-cover filter sepia-[0.5] hue-rotate-[-30deg] contrast-125 group-hover:filter-none transition-all duration-500"
                            />
                            {/* Scanlines */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,11,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
                        </div>

                        {/* Data Content */}
                        <div className="md:w-7/12 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs text-amber-700 font-bold border border-amber-800 px-1">REF_0{index + 1}</span>
                                    <h4 className="text-2xl font-bold text-amber-100 group-hover:text-white transition-colors">{project.title}</h4>
                                </div>
                                
                                <p className="text-amber-200/70 text-sm leading-relaxed mb-4 border-l border-amber-500/30 pl-3">
                                    {project.description}
                                </p>
                                
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {project.tech.map((t) => (
                                    <span key={t} className="px-2 py-1 text-[10px] uppercase tracking-wider bg-amber-900/20 text-amber-300 border border-amber-500/20">
                                        {t}
                                    </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 mt-auto">
                                <button className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all">
                                    <span className="w-2 h-2 bg-black animate-pulse"></span> Initiate
                                </button>
                                <button className="flex-1 py-2 border border-amber-500 text-amber-500 hover:bg-amber-500/10 font-bold uppercase text-xs tracking-widest transition-all">
                                    Source_Code
                                </button>
                            </div>
                        </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="font-mono max-w-2xl mx-auto">
             <div className="text-center mb-8">
                 <div className="inline-block border border-violet-500/50 bg-violet-900/10 px-6 py-2 rounded-full mb-4">
                     <span className="w-2 h-2 inline-block bg-violet-400 rounded-full animate-pulse mr-2"></span>
                     <span className="text-violet-300 text-xs tracking-[0.2em]">SECURE_CHANNEL_OPEN</span>
                 </div>
                 <h2 className="text-3xl text-white font-bold">TRANSMISSION_TERMINAL</h2>
             </div>
            
            <div className="relative bg-black/60 border border-violet-500/30 p-8 rounded-lg shadow-[0_0_50px_rgba(139,92,246,0.1)]">
               {/* Terminal dots */}
               <div className="flex gap-2 mb-6 border-b border-gray-800 pb-4">
                   <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                   <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                   <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
               </div>

                <form className="space-y-6">
                    <div className="group">
                        <label className="block text-xs text-violet-400 mb-1 opacity-70 group-focus-within:opacity-100 transition-opacity">IDENTIFIER_NAME</label>
                        <input 
                            type="text" 
                            className="w-full bg-transparent border-b border-gray-700 text-white p-2 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                            placeholder="> Enter sender identity..."
                        />
                    </div>
                    <div className="group">
                        <label className="block text-xs text-violet-400 mb-1 opacity-70 group-focus-within:opacity-100 transition-opacity">COMM_FREQUENCY (EMAIL)</label>
                        <input 
                            type="email" 
                            className="w-full bg-transparent border-b border-gray-700 text-white p-2 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                            placeholder="> Enter return frequency..."
                        />
                    </div>
                    <div className="group">
                        <label className="block text-xs text-violet-400 mb-1 opacity-70 group-focus-within:opacity-100 transition-opacity">ENCRYPTED_MESSAGE</label>
                        <textarea 
                            className="w-full bg-violet-900/5 border border-gray-700 text-white p-4 h-32 focus:outline-none focus:border-violet-500 transition-colors font-mono resize-none"
                            placeholder="> Input data stream..."
                        ></textarea>
                    </div>
                    <button className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-4 rounded shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all uppercase tracking-widest flex items-center justify-center gap-3 group">
                        <span>TRANSMIT_SIGNAL</span>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                </form>

                 <div className="mt-8 pt-6 border-t border-gray-800 flex justify-center gap-8">
                     {['GITHUB_UPLINK', 'LINKEDIN_NODE', 'TWITTER_FEED'].map(social => (
                         <a key={social} href="#" className="text-xs text-gray-500 hover:text-violet-400 transition-colors tracking-widest border border-transparent hover:border-violet-500/30 px-3 py-1 rounded">
                             [{social}]
                         </a>
                     ))}
                 </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden select-none font-sans">
      <GameCanvas 
        gameState={gameState}
        setGameState={setGameState}
        onZoneEnter={handleZoneEnter}
        onInteract={handleInteract}
        isMobile={isMobile}
        activeInputRef={inputRef}
        onUpdateProgress={setProgress}
        userName={userName}
        audioMuted={audioMuted}
      />
      
      <UIOverlay 
        activeZone={activeZone}
        progress={progress}
        isMobile={isMobile}
        onInput={handleMobileInput}
        audioMuted={audioMuted}
        onToggleAudio={() => setAudioMuted(!audioMuted)}
      />

      <Modal
        isOpen={gameState === GameState.MODAL_OPEN}
        onClose={closeModal}
        title={activeModal?.title || ''}
        color={activeModal?.color || '#fff'}
      >
        {renderModalContent()}
      </Modal>

      {/* Login / Intro Overlay */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
            <div className="w-full max-w-md p-8 bg-gray-900/50 border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(34,211,238,0.2)]">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white font-mono tracking-tighter mb-2">SYSTEM LOGIN</h1>
                    <p className="text-cyan-400/60 font-mono text-sm">SECURE TERMINAL ACCESS</p>
                </div>
                
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <input 
                            type="text" 
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            className="relative w-full bg-black border border-gray-800 rounded-lg px-4 py-4 text-white text-center font-mono placeholder-gray-700 focus:outline-none focus:border-cyan-500 transition-colors"
                            placeholder="ENTER IDENTITY..."
                            autoFocus
                        />
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={tempName.trim().length === 0}
                        className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all transform hover:scale-[1.02] shadow-lg font-mono tracking-widest"
                    >
                        INITIALIZE_SESSION
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Intro Text Overlay (After Login) */}
      {!showLogin && (
        <div 
            className={`absolute top-[20%] left-6 md:left-20 pointer-events-none transition-all duration-1000 ease-in-out ${
                progress > 0.02 ? 'opacity-0 -translate-y-10' : 'opacity-100 translate-y-0'
            }`}
        >
          <div className="overflow-hidden">
             <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-400 drop-shadow-[0_0_30px_rgba(34,211,238,0.5)] hologram-text creative-enter">
               HELLO, <br/>
               <span className="text-cyan-400">{userName.toUpperCase()}</span>
             </h1>
          </div>
          <p className="mt-4 text-xl md:text-2xl text-cyan-200/80 font-mono tracking-[0.2em] creative-enter" style={{ animationDelay: '0.2s' }}>
             WELCOME TO OUR HUMBLE WORLD
          </p>
          
          <div className="mt-8 flex items-center gap-4 creative-enter" style={{ animationDelay: '0.5s' }}>
             <div className="w-12 h-[1px] bg-cyan-500"></div>
             <p className="text-sm text-cyan-400 font-mono">INITIATE MOVEMENT SEQUENCE [RIGHT]</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
