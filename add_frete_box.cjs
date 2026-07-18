const fs = require('fs');

let client = fs.readFileSync('src/components/Client.tsx', 'utf8');

const freteBox = `                {routeCalculated && osTotalValue > 0 && (
                  <div className="mt-6 bg-emerald-100 border border-emerald-300 rounded-xl p-4 flex justify-between items-center">
                    <span className="text-emerald-900 font-bold text-lg">Frete Total da OS</span>
                    <span className="text-emerald-900 font-black text-2xl">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(osTotalValue)}</span>
                  </div>
                )}
                <div className="pt-6 flex items-center justify-end gap-4">`;

client = client.replace(
  /<div className="pt-6 flex items-center justify-end gap-4">/,
  freteBox
);

fs.writeFileSync('src/components/Client.tsx', client);
