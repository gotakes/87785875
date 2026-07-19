const { GoogleGenAI } = require('@google/genai');
async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: "Qual o valor total de pedágio para um CARRO DE PASSEIO (2 eixos) viajando de São José dos Campos, SP para São Paulo, SP, capital? Considere os valores de pedágio atualizados hoje. Retorne apenas um JSON com {pedagio: numero_float}",
    config: {
      tools: [{ googleSearch: {} }]
    }
  });
  console.log(response.text);
}
run();
