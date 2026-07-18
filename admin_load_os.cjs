const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

const importRegex = /const \[loadedOsId, setLoadedOsId\]/;
if (!importRegex.test(code)) {
    code = code.replace(
        /const \[financeDriverId, setFinanceDriverId\] = useState<string>\(''\);/,
        `const [financeDriverId, setFinanceDriverId] = useState<string>('');\n  const [loadedClientOs, setLoadedClientOs] = useState<any>(null);\n  const [searchClientOs, setSearchClientOs] = useState<string>('');`
    );
}

// Add the input field for Client OS
const formStartRegex = /<h2 className="text-2xl font-bold text-slate-900">Emissão de OS<\/h2>\s*<p className="text-slate-500 text-sm">Simulador de Rotas<\/p>\s*<\/div>/;

const searchBox = `<h2 className="text-2xl font-bold text-slate-900">Emissão de OS</h2>
                  <p className="text-slate-500 text-sm">Simulador de Rotas</p>
                </div>`;

const searchBoxReplacement = `<h2 className="text-2xl font-bold text-slate-900">Emissão de OS</h2>
                  <p className="text-slate-500 text-sm">Simulador de Rotas</p>
                </div>
              </div>
              <div className="bg-indigo-50 p-4 rounded-xl mb-4 border border-indigo-100 shadow-sm">
                <label className="block text-sm font-bold text-indigo-900 mb-2">Carregar OS do Cliente (Nº)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ex: 123456" 
                    value={searchClientOs} 
                    onChange={e => setSearchClientOs(e.target.value)} 
                    className="flex-1 px-3 py-2 rounded-lg border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      const found = orders.find(o => o.number === searchClientOs && o.status === 'PENDING_APPROVAL');
                      if (found) {
                        setLoadedClientOs(found);
                        setRouteOrigins([found.origin]);
                        setRouteDests(found.destinations || []);
                        
                        setOsFormState(prev => ({
                          ...prev,
                          distance: found.distanceKm || 0,
                          tollPerAxle: (found.tollCost || 0) / (found.axles || 1), // approximate
                          axles: found.axles || 1,
                          otherExpenses: found.otherExpenses || 0
                        }));
                        
                        setMapOrigin(found.origin);
                        setMapDest((found.destinations || []).join(';'));
                        setRouteCalculated(true);
                        
                        toast.success('OS carregada com sucesso. Preencha o motorista e demais dados.');
                      } else {
                        toast.error('OS não encontrada ou não está pendente.');
                      }
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700"
                  >
                    Buscar
                  </button>
                </div>
                {loadedClientOs && (
                   <div className="mt-3 text-xs text-indigo-700 bg-white p-2 rounded border border-indigo-100 flex justify-between items-center">
                     <span>Editando OS #{loadedClientOs.number} do cliente: {loadedClientOs.clientName}</span>
                     <button type="button" onClick={() => setLoadedClientOs(null)} className="text-red-500 hover:underline">Cancelar</button>
                   </div>
                )}
              </div>
              <div className="mb-6 border-b border-slate-100 pb-4 hidden flex-justify-between items-start">
                <div>`;

code = code.replace(searchBox, searchBoxReplacement);

const submitRegex = /const osData = \{\s*number: osNumber,\s*driverId,\s*driverName: selectedDriver\?\.name \|\| '',/g;

code = code.replace(
  /const osData = \{\s*number: osNumber,\s*driverId,\s*driverName: selectedDriver\?\.name \|\| '',/g,
  `const osData = {
                      number: loadedClientOs ? loadedClientOs.number : osNumber,
                      clientId: loadedClientOs ? loadedClientOs.clientId : undefined,
                      clientName: loadedClientOs ? loadedClientOs.clientName : undefined,
                      driverId,
                      driverName: selectedDriver?.name || '',`
);

const addDocRegex = /await addDoc\(collection\(db, "orders"\), osData\);\s*toast\.success\(`OS Emitida com Sucesso!\\nDistância: \$\{distStr\}km\\nPedágio: R\$ \$\{tollCost\.toFixed\(2\)\}`\);/g;

code = code.replace(addDocRegex, 
  `if (loadedClientOs) {
                      await updateDoc(doc(db, "orders", loadedClientOs.id), osData);
                      toast.success(\`OS #\${loadedClientOs.number} aprovada com sucesso!\`);
                      setLoadedClientOs(null);
                      setSearchClientOs('');
                    } else {
                      await addDoc(collection(db, "orders"), osData);
                      toast.success(\`OS Emitida com Sucesso!\\nDistância: \${distStr}km\\nPedágio: R$ \${tollCost.toFixed(2)}\`);
                    }`);


fs.writeFileSync('src/components/Admin.tsx', code);
