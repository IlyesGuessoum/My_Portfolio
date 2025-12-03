import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [audioMuted, setAudioMuted] = useState(true);
  
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
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500 shadow-lg shrink-0">
                <img src="https://picsum.photos/seed/profile/200" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-3xl font-bold text-emerald-400">Creative Developer</h3>
                <p className="text-gray-300 leading-relaxed max-w-lg">{ABOUT_TEXT}</p>
                <button className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors">
                  Download Resume
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'skills':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SKILLS.map((category) => (
              <div key={category.category} className="bg-gray-800/50 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-pink-400 mb-4 border-b border-pink-500/30 pb-2">{category.category}</h3>
                <div className="space-y-4">
                  {category.items.map((skill) => (
                    <div key={skill.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-200">{skill.name}</span>
                        <span className="text-pink-300">{skill.level}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-pink-600 to-purple-600" 
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 'projects':
        return (
          <div className="grid grid-cols-1 gap-8">
            {PROJECTS.map((project) => (
              <div key={project.id} className="group relative bg-gray-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-yellow-500 transition-all">
                <div className="flex flex-col md:flex-row">
                   <div className="md:w-1/3 h-48 md:h-auto overflow-hidden">
                      <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   </div>
                   <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-yellow-400 mb-2">{project.title}</h3>
                        <p className="text-gray-300 mb-4">{project.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.tech.map(t => (
                            <span key={t} className="px-2 py-1 bg-gray-700 text-xs text-yellow-200 rounded-md border border-gray-600">{t}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-4">
                         <button className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white py-2 rounded font-bold transition-colors">Live Demo</button>
                         <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded font-bold transition-colors border border-gray-600">GitHub</button>
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'contact':
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <p className="text-gray-300">Interested in working together? Send me a message or find me on social platforms.</p>
              <div className="flex justify-center gap-6">
                 {['GitHub', 'LinkedIn', 'Twitter', 'Behance'].map(social => (
                   <div key={social} className="w-12 h-12 bg-gray-800 hover:bg-violet-600 rounded-full flex items-center justify-center cursor-pointer transition-colors text-xl font-bold text-gray-400 hover:text-white">
                      {social[0]}
                   </div>
                 ))}
              </div>
            </div>
            
            <form className="space-y-4 bg-gray-800/50 p-6 rounded-xl border border-violet-500/20" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-gray-400">Name</label>
                  <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 focus:border-violet-500 focus:outline-none text-white" placeholder="John Doe" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-400">Email</label>
                  <input type="email" className="w-full bg-gray-900 border border-gray-700 rounded p-2 focus:border-violet-500 focus:outline-none text-white" placeholder="john@example.com" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Message</label>
                <textarea rows={4} className="w-full bg-gray-900 border border-gray-700 rounded p-2 focus:border-violet-500 focus:outline-none text-white" placeholder="Tell me about your project..."></textarea>
              </div>
              <button className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg transition-transform hover:scale-[1.01]">
                Send Transmission
              </button>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  // Determine if intro text should be shown or hidden
  const showIntro = !showLogin && progress < 0.02 && !activeModal;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-900">
      <GameCanvas 
        onZoneEnter={handleZoneEnter}
        onInteract={handleInteract}
        gameState={gameState}
        setGameState={setGameState}
        isMobile={isMobile}
        activeInputRef={inputRef}
        onUpdateProgress={setProgress}
        userName={userName}
      />
      
      <UIOverlay 
        activeZone={activeZone}
        progress={progress}
        isMobile={isMobile}
        onInput={handleMobileInput}
        audioMuted={audioMuted}
        onToggleAudio={() => setAudioMuted(!audioMuted)}
      />

      {/* Login Modal */}
      {showLogin && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
            <div className="w-full max-w-md p-8 bg-gray-900 border border-cyan-500 rounded-2xl shadow-[0_0_40px_rgba(34,211,238,0.2)] text-center animate-fade-in">
                <div className="mb-6">
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">SYSTEM LOGIN</h2>
                    <p className="text-gray-400 font-mono text-sm">IDENTIFY YOURSELF, TRAVELER</p>
                </div>
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                    <input 
                        type="text" 
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        placeholder="Enter Username..." 
                        className="w-full bg-black border-2 border-gray-700 focus:border-cyan-500 text-white text-center text-xl py-3 rounded-lg outline-none transition-colors font-mono placeholder-gray-600"
                        autoFocus
                    />
                    <button 
                        type="submit" 
                        disabled={!tempName.trim()}
                        className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold tracking-widest rounded-lg transition-all shadow-lg hover:shadow-cyan-500/30"
                    >
                        INITIALIZE
                    </button>
                </form>
            </div>
        </div>
      )}

      <Modal 
        isOpen={gameState === GameState.MODAL_OPEN} 
        onClose={closeModal}
        title={activeModal?.title || ''}
        color={activeModal?.color || '#fff'}
      >
        {renderModalContent()}
      </Modal>

      {/* Intro Overlay - Restored Position & Smooth Transition */}
      {!showLogin && (
        <div 
            className={`absolute top-[20%] left-6 md:left-20 z-10 flex flex-col items-start text-left pointer-events-none transition-all duration-700 ease-out ${showIntro ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}
        >
           <h2 className="text-4xl md:text-7xl font-black text-white mb-2 drop-shadow-2xl tracking-tighter">
             <span className="block text-cyan-200 font-mono text-xl md:text-3xl mb-1 opacity-80">WELCOME,</span>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 filter drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]">
               {userName}
             </span>
           </h2>
           <div className="relative mt-2">
             <p className="text-lg md:text-2xl text-cyan-100 font-mono tracking-[0.2em] uppercase drop-shadow-lg border-l-4 border-cyan-500 pl-4 bg-black/30 backdrop-blur-sm rounded-r-lg pr-4 py-1">
               TO OUR HUMBLE WORLD
             </p>
           </div>
           
           <div className={`mt-12 transition-opacity duration-1000 delay-500 ${showIntro ? 'opacity-80' : 'opacity-0'}`}>
               <p className="flex items-center gap-3 text-gray-300 text-xs md:text-sm font-mono bg-black/60 px-4 py-2 rounded-full border border-gray-700/50">
                 <span className="animate-pulse w-2 h-2 bg-cyan-400 rounded-full"></span>
                 PRESS <span className="text-white font-bold">[RIGHT ARROW]</span> TO START JOURNEY
               </p>
           </div>
        </div>
      )}
    </div>
  );
}

export default App;