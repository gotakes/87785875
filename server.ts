import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_2026";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: { origin: "*" }
  });
  const PORT = 3000;

  // Real-time tracking namespace
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: Token required"));
    }
    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) return next(new Error("Authentication error: Invalid token"));
      socket.data.user = decoded; // { id, role, clientId (if any) }
      next();
    });
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;
    console.log(`[WebSocket] User connected: ${user.role} (${user.id})`);

    // Join room based on role for multi-tenancy
    if (user.role === "ADMIN") {
      socket.join("admins");
    } else if (user.role === "CLIENT") {
      socket.join(`client_${user.id}`);
    }

    socket.on("driver_location_update", (data) => {
      // data: { driverId, lat, lng, clientId? }
      if (user.role === "DRIVER" && user.id === data.driverId) {
        // Broadcast to admins
        io.to("admins").emit("location_update", data);
        
        // Broadcast to specific client if the driver is currently on an OS for that client
        if (data.clientId) {
          io.to(`client_${data.clientId}`).emit("location_update", data);
        }
      }
    });

    socket.on("disconnect", () => {
      console.log(`[WebSocket] User disconnected: ${user.id}`);
    });
  });

  // Middleware para JSON com limite maior para imagens base64
  app.use(express.json({ limit: "50mb" }));

  // Auth generation endpoint
  app.post("/api/auth/token", (req, res) => {
    const { id, role } = req.body;
    if (!id || !role) return res.status(400).json({ error: "Missing id or role" });
    const token = jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  });

  // Geocoding Proxy to avoid browser CORS/User-Agent restrictions
  app.get("/api/geocode", async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Missing query parameter 'q'" });

    try {
      // Using Photon by Komoot as it's more lenient with rate limits than Nominatim
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query as string)}&limit=1`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'LogisticaApp/1.0'
        }
      });
      if (!response.ok) {
        throw new Error(`Photon error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      
      // Map Photon response to Nominatim-like response for compatibility
      let result = [];
      if (data && data.length > 0) {
        result = [{ lat: data[0].lat, lon: data[0].lon }];
      }
      
      res.json(result);
    } catch (error: any) {
      console.error("Geocoding proxy error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch geocoding data" });
    }
  });

  // Rota da API Gemini
  app.post("/api/extract-qualp", async (req, res) => {
    try {
      const { imagesBase64 } = req.body;
      
      if (!imagesBase64 || !Array.isArray(imagesBase64) || imagesBase64.length === 0) {
        return res.status(400).json({ error: "Nenhuma imagem fornecida." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY não configurada no servidor.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `Você é um assistente de extração de dados logísticos. Analise o(s) print(s) do site Qualp ou similar fornecido(s). Extraia textualmente os seguintes dados e retorne estritamente em formato JSON puro, sem formatação markdown:
{
  "origem": (nome da cidade de origem, se encontrado),
  "destino": (nome da cidade de destino, se encontrado),
  "distancia": (valor em km, apenas número),
  "pedagio": (valor do pedágio em R$, apenas número),
  "combustivel_total": (valor em R$, apenas número se houver)
}
Caso não encontre algum valor, retorne null para ele.`;

      // A API espera inlineData para imagens
      const imageParts = imagesBase64.map((base64: string) => ({
        inlineData: {
          data: base64,
          mimeType: "image/jpeg", // Aceitando genericamente como jpeg ou png
        }
      }));

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          prompt,
          ...imageParts
        ]
      });

      let jsonStr = response.text || "";
      // Remover possíveis tags markdown do JSON
      jsonStr = jsonStr.replace(/```json\n?|```\n?/g, "").trim();
      
      const parsed = JSON.parse(jsonStr);
      res.json(parsed);

    } catch (error: any) {
      console.error("Erro na extração do Qualp com IA:", error);
      res.status(500).json({ error: error.message || "Erro interno na extração via IA." });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
