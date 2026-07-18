const fs = require('fs');

let client = fs.readFileSync('src/components/Client.tsx', 'utf8');

const clientInputs = `<div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-slate-600 mb-1">Peso Estimado (Kg) <span className="text-slate-400 font-normal">(Opcional)</span></label>
                      <input name="estimatedWeight" type="text" placeholder="Ex: 1500" className="w-full bg-white rounded border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-slate-600 mb-1">Volumetria (M³) <span className="text-slate-400 font-normal">(Opcional)</span></label>
                      <input name="cargoVolume" type="text" placeholder="Ex: 12" className="w-full bg-white rounded border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-600 mb-1">Observações Adicionais</label>`;

client = client.replace(
  /<div className="col-span-2">\s*<label className="block text-sm font-medium text-slate-600 mb-1">Observações Adicionais<\/label>/,
  clientInputs
);

fs.writeFileSync('src/components/Client.tsx', client);
