
import { Particle } from '../types';

// Utility to draw the background and environmental elements

export const drawSky = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#0f172a'); // Very Dark Blue
  gradient.addColorStop(0.4, '#1e1b4b'); // Indigo
  gradient.addColorStop(1, '#4c1d95'); // Purple
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
};

export const drawCity = (ctx: CanvasRenderingContext2D, cameraX: number, height: number) => {
  const parallaxSpeed = 0.15;
  const offset = cameraX * parallaxSpeed;
  const cityColor = '#1e1b4b'; // Dark silhouette
  const windowColor1 = 'rgba(255, 255, 0, 0.3)'; // Yellowish
  const windowColor2 = 'rgba(0, 255, 255, 0.3)'; // Cyanish

  ctx.fillStyle = cityColor;
  
  // Deterministic random city generation based on x index
  const buildingWidth = 60;
  const gap = 10;
  const startIdx = Math.floor(offset / (buildingWidth + gap)) - 2;
  const endIdx = startIdx + Math.ceil(ctx.canvas.width / (buildingWidth + gap)) + 4;

  for (let i = startIdx; i < endIdx; i++) {
    // Pseudo-random height based on index
    const h = 200 + Math.abs(Math.sin(i * 132.12) * 300) + Math.abs(Math.cos(i * 44.5) * 100);
    const x = i * (buildingWidth + gap) - offset;
    const y = height - h;

    // Building body
    ctx.fillStyle = cityColor;
    ctx.fillRect(x, y, buildingWidth, h);

    // Windows
    const seed = Math.abs(Math.sin(i));
    if (seed > 0.3) {
      const rows = Math.floor(h / 20);
      const cols = Math.floor(buildingWidth / 15);
      
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.sin(i * r * c + r) > 0.6) { // Random lights on/off
             ctx.fillStyle = (r + c) % 2 === 0 ? windowColor1 : windowColor2;
             ctx.fillRect(x + 5 + c * 12, y + 10 + r * 20, 6, 10);
          }
        }
      }
    }
    
    // Antennas
    if (seed > 0.7) {
       ctx.fillStyle = '#312e81';
       ctx.fillRect(x + buildingWidth / 2 - 2, y - 40, 4, 40);
       ctx.beginPath();
       ctx.arc(x + buildingWidth / 2, y - 40, 2, 0, Math.PI * 2);
       ctx.fillStyle = 'red';
       ctx.fill();
    }
  }
};

export const drawMountains = (ctx: CanvasRenderingContext2D, cameraX: number, height: number, layer: number) => {
  const parallaxSpeed = layer === 1 ? 0.25 : 0.6;
  const color = layer === 1 ? '#312e81' : '#4338ca';
  const offset = cameraX * parallaxSpeed;
  
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, height);
  
  // Procedural mountains using sine waves for simplicity but effective silhouette
  for (let x = 0; x <= ctx.canvas.width; x += 10) {
    const worldX = x + offset;
    // Layer 1 is taller/further, Layer 2 is shorter/closer
    const noise = Math.sin(worldX * 0.002) * 100 + Math.sin(worldX * 0.01) * 20;
    const mountainHeight = layer === 1 ? 250 : 120;
    const y = height - (mountainHeight + noise);
    ctx.lineTo(x, y);
  }
  
  ctx.lineTo(ctx.canvas.width, height);
  ctx.lineTo(0, height);
  ctx.fill();
};

export const drawGround = (ctx: CanvasRenderingContext2D, cameraX: number, width: number, height: number) => {
  const groundHeight = 60;
  ctx.fillStyle = '#0f172a'; // Dark slate
  ctx.fillRect(0, height - groundHeight, width, groundHeight);
  
  // Draw top border
  ctx.strokeStyle = '#22d3ee'; // Cyan neon line
  ctx.lineWidth = 3;
  ctx.shadowBlur = 10;
  ctx.shadowColor = '#22d3ee';
  ctx.beginPath();
  ctx.moveTo(0, height - groundHeight);
  ctx.lineTo(width, height - groundHeight);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Draw Grid lines on ground for perspective/speed sensation
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.15)';
  ctx.lineWidth = 1;
  const gridSize = 120;
  const startX = -(cameraX % gridSize);
  
  for (let x = startX; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, height - groundHeight);
    ctx.lineTo(x - 150, height); // Slanted for pseudo-3D
    ctx.stroke();
  }
};

export const drawParticles = (ctx: CanvasRenderingContext2D, particles: Particle[], cameraX: number) => {
  ctx.save();
  // Additive blending makes overlapping particles glow intensely (Neon effect)
  ctx.globalCompositeOperation = 'lighter';
  
  particles.forEach(p => {
    const screenX = p.x - cameraX;
    
    // Only draw if on screen
    if (screenX > -20 && screenX < ctx.canvas.width + 20) {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      
      // Dynamic Shadow for glow
      ctx.shadowBlur = p.color === '#334155' ? 0 : 15; // No glow for smoke, high glow for energy
      ctx.shadowColor = p.color;
      
      // Draw Logic: Mix of Squares and Glitch Lines
      if (p.color === '#22d3ee' || p.color === '#eab308') {
          // Glitch / Spark style (Stretched horizontally for speed)
          const width = p.size * (Math.random() > 0.5 ? 2.5 : 1);
          const height = p.size * 0.6;
          ctx.fillRect(screenX, p.y, width, height);
      } else {
          // Smoke / Dust style (Square/Blocky)
          ctx.fillRect(screenX - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
    }
  });
  
  ctx.restore();
};

export const drawPlayer = (
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  direction: 1 | -1,
  isMoving: boolean,
  time: number
) => {
  // === THE CYBER-RONIN ===
  // A futuristic Samurai with dark armor, gold accents, and a flowing digital coat.
  
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  
  const baseHeight = 110;
  const scale = height / baseHeight;
  ctx.scale(direction * scale, scale);

  // Animation Variables
  const t = time * 0.005;
  const breath = Math.sin(t) * 1;
  const runCycle = isMoving ? Math.sin(t * 3) : 0;
  
  // Colors
  const cArmor = '#0f172a'; // Slate 900 (Dark Armor)
  const cGold = '#eab308'; // Yellow 500 (Gold Trim)
  const cCloth = '#334155'; // Slate 700 (Coat)
  const cNeon = '#ef4444'; // Red Neon (Visor/Accents)
  const cBlade = '#22d3ee'; // Cyan (Katana)

  // Lean forward when running
  if (isMoving) {
      ctx.rotate(0.2); 
      ctx.translate(0, 5);
  }

  // 1. THE DIGITAL HAORI (Coat) - Behind body
  // Flows violently when running, gently when idle
  ctx.save();
  ctx.translate(-5, -35); // Shoulder anchor
  
  // Draw multiple strips of cloth
  for (let i = 0; i < 4; i++) {
    const lag = i * 0.3;
    const flow = isMoving 
        ? Math.sin(t * 3 - lag) * 15 + 20 // Violent flow back
        : Math.sin(t - lag) * 5; // Gentle sway
    
    const len = 60 + i * 5;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    // Control points for bezier cloth
    ctx.bezierCurveTo(
        -20 - flow, 20, 
        -30 - flow, 40, 
        -40 - flow * 1.5, len
    );
    
    ctx.lineWidth = 10;
    ctx.strokeStyle = cCloth;
    ctx.lineCap = 'butt';
    ctx.stroke();

    // Digital "glitch" tip
    ctx.fillStyle = cGold;
    ctx.beginPath();
    ctx.arc(-40 - flow * 1.5, len, 2, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.restore();

  // 2. LEGS (Hakama style pants + Greaves)
  ctx.save();
  ctx.translate(0, 10);
  
  // Back Leg
  ctx.save();
  const backLegAngle = isMoving ? Math.sin(t * 3 + Math.PI) * 0.8 : 0.1;
  ctx.rotate(backLegAngle);
  ctx.translate(0, 15);
  // Thigh (Hakama)
  ctx.fillStyle = '#1e293b'; 
  ctx.beginPath(); ctx.moveTo(-6, -15); ctx.lineTo(6, -15); ctx.lineTo(8, 10); ctx.lineTo(-8, 10); ctx.fill();
  // Greave (Armor)
  ctx.fillStyle = cArmor;
  ctx.fillRect(-5, 10, 10, 15);
  ctx.strokeStyle = cGold; ctx.lineWidth = 1; ctx.strokeRect(-5, 10, 10, 15);
  // Boot
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.moveTo(-5, 25); ctx.lineTo(8, 25); ctx.lineTo(8, 28); ctx.lineTo(-6, 28); ctx.fill();
  ctx.restore();

  // Front Leg
  ctx.save();
  const frontLegAngle = isMoving ? Math.sin(t * 3) * 0.8 : -0.1;
  ctx.rotate(frontLegAngle);
  ctx.translate(0, 15);
  // Thigh
  ctx.fillStyle = '#1e293b'; 
  ctx.beginPath(); ctx.moveTo(-6, -15); ctx.lineTo(6, -15); ctx.lineTo(8, 10); ctx.lineTo(-8, 10); ctx.fill();
  // Greave
  ctx.fillStyle = cArmor;
  ctx.fillRect(-5, 10, 10, 15);
  ctx.strokeStyle = cGold; ctx.lineWidth = 1; ctx.strokeRect(-5, 10, 10, 15);
  // Boot
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.moveTo(-5, 25); ctx.lineTo(8, 25); ctx.lineTo(8, 28); ctx.lineTo(-6, 28); ctx.fill();
  ctx.restore();

  ctx.restore(); // End Legs

  // 3. TORSO (Armor Plate)
  ctx.save();
  ctx.translate(0, -10 + breath);
  
  // Body armor shape
  ctx.fillStyle = cArmor;
  ctx.beginPath();
  ctx.moveTo(-12, -25); // Shoulder L
  ctx.lineTo(12, -25);  // Shoulder R
  ctx.lineTo(10, 15);   // Waist R
  ctx.lineTo(-10, 15);  // Waist L
  ctx.fill();
  
  // Gold Trim
  ctx.strokeStyle = cGold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-12, -25); ctx.lineTo(-5, 15);
  ctx.moveTo(12, -25); ctx.lineTo(5, 15);
  ctx.stroke();

  // Reactor/Symbol on chest
  ctx.fillStyle = cNeon;
  ctx.shadowColor = cNeon;
  ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.arc(0, -5, 3, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;

  // 4. ARMS
  // Back Arm (Holding Sheath or Swinging)
  ctx.save();
  ctx.translate(-12, -20);
  ctx.rotate(isMoving ? -runCycle : 0.1);
  ctx.fillStyle = '#334155'; // Undersuit
  ctx.fillRect(-3, 0, 6, 12); // Upper
  ctx.fillStyle = cArmor; // Gauntlet
  ctx.fillRect(-4, 12, 8, 12);
  ctx.restore();

  // 5. KATANA (On Back)
  ctx.save();
  ctx.rotate(-0.5); // Tilt
  ctx.translate(5, -15);
  // Sheath
  ctx.fillStyle = '#111';
  ctx.fillRect(-2, -30, 4, 50);
  // Handle
  ctx.fillStyle = '#fff';
  ctx.fillRect(-2, -40, 4, 10);
  // Tsuba (Guard) - Gold
  ctx.fillStyle = cGold;
  ctx.fillRect(-4, -30, 8, 2);
  ctx.restore();

  // Front Arm
  ctx.save();
  ctx.translate(12, -20);
  ctx.rotate(isMoving ? runCycle : -0.1);
  ctx.fillStyle = '#334155';
  ctx.fillRect(-3, 0, 6, 12);
  ctx.fillStyle = cArmor; // Gauntlet
  ctx.fillRect(-4, 12, 8, 12);
  ctx.strokeStyle = cGold;
  ctx.strokeRect(-4, 12, 8, 12);
  ctx.restore();

  // 6. HEAD (Kabuto Helmet)
  ctx.translate(0, -28);
  
  // Helmet Base
  ctx.fillStyle = cArmor;
  ctx.beginPath();
  ctx.moveTo(-9, -10);
  ctx.quadraticCurveTo(0, -15, 9, -10); // Top dome
  ctx.lineTo(10, 5);
  ctx.lineTo(0, 10); // Chin
  ctx.lineTo(-10, 5);
  ctx.fill();

  // Visor (The Cyber Eye)
  ctx.strokeStyle = cNeon;
  ctx.lineWidth = 2;
  ctx.shadowColor = cNeon;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(-6, -2);
  ctx.lineTo(6, -2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Horns (Kuwarigata) - Gold
  ctx.fillStyle = cGold;
  ctx.beginPath();
  ctx.moveTo(-10, -5); ctx.lineTo(-15, -20); ctx.lineTo(-8, -10); // L
  ctx.moveTo(10, -5); ctx.lineTo(15, -20); ctx.lineTo(8, -10); // R
  ctx.fill();

  ctx.restore(); // End Head & Torso
  ctx.restore(); // End Player
};

export const drawZoneObject = (ctx: CanvasRenderingContext2D, zoneType: string, x: number, y: number, screenX: number, time: number) => {
  const floatY = Math.sin(time * 0.005) * 10;
  const s = 2.5; // Scale factor
  
  ctx.save();
  ctx.translate(screenX, y + floatY);
  
  // Shadow for all buildings
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.ellipse(0, 45, 100, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  if (zoneType === 'welcome') {
     const scaleHand = 3.5;
    const pointOffset = Math.sin(time * 0.008) * 15;
    ctx.save();
    ctx.translate(0, -60 * s);
    for (let i = 0; i < 3; i++) {
        const offset = (time * 0.05 + i * 20) % 60;
        const opacity = Math.max(0, 1 - (offset / 50));
        ctx.strokeStyle = `rgba(34, 211, 238, ${opacity})`;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 10 * opacity;
        ctx.shadowColor = '#22d3ee';
        ctx.beginPath();
        const chevronX = -120 + offset * 1.5;
        ctx.moveTo(chevronX, -20);
        ctx.lineTo(chevronX + 20, 0);
        ctx.lineTo(chevronX, 20);
        ctx.stroke();
    }
    ctx.translate(pointOffset - 20, 0);
    const grad = ctx.createLinearGradient(-40, 0, 40, 0);
    grad.addColorStop(0, 'rgba(6, 182, 212, 0.2)');
    grad.addColorStop(0.5, 'rgba(34, 211, 238, 0.9)');
    grad.addColorStop(1, 'rgba(6, 182, 212, 0.2)');
    ctx.fillStyle = grad;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#22d3ee';
    ctx.strokeStyle = '#cffafe';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-50, -15);
    ctx.lineTo(-20, -20);
    ctx.lineTo(40, -10); 
    ctx.quadraticCurveTo(50, 0, 40, 10);
    ctx.lineTo(-20, 20);
    ctx.lineTo(-50, 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-20, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(30, 0);
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

  } else if (zoneType === 'about') {
    // ... (Futuristic Home Base Code - Keep unchanged) ...
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(-40 * s, 0); ctx.lineTo(-50 * s, 30 * s); ctx.lineTo(-40 * s, 30 * s); ctx.lineTo(-30 * s, 0); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(40 * s, 0); ctx.lineTo(50 * s, 30 * s); ctx.lineTo(40 * s, 30 * s); ctx.lineTo(30 * s, 0); ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-60 * s, -70 * s, 120 * s, 70 * s, 10 * s);
    ctx.fill();
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#22d3ee';
    ctx.stroke();
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-15 * s, -45 * s, 30 * s, 45 * s);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -45 * s); ctx.lineTo(0, 0); ctx.stroke();
    ctx.strokeStyle = '#38bdf8';
    ctx.strokeRect(-15 * s, -45 * s, 30 * s, 45 * s);
    const winColor = '#fef08a';
    ctx.fillStyle = winColor;
    ctx.shadowColor = winColor;
    ctx.shadowBlur = 15;
    ctx.beginPath(); ctx.arc(-35 * s, -35 * s, 8 * s, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(35 * s, -35 * s, 8 * s, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#475569';
    ctx.fillRect(-10 * s, -80 * s, 20 * s, 10 * s);
    const dishAngle = Math.sin(time * 0.002) * 0.4;
    ctx.save();
    ctx.translate(0, -80 * s);
    ctx.rotate(dishAngle);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -10 * s); ctx.strokeStyle = '#64748b'; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -15 * s, 12 * s, 0.2 * Math.PI, 0.8 * Math.PI, true); ctx.fillStyle = '#cbd5e1'; ctx.fill();
    ctx.restore();
    const pulse = Math.sin(time * 0.005);
    ctx.save();
    ctx.translate(0, -130 * s + (pulse * 5));
    const boxW = 140 * s; const boxH = 50 * s;
    ctx.fillStyle = 'rgba(0, 10, 20, 0.85)';
    ctx.fillRect(-boxW/2, -boxH/2, boxW, boxH);
    ctx.save(); ctx.beginPath(); ctx.rect(-boxW/2, -boxH/2, boxW, boxH); ctx.clip();
    const scanY = (time * 0.05) % boxH - boxH/2;
    ctx.fillStyle = 'rgba(34, 211, 238, 0.2)'; ctx.fillRect(-boxW/2, scanY, boxW, 5); ctx.restore();
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)'; ctx.lineWidth = 2; ctx.strokeRect(-boxW/2, -boxH/2, boxW, boxH);
    ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 3; const cw = 10; const ch = 10;
    ctx.beginPath(); ctx.moveTo(-boxW/2, -boxH/2 + ch); ctx.lineTo(-boxW/2, -boxH/2); ctx.lineTo(-boxW/2 + cw, -boxH/2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(boxW/2 - cw, -boxH/2); ctx.lineTo(boxW/2, -boxH/2); ctx.lineTo(boxW/2, -boxH/2 + ch); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-boxW/2, boxH/2 - ch); ctx.lineTo(-boxW/2, boxH/2); ctx.lineTo(-boxW/2 + cw, boxH/2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(boxW/2 - cw, boxH/2); ctx.lineTo(boxW/2, boxH/2); ctx.lineTo(boxW/2, boxH/2 - ch); ctx.stroke();
    ctx.font = `bold ${10 * s}px "Courier New", monospace`; ctx.fillStyle = '#06b6d4'; ctx.textAlign = 'center'; ctx.fillText("IDENTITY CORE", 0, -10 * s);
    ctx.font = `bold ${16 * s}px "Courier New", monospace`; ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 10; ctx.shadowColor = '#22d3ee'; ctx.fillText("MY PROFILE", 0, 10 * s);
    ctx.restore();

  } else if (zoneType === 'skills') {
    // === DATA CITADEL (Skyscraper) ===
    const coreColor = '#d946ef'; // Fuchsia
    const darkColor = '#4a044e';
    const lightColor = '#f0abfc';
    
    ctx.translate(0, 10); // Align to ground

    // 1. Foundation
    ctx.fillStyle = '#2e1065';
    ctx.beginPath();
    ctx.moveTo(-50 * s, 0);
    ctx.lineTo(50 * s, 0);
    ctx.lineTo(60 * s, 20 * s); // Slant down
    ctx.lineTo(-60 * s, 20 * s);
    ctx.fill();

    // 2. Main Tower Structure
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.moveTo(-35 * s, 0);
    ctx.lineTo(-30 * s, -120 * s); // Taper up
    ctx.lineTo(30 * s, -120 * s);
    ctx.lineTo(35 * s, 0);
    ctx.fill();

    // Side pillars
    ctx.fillStyle = '#2c0b36'; // Darker
    ctx.fillRect(-45 * s, 0, 10 * s, -80 * s);
    ctx.fillRect(35 * s, 0, 10 * s, -80 * s);

    // 3. Neon Cooling Pipes (Veins)
    ctx.strokeStyle = coreColor;
    ctx.lineWidth = 2 * s;
    ctx.shadowBlur = 10;
    ctx.shadowColor = coreColor;
    ctx.beginPath();
    ctx.moveTo(-30 * s, -10 * s); ctx.lineTo(-30 * s, -110 * s);
    ctx.moveTo(30 * s, -10 * s); ctx.lineTo(30 * s, -110 * s);
    ctx.stroke();

    // 4. Server Racks (Blinking Lights)
    const rows = 6;
    const cols = 3;
    const padX = 15 * s;
    const padY = 15 * s;
    
    for(let r=0; r<rows; r++) {
        for(let c=0; c<cols; c++) {
            const lightX = -20 * s + (c * 20 * s);
            const lightY = -20 * s - (r * 15 * s);
            
            // Random blinking based on time and index
            const blink = Math.sin(time * 0.01 + r * c) > 0;
            ctx.fillStyle = blink ? lightColor : '#701a75';
            
            ctx.shadowBlur = blink ? 5 : 0;
            ctx.fillRect(lightX, lightY, 10 * s, 4 * s);
        }
    }
    ctx.shadowBlur = 0;

    // 5. Roof Processor (Floating Brain)
    ctx.translate(0, -130 * s);
    // Floating levitation
    const hover = Math.sin(time * 0.005) * 5;
    ctx.translate(0, hover);
    
    // Core shape
    ctx.fillStyle = '#fdf4ff';
    ctx.shadowColor = coreColor;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(0, -20 * s);
    ctx.lineTo(15 * s, 0);
    ctx.lineTo(0, 20 * s);
    ctx.lineTo(-15 * s, 0);
    ctx.fill();
    
    // Spinning rings around top
    ctx.strokeStyle = lightColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, 30 * s, 8 * s, time * 0.002, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 0, 30 * s, 8 * s, -time * 0.002, 0, Math.PI * 2);
    ctx.stroke();

    // Signage
    ctx.translate(0, -40 * s);
    ctx.fillStyle = lightColor;
    ctx.font = `bold ${8 * s}px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.fillText("NEURAL LINK", 0, 0);

  } else if (zoneType === 'projects') {
    // === FLOATING MUSEUM (Gold Dome) ===
    const goldColor = '#f59e0b';
    const glassColor = 'rgba(255, 251, 235, 0.3)';
    
    ctx.translate(0, -20 * s); // Hovering slightly

    // 1. Anti-Gravity Engines (Bottom)
    const hover = Math.sin(time * 0.003) * 5;
    ctx.translate(0, hover);

    ctx.fillStyle = '#451a03'; // Dark wood/metal
    ctx.beginPath();
    ctx.moveTo(-60 * s, 0);
    ctx.lineTo(60 * s, 0);
    ctx.lineTo(40 * s, 20 * s);
    ctx.lineTo(-40 * s, 20 * s);
    ctx.fill();

    // Engine glow
    ctx.fillStyle = '#3b82f6'; // Blue engine thrust
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.ellipse(-30 * s, 15 * s, 8 * s, 3 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(30 * s, 15 * s, 8 * s, 3 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 2. Main Hall (Walls)
    ctx.fillStyle = '#78350f'; // Amber dark
    ctx.fillRect(-60 * s, -40 * s, 120 * s, 40 * s);

    // Pillars
    ctx.fillStyle = goldColor;
    ctx.fillRect(-62 * s, -40 * s, 5 * s, 40 * s);
    ctx.fillRect(57 * s, -40 * s, 5 * s, 40 * s);
    ctx.fillRect(-20 * s, -40 * s, 5 * s, 40 * s);
    ctx.fillRect(15 * s, -40 * s, 5 * s, 40 * s);

    // 3. The Grand Dome (Glass)
    ctx.save();
    ctx.translate(0, -40 * s);
    
    // Back Dome outline
    ctx.beginPath();
    ctx.arc(0, 0, 55 * s, Math.PI, 0); // Half circle
    ctx.fillStyle = glassColor;
    ctx.fill();
    
    // Dome Grid
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Internal Hologram (Artifact)
    ctx.fillStyle = goldColor;
    ctx.shadowColor = goldColor;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    // A floating pyramid inside
    const pyY = Math.sin(time * 0.005) * 5 - 10 * s;
    ctx.moveTo(0, pyY - 15 * s);
    ctx.lineTo(10 * s, pyY + 10 * s);
    ctx.lineTo(-10 * s, pyY + 10 * s);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();

    // 4. Entrance Steps (Holographic)
    ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
    ctx.beginPath();
    ctx.moveTo(-15 * s, 0);
    ctx.lineTo(15 * s, 0);
    ctx.lineTo(25 * s, 30 * s); // Extend down towards ground
    ctx.lineTo(-25 * s, 30 * s);
    ctx.fill();

    // 5. Signage
    ctx.translate(0, -110 * s);
    ctx.fillStyle = '#fef3c7';
    ctx.font = `bold ${8 * s}px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.shadowColor = goldColor;
    ctx.shadowBlur = 10;
    ctx.fillText("HOLO GALLERY", 0, 0);


  } else if (zoneType === 'contact') {
    // === ORBITAL COMMAND CENTER ===
    const techColor = '#8b5cf6'; // Violet
    const darkBase = '#1e1b4b'; // Indigo dark
    
    ctx.translate(0, 20 * s); // Grounded

    // 1. Heavy Bunker Base
    ctx.fillStyle = darkBase;
    ctx.beginPath();
    ctx.moveTo(-50 * s, 0);
    ctx.lineTo(50 * s, 0);
    ctx.lineTo(40 * s, -30 * s); // Slope up
    ctx.lineTo(-40 * s, -30 * s);
    ctx.fill();
    
    // Hazard Stripes
    ctx.strokeStyle = techColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-45 * s, -5 * s); ctx.lineTo(-35 * s, -25 * s);
    ctx.moveTo(45 * s, -5 * s); ctx.lineTo(35 * s, -25 * s);
    ctx.stroke();

    // 2. Control Tower Shaft
    ctx.fillStyle = '#4c1d95';
    ctx.fillRect(-15 * s, -90 * s, 30 * s, 60 * s);
    
    // Ladder/Details
    ctx.fillStyle = '#6d28d9';
    ctx.fillRect(-5 * s, -90 * s, 10 * s, 60 * s);

    // 3. Observation Deck (Head)
    ctx.translate(0, -90 * s);
    ctx.fillStyle = darkBase;
    // Hexagonal control room
    ctx.beginPath();
    ctx.moveTo(-30 * s, 0);
    ctx.lineTo(-40 * s, -20 * s);
    ctx.lineTo(-20 * s, -40 * s);
    ctx.lineTo(20 * s, -40 * s);
    ctx.lineTo(40 * s, -20 * s);
    ctx.lineTo(30 * s, 0);
    ctx.fill();

    // Windows
    ctx.fillStyle = '#c4b5fd'; // Light violet glass
    ctx.shadowColor = techColor;
    ctx.shadowBlur = 15;
    ctx.fillRect(-30 * s, -30 * s, 60 * s, 5 * s);
    ctx.shadowBlur = 0;

    // 4. Rotating Radar Dish
    ctx.save();
    ctx.translate(0, -40 * s);
    
    // Swivel
    const angle = Math.sin(time * 0.001) * 0.5; // Slow sweep
    ctx.rotate(angle - 0.5); // Tilt slightly left default

    // Dish Stem
    ctx.fillStyle = '#6d28d9';
    ctx.fillRect(-2 * s, -15 * s, 4 * s, 15 * s);
    
    // The Dish
    ctx.beginPath();
    ctx.arc(0, -25 * s, 25 * s, 0.8 * Math.PI, 2.2 * Math.PI, true);
    ctx.fillStyle = '#ddd6fe';
    ctx.fill();
    ctx.strokeStyle = techColor;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Receiver Spike
    ctx.beginPath();
    ctx.moveTo(0, -25 * s);
    ctx.lineTo(0, -45 * s);
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    
    // Signal Waves (Animated)
    const waveSize = (time * 0.1) % 40;
    ctx.beginPath();
    ctx.arc(0, -45 * s, waveSize, 1.2 * Math.PI, 1.8 * Math.PI);
    ctx.strokeStyle = `rgba(139, 92, 246, ${1 - waveSize/40})`;
    ctx.stroke();

    ctx.restore();

    // Signage text
    ctx.fillStyle = '#a78bfa';
    ctx.font = `bold ${7 * s}px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.fillText("UPLINK", 0, 15 * s);
  }

  ctx.restore();
};

export const drawSpeechBubble = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  time: number
) => {
  if (!text) return;

  const paddingX = 25;
  const paddingY = 15;
  const floatY = Math.sin(time * 0.003) * 6; // Slower, smoother float
  
  ctx.save();
  ctx.translate(x, y + floatY);
  
  // Font setup
  ctx.font = 'bold 18px "Courier New", monospace';
  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;
  const boxWidth = textWidth + paddingX * 2;
  const boxHeight = 50; // Fixed height for consistent look
  
  // -- Holographic Background --
  
  // Gradient fill
  const gradient = ctx.createLinearGradient(0, -boxHeight, 0, 0);
  gradient.addColorStop(0, 'rgba(6, 182, 212, 0.25)'); // Cyan top
  gradient.addColorStop(1, 'rgba(15, 23, 42, 0.85)'); // Dark bottom
  ctx.fillStyle = gradient;
  
  // Path for rounded rectangle with pointer
  const r = 8; // Radius
  ctx.beginPath();
  ctx.moveTo(-boxWidth / 2 + r, -boxHeight);
  ctx.lineTo(boxWidth / 2 - r, -boxHeight);
  ctx.quadraticCurveTo(boxWidth / 2, -boxHeight, boxWidth / 2, -boxHeight + r);
  ctx.lineTo(boxWidth / 2, -r);
  ctx.quadraticCurveTo(boxWidth / 2, 0, boxWidth / 2 - r, 0);
  ctx.lineTo(8, 0);
  ctx.lineTo(0, 12); // Sharp Tech Pointer
  ctx.lineTo(-8, 0);
  ctx.lineTo(-boxWidth / 2 + r, 0);
  ctx.quadraticCurveTo(-boxWidth / 2, 0, -boxWidth / 2, -r);
  ctx.lineTo(-boxWidth / 2, -boxHeight + r);
  ctx.quadraticCurveTo(-boxWidth / 2, -boxHeight, -boxWidth / 2 + r, -boxHeight);
  ctx.closePath();
  ctx.fill();

  // -- Tech Borders & Glow --
  
  const pulse = (Math.sin(time * 0.005) + 1) / 2; // 0 to 1
  ctx.strokeStyle = `rgba(34, 211, 238, ${0.5 + pulse * 0.5})`; // Pulsing Cyan
  ctx.lineWidth = 2;
  ctx.shadowColor = '#22d3ee';
  ctx.shadowBlur = 10 + pulse * 10;
  ctx.stroke();

  // Decorative corners (Top-Left and Bottom-Right)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.shadowBlur = 0;
  
  // TL Corner
  ctx.beginPath();
  ctx.moveTo(-boxWidth / 2 + 2, -boxHeight + 10);
  ctx.lineTo(-boxWidth / 2 + 2, -boxHeight + 2);
  ctx.lineTo(-boxWidth / 2 + 10, -boxHeight + 2);
  ctx.stroke();

  // BR Corner
  ctx.beginPath();
  ctx.moveTo(boxWidth / 2 - 2, -10);
  ctx.lineTo(boxWidth / 2 - 2, -2);
  ctx.lineTo(boxWidth / 2 - 10, -2);
  ctx.stroke();

  // -- Text Drawing --
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Typewriter cursor effect
  const showCursor = Math.floor(time / 500) % 2 === 0;
  ctx.fillText(`${text}${showCursor ? '_' : ''}`, 0, -boxHeight / 2 + 2);
  
  ctx.restore();
};
