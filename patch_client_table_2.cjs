const fs = require('fs');
let code = fs.readFileSync('src/components/Client.tsx', 'utf8');

const regex = /<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">[\s\S]*?<\/div>\s*\)\}\s*<\/div>\s*\)\}\s*\{activeTab === 'OS_CREATE' && \(/;

const newTable = `<div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">OS / Data</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Origem / Destino</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Valor Total</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clientOrders.map(os => (
                      <tr key={os.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">#{os.number}</div>
                          <div className="text-xs text-slate-500">{new Date(os.createdAt).toLocaleDateString('pt-BR')}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={\`text-xs font-semibold px-3 py-1 rounded-full \${
                            os.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                            os.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-700' :
                            os.status === 'APPROVED' ? 'bg-purple-100 text-purple-700' : os.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }\`}>
                            {os.status === 'COMPLETED' ? 'Entregue' :
                              os.status === 'IN_TRANSIT' ? 'Em Trânsito' :
                              os.status === 'APPROVED' ? 'Aprovado (Aguard. Coleta)' : os.status === 'CANCELLED' ? 'Cancelada' : 'Pendente (Aguard. Aprovação)'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-slate-900"><span className="text-slate-500 font-medium">Origem:</span> {os.origin}</div>
                          <div className="text-slate-900 mt-1"><span className="text-slate-500 font-medium">Destino:</span> {os.destinations.join('; ')}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-emerald-600">{new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(os.totalValue || 0)}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {os.status === 'IN_TRANSIT' && (
                              <button 
                                onClick={() => setActiveTab('MAP')}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Ver no Mapa"
                              >
                                <Map size={18} />
                              </button>
                            )}
                            <button 
                              onClick={() => setPrintOs(os)}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Imprimir / Salvar PDF / Compartilhar"
                            >
                              <Printer size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {activeTab === 'OS_CREATE' && (`;

if (regex.test(code)) {
    code = code.replace(regex, newTable);
    fs.writeFileSync('src/components/Client.tsx', code);
    console.log("Successfully replaced grid with table.");
} else {
    console.log("Regex didn't match. Here's a snippet to see what's wrong:");
    const match = code.match(/<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">[\s\S]{0,500}/);
    console.log(match ? match[0] : "Grid not found at all.");
}
