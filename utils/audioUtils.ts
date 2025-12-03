
// Audio Context Singleton
let audioCtx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;

// Initialize Audio Context (must be called after user interaction)
export const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  // Pre-generate noise buffer (0.1s is enough)
  if (!noiseBuffer && audioCtx) {
    const bufferSize = audioCtx.sampleRate * 0.1;
    noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        // White noise: random values between -1 and 1
        data[i] = Math.random() * 2 - 1;
    }
  }

  return audioCtx;
};

// Procedural Sci-Fi Footstep Sound (FIXED: Noise-based Thud, Non-tonal)
export const playFootstepSound = (muted: boolean) => {
  if (muted || !audioCtx || !noiseBuffer) return;

  const t = audioCtx.currentTime;

  // Source: Noise Buffer (No tone/pitch, just texture)
  const source = audioCtx.createBufferSource();
  source.buffer = noiseBuffer;

  // Filter: Low Pass to remove high frequencies (hiss)
  // This makes it sound like a heavy boot (Bass thud)
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(150, t); // Very low cutoff (Heavy sound)
  filter.frequency.exponentialRampToValueAtTime(80, t + 0.05); // Dampen quickly

  // Envelope: Short and punchy
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.1, t); // Low volume (not distracting)
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05); // Fade out super fast (50ms)

  // Connect
  source.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  // Play
  source.start(t);
  source.stop(t + 0.05); // Ensure it stops
};

// Jump Sound (Sci-Fi Swoosh)
export const playJumpSound = (muted: boolean) => {
    if (muted || !audioCtx) return;
  
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
  
    // Softer swoosh
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.linearRampToValueAtTime(300, t + 0.15); 
    osc.type = 'sine';
  
    gain.gain.setValueAtTime(0.1, t); // Reduced volume
    gain.gain.linearRampToValueAtTime(0, t + 0.15);
  
    osc.connect(gain);
    gain.connect(audioCtx.destination);
  
    osc.start(t);
    osc.stop(t + 0.15);
};
