const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

code = code.replace(
  /<div className="mb-6 border-b border-slate-100 pb-4 hidden flex-justify-between items-start">\s*<div>\s*<button/g,
  `<div className="mb-6 flex justify-end items-start">\s*<button`
);

code = code.replace(
  /<div className="mb-6 border-b border-slate-100 pb-4 flex justify-between items-start">\s*<div>\s*<h2 className="text-2xl font-bold text-slate-900">Emissão de OS<\/h2>\s*<p className="text-slate-500 text-sm">Simulador de Rotas<\/p>\s*<\/div>\s*<\/div>/g,
  `<div className="mb-6 border-b border-slate-100 pb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Emissão de OS</h2>
                  <p className="text-slate-500 text-sm">Simulador de Rotas</p>
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); setActiveTab('PRICING_TABLE'); }}
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Configurar Tabela de Preços"
                >
                  <CircleDollarSign size={20} />
                </button>
              </div>`
);

// We should also remove the hidden div we added
code = code.replace(
  /<div className="mb-6 flex justify-end items-start">\s*<button[\s\S]*?<\/button>\s*<\/div>/g,
  ``
);

fs.writeFileSync('src/components/Admin.tsx', code);
