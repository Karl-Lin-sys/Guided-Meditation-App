export type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

export type MeditationStep = {
  text: string;
  imagePrompt: string;
  imageUrl?: string;
  audioUrl?: string;
};

export type ImageSize = '1K' | '2K' | '4K';
