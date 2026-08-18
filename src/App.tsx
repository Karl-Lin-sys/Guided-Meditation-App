import React, { useState } from 'react';
import Chat from './components/Chat';
import MeditationPlayer from './components/MeditationPlayer';
import { generateMeditationSession, generateImage, generateAudio } from './lib/api';
import { MeditationStep, ImageSize } from './types';
import { Sparkles, Flower2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [sessionSteps, setSessionSteps] = useState<MeditationStep[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');

  const handleGenerateSession = async (prompt: string, model: string, imageSize: ImageSize) => {
    setIsGenerating(true);
    try {
      setLoadingStatus('Crafting your meditation script...');
      const steps = await generateMeditationSession(prompt);
      
      setLoadingStatus('Generating calming visuals and voiceovers...');
      
      // We will generate the images and audio concurrently for all steps
      const fullSteps = await Promise.all(steps.map(async (step, index) => {
        setLoadingStatus(`Creating assets for step ${index + 1} of ${steps.length}...`);
        const [imageUrl, audioUrl] = await Promise.all([
          generateImage(step.imagePrompt, imageSize).catch(() => undefined),
          generateAudio(step.text, 'Kore').catch(() => undefined)
        ]);
        
        return {
          ...step,
          imageUrl,
          audioUrl
        };
      }));

      setSessionSteps(fullSteps);
    } catch (error) {
      console.error(error);
      alert('Failed to generate session. Please try again.');
    } finally {
      setIsGenerating(false);
      setLoadingStatus('');
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center py-8 px-4 font-sans text-stone-800">
      <header className="mb-8 text-center max-w-2xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-2"
        >
          <Flower2 className="w-8 h-8 text-stone-600" />
          <h1 className="text-3xl font-light tracking-wide text-stone-700">Aura</h1>
        </motion.div>
        <p className="text-stone-500 font-medium">Your personalized meditation guide</p>
      </header>

      <main className="flex-1 w-full max-w-4xl flex flex-col shadow-xl rounded-2xl bg-white overflow-hidden relative">
        <AnimatePresence mode="wait">
          {sessionSteps ? (
            <motion.div 
              key="player"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-[600px] md:h-[700px] w-full"
            >
              <MeditationPlayer steps={sessionSteps} onReset={() => setSessionSteps(null)} />
            </motion.div>
          ) : (
            <motion.div 
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-[600px] md:h-[700px] w-full"
            >
              <Chat onGenerateSession={handleGenerateSession} isGenerating={isGenerating} />
            </motion.div>
          )}
        </AnimatePresence>

        {isGenerating && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-stone-200 border-t-stone-600 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-stone-600 animate-pulse" />
              </div>
            </div>
            <p className="mt-6 text-lg font-medium text-stone-700 animate-pulse">{loadingStatus}</p>
          </div>
        )}
      </main>
    </div>
  );
}
