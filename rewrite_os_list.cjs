const fs = require('fs');
const filepath = 'src/components/Admin.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const startMarker = `{activeTab === 'OS_LIST' && (`;
const startIndex = content.indexOf(startMarker);

// Find the end of OS_LIST block.
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 md:mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black font-display text-slate-900 tracking-tight">Ordens de Serviço</h2>
                <p className="text-slate-500 mt-2 font-medium">Histórico e acompanhamento de OS.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <FileText size={18} /> <span className="hidden md:inline">Relatório PDF</span>
                </button>
                <button 
                  onClick={() => {
                    setOsForm({
                      date: new Date().toISOString().slice(0, 10),
                      clientId: '',
                      driverId: '',
                      origin: '',
                      destinations: [''],
                      status: 'PENDING_APPROVAL',
                      grossValue: 0,
                      tollCost: 0,
                      otherExpenses: 0,
                      paymentStatusClient: 'PENDING',
                      paymentStatusDriver: 'PENDING',
                      weight: 0,
                      kmTotal: 0
                    });
                    setEditingOs(null);
                    setActiveTab('OS_CREATE');
                  }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Plus size={18} /> Nova OS
                </button>
              </div>
            </div>

            <div className="bg-white p-3 md:p-4 rounded-lg md:rounded-2xl border border-slate-200 mb-6 shadow-sm">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Filter size={18} className="text-slate-400" />
                  <span className="text-sm font-semibold text-slate-700">Filtros</span>
                </div>
                
                <div className="flex-1 flex flex-col md:flex-row gap-3 w-full">
                  <select 
                    value={osStatusFilter}
                    onChange={(e) => setOsStatusFilter(e.target.value)}
                    className="w-full md:w-40 py-2 px-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs md:text-sm text-slate-700"
                  >
                    <option value="">Status</option>
                    <option value="PENDING_APPROVAL">Pendente</option>
                    <option value="APPROVED">Aprovada</option>
                    <option value="IN_TRANSIT">Em Trânsito</option>
                    <option value="COMPLETED">Finalizada</option>
                    <option value="CANCELLED">Cancelada</option>
                  </select>
                  <input 
                    type="date"
                    value={osDateFrom}
                    onChange={(e) => setOsDateFrom(e.target.value)}
                    className="w-full md:w-36 py-2 px-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs md:text-sm text-slate-700"
                  />
                  <input 
                    type="date"
                    value={osDateTo}
                    onChange={(e) => setOsDateTo(e.target.value)}
                    className="w-full md:w-36 py-2 px-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs md:text-sm text-slate-700"
                  />
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Nº OS ou Placa..."
                      value={osSearch}
                      onChange={(e) => setOsSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs md:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {filteredOS.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                  Nenhuma ordem de serviço encontrada.
                </div>
              ) : filteredOS.filter(os => {
                const s = osSearch.toLowerCase();
                return os.number.includes(s) || 
                       (os.driverName || '').toLowerCase().includes(s) || 
                       os.status.toLowerCase().includes(s);
              }).map(os => (
                <ExpandableCard
                  key={os.id}
                  id={os.id!}
                  isExpanded={!!expandedOsIds[os.id!]}
                  onToggle={toggleOsExpanded}
                  header={
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm md:text-base">#{os.number}</span>
                          <span className="text-xs text-slate-500 hidden md:inline">{new Date(os.createdAt).toLocaleDateString('pt-BR')} - {new Date(os.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="hidden md:flex flex-col border-l border-slate-200 pl-4">
                            <span className="text-sm font-semibold text-slate-800">{os.clientName || 'Cliente Indefinido'}</span>
                            <span className="text-xs text-slate-500">Mot: {os.driverName || 'Sem motorista'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="font-bold text-indigo-600 block text-sm md:text-base">{formatBRL(os.netValue)}</span>
                          <span className="text-[10px] md:text-xs text-slate-500 hidden md:block">Total Bruto: {formatBRL((os as any).totalValue || (os.grossValue || 0) + (os.tollCost || 0) + (os.otherExpenses || 0))}</span>
                        </div>
                        <span className={\`text-[10px] md:text-xs font-semibold rounded-full px-2 py-1 md:px-3 \${
                          os.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                          os.status === 'IN_TRANSIT' ? 'bg-indigo-100 text-indigo-700' : 
                          os.status === 'APPROVED' ? 'bg-purple-100 text-purple-700' : os.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }\`}>
                          {os.status === 'COMPLETED' ? 'Concluída' : 
                           os.status === 'IN_TRANSIT' ? 'Em Trânsito' : 
                           os.status === 'APPROVED' ? 'Aprovado' : os.status === 'CANCELLED' ? 'Cancelada' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Cliente / Motorista</p>
                      <p className="font-medium text-slate-900">{os.clientName || 'N/A'}</p>
                      <p className="text-sm text-slate-600">{os.driverName || 'Sem motorista'} <span className="text-xs text-slate-400">({os.vehicleType || '-'})</span></p>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Rota</p>
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex gap-2"><span className="text-emerald-500 font-bold">A</span><span className="text-slate-700">{os.origin}</span></div>
                        <div className="flex gap-2"><span className="text-indigo-500 font-bold">B</span><span className="text-slate-700">{os.destinations?.join('; ') || 'N/A'}</span></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-white rounded-lg border border-slate-200">
                    <div>
                      <p className="text-xs text-slate-500">KM Total / Peso</p>
                      <p className="font-semibold text-slate-900">{os.kmTotal} km / {os.weight} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Líquido Motorista</p>
                      <p className="font-semibold text-indigo-600">{formatBRL(os.netValue)}</p>
                    </div>
                    <div className="col-span-2 md:col-span-2">
                      <p className="text-xs text-slate-500 mb-1">Status de Pagamentos</p>
                      <div className="flex items-center gap-2">
                        <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase \${os.paymentStatusClient === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}\`}>
                          Cliente: {os.paymentStatusClient === 'PAID' ? 'Recebido' : 'Pendente'}
                        </span>
                        <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase \${os.paymentStatusDriver === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}\`}>
                          Motorista: {os.paymentStatusDriver === 'PAID' ? 'Pago' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={(e) => { e.stopPropagation(); setPrintOs(os); }}
                      className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
                    >
                      <FileText size={18} /> <span className="hidden md:inline">Salvar em PDF</span><span className="md:hidden">PDF</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); sendOsWhatsApp(os); }}
                      className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg font-medium hover:bg-emerald-100 transition-colors"
                    >
                      <MessageCircle size={18} /> <span className="hidden md:inline">Compartilhar</span><span className="md:hidden">Whats</span>
                    </button>
                    <div className="w-full md:w-auto flex-1 md:ml-auto flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingOs(os); }}
                        className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                      >
                        <Edit size={18} /> Editar
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteOs(os.id!); }}
                        className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={18} /> <span className="hidden md:inline">Cancelar OS</span><span className="md:hidden">Cancelar</span>
                      </button>
                    </div>
                  </div>
                </ExpandableCard>
              ))}
            </div>
          </div>
        )}`;

    fs.writeFileSync(filepath, content.replace(originalBlock, newBlock));
    console.log("Successfully replaced OS_LIST");
} else {
    console.log("Could not find bounds of OS_LIST");
}
