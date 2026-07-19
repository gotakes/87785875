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

  // API for Toll Calculation using Gemini
  app.post("/api/calculate-toll", async (req, res) => {
    try {
      const { origins, destinations, vehicleType, axles } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({ toll: 0, error: 'GEMINI_API_KEY_MISSING' });
      }
      
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Qual o valor total de pedágio para um veículo ${vehicleType} (${axles} eixos) viajando de ${origins.join(' e ')} para ${destinations.join(' e ')}? Considere os valores de pedágio do Brasil atualizados hoje. Retorne apenas um JSON com { "pedagio": numero_float }`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      
      let jsonStr = response.text || "";
      jsonStr = jsonStr.replace(/```json\n?|```\n?/g, "").trim();
      
      try {
        const parsed = JSON.parse(jsonStr);
        res.json({ toll: parsed.pedagio || 0 });
      } catch(e) {
        // Fallback se n conseguir parsear
        const match = jsonStr.match(/"pedagio":\s*([0-9.]+)/);
        if (match) {
           res.json({ toll: parseFloat(match[1]) });
        } else {
           res.json({ toll: 0 });
        }
      }
    } catch (error: any) {
      console.error("Toll calc error:", error);
      res.json({ toll: 0, error: error.message });
    }
  });

  // Geocode Search for Autocomplete (Nominatim with Gemini fallback)
  app.get("/api/geocode-search", async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Missing query" });
    
    try {
      let result = [];
      
      // Try Nominatim first
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query as string)}&addressdetails=1&limit=5&countrycodes=BR`, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'LogisticaApp/1.0' }
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          result = data.map((d: any) => ({ display_name: d.display_name, lat: d.lat, lon: d.lon }));
        }
      }
      
      // If no results, ask Gemini!
      if (result.length === 0 && process.env.GEMINI_API_KEY) {
         const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
         const prompt = `Qual a latitude e longitude exata, e o nome por extenso deste endereço no Brasil: '${query}'? Retorne apenas um JSON puro com { "lat": string_float, "lon": string_float, "display_name": string }`;
         const aiResp = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] }
         });
         
         let jsonStr = aiResp.text || "";
         jsonStr = jsonStr.replace(/```json\n?|```\n?/g, "").trim();
         try {
           const parsed = JSON.parse(jsonStr);
           if (parsed.lat && parsed.lon) {
              result = [{ display_name: parsed.display_name || query, lat: parsed.lat.toString(), lon: parsed.lon.toString() }];
           }
         } catch(e) {}
      }
      
      res.json(result);
    } catch (error) {
       res.status(500).json({ error: 'Erro' });
    }
  });

  // Geocoding Proxy to avoid browser CORS/User-Agent restrictions
  app.get("/api/geocode", async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Missing query parameter 'q'" });

    try {
      let result = [];
      const gmpKey = process.env.GOOGLE_MAPS_PLATFORM_KEY;
      
      if (gmpKey) {
        // Use Google Maps Geocoding API
        const gmpRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query as string)}&region=br&key=${gmpKey}`);
        const gmpData = await gmpRes.json();
        
        if (gmpData.status === 'OK' && gmpData.results.length > 0) {
          result = [{ 
            lat: gmpData.results[0].geometry.location.lat.toString(), 
            lon: gmpData.results[0].geometry.location.lng.toString() 
          }];
        } else {
           console.log("Google Maps geocode fail/empty:", gmpData.status);
        }
      } 
      
      // Fallback if no key or no results
      if (result.length === 0) {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query as string)}&limit=1`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'LogisticaApp/1.0'
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            result = [{ lat: data[0].lat, lon: data[0].lon }];
          }
        }
      }
      
      // If Nominatim failed too, use Gemini as last resort
      if (result.length === 0 && process.env.GEMINI_API_KEY) {
         const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
         const prompt = `Qual a latitude e longitude exata deste endereço no Brasil: '${query}'? Retorne apenas um JSON puro com { "lat": string_float, "lon": string_float }`;
         const aiResp = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] }
         });
         
         let jsonStr = aiResp.text || "";
         jsonStr = jsonStr.replace(/```json\n?|```\n?/g, "").trim();
         try {
           const parsed = JSON.parse(jsonStr);
           if (parsed.lat && parsed.lon) {
              result = [{ lat: parsed.lat.toString(), lon: parsed.lon.toString() }];
           }
         } catch(e) {
           console.error("Gemini geocode parsing error", e);
         }
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
