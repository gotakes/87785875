const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldGeocode = `  // Geocoding Proxy to avoid browser CORS/User-Agent restrictions
  app.get("/api/geocode", async (req, res) => {`;

const newRoutes = `  // API for Toll Calculation using Gemini
  app.post("/api/calculate-toll", async (req, res) => {
    try {
      const { origins, destinations, vehicleType, axles } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({ toll: 0, error: 'GEMINI_API_KEY_MISSING' });
      }
      
      const ai = new GoogleGenAI({ apiKey });
      const prompt = \`Qual o valor total de pedágio para um veículo \${vehicleType} (\${axles} eixos) viajando de \${origins.join(' e ')} para \${destinations.join(' e ')}? Considere os valores de pedágio do Brasil atualizados hoje. Retorne apenas um JSON com { "pedagio": numero_float }\`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      
      let jsonStr = response.text || "";
      jsonStr = jsonStr.replace(/\`\`\`json\\n?|\`\`\`\\n?/g, "").trim();
      
      try {
        const parsed = JSON.parse(jsonStr);
        res.json({ toll: parsed.pedagio || 0 });
      } catch(e) {
        // Fallback se n conseguir parsear
        const match = jsonStr.match(/"pedagio":\\s*([0-9.]+)/);
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
      const response = await fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(query as string)}&addressdetails=1&limit=5&countrycodes=BR\`, {
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
         const prompt = \`Qual a latitude e longitude exata, e o nome por extenso deste endereço no Brasil: '\${query}'? Retorne apenas um JSON puro com { "lat": string_float, "lon": string_float, "display_name": string }\`;
         const aiResp = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] }
         });
         
         let jsonStr = aiResp.text || "";
         jsonStr = jsonStr.replace(/\`\`\`json\\n?|\`\`\`\\n?/g, "").trim();
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
  app.get("/api/geocode", async (req, res) => {`;

content = content.replace(oldGeocode, newRoutes);
fs.writeFileSync('server.ts', content);
