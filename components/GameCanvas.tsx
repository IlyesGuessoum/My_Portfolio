
import React, { useRef, useEffect, useState } from 'react';
import { PlayerState, InputState, Zone, GameState, Particle } from '../types';
import { 
  WORLD_WIDTH, 
  GRAVITY, 
  MOVEMENT_SPEED, 
  FRICTION, 
  ACCELERATION, 
  JUMP_FORCE, 
  ZONES 
} from '../constants';
import { drawSky, drawMountains, drawCity, drawGround, drawPlayer, drawZoneObject, drawSpeechBubble, drawParticles } from '../utils/drawUtils';
import { initAudio, playFootstepSound, playJumpSound } from '../utils/audioUtils';

interface GameCanvasProps {
  onZoneEnter: (zone: Zone | null) => void;
  onInteract: (zone: Zone) => void;
  gameState: GameState;
  setGameState: (state: GameState) => void;
  isMobile: boolean;
  activeInputRef: React.MutableRefObject<InputState>;
  onUpdateProgress: (progress: number) => void;
  userName?: string;
  audioMuted: boolean; // Added prop
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  onZoneEnter, 
  onInteract, 
  gameState, 
  isMobile,
  activeInputRef,
  onUpdateProgress,
  userName,
  audioMuted
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  
  // Mutable state ref to avoid React render cycle in game loop
  const stateRef = useRef<{
    player: PlayerState;
    cameraX: number;
    activeZone: Zone | null;
    particles: Particle[];
    lastOnGround: boolean;
    lastStepTime: number; // For audio timing
  }>({
    player: { x: 100, y: 0, vx: 0, vy: 0, direction: 1, isMoving: false, isJumping: false },
    cameraX: 0,
    activeZone: null,
    particles: [],
    lastOnGround: false,
    lastStepTime: 0,
  });

  // Initialize audio on first user interaction (browser policy)
  useEffect(() => {
    const handleFirstInteraction = () => {
        initAudio();
        window.removeEventListener('keydown', handleFirstInteraction);
        window.removeEventListener('touchstart', handleFirstInteraction);
        window.removeEventListener('click', handleFirstInteraction);
    };

    window.addEventListener('keydown', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    window.addEventListener('click', handleFirstInteraction);
    return () => {
        window.removeEventListener('keydown', handleFirstInteraction);
        window.removeEventListener('touchstart', handleFirstInteraction);
        window.removeEventListener('click', handleFirstInteraction);
    };
  }, []);

  const updatePhysics = (width: number, height: number) => {
    const s = stateRef.current;
    const input = activeInputRef.current;
    
    // Player Dimensions - Enlarged
    const PLAYER_WIDTH = 120;
    const PLAYER_HEIGHT = 160;
    const GROUND_LEVEL_Y = height - (60 + PLAYER_HEIGHT);
    
    if (gameState === GameState.MODAL_OPEN) return;

    // Movement
    if (input.right) {
      s.player.vx += ACCELERATION;
      s.player.direction = 1;
      s.player.isMoving = true;
    } else if (input.left) {
      s.player.vx -= ACCELERATION;
      s.player.direction = -1;
      s.player.isMoving = true;
    } else {
      s.player.isMoving = false;
    }

    // Jump
    if (input.jump && !s.player.isJumping) {
      s.player.vy = JUMP_FORCE;
      s.player.isJumping = true;
      playJumpSound(audioMuted); // Trigger Jump SFX
    }

    // Physics application
    s.player.vx *= FRICTION;
    
    // === FIX FOR SLIDING/CONTINUOUS SOUND ===
    // Clamp velocity to 0 if it's very small. This prevents the physics
    // from thinking the player is moving when they should be stopped.
    if (Math.abs(s.player.vx) < 0.1) {
        s.player.vx = 0;
        s.player.isMoving = false; // Force stop state
    }

    s.player.x += s.player.vx;
    s.player.y += s.player.vy;
    s.player.vy += GRAVITY;

    // Floor collision
    let isOnGround = false;
    if (s.player.y > GROUND_LEVEL_Y) {
      s.player.y = GROUND_LEVEL_Y;
      s.player.vy = 0;
      s.player.isJumping = false;
      isOnGround = true;
    }

    // === AUDIO LOGIC ===
    // Sound only plays when significantly moving (walking/running)
    if (isOnGround && Math.abs(s.player.vx) > 2.0) {
        const now = Date.now();
        // Step interval depends on speed, roughly every 350ms
        if (now - s.lastStepTime > 350) {
            playFootstepSound(audioMuted);
            s.lastStepTime = now;
        }
    }

    // Particle Generation
    // === LEGENDARY CYBER-RONIN EFFECTS ===
    
    if (isOnGround && Math.abs(s.player.vx) > 0.5) {
        // SIGNIFICANTLY REDUCED FREQUENCY: Only 20% chance per frame
        if (Math.random() > 0.8) {
            const particleId = Date.now() + Math.random();
            const centerX = s.player.x + PLAYER_WIDTH / 2;
            
            // Emit from the back foot position roughly
            const emitX = centerX - (s.player.direction * 40);
            
            // Randomize particle type based on Ronin colors
            const rand = Math.random();
            let pColor, pSize, pLife, pVy;

            if (rand > 0.9) {
                // Legendary Gold Spark (Rare)
                pColor = '#eab308';
                pSize = Math.random() * 2 + 1; // Smaller: 1px to 3px
                pLife = 0.5; // Short life
                pVy = -(Math.random() * 2 + 1); // Shoots up
            } else if (rand > 0.6) {
                // Cyan Energy / Glitch (Uncommon)
                pColor = '#22d3ee';
                pSize = Math.random() * 2 + 1; // Smaller
                pLife = 0.4; // Short life
                pVy = -(Math.random() * 1.5);
            } else {
                // Dark Digital Smoke (Common)
                pColor = '#334155';
                pSize = Math.random() * 3 + 2; // Medium
                pLife = 0.3; // Very short life
                pVy = -(Math.random() * 0.5);
            }

            s.particles.push({
                id: particleId,
                x: emitX + (Math.random() * 20 - 10),
                y: height - 60 - (Math.random() * 5), // Close to ground
                vx: -s.player.direction * (Math.random() * 3 + 1), // Kicked back
                vy: pVy,
                life: pLife,
                size: pSize,
                color: pColor
            });
        }
    }

    // Landing Impact - Digital Shockwave
    if (isOnGround && !s.lastOnGround) {
        // Landing Sound
        playFootstepSound(audioMuted); // Heavier impact
        
        // Reduced burst count
        for (let i = 0; i < 8; i++) {
            const isGold = Math.random() > 0.5;
            s.particles.push({
                id: Date.now() + i,
                x: s.player.x + PLAYER_WIDTH / 2,
                y: height - 60,
                vx: (Math.random() - 0.5) * 10, 
                vy: -(Math.random() * 3 + 1),
                life: 0.6,
                size: Math.random() * 3 + 1,
                color: isGold ? '#eab308' : '#22d3ee'
            });
        }
    }
    s.lastOnGround = isOnGround;

    // Update Particles
    for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04; // Faster fade out (was 0.03)
        
        // Drag effect on particles
        p.vx *= 0.95;
        p.vy += 0.1; // Slight gravity for particles

        if (p.life <= 0) {
            s.particles.splice(i, 1);
        }
    }


    // World bounds
    if (s.player.x < 0) {
        s.player.x = 0;
        s.player.vx = 0;
    }
    if (s.player.x > WORLD_WIDTH - PLAYER_WIDTH) {
        s.player.x = WORLD_WIDTH - PLAYER_WIDTH;
        s.player.vx = 0;
    }

    // Camera Logic (Smooth follow)
    const targetCamX = s.player.x - width / 2 + PLAYER_WIDTH / 2; // Center player
    // Clamp camera
    const maxCamX = WORLD_WIDTH - width;
    s.cameraX += (targetCamX - s.cameraX) * 0.1; // Smooth lerp
    if (s.cameraX < 0) s.cameraX = 0;
    if (s.cameraX > maxCamX) s.cameraX = maxCamX;

    // Zone Detection
    const playerCenterX = s.player.x + PLAYER_WIDTH / 2;
    const foundZone = ZONES.find(z => 
      playerCenterX >= z.x && playerCenterX <= z.x + z.width
    );

    if (foundZone !== s.activeZone) {
      s.activeZone = foundZone || null;
      onZoneEnter(s.activeZone);
    }

    // Interaction Check (Immediate trigger on keypress if inside zone)
    if (foundZone && input.interact) {
        // Debounce interact to prevent multi-fire
        input.interact = false; 
        onInteract(foundZone);
    }

    // Update Progress
    const progress = s.player.x / (WORLD_WIDTH - width);
    onUpdateProgress(progress);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const s = stateRef.current;
    
    // Clear
    ctx.clearRect(0, 0, width, height);

    // Draw World
    drawSky(ctx, width, height);
    drawCity(ctx, s.cameraX, height); // City background layer
    drawMountains(ctx, s.cameraX, height, 1); // Back layer
    drawMountains(ctx, s.cameraX, height, 2); // Front layer
    
    // Zone Objects (Behind ground)
    ZONES.forEach(zone => {
      // Optimize: Only draw if visible on screen
      const screenX = zone.x - s.cameraX;
      if (screenX > -300 && screenX < width + 300) {
        drawZoneObject(ctx, zone.type, zone.x, height - 60, screenX + (zone.width/2), timeRef.current);
      }
    });

    drawGround(ctx, s.cameraX, width, height);
    
    // Draw Particles (With Additive Blending for Glow)
    drawParticles(ctx, s.particles, s.cameraX);

    // Draw Player
    const playerScreenX = s.player.x - s.cameraX;
    drawPlayer(
      ctx, 
      playerScreenX, 
      s.player.y, 
      120, // Enlarged width
      160, // Enlarged height
      s.player.direction, 
      s.player.isMoving,
      timeRef.current
    );

    // Draw Speech Bubble if user name exists
    if (userName) {
        // Calculate bubble position: centered above player
        const bubbleX = playerScreenX + 60; // 120 width / 2
        // Raised by an additional 30px (previously -20, now -50) to float higher above the 160px tall robot
        const bubbleY = s.player.y - 50; 
        
        drawSpeechBubble(
            ctx,
            bubbleX,
            bubbleY,
            `Hello, ${userName}!`,
            timeRef.current
        );
    }

    timeRef.current += 16.67; // Approx 60fps ms
  };

  const loop = () => {
    if (canvasRef.current) {
        updatePhysics(canvasRef.current.width, canvasRef.current.height);
        draw();
    }
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    // Handle resizing
    const handleResize = () => {
        if (canvasRef.current) {
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
        }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    requestRef.current = requestAnimationFrame(loop);
    return () => {
        if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
        window.removeEventListener('resize', handleResize);
    };
  }, [gameState, userName, audioMuted]); // Re-bind if important props change

  return (
    <canvas 
        ref={canvasRef} 
        className="block w-full h-full"
    />
  );
};

export default GameCanvas;
