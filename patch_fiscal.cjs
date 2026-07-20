const fs = require('fs');
let file = 'src/components/PrintFiscalModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `<div className="grid grid-cols-3 gap-1.5 md:gap-4 text-center">
              <div className="border border-slate-200 p-2 md:p-4 rounded">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Bruto de Fretes</p>
                <p className="text-lg md:text-xl font-bold text-slate-900">{formatBRL(fiscalData.resumo.bruto)}</p>
              </div>
              <div className="border border-slate-200 p-2 md:p-4 rounded">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total de Descontos/Retenções</p>
                <p className="text-lg md:text-xl font-bold text-red-600">{formatBRL(fiscalData.resumo.retencoes)}</p>
              </div>
              <div className="border border-slate-200 p-2 md:p-4 rounded bg-indigo-50 border-indigo-100">
                <p className="text-xs font-bold text-indigo-700 uppercase mb-1">Rendimento Líquido Pago</p>
                <p className="text-xl font-black text-indigo-900">{formatBRL(fiscalData.resumo.liquido)}</p>
              </div>
            </div>`;

const replacement = `<div className="flex justify-center text-center">
              <div className="border border-slate-200 p-2 md:p-6 rounded bg-indigo-50 border-indigo-100 min-w-[300px]">
                <p className="text-sm font-bold text-indigo-700 uppercase mb-2">Rendimento Líquido Pago</p>
                <p className="text-3xl font-black text-indigo-900">{formatBRL(fiscalData.resumo.liquido)}</p>
              </div>
            </div>`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
console.log("Patched PrintFiscalModal.tsx");
