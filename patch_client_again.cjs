const fs = require('fs');
let code = fs.readFileSync('src/components/Client.tsx', 'utf8');

const rotaStart = code.indexOf('{/* 2. ROTA */}');
const calcButton = code.indexOf('<button \n                        type="button" \n                        onClick={() => {', rotaStart);
// Actually, let's just use string replace.

// 1. Rename "Rota, Custo e Frete" to "Rota"
code = code.replace('<h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Rota, Custo e Frete</h3>', '<h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Rota</h3>');

// 2. Remove "Consumo" and "Preço" block if it exists
code = code.replace(/<div className="flex gap-4 mb-3">[\s\S]*?<\/div>\s*<\/div>\s*<div>\s*<div className="flex justify-between items-center mb-1">\s*<label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Origens<\/label>/, 
`<div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Origens</label>`);

// 3. Remove "Valores" section completely
const resIdx = code.indexOf('{/* 3. RESULTADOS E TOTAIS */}');
if (resIdx !== -1) {
  const nextSectionIdx = code.indexOf('<div className="pt-6 border-t border-slate-200">', resIdx);
  if (nextSectionIdx !== -1) {
    code = code.substring(0, resIdx) + code.substring(nextSectionIdx);
  }
}

fs.writeFileSync('src/components/Client.tsx', code);
