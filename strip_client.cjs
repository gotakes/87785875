const fs = require('fs');
let code = fs.readFileSync('src/components/Client.tsx', 'utf8');

const resultSection = code.indexOf('{/* 3. RESULTADOS E TOTAIS */}');
const buttonSection = code.indexOf('<div className="pt-6 flex items-center justify-end gap-4">');

if (resultSection !== -1 && buttonSection !== -1) {
  // Let's replace the section with just the fields that matter: "O que será transportado?", "Observações Adicionais", "Data e hora" (maybe)?
  // Actually, the user needs to input "O que será transportado?" and "Observações Adicionais".
  const replacement = `{/* 3. INFORMAÇÕES ADICIONAIS */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Informações da Carga</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-slate-600 mb-1">Data e Hora da OS</label>
                      <input name="createdAt" type="datetime-local" defaultValue={getLocalDatetimeForInput(new Date().toISOString())} className="w-full bg-white rounded border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-600 mb-1">O que será transportado?</label>
                      <input name="cargoType" type="text" value={cargoType} onChange={(e) => setCargoType(e.target.value)} placeholder="Ex: Caixas de papelão, Eletrônicos" className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" required />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-600 mb-1">Observações Adicionais</label>
                      <textarea name="observations" value={observations} onChange={(e) => setObservations(e.target.value)} rows={2} className="w-full bg-white rounded border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
                    </div>
                  </div>
                </div>
                `;
  code = code.substring(0, resultSection) + replacement + code.substring(buttonSection);
  fs.writeFileSync('src/components/Client.tsx', code);
  console.log("Replaced successfully.");
} else {
  console.log("Could not find sections");
}
