import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { ChatMessage, ImageSize } from '../types';
import { chatWithModel } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';

type ChatProps = {
  onGenerateSession: (prompt: string, model: string, imageSize: ImageSize) => void;
  isGenerating: boolean;
};

export default function Chat({ onGenerateSession, isGenerating }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'model',
    content: "Welcome. I'm your meditation guide. What kind of meditation are you looking for today? We can create something specific to your needs."
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-3.5-flash');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await chatWithModel(messages, userMessage.content, selectedModel);
      setMessages(prev => [...prev, { role: 'model', content: responseText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = () => {
    const chatHistory = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    onGenerateSession(`Based on this conversation, create a tailored meditation session:\n${chatHistory}`, selectedModel, imageSize);
  };

  return (
    <div className="flex flex-col h-full bg-stone-50 rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === 'user' 
                ? 'bg-stone-800 text-stone-50 rounded-br-none' 
                : 'bg-white text-stone-800 rounded-bl-none shadow-sm border border-stone-100'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white rounded-2xl rounded-bl-none shadow-sm border border-stone-100 px-4 py-3">
                <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-stone-200 p-4 space-y-4">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-xl border border-stone-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-stone-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-stone-800 text-stone-50 px-4 py-2 rounded-xl disabled:opacity-50 hover:bg-stone-700 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-stone-100">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <label className="text-xs text-stone-500 font-medium mb-1">Chat Model</label>
              <select 
                value={selectedModel} 
                onChange={(e) => setSelectedModel(e.target.value)}
                className="text-sm border border-stone-200 rounded-lg px-2 py-1.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-400"
              >
                <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Fast)</option>
                <option value="gemini-3.5-flash">Gemini 3.5 Flash (Balanced)</option>
                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Complex)</option>
              </select>
            </div>
            
            <div className="flex flex-col">
              <label className="text-xs text-stone-500 font-medium mb-1">Image Quality</label>
              <select 
                value={imageSize} 
                onChange={(e) => setImageSize(e.target.value as ImageSize)}
                className="text-sm border border-stone-200 rounded-lg px-2 py-1.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-400"
              >
                <option value="1K">1K (Standard)</option>
                <option value="2K">2K (High)</option>
                <option value="4K">4K (Ultra)</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={isGenerating || messages.length < 2}
            className="flex items-center gap-2 bg-gradient-to-r from-stone-700 to-stone-900 text-stone-50 px-5 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate Session
          </button>
        </div>
      </div>
    </div>
  );
}
