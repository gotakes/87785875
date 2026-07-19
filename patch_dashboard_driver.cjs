const fs = require('fs');
const filepath = 'src/components/Admin.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const startStr = `<h3 className="text-base md:text-lg font-semibold text-slate-900">Fechamento por Motorista</h3>`;

const blockStart = content.lastIndexOf('<div className="bg-white rounded-lg md:rounded-2xl border border-slate-200 shadow-sm overflow-hidden">', content.indexOf(startStr));

let braceCount = 0;
let endIndex = -1;
for (let i = blockStart; i < content.length; i++) {
  if (content.substr(i, 4) === '<div') braceCount++;
  else if (content.substr(i, 5) === '</div') {
    if (braceCount === 1) {
      endIndex = i + 6;
      break;
    }
    braceCount--;
  }
}

if (blockStart > -1 && endIndex > -1) {
  const originalBlock = content.substring(blockStart, endIndex);
  
  const newStr = `            <div className="mb-6">
              <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-4 px-1">Fechamento por Motorista</h3>
              <div className="space-y-3">
                {drivers.map(driver => {
                  const driverOrders = orders.filter(o => o.driverId === driver.id);
                  const totalNet = driverOrders.reduce((acc, os) => acc + os.netValue, 0);

                  return (
                    <ExpandableCard
                      key={driver.id}
                      id={'dash_driver_' + driver.id!}
                      isExpanded={!!expandedDriverIds['dash_driver_' + driver.id!]}
                      onToggle={(id) => setExpandedDriverIds(prev => ({ ...prev, [id]: !prev[id] }))}
                      header={
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 text-indigo-700 rounded-full hidden md:flex items-center justify-center font-bold text-lg">
                              {driver.name.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 text-sm md:text-lg">{driver.name}</span>
                              <span className="text-xs text-slate-500">{driver.vehiclePlateHorse}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="font-bold text-emerald-600 block text-sm md:text-base">{formatBRL(totalNet)}</span>
                              <span className="text-[10px] md:text-xs text-slate-500 hidden md:block">Líquido a Receber</span>
                            </div>
                          </div>
                        </div>
                      }
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Documento (CPF)</p>
                          <p className="font-medium text-slate-900 text-sm">{driver.cpf || 'N/A'}</p>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Dados Bancários / PIX</p>
                          <div className="text-sm font-medium text-slate-900">
                            PIX: {driver.pixKey} ({driver.pixKeyType})
                          </div>
                          <div className="text-xs text-slate-600">
                            {driver.bank} - Agência: {driver.agency} - Conta: {driver.account}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                        <button
                          onClick={(e) => { 
                            e.stopPropagation();
                            setSelectedDriverId(driver.id);
                            // Se tiver state financeDriverId, usa
                            setActiveTab('DRIVER_DETAIL');
                          }}
                          className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
                        >
                          <CreditCard size={18} /> Acerto Financeiro
                        </button>
                        <div className="w-full md:w-auto flex-1 md:ml-auto flex gap-2">
                          <button
                            onClick={(e) => { 
                              e.stopPropagation();
                              setSelectedDriverId(driver.id);
                              setActiveTab('DRIVER_DETAIL');
                            }}
                            className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                          >
                            <UserPlus size={18} /> Perfil Completo
                          </button>
                        </div>
                      </div>
                    </ExpandableCard>
                  );
                })}
              </div>
            </div>`;

  fs.writeFileSync(filepath, content.replace(originalBlock, newStr));
  console.log("Replaced using block matching!");
} else {
  console.log("Could not find block boundaries.", blockStart, endIndex);
}
