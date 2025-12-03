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
  // Beautiful Humanoid Robot Design
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  
  // Scale everything based on a base height of 100px.
  // If height is 160, scale will be 1.6
  const baseHeight = 100;
  const scale = height / baseHeight;
  ctx.scale(direction * scale, scale); // Face direction and Scale up

  const colorBody = '#e2e8f0'; // Slate 200
  const colorDark = '#1e293b'; // Slate 800
  const colorAccent = '#06b6d4'; // Cyan 500
  const colorSkin = '#94a3b8'; // Metallic skin tone

  // Animation Variables
  const bob = isMoving ? Math.sin(time * 0.02) * 3 : Math.sin(time * 0.005) * 2;
  const walk = isMoving ? time * 0.015 : 0;
  
  const leftLegAngle = isMoving ? Math.sin(walk) * 0.6 : 0;
  const rightLegAngle = isMoving ? Math.sin(walk + Math.PI) * 0.6 : 0;
  const leftArmAngle = isMoving ? Math.sin(walk + Math.PI) * 0.6 : Math.sin(time * 0.003) * 0.05;
  const rightArmAngle = isMoving ? Math.sin(walk) * 0.6 : -Math.sin(time * 0.003) * 0.05;

  // Helper for drawing rounded rectangles (manual path for compatibility)
  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  // --- Back Limbs (Right side relative to character facing right) ---
  
  // Back Leg
  ctx.save();
  ctx.translate(-5, 15 + bob); // Hip pivot
  ctx.rotate(rightLegAngle);
  ctx.fillStyle = colorDark;
  roundRect(ctx, -6, 0, 12, 25, 5); // Thigh
  ctx.fill();
    // Shin
    ctx.translate(0, 22);
    ctx.rotate(isMoving ? Math.max(0, Math.sin(walk + Math.PI)) * 0.5 : 0); // Knee bend
    ctx.fillStyle = colorBody;
    roundRect(ctx, -5, 0, 10, 25, 4);
    ctx.fill();
    // Foot
    ctx.fillStyle = colorDark;
    ctx.beginPath();
    ctx.moveTo(-5, 22);
    ctx.lineTo(5, 22);
    ctx.lineTo(7, 30);
    ctx.lineTo(-7, 30);
    ctx.fill();
  ctx.restore();

  // Back Arm
  ctx.save();
  ctx.translate(-8, -25 + bob); // Shoulder pivot
  ctx.rotate(rightArmAngle);
  ctx.fillStyle = colorDark;
  roundRect(ctx, -4, 0, 8, 20, 4); // Upper arm
  ctx.fill();
    // Forearm
    ctx.translate(0, 18);
    ctx.rotate(-0.2); // Natural bend
    ctx.fillStyle = colorSkin;
    roundRect(ctx, -3, 0, 6, 20, 3);
    ctx.fill();
    // Hand
    ctx.fillStyle = colorBody;
    ctx.beginPath();
    ctx.arc(0, 22, 5, 0, Math.PI * 2);
    ctx.fill();
  ctx.restore();

  // --- Body ---
  ctx.save();
  ctx.translate(0, bob);
  
  // Torso
  ctx.fillStyle = colorBody;
  ctx.beginPath();
  // Sleek Android shape
  ctx.moveTo(-12, -35); // Left shoulder
  ctx.lineTo(12, -35); // Right shoulder
  ctx.lineTo(8, 0); // Waist right
  ctx.lineTo(14, 15); // Hip right
  ctx.lineTo(-14, 15); // Hip left
  ctx.lineTo(-8, 0); // Waist left
  ctx.closePath();
  ctx.fill();

  // Core / Chest Plate
  ctx.fillStyle = colorAccent;
  ctx.shadowColor = colorAccent;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(0, -20, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Neck
  ctx.fillStyle = colorDark;
  ctx.fillRect(-3, -40, 6, 8);

  // Head
  ctx.translate(0, -42);
  ctx.rotate(0.05); // Tilt head slightly forward
  
  // Helmet
  ctx.fillStyle = colorBody;
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Visor
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(0, -6, 13, 10, 4); // Visor on the "front" of the face
  ctx.fill();
  
  // Eye Glow
  ctx.fillStyle = colorAccent;
  ctx.shadowColor = colorAccent;
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(8, -2, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Ear detail
  ctx.fillStyle = colorDark;
  ctx.fillRect(-6, -6, 4, 12);

  ctx.restore(); // End Body Context

  // --- Front Limbs (Left side) ---

  // Front Leg
  ctx.save();
  ctx.translate(5, 15 + bob); // Hip pivot
  ctx.rotate(leftLegAngle);
  ctx.fillStyle = colorBody; 
  roundRect(ctx, -7, 0, 14, 25, 6); // Thigh
  ctx.fill();
    // Shin
    ctx.translate(0, 22);
    ctx.rotate(isMoving ? Math.max(0, Math.sin(walk)) * 0.5 : 0);
    ctx.fillStyle = '#f1f5f9';
    roundRect(ctx, -6, 0, 12, 28, 5);
    ctx.fill();
    // Boot
    ctx.fillStyle = colorDark;
    ctx.beginPath();
    ctx.moveTo(-6, 25);
    ctx.lineTo(6, 25);
    ctx.lineTo(8, 32);
    ctx.lineTo(-8, 32);
    ctx.fill();
    // Boot light
    ctx.fillStyle = colorAccent;
    ctx.fillRect(-8, 30, 16, 2);
  ctx.restore();

  // Front Arm
  ctx.save();
  ctx.translate(10, -25 + bob); // Shoulder pivot
  ctx.rotate(leftArmAngle);
  ctx.fillStyle = colorBody;
  roundRect(ctx, -5, 0, 10, 22, 5); // Upper arm
  ctx.fill();
    // Forearm
    ctx.translate(0, 20);
    ctx.rotate(-0.1); 
    ctx.fillStyle = '#f8fafc';
    roundRect(ctx, -4, 0, 8, 22, 4);
    ctx.fill();
    // Hand
    ctx.fillStyle = colorDark;
    ctx.beginPath();
    ctx.arc(0, 24, 6, 0, Math.PI * 2);
    ctx.fill();
  ctx.restore();

  ctx.restore();
};

export const drawZoneObject = (ctx: CanvasRenderingContext2D, zoneType: string, x: number, y: number, screenX: number, time: number) => {
  const floatY = Math.sin(time * 0.005) * 15;
  const s = 2.5; // Scale factor (increased slightly for better visibility)
  
  ctx.save();
  ctx.translate(screenX, y + floatY);
  
  // Draw base (Shadow/Platform)
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath();
  // Keep Y offset moderate so it stays within ground bar roughly
  ctx.ellipse(0, 40, 80, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  if (zoneType === 'welcome') {
    // === HOLOGRAPHIC GUIDE HAND ===
    const scaleHand = 3.5;
    
    // Animation for pointing motion
    const pointOffset = Math.sin(time * 0.008) * 15; // Move left-right
    
    ctx.save();
    ctx.translate(0, -60 * s); // Lift up
    
    // 1. Draw Directional Chevrons (Arrows behind hand)
    // Three arrows fading and moving right
    for (let i = 0; i < 3; i++) {
        const offset = (time * 0.05 + i * 20) % 60; // Loop 0 to 60
        const opacity = Math.max(0, 1 - (offset / 50)); // Fade out as it moves
        
        ctx.strokeStyle = `rgba(34, 211, 238, ${opacity})`; // Cyan glow
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 10 * opacity;
        ctx.shadowColor = '#22d3ee';
        
        ctx.beginPath();
        // Draw Chevron Shape >
        const chevronX = -120 + offset * 1.5; // Start left
        ctx.moveTo(chevronX, -20);
        ctx.lineTo(chevronX + 20, 0);
        ctx.lineTo(chevronX, 20);
        ctx.stroke();
    }

    // 2. Draw The Robotic Hand
    ctx.translate(pointOffset - 20, 0); // Apply pointing animation
    
    // Gradient for Hologram look
    const grad = ctx.createLinearGradient(-40, 0, 40, 0);
    grad.addColorStop(0, 'rgba(6, 182, 212, 0.2)');
    grad.addColorStop(0.5, 'rgba(34, 211, 238, 0.9)'); // Bright Cyan center
    grad.addColorStop(1, 'rgba(6, 182, 212, 0.2)');
    
    ctx.fillStyle = grad;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#22d3ee';
    ctx.strokeStyle = '#cffafe';
    ctx.lineWidth = 2;

    // Hand Shape (Stylized pointing finger)
    ctx.beginPath();
    // Wrist
    ctx.moveTo(-50, -15);
    ctx.lineTo(-20, -20);
    // Pointing Finger Top
    ctx.lineTo(40, -10); 
    // Finger Tip
    ctx.quadraticCurveTo(50, 0, 40, 10);
    // Finger Bottom
    ctx.lineTo(-20, 20);
    // Wrist Bottom
    ctx.lineTo(-50, 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tech details on hand
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-20, 0, 5, 0, Math.PI * 2); // Knuckle node
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(30, 0); // Circuit line
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();

  } else if (zoneType === 'about') {
    // === HOLOGRAPHIC BIO-DATA STATION (UPDATED TO MATCH HUD) ===
    const pulse = Math.sin(time * 0.005);
    
    // Base Platform (Changed to Cyan/Dark theme)
    ctx.fillStyle = '#083344'; // Dark Cyan/Slate
    ctx.fillRect(-40 * s, -10 * s, 80 * s, 10 * s);
    // Glowing rim
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.strokeRect(-40 * s, -10 * s, 80 * s, 10 * s);

    // Hologram Beam (Cyan)
    const grad = ctx.createLinearGradient(0, -10 * s, 0, -150 * s);
    grad.addColorStop(0, 'rgba(34, 211, 238, 0.4)');
    grad.addColorStop(1, 'rgba(34, 211, 238, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-30 * s, -10 * s);
    ctx.lineTo(30 * s, -10 * s);
    ctx.lineTo(40 * s, -150 * s);
    ctx.lineTo(-40 * s, -150 * s);
    ctx.fill();

    // DNA Helix Animation (Cyan)
    ctx.save();
    ctx.translate(0, -80 * s);
    for (let i = 0; i < 10; i++) {
        const yOffset = i * 15 - 75;
        const xOffset = Math.sin(time * 0.003 + i * 0.5) * 20 * s;
        
        ctx.fillStyle = i % 2 === 0 ? '#22d3ee' : '#06b6d4'; // Cyan 400 / 500
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#22d3ee';
        ctx.beginPath();
        ctx.arc(xOffset, yOffset, 4 * s, 0, Math.PI * 2);
        ctx.arc(-xOffset, yOffset, 4 * s, 0, Math.PI * 2); // Mirror
        ctx.fill();
        
        // Connector
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(xOffset, yOffset);
        ctx.lineTo(-xOffset, yOffset);
        ctx.stroke();
    }
    ctx.restore();

    // Sign "MY PROFILE" (HUD Style)
    ctx.save();
    ctx.translate(0, -160 * s + (pulse * 5)); // Higher up
    
    const boxW = 140 * s;
    const boxH = 50 * s;
    
    // Background
    ctx.fillStyle = 'rgba(0, 10, 20, 0.85)'; // Dark
    ctx.fillRect(-boxW/2, -boxH/2, boxW, boxH);
    
    // Scan line (Clipping)
    ctx.save();
    ctx.beginPath();
    ctx.rect(-boxW/2, -boxH/2, boxW, boxH);
    ctx.clip();
    
    const scanY = (time * 0.05) % boxH - boxH/2;
    ctx.fillStyle = 'rgba(34, 211, 238, 0.2)';
    ctx.fillRect(-boxW/2, scanY, boxW, 5); // Scan bar
    ctx.restore();

    // Borders
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(-boxW/2, -boxH/2, boxW, boxH);

    // Decorative Corners (Thick Cyan)
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 3;
    const cw = 10;
    const ch = 10;
    
    // TL
    ctx.beginPath(); ctx.moveTo(-boxW/2, -boxH/2 + ch); ctx.lineTo(-boxW/2, -boxH/2); ctx.lineTo(-boxW/2 + cw, -boxH/2); ctx.stroke();
    // TR
    ctx.beginPath(); ctx.moveTo(boxW/2 - cw, -boxH/2); ctx.lineTo(boxW/2, -boxH/2); ctx.lineTo(boxW/2, -boxH/2 + ch); ctx.stroke();
    // BL
    ctx.beginPath(); ctx.moveTo(-boxW/2, boxH/2 - ch); ctx.lineTo(-boxW/2, boxH/2); ctx.lineTo(-boxW/2 + cw, boxH/2); ctx.stroke();
    // BR
    ctx.beginPath(); ctx.moveTo(boxW/2 - cw, boxH/2); ctx.lineTo(boxW/2, boxH/2); ctx.lineTo(boxW/2, boxH/2 - ch); ctx.stroke();

    // Text: Subtitle
    ctx.font = `bold ${10 * s}px "Courier New", monospace`;
    ctx.fillStyle = '#06b6d4'; // Darker cyan
    ctx.textAlign = 'center';
    ctx.fillText("IDENTITY CORE", 0, -10 * s);

    // Text: Title
    ctx.font = `bold ${16 * s}px "Courier New", monospace`;
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#22d3ee';
    ctx.fillText("MY PROFILE", 0, 10 * s);

    ctx.restore();

  } else if (zoneType === 'skills') {
    // Computer terminal or floating cube
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#F472B6';
    ctx.strokeStyle = '#F472B6';
    ctx.lineWidth = 3 * s;
    ctx.strokeRect(-25 * s, -50 * s, 50 * s, 50 * s);
    // Code lines
    ctx.fillStyle = '#F472B6';
    ctx.fillRect(-20 * s, -40 * s, 30 * s, 4 * s);
    ctx.fillRect(-20 * s, -30 * s, 20 * s, 4 * s);
    ctx.fillRect(-20 * s, -20 * s, 35 * s, 4 * s);
  } else if (zoneType === 'projects') {
    // Gallery Frame
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#FBBF24';
    ctx.fillStyle = '#FBBF24';
    ctx.fillRect(-30 * s, -60 * s, 60 * s, 40 * s);
    ctx.fillStyle = '#000';
    ctx.fillRect(-25 * s, -55 * s, 50 * s, 30 * s); // Screen
    ctx.fillStyle = '#FBBF24'; // Stand
    ctx.fillRect(-5 * s, -20 * s, 10 * s, 20 * s);
    ctx.fillRect(-20 * s, 0, 40 * s, 5 * s);
  } else if (zoneType === 'contact') {
    // Mailbox
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#A78BFA';
    ctx.fillStyle = '#A78BFA';
    ctx.beginPath();
    ctx.arc(0, -40 * s, 25 * s, Math.PI, 0); // Top arch
    ctx.lineTo(25 * s, -10 * s);
    ctx.lineTo(-25 * s, -10 * s);
    ctx.fill();
    ctx.fillRect(-5 * s, -10 * s, 10 * s, 40 * s); // Pole
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