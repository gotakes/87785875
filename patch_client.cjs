const fs = require('fs');
let code = fs.readFileSync('src/components/Client.tsx', 'utf8');

// Remove Consumo and Preço
code = code.replace(
  /\{\/\* 2\. ROTA \*\/\}([\s\S]*?)<div className="flex gap-4 mb-3">[\s\S]*?<\/div>\s*<\/div>\s*<div>\s*<div className="flex justify-between items-center mb-1">/g,
  `{/* 2. ROTA */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Rota</h3>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">`
);

// Remove Valores Section
code = code.replace(
  /\{\/\* 3\. RESULTADOS E TOTAIS \*\/\}([\s\S]*?)<div className="pt-6 border-t border-slate-200">/g,
  `<div className="pt-6 border-t border-slate-200">`
);

// Remove 'z-10 pointer-events-none' from the swap button container
code = code.replace(
  /className="flex justify-center -my-2 relative z-10 pointer-events-none"/g,
  'className="flex justify-center py-2 relative"'
);
code = code.replace(
  /className="bg-white border border-slate-200 p-1\.5 rounded-full shadow-sm hover:bg-slate-50 transition-colors pointer-events-auto"/g,
  'className="bg-white border border-slate-200 p-1.5 rounded-full shadow-sm hover:bg-slate-50 transition-colors"'
);

fs.writeFileSync('src/components/Client.tsx', code);
