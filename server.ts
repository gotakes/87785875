import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Assistant for geocoding
  app.post("/api/geocode", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      let optimizedQuery = query;



      // Fallback: Make sure "Brasil" is in the query if AI failed
      if (!optimizedQuery.toLowerCase().includes('brasil') && !optimizedQuery.toLowerCase().includes('brazil')) {
          optimizedQuery = `${optimizedQuery}, Brasil`;
      }
      
      console.log(`Geocoding optimized query: ${optimizedQuery}`);

      // Call Photon API
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(optimizedQuery)}&limit=5`;
      const response = await fetch(url, {
          headers: {
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
          }
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: "Geocoding service error" });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Geocoding API Error:", error);
      res.status(500).json({ error: "Internal server error" });
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
