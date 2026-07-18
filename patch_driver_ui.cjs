const fs = require('fs');

let code = fs.readFileSync('src/components/Driver.tsx', 'utf8');

const oldDetails = /<div className="bg-slate-50 rounded-xl p-4 mb-4">\s*<div className="flex justify-between text-sm mb-2">\s*<span className="text-slate-500">Valor Líquido \(Frete\)<\/span>[\s\S]*?<span className="font-bold text-slate-900">\{order\.distanceKm\} km<\/span>\s*<\/div>\s*<\/div>/;

const newDetails = `<div className="bg-slate-50 rounded-xl p-4 mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-emerald-700 font-bold">LÍQUIDO DO MOTORISTA</span>
              <span className="font-bold text-emerald-700 text-lg">{formatBRL(order.netValue)}</span>
            </div>
            <div className="flex justify-between text-sm mt-2 pt-2 border-t border-slate-200">
              <span className="text-slate-500">Distância Total</span>
              <span className="font-bold text-slate-900">{order.distanceKm} km</span>
            </div>
          </div>`;

code = code.replace(oldDetails, newDetails);
fs.writeFileSync('src/components/Driver.tsx', code);
