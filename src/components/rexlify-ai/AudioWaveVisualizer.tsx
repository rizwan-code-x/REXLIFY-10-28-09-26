import React, { useEffect, useRef } from 'react';

export interface AudioWaveVisualizerProps {
  state: 'idle' | 'listening' | 'speaking' | 'processing' | 'interrupted' | 'error';
  audioLevel: number;
  analyser: AnalyserNode | null;
  isPositiveEmotion?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

export const AudioWaveVisualizer: React.FC<AudioWaveVisualizerProps> = ({
  state,
  audioLevel,
  analyser,
  isPositiveEmotion = false,
  className = '',
  width = 380,
  height = 110
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;
    const dataArray = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

    const renderFrame = () => {
      if (!running) return;
      phaseRef.current += state === 'speaking' ? 0.08 : state === 'listening' ? 0.05 : 0.02;

      ctx.clearRect(0, 0, width, height);

      const midY = height / 2;
      const numBars = 36;
      const barSpacing = width / numBars;
      const barWidth = Math.max(3, barSpacing * 0.55);

      // Get real audio frequency data if analyser is active
      let freqAvg = audioLevel;
      if (analyser && dataArray && (state === 'listening' || state === 'speaking')) {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        const sampleCount = Math.min(dataArray.length, 64);
        for (let i = 0; i < sampleCount; i++) {
          sum += dataArray[i];
        }
        freqAvg = Math.max(audioLevel, (sum / sampleCount) * 0.8);
      }

      // Draw background ambient glow line
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(width, midY);
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 1. Draw Organic Continuous Wave Ribbon
      ctx.beginPath();
      ctx.moveTo(0, midY);

      for (let x = 0; x <= width; x += 4) {
        const normalizedX = x / width;
        // Envelope curve: tapered at ends, peak in center
        const envelope = Math.sin(normalizedX * Math.PI);

        let waveY = 0;
        if (state === 'listening') {
          const micIntensity = Math.min(1.0, freqAvg / 50);
          waveY = Math.sin(normalizedX * 12 + phaseRef.current * 3) * (20 * micIntensity * envelope) +
                  Math.cos(normalizedX * 6 - phaseRef.current * 2) * (14 * micIntensity * envelope);
        } else if (state === 'speaking') {
          const emotionMultiplier = isPositiveEmotion ? 1.35 : 1.0;
          waveY = Math.sin(normalizedX * 8 + phaseRef.current * 4) * (24 * envelope * emotionMultiplier) +
                  Math.cos(normalizedX * 14 + phaseRef.current * 2) * (10 * envelope * emotionMultiplier);
        } else if (state === 'processing') {
          waveY = Math.sin(normalizedX * 16 + phaseRef.current * 5) * (12 * envelope);
        } else if (state === 'interrupted') {
          waveY = Math.sin(normalizedX * 24 + phaseRef.current * 6) * (6 * envelope);
        } else {
          // Idle gentle breathing baseline
          waveY = Math.sin(normalizedX * 4 + phaseRef.current) * (4 * envelope);
        }

        ctx.lineTo(x, midY + waveY);
      }

      // Gradient for continuous line
      const lineGradient = ctx.createLinearGradient(0, 0, width, 0);
      if (isPositiveEmotion || state === 'speaking') {
        lineGradient.addColorStop(0, 'rgba(236, 72, 153, 0.2)');
        lineGradient.addColorStop(0.3, 'rgba(244, 63, 94, 0.85)');
        lineGradient.addColorStop(0.5, 'rgba(251, 146, 60, 0.95)');
        lineGradient.addColorStop(0.7, 'rgba(168, 85, 247, 0.85)');
        lineGradient.addColorStop(1, 'rgba(236, 72, 153, 0.2)');
      } else if (state === 'listening') {
        lineGradient.addColorStop(0, 'rgba(244, 63, 94, 0.2)');
        lineGradient.addColorStop(0.5, 'rgba(244, 63, 94, 0.9)');
        lineGradient.addColorStop(1, 'rgba(168, 85, 247, 0.2)');
      } else if (state === 'interrupted') {
        lineGradient.addColorStop(0, 'rgba(245, 158, 11, 0.2)');
        lineGradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.9)');
        lineGradient.addColorStop(1, 'rgba(239, 68, 68, 0.2)');
      } else {
        lineGradient.addColorStop(0, 'rgba(244, 63, 94, 0.1)');
        lineGradient.addColorStop(0.5, 'rgba(244, 63, 94, 0.4)');
        lineGradient.addColorStop(1, 'rgba(168, 85, 247, 0.1)');
      }

      ctx.strokeStyle = lineGradient;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = isPositiveEmotion ? 'rgba(251, 146, 60, 0.6)' : 'rgba(244, 63, 94, 0.5)';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // 2. Draw Multi-Band Audio Bars
      for (let i = 0; i < numBars; i++) {
        const x = i * barSpacing + barSpacing / 2;
        const normalizedPos = i / (numBars - 1);
        const centerDist = Math.abs(normalizedPos - 0.5) * 2; // 0 at center, 1 at ends
        const bellCurve = Math.cos(centerDist * (Math.PI / 2));

        let barMagnitude = 0;
        if (state === 'listening') {
          // Responsive microphone audio feedback
          let freqVal = 0;
          if (dataArray && dataArray.length > 0) {
            const dataIndex = Math.floor((i / numBars) * Math.min(32, dataArray.length));
            freqVal = dataArray[dataIndex] || 0;
          }
          const levelBoost = (freqAvg / 100) * 45;
          const liveFreqBoost = (freqVal / 255) * 35;
          const sineNoise = Math.sin(phaseRef.current * 4 + i * 0.45) * 6;
          barMagnitude = (levelBoost + liveFreqBoost + sineNoise) * bellCurve;
        } else if (state === 'speaking') {
          const emotionBoost = isPositiveEmotion ? 1.3 : 1.0;
          const rhythm = Math.sin(phaseRef.current * 5 + i * 0.35) * Math.cos(phaseRef.current * 2 + i * 0.2);
          barMagnitude = (14 + Math.abs(rhythm) * 34) * bellCurve * emotionBoost;
        } else if (state === 'processing') {
          const pulse = Math.sin(phaseRef.current * 6 + i * 0.5);
          barMagnitude = (10 + Math.abs(pulse) * 20) * bellCurve;
        } else if (state === 'interrupted') {
          const snap = Math.sin(phaseRef.current * 8 + i * 0.8);
          barMagnitude = (4 + Math.abs(snap) * 10) * bellCurve;
        } else {
          // Idle ambient wave
          const breathe = Math.sin(phaseRef.current + i * 0.3);
          barMagnitude = (2 + Math.abs(breathe) * 5) * bellCurve;
        }

        const barHeight = Math.max(3, barMagnitude);
        const yTop = midY - barHeight / 2;

        // Bar Color Gradient
        const barGrad = ctx.createLinearGradient(0, yTop, 0, yTop + barHeight);
        if (state === 'listening') {
          barGrad.addColorStop(0, '#f43f5e');
          barGrad.addColorStop(1, '#a855f7');
        } else if (state === 'speaking') {
          if (isPositiveEmotion) {
            barGrad.addColorStop(0, '#fb923c'); // warm golden peach
            barGrad.addColorStop(0.5, '#ec4899');
            barGrad.addColorStop(1, '#a855f7');
          } else {
            barGrad.addColorStop(0, '#ec4899');
            barGrad.addColorStop(1, '#8b5cf6');
          }
        } else if (state === 'interrupted') {
          barGrad.addColorStop(0, '#f59e0b');
          barGrad.addColorStop(1, '#ef4444');
        } else {
          barGrad.addColorStop(0, 'rgba(244, 63, 94, 0.4)');
          barGrad.addColorStop(1, 'rgba(168, 85, 247, 0.3)');
        }

        ctx.fillStyle = barGrad;
        ctx.beginPath();
        ctx.roundRect(x - barWidth / 2, yTop, barWidth, barHeight, 2.5);
        ctx.fill();

        // Little floating glow particle at top of strong bars
        if (barHeight > 25 && (state === 'listening' || state === 'speaking')) {
          ctx.beginPath();
          ctx.arc(x, yTop - 3, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = isPositiveEmotion ? '#fef08a' : '#ffffff';
          ctx.shadowColor = '#fb923c';
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      animationIdRef.current = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      running = false;
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [state, audioLevel, analyser, isPositiveEmotion, width, height]);

  return (
    <div className={`relative flex flex-col items-center justify-center pointer-events-none select-none ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full max-w-[420px] h-[110px]"
      />
      {/* Real-time Decibel / Audio Level Readout Pill */}
      {state === 'listening' && (
        <div className="absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200/80 text-[10px] font-mono font-bold text-rose-600 shadow-2xs animate-fadeIn">
          LIVE AUDIO • {Math.round(audioLevel)}% MIC LEVEL
        </div>
      )}
      {state === 'speaking' && (
        <div className="absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200/80 text-[10px] font-mono font-bold text-purple-600 shadow-2xs animate-fadeIn flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
          <span>{isPositiveEmotion ? 'JOYFUL HARMONIC WAVE • 19 YRS' : 'SPEECH CADENCE • AYESHA'}</span>
        </div>
      )}
    </div>
  );
};
