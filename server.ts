import express from "express";
import { createServer as createViteServer } from "vite";
import { rateLimit } from "express-rate-limit";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createServer() {
  const app = express();
  const PORT = 3000;

  // 1. MUST trust proxy for correct IP identification in Cloud Run/Nginx
  // Setting to 1 because Cloud Run is usually 1 hop away
  app.set('trust proxy', 1);

  app.use(express.json());

  // Rate Limiting Configuration
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"); 
  const max = parseInt(process.env.RATE_LIMIT_MAX || "500");

  const limiter = rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: "Too many requests",
      message: "Limite de pedidos excedido. Por favor, tente novamente mais tarde.",
    },
    // Silence the expected Cloud Run proxy warnings
    // express-rate-limit 7+ uses this validation object
    validate: { 
      trustProxy: false, // We already set it at the app level, so we don't need additional validation here
      xForwardedForHeader: false,
    },
  });

  // Apply rate limiting ONLY to API routes
  app.use("/api/", limiter);

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Secure AI Proxy Endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { prompt, context } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        console.error("Missing GEMINI_API_KEY on server");
        return res.status(500).json({ error: "AI Service not configured" });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: context ? `Contexto da Utilizadora: ${context}\n\nPergunta: ${prompt}` : prompt,
        config: {
          systemInstruction: `És uma assistente especializada para mães no pós-parto. 
          O teu tom é gentil, acolhedor e médico, mas acessível. 
          As mães estão a passar por mudanças físicas e emocionais profundas. 
          
          CRÍTICO: Deves comunicar SEMPRE em Português de Portugal (PT-PT). 
          Usa termos como "consulta", "marcação", "rabinho", "fralda".
          
          Se não tiveres a certeza sobre um sintoma médico OU se a utilizadora parecer em sofrimento, 
          DEVES recomendar explicitamente a marcação de uma consulta com um especialista.
          
          Mantém as respostas concisas e empáticas.`,
        },
      });

      res.json({ text: response.text });
    } catch (error) {
      console.error("AI Proxy Error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
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
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}

// In local environment, start the server
if (process.env.NODE_ENV !== 'production') {
  createServer().then(app => {
    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}

// Export for Vercel
export default createServer;
