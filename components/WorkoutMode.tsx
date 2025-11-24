import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Heart, Volume2, VolumeX, ChevronUp, ChevronDown, Activity } from 'lucide-react';
import { HeartRateZone } from '../types';

interface WorkoutModeProps {
  targetZone: HeartRateZone;
  maxHr: number;
  onClose: () => void;
}

export const WorkoutMode: React.FC<WorkoutModeProps> = ({ targetZone, maxHr, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [bpm, setBpm] = useState(70); // Start at resting HR
  const [feedback, setFeedback] = useState<string>('Riscaldamento');
  const [isMuted, setIsMuted] = useState(false);
  const [statusColor, setStatusColor] = useState('bg-slate-100');
  
  // Simulation controls
  const [effortLevel, setEffortLevel] = useState(30); // 0-100 hypothetical effort

  const lastSpeechTime = useRef<number>(0);

  // Timer Logic
  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  // BPM Simulation Logic based on Effort Level
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isActive) return;

      // Target BPM based on effort level (roughly mapping 0-100 effort to 60-MaxHR)
      const targetSimulatedBpm = 60 + ((maxHr - 60) * (effortLevel / 100));
      
      // Add randomness and drift towards target
      setBpm(current => {
        const drift = (targetSimulatedBpm - current) * 0.1; // Move 10% towards target
        const noise = (Math.random() - 0.5) * 4; // +/- 2 BPM jitter
        return Math.round(current + drift + noise);
      });

    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, effortLevel, maxHr]);

  // Zone Monitoring & Feedback Logic
  useEffect(() => {
    if (!isActive) return;

    let newStatus = '';
    let newColor = '';
    
    if (bpm < targetZone.minBpm) {
      newStatus = 'Aumenta il ritmo!';
      newColor = 'bg-indigo-50 border-indigo-200 text-indigo-700'; // Too low (Blueish)
    } else if (bpm > targetZone.maxBpm) {
      newStatus = 'Rallenta! Frequenza alta.';
      newColor = 'bg-red-50 border-red-200 text-red-700'; // Too high (Red)
    } else {
      newStatus = 'Ottimo lavoro! Mantieni.';
      newColor = 'bg-green-50 border-green-200 text-green-700'; // Perfect (Green)
    }

    setFeedback(newStatus);
    setStatusColor(newColor);

    // Audio Feedback (throttled to every 10 seconds to avoid spam)
    const now = Date.now();
    if (!isMuted && now - lastSpeechTime.current > 10000) {
      // Only speak if out of zone or just entered zone
      if (bpm < targetZone.minBpm || bpm > targetZone.maxBpm || (bpm >= targetZone.minBpm && bpm <= targetZone.maxBpm && Math.random() > 0.7)) {
        speak(newStatus);
        lastSpeechTime.current = now;
      }
    }
  }, [bpm, targetZone, isActive, isMuted]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'it-IT';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const toggleTimer = () => setIsActive(!isActive);

  const stopWorkout = () => {
    setIsActive(false);
    onClose();
  };

  const adjustEffort = (delta: number) => {
    setEffortLevel(prev => Math.min(100, Math.max(0, prev + delta)));
  };

  // Calculate percentage within the visual gauge (from 0 to maxHr)
  const gaugePercent = Math.min(100, Math.max(0, (bpm / maxHr) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-600 animate-pulse" />
          <h2 className="font-bold text-slate-800 text-lg">Allenamento Guidato</h2>
        </div>
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        
        {/* Background Pulse Effect based on zone */}
        <div className={`absolute inset-0 opacity-10 transition-colors duration-1000 ${
           bpm > targetZone.maxBpm ? 'bg-red-500' : bpm >= targetZone.minBpm ? 'bg-green-500' : 'bg-indigo-500'
        }`} />

        {/* Timer */}
        <div className="text-6xl font-mono font-bold text-slate-900 mb-8 z-10 tabular-nums tracking-wider">
          {formatTime(seconds)}
        </div>

        {/* Main Heart Rate Display */}
        <div className="relative z-10 flex flex-col items-center mb-8">
          <div className="relative">
            <Heart 
              className={`w-32 h-32 transition-colors duration-300 ${
                bpm > targetZone.maxBpm ? 'text-red-500' : bpm >= targetZone.minBpm ? 'text-green-500' : 'text-slate-300'
              }`} 
              fill="currentColor"
              style={{ 
                animation: `pulse ${60/bpm}s infinite cubic-bezier(0.4, 0, 0.6, 1)` 
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center pt-2">
              <span className="text-4xl font-bold text-white drop-shadow-md">{bpm}</span>
            </div>
          </div>
          <span className="text-slate-500 font-medium mt-2">BPM Attuali (Simulati)</span>
        </div>

        {/* Feedback Banner */}
        <div className={`z-10 px-6 py-3 rounded-full border-2 font-bold text-lg mb-8 transition-all duration-300 shadow-sm text-center max-w-xs ${statusColor}`}>
          {feedback}
        </div>

        {/* Target Zone Info */}
        <div className="z-10 text-center mb-8 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Zona Target ({targetZone.name})</p>
          <p className="text-xl font-bold text-slate-800">{targetZone.minBpm} - {targetZone.maxBpm} BPM</p>
        </div>

        {/* Simulator Controls (Since we don't have real sensors) */}
        <div className="z-10 w-full max-w-sm bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Simulatore Sforzo</span>
            <span className="text-xs font-mono text-slate-700">{effortLevel}%</span>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => adjustEffort(-10)}
              className="flex-1 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 flex justify-center items-center active:scale-95 transition-transform"
            >
              <ChevronDown className="w-5 h-5" /> Meno
            </button>
            <button 
              onClick={() => adjustEffort(10)}
              className="flex-1 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 flex justify-center items-center active:scale-95 transition-transform"
            >
              <ChevronUp className="w-5 h-5" /> Più
            </button>
          </div>
        </div>

      </div>

      {/* Footer Controls */}
      <div className="bg-white border-t border-slate-200 p-6 flex justify-center gap-6 z-10 pb-8">
        {isActive ? (
          <button 
            onClick={toggleTimer}
            className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center hover:bg-amber-200 transition-colors shadow-sm"
          >
            <Pause className="w-8 h-8 fill-current" />
          </button>
        ) : (
          <button 
            onClick={toggleTimer}
            className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors shadow-sm"
          >
            <Play className="w-8 h-8 fill-current ml-1" />
          </button>
        )}
        
        <button 
          onClick={stopWorkout}
          className="w-16 h-16 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors shadow-sm"
        >
          <Square className="w-6 h-6 fill-current" />
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};
