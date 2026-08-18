import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, RefreshCcw } from 'lucide-react';
import { MeditationStep } from '../types';
import { motion, AnimatePresence } from 'motion/react';

type PlayerProps = {
  steps: MeditationStep[];
  onReset: () => void;
};

export default function MeditationPlayer({ steps, onReset }: PlayerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const step = steps[currentStep];

  useEffect(() => {
    if (audioRef.current && step?.audioUrl) {
      audioRef.current.src = step.audioUrl;
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [currentStep, step?.audioUrl]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleEnded = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsPlaying(false);
    }
  };

  if (!step) return null;

  return (
    <div className="flex flex-col h-full bg-stone-900 rounded-2xl overflow-hidden relative shadow-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
        >
          {step.imageUrl ? (
            <img 
              src={step.imageUrl} 
              alt="Meditation visual" 
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="w-full h-full bg-stone-800 animate-pulse" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent opacity-80" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex flex-col h-full p-8 text-stone-50">
        <div className="flex justify-between items-center mb-8">
          <span className="text-sm font-medium tracking-widest uppercase opacity-70">
            Step {currentStep + 1} of {steps.length}
          </span>
          <button 
            onClick={onReset}
            className="p-2 hover:bg-white/10 rounded-full transition-colors opacity-70 hover:opacity-100"
            title="Start New Session"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center text-center">
          <AnimatePresence mode="wait">
            <motion.p 
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed max-w-3xl text-stone-100 drop-shadow-md"
            >
              {step.text}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex flex-col items-center gap-6">
          <div className="flex items-center gap-6">
            <button 
              onClick={handlePrev} 
              disabled={currentStep === 0}
              className="p-3 hover:bg-white/10 rounded-full transition-colors disabled:opacity-30"
            >
              <SkipBack className="w-6 h-6" />
            </button>
            
            <button 
              onClick={togglePlay}
              className="p-5 bg-white text-stone-900 rounded-full hover:scale-105 transition-transform shadow-lg"
            >
              {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </button>
            
            <button 
              onClick={handleNext} 
              disabled={currentStep === steps.length - 1}
              className="p-3 hover:bg-white/10 rounded-full transition-colors disabled:opacity-30"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
      
      <audio 
        ref={audioRef} 
        onEnded={handleEnded} 
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
}
