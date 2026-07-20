const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const target = `      // Use Gemini to optimize the search query for Nominatim/Photon
      if (process.env.GEMINI_API_KEY) {
        try {
          const ai = new GoogleGenAI({ 
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                }
            }
          });
          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: \`You are an address formatting assistant for Brazil.
The user wants to find coordinates for this input: "\${query}"
Return ONLY a highly optimized address string that OpenStreetMap Nominatim or Photon will easily find in Brazil. 
Format it from most specific to least specific, e.g., "Street Name, Number, City, State, Brazil".
If the input lacks city/state but you can infer it, add it.
Always append ", Brasil" to the end.
Only output the raw string, nothing else. No quotes, no markdown, no conversational text.\`,
          });
          
          if (response.text) {
              optimizedQuery = response.text.trim();
          }
        } catch (aiError) {
          console.log("Gemini AI error (quota/rate limit), falling back to original query. Error:", aiError.message || aiError);
        }
      }`;

code = code.replace(target, '');
fs.writeFileSync('server.ts', code);
console.log("Removed Gemini from geocode");
