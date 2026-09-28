// Rizwan Online Dreams Platform (RODP) - Premium Synthesized Sound System
// Implements high-fidelity, professional audio chimes using standard Web Audio API (No external file download lag)

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (!audioCtx) {
    try {
      if (typeof window !== 'undefined') {
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (typeof AudioContextClass === 'function') {
          audioCtx = new AudioContextClass();
        }
      }
    } catch (e) {
      console.warn('AudioContext creation failed:', e);
      return null;
    }
  }
  return audioCtx;
}

/**
 * Sound 1: Booking Success Chime
 * MacBook-style dual-tone, bright and uplifting.
 */
export function playBookingSuccessSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;
    
    // Tone 1: High bright note
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
    
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);
    
    // Tone 2: Harmonizing third, slightly delayed
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, now + 0.08); // E5
    osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.25); // C6
    
    gain2.gain.setValueAtTime(0.08, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.5);
  } catch (e) {
    console.error("RODP sound engine error (Booking Success):", e);
  }
}

/**
 * Sound 2: Bill Generation
 * Clean digital check-out click and premium ring.
 */
export function playBillGenerateSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;
    
    // Crisp transient mechanical checkout click
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(1100, now);
    clickOsc.frequency.linearRampToValueAtTime(150, now + 0.035);
    
    clickGain.gain.setValueAtTime(0.15, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    
    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.04);

    // Warm modern electronic digital bell note
    const bellOsc = ctx.createOscillator();
    const bellGain = ctx.createGain();
    bellOsc.type = 'sine';
    bellOsc.frequency.setValueAtTime(587.33, now + 0.02); // D5
    bellOsc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.16); // D6
    
    bellGain.gain.setValueAtTime(0.10, now + 0.02);
    bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    
    bellOsc.connect(bellGain);
    bellGain.connect(ctx.destination);
    bellOsc.start(now + 0.02);
    bellOsc.stop(now + 0.45);
  } catch (e) {
    console.error("RODP sound engine error (Bill Generate):", e);
  }
}

/**
 * Sound 3: Bill Saving & Sync
 * Satisfying deep chord confirmation with lush, warm tail.
 */
export function playBillSaveSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;
    
    // Warm minor-seventh/major-ninth chord voicing (C4 -> G4 -> C5 -> E5 -> G5)
    const frequencies = [261.63, 392.00, 523.25, 659.25, 783.99]; 
    const gains = [0.08, 0.06, 0.05, 0.04, 0.03];
    
    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.015);
      
      gain.gain.setValueAtTime(gains[idx], now + idx * 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.015);
      osc.stop(now + 0.65);
    });
  } catch (e) {
    console.error("RODP sound engine error (Bill Save):", e);
  }
}

/**
 * Sound 4: Tech Industry Cybernetic Enterprise Login Sound
 * Futuristic multi-stage cyber sound with pitch sweep, digital handshake tones, and sub-bass activation.
 */
export function playTechIndustryLoginSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;

    // Phase 1: Cyber Sub-Bass Activation Pulse
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(60, now);
    subOsc.frequency.exponentialRampToValueAtTime(140, now + 0.18);
    subGain.gain.setValueAtTime(0.2, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.35);

    // Phase 2: High-Tech Fast Frequency Sweep (Radar Sync)
    const sweepOsc = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    sweepOsc.type = 'sawtooth';
    sweepOsc.frequency.setValueAtTime(800, now + 0.05);
    sweepOsc.frequency.exponentialRampToValueAtTime(2800, now + 0.22);
    sweepGain.gain.setValueAtTime(0.08, now + 0.05);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    sweepOsc.connect(sweepGain);
    sweepGain.connect(ctx.destination);
    sweepOsc.start(now + 0.05);
    sweepOsc.stop(now + 0.25);

    // Phase 3: High-Tech Ascending Quad Chime (E5 -> A5 -> C#6 -> E6)
    const notes = [659.25, 880.00, 1108.73, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + 0.18 + idx * 0.07);
      
      gain.gain.setValueAtTime(0.12, now + 0.18 + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18 + idx * 0.07 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + 0.18 + idx * 0.07);
      osc.stop(now + 0.18 + idx * 0.07 + 0.35);
    });
  } catch (e) {
    console.error("RODP sound engine error (Tech Industry Login):", e);
  }
}

