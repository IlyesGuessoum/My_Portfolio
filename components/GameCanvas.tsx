import React, { useRef, useEffect, useState } from 'react';
import { PlayerState, InputState, Zone, GameState } from '../types';
import { 
  WORLD_WIDTH, 
  GRAVITY, 
  MOVEMENT_SPEED, 
  FRICTION, 
  ACCELERATION, 
  JUMP_FORCE, 
  ZONES 
} from '../constants';
import { drawSky, drawMountains, drawCity, drawGround, drawPlayer, drawZoneObject, drawSpeechBubble } from '../utils/drawUtils';

interface GameCanvasProps {
  onZoneEnter: (zone: Zone | null) => void;
  onInteract: (zone: Zone) => void;
  gameState: GameState;
  setGameState: (state: GameState) => void;
  isMobile: boolean;
  activeInputRef: React.MutableRefObject<InputState>;
  onUpdateProgress: (progress: number) => void;
  userName?: string;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  onZoneEnter, 
  onInteract, 
  gameState, 
  isMobile,
  activeInputRef,
  onUpdateProgress,
  userName
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  
  // Mutable state ref to avoid React render cycle in game loop
  const stateRef = useRef<{
    player: PlayerState;
    cameraX: number;
    activeZone: Zone | null;
  }>({
    player: { x: 100, y: 0, vx: 0, vy: 0, direction: 1, isMoving: false, isJumping: false },
    cameraX: 0,
    activeZone: null,
  });

  const updatePhysics = (width: number, height: number) => {
    const s = stateRef.current;
    const input = activeInputRef.current;
    
    // Player Dimensions - Enlarged
    const PLAYER_WIDTH = 120;
    const PLAYER_HEIGHT = 160;
    
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
    }

    // Physics application
    s.player.vx *= FRICTION;
    s.player.x += s.player.vx;
    s.player.y += s.player.vy;
    s.player.vy += GRAVITY;

    // Floor collision
    // Ground block is 60px high.
    const groundY = height - (60 + PLAYER_HEIGHT);
    if (s.player.y > groundY) {
      s.player.y = groundY;
      s.player.vy = 0;
      s.player.isJumping = false;
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
  }, [gameState, userName]); // Re-bind if important props change

  return (
    <canvas 
        ref={canvasRef} 
        className="block w-full h-full"
    />
  );
};

export default GameCanvas;