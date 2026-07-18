const fs = require('fs');

const adminInputs = `<div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Peso Estimado (Kg)</label>
                      <input name="estimatedWeight" type="text" placeholder="Ex: 1500" className="w-full bg-white rounded border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Volumetria (M³)</label>
                      <input name="cargoVolume" type="text" placeholder="Ex: 12" className="w-full bg-white rounded border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>`;

let admin = fs.readFileSync('src/components/Admin.tsx', 'utf8');
admin = admin.replace(
  /<div>\s*<label className="block text-sm font-medium text-slate-600 mb-1">Outras Despesas \(R\$\)<\/label>/,
  adminInputs + '\n                    <div>\n                      <label className="block text-sm font-medium text-slate-600 mb-1">Outras Despesas (R$)</label>'
);
fs.writeFileSync('src/components/Admin.tsx', admin);

let client = fs.readFileSync('src/components/Client.tsx', 'utf8');
const clientInputs = `<div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Peso Estimado (Kg) <span className="text-slate-400 font-normal">(Opcional)</span></label>
                      <input name="estimatedWeight" type="text" placeholder="Ex: 1500" className="w-full bg-white rounded border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Volumetria (M³) <span className="text-slate-400 font-normal">(Opcional)</span></label>
                      <input name="cargoVolume" type="text" placeholder="Ex: 12" className="w-full bg-white rounded border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>`;
client = client.replace(
  /<div>\s*<label className="block text-sm font-medium text-slate-700 mb-1">Outras Despesas \(R\$\)<\/label>/,
  clientInputs + '\n                    <div>\n                      <label className="block text-sm font-medium text-slate-700 mb-1">Outras Despesas (R$)</label>'
);
fs.writeFileSync('src/components/Client.tsx', client);
