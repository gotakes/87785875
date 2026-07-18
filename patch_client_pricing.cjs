const fs = require('fs');
const file = 'src/components/Client.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldBox = `{routeCalculated && osTotalValue > 0 && (
                  <div className="mt-6 bg-emerald-100 border border-emerald-300 rounded-xl p-4 flex justify-between items-center">
                    <span className="text-emerald-900 font-bold text-lg">Frete Total da OS</span>
                    <span className="text-emerald-900 font-black text-2xl">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(osTotalValue)}</span>
                  </div>
                )}`;

const newBox = `<div className="mt-6 bg-emerald-100 border border-emerald-300 rounded-xl p-4 flex justify-between items-center">
                  <span className="text-emerald-900 font-bold text-lg">Frete Total da OS</span>
                  <span className="text-emerald-900 font-black text-2xl">
                    {routeCalculated && osTotalValue > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(osTotalValue) : 'R$ 0,00'}
                  </span>
                </div>`;

content = content.replace(oldBox, newBox);
fs.writeFileSync(file, content);
console.log('Client pricing box patched.');
