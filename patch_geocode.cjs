const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldGeocode = `      // Fallback if no key or no results
      if (result.length === 0) {
        const response = await fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(query as string)}&limit=1\`, {
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
      
      res.json(result);`;

const newGeocode = `      // Fallback if no key or no results
      if (result.length === 0) {
        const response = await fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(query as string)}&limit=1\`, {
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
         const prompt = \`Qual a latitude e longitude exata deste endereço no Brasil: '\${query}'? Retorne apenas um JSON puro com { "lat": string_float, "lon": string_float }\`;
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
              result = [{ lat: parsed.lat.toString(), lon: parsed.lon.toString() }];
           }
         } catch(e) {
           console.error("Gemini geocode parsing error", e);
         }
      }
      
      res.json(result);`;

if (content.includes('// Fallback if no key or no results')) {
  fs.writeFileSync('server.ts', content.replace(oldGeocode, newGeocode));
  console.log("Patched server.ts geocode");
} else {
  console.log("Not found");
}
