const fs = require('fs');
const filepath = 'src/components/Client.tsx';
let content = fs.readFileSync(filepath, 'utf8');

if (!content.includes("ExpandableCard")) {
  content = "import { ExpandableCard } from './ExpandableCard';\n" + content;
}

const startMarker = `{activeTab === 'OS_LIST' && (`;
const startIndex = content.indexOf(startMarker);

let braceCount = 0;
let endIndex = -1;
for (let i = startIndex + startMarker.length; i < content.length; i++) {
  if (content[i] === '(') braceCount++;
  else if (content[i] === ')') {
    if (braceCount === 0) {
      endIndex = i;
      break;
    }
    braceCount--;
  }
}

if (startIndex > -1 && endIndex > -1) {
    const originalBlock = content.substring(startIndex, endIndex + 1);
    
    const newBlock = `{activeTab === 'OS_LIST' && (
          <div className="p-3 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4 md:mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black font-display text-slate-900 tracking-tight">Minhas Ordens de Serviço</h2>
                <p className="text-slate-500 mt-2 font-medium">Acompanhe e solicite novos transportes.</p>
              </div>
              <button 
                onClick={() => setActiveTab('OS_CREATE')}
                className="w-full md:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
              >
                <Plus size={18} /> Nova Solicitação
              </button>
            </div>

            <div className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-200 mb-6 shadow-sm">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Buscar Nº da OS ou Destino..."
                    value={osSearch}
                    onChange={(e) => setOsSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pb-24">
              {filteredClientOrders.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                  Nenhuma Ordem de Serviço encontrada.
                </div>
              ) : filteredClientOrders.map(os => (
                <ExpandableCard
                  key={os.id}
                  id={os.id!}
                  isExpanded={!!expandedOsIds[os.id!]}
                  onToggle={(id) => setExpandedOsIds(prev => ({ ...prev, [id]: !prev[id] }))}
                  header={
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox"
                          checked={!!selectedOsIds[os.id!]}
                          onChange={(e) => {
                            setSelectedOsIds(prev => ({
                              ...prev,
                              [os.id!]: e.target.checked
                            }));
                          }}
                          disabled={os.paymentStatusClient === 'PAID'}
                          className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-sm md:text-base">#{os.number}</span>
                            <span className="text-xs text-slate-500">{new Date(os.createdAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right hidden md:block">
                            <span className="font-bold text-emerald-600 text-sm md:text-base">{new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(os.totalValue || 0)}</span>
                          </div>
                          <span className={\`text-[10px] md:text-xs font-semibold rounded-full px-2 py-1 md:px-3 \${
                            os.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                            os.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-700' : 
                            os.status === 'APPROVED' ? 'bg-purple-100 text-purple-700' : os.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }\`}>
                            {os.status === 'COMPLETED' ? 'Entregue' : 
                             os.status === 'IN_TRANSIT' ? 'Em Trânsito' : 
                             os.status === 'APPROVED' ? 'Aprovado' : os.status === 'CANCELLED' ? 'Cancelada' : 'Pendente'}
                          </span>
                        </div>
                      </div>
                    </div>
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Origem</p>
                      <p className="font-medium text-slate-900 text-sm">{os.origin}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Destino</p>
                      <p className="font-medium text-slate-900 text-sm">{os.destinations.join('; ')}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-white rounded-lg border border-slate-200">
                    <div>
                      <p className="text-xs text-slate-500">Valor do Frete</p>
                      <p className="font-semibold text-emerald-600 text-lg">{new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(os.totalValue || 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Status de Pagamento</p>
                      <span className={\`inline-block mt-1 px-3 py-1 text-xs font-semibold rounded-full \${os.paymentStatusClient === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}\`}>
                        {os.paymentStatusClient === 'PAID' ? 'PAGO' : 'PENDENTE'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                    {os.status === 'IN_TRANSIT' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveTab('MAP'); setMobileMenuOpen(false); }}
                        className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                      >
                        <Map size={18} /> Rastrear Em Tempo Real
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setPrintOs(os); }}
                      className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                    >
                      <Printer size={18} /> Relatório PDF
                    </button>
                  </div>
                </ExpandableCard>
              ))}
            </div>

            {Object.values(selectedOsIds).some(v => v) && (
              <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-indigo-50 border-t border-indigo-200 p-3 md:p-4 flex justify-between items-center z-20 animate-in slide-in-from-bottom-2 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.1)]">
                <div className="flex items-center gap-2 md:gap-4">
                  <div>
                    <p className="text-xs md:text-sm font-semibold text-indigo-800">Total Selecionado</p>
                    <p className="text-lg md:text-2xl font-black text-indigo-700">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        clientOrders.filter(os => selectedOsIds[os.id!]).reduce((sum, os) => sum + (os.totalValue || 0), 0)
                      )}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const selectedOses = clientOrders.filter(os => selectedOsIds[os.id!]);
                    setStatementData({
                      orders: selectedOses,
                      role: 'CLIENT',
                      targetName: client.name,
                      targetDocument: client.document
                    });
                  }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
                >
                  <FileText size={18} /> <span className="hidden md:inline">Gerar Extrato PDF</span><span className="md:hidden">Extrato</span>
                </button>
              </div>
            )}
          </div>
        )}`;

    fs.writeFileSync(filepath, content.replace(originalBlock, newBlock));
    console.log("Successfully replaced OS_LIST in Client");
} else {
    console.log("Could not find bounds of OS_LIST in Client");
}
