const { GoogleGenAI } = require('@google/genai');
async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: "Qual a latitude e longitude de Av. Eng. Juarez de Siqueira Brito Vanderlei, 155, São José dos Campos? Retorne apenas um JSON com {lat, lon}",
    config: {
      tools: [{ googleSearch: {} }]
    }
  });
  console.log(response.text);
}
run();
