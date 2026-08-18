import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { history, message, modelName = "gemini-3.5-flash", systemInstruction } = req.body;
      
      const chat = ai.chats.create({
        model: modelName,
        config: {
          systemInstruction: systemInstruction || "You are a helpful meditation guide and assistant.",
        },
      });

      // Send previous history
      if (history && history.length > 0) {
          // You can't easily set history via SDK without passing history config, 
          // but we can manually rebuild it or just pass everything in the first message if needed.
          // Wait, the new SDK supports passing history to chats.create? Let's check.
          // Let's just use generateContent with the whole history.
      }
      // Actually, since it's stateless on server, we should use generateContent with history.
      const contents = history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));
      contents.push({ role: 'user', parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction: systemInstruction || "You are a helpful meditation guide and assistant.",
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate Meditation Session
  app.post("/api/generate-session", async (req, res) => {
    try {
      const { prompt } = req.body;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `Generate a structured meditation session based on this prompt: "${prompt}". Provide 3 distinct steps. Each step should have a calming spoken 'text' and a highly detailed 'imagePrompt' for a visual generation that represents the current stage of the meditation (use descriptive visual words, not text-on-image). Format as JSON array of objects.`,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are an expert meditation instructor and visual artist.",
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate Image
  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, imageSize = "1K" } = req.body;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9",
            imageSize: imageSize
          }
        },
      });

      let base64 = "";
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          base64 = part.inlineData.data;
          break;
        }
      }

      res.json({ base64 });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate Audio
  app.post("/api/generate-audio", async (req, res) => {
    try {
      const { text, voice = "Kore" } = req.body;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      res.json({ base64: base64Audio });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
