import { ChatMessage, MeditationStep, ImageSize } from '../types';

export const chatWithModel = async (history: ChatMessage[], message: string, modelName: string) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history, message, modelName })
  });
  if (!response.ok) throw new Error('Failed to chat');
  const data = await response.json();
  return data.text;
};

export const generateMeditationSession = async (prompt: string): Promise<MeditationStep[]> => {
  const response = await fetch('/api/generate-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  if (!response.ok) throw new Error('Failed to generate session');
  const data = await response.json();
  try {
    const text = data.text.replace(/```json\n?|\n?```/g, '').trim();
    const steps = JSON.parse(text);
    return steps;
  } catch(e) {
    throw new Error('Failed to parse meditation session');
  }
};

export const generateImage = async (prompt: string, imageSize: ImageSize): Promise<string> => {
  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, imageSize })
  });
  if (!response.ok) throw new Error('Failed to generate image');
  const data = await response.json();
  return `data:image/jpeg;base64,${data.base64}`;
};

export const generateAudio = async (text: string, voice: string = 'Kore'): Promise<string> => {
  const response = await fetch('/api/generate-audio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice })
  });
  if (!response.ok) throw new Error('Failed to generate audio');
  const data = await response.json();
  return `data:audio/wav;base64,${data.base64}`;
};
