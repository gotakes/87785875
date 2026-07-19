const fs = require('fs');
const filepath = 'src/components/Admin.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const startMarker = `{activeTab === 'DRIVER_LIST' && (`;
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
    
    const newBlock = `{activeTab === 'DRIVER_LIST' && (
          <div className="p-3 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 md:mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black font-display text-slate-900 tracking-tight">Motoristas e Frota</h2>
                <p className="text-slate-500 mt-2 font-medium">Gerencie sua equipe, veículos e acertos financeiros.</p>
              </div>
            </div>

            <div className="bg-white p-3 md:p-4 rounded-lg md:rounded-2xl border border-slate-200 mb-6 shadow-sm">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar por nome, placa ou CPF..."
                  value={driverSearch}
                  onChange={(e) => setDriverSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              {drivers.filter(d => {
                const s = driverSearch.toLowerCase();
                return d.name.toLowerCase().includes(s) || 
                       d.cpf.toLowerCase().includes(s) || 
                       d.vehiclePlateHorse.toLowerCase().includes(s);
              }).length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                  Nenhum motorista encontrado.
                </div>
              ) : drivers.filter(d => {
                const s = driverSearch.toLowerCase();
                return d.name.toLowerCase().includes(s) || 
                       d.cpf.toLowerCase().includes(s) || 
                       d.vehiclePlateHorse.toLowerCase().includes(s);
              }).map(driver => (
                <ExpandableCard
                  key={driver.id}
                  id={driver.id!}
                  isExpanded={!!expandedDriverIds[driver.id!]}
                  onToggle={toggleDriverExpanded}
                  header={
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg hidden md:flex">
                          {driver.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm md:text-lg">{driver.name}</span>
                          <span className="text-xs text-slate-500">{driver.vehicleType || 'Não Informado'} • Placa: {driver.vehiclePlateHorse}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] md:text-xs font-semibold rounded-full border border-emerald-200">
                          Online
                        </span>
                      </div>
                    </div>
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Documento (CPF)</p>
                      <p className="font-medium text-slate-900">{driver.cpf || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Contato</p>
                      <p className="font-medium text-slate-900">{driver.phone || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Veículo / Tipo</p>
                      <p className="font-medium text-slate-900">{driver.vehicleType || 'Não Informado'}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setFinanceDriverId(driver.id); 
                        setActiveTab('DRIVER_DETAIL'); 
                      }} 
                      className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg font-medium hover:bg-emerald-100 transition-colors"
                    >
                      <CreditCard size={18} /> Acerto Financeiro
                    </button>
                    <div className="w-full md:w-auto flex-1 md:ml-auto flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedDriverId(driver.id); setActiveTab('DRIVER_DETAIL'); }}
                        className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                      >
                        <UserPlus size={18} /> Abrir Perfil
                      </button>
                    </div>
                  </div>
                </ExpandableCard>
              ))}
            </div>
          </div>
        )}`;

    fs.writeFileSync(filepath, content.replace(originalBlock, newBlock));
    console.log("Successfully replaced DRIVER_LIST");
} else {
    console.log("Could not find bounds of DRIVER_LIST");
}
