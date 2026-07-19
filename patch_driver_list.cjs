const fs = require('fs');
const filepath = 'src/components/Admin.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const targetStr = `                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-2 py-2 md:px-6 md:py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Motorista / Contato</th>
                      <th className="px-2 py-2 md:px-6 md:py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Veículo / Placa</th>
                      <th className="px-2 py-2 md:px-6 md:py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                      <th className="px-2 py-2 md:px-6 md:py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {drivers.filter(d => {
                      const s = driverSearch.toLowerCase();
                      return d.name.toLowerCase().includes(s) || 
                             d.cpf.toLowerCase().includes(s) || 
                             d.vehiclePlateHorse.toLowerCase().includes(s);
                    }).length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-3 md:px-6 py-12 text-center text-slate-500">
                          Nenhum motorista encontrado.
                        </td>
                      </tr>
                    ) : drivers.filter(d => {
                      const s = driverSearch.toLowerCase();
                      return d.name.toLowerCase().includes(s) || 
                             d.cpf.toLowerCase().includes(s) || 
                             d.vehiclePlateHorse.toLowerCase().includes(s);
                    }).map(driver => (
                        <tr key={driver.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-2 py-2 md:px-6 md:py-4 cursor-pointer" onClick={() => { setSelectedDriverId(driver.id); setActiveTab('DRIVER_DETAIL'); }}>
                            <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{driver.name}</div>
                            <div className="text-xs text-slate-500 mt-1">CPF: {driver.cpf} • Cel: {driver.phone}</div>
                          </td>
                          <td className="px-2 py-2 md:px-6 md:py-4 cursor-pointer" onClick={() => { setSelectedDriverId(driver.id); setActiveTab('DRIVER_DETAIL'); }}>
                            <div className="font-semibold text-slate-800">{driver.vehicleType || 'Não Informado'}</div>
                            <div className="text-xs text-slate-500 mt-1">Placa: {driver.vehiclePlateHorse}</div>
                          </td>
                          <td className="px-2 py-2 md:px-6 md:py-4 text-center cursor-pointer" onClick={() => { setSelectedDriverId(driver.id); setActiveTab('DRIVER_DETAIL'); }}>
                            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
                              Ativo
                            </span>
                          </td>
                          <td className="px-2 py-2 md:px-6 md:py-4 text-right">
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setFinanceDriverId(driver.id); 
                                setActiveTab('DRIVER_DETAIL'); 
                              }} 
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Acessar Financeiro do Motorista"
                            >
                              <CreditCard size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>`;

const newStr = `                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-2 py-2 md:px-6 md:py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Motorista / Razão Social</th>
                      <th className="px-2 py-2 md:px-6 md:py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Veículo / Placa</th>
                      <th className="px-2 py-2 md:px-6 md:py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center hidden md:table-cell">Status</th>
                      <th className="px-2 py-2 md:px-6 md:py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right hidden md:table-cell">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {drivers.filter(d => {
                      const s = driverSearch.toLowerCase();
                      return d.name.toLowerCase().includes(s) || 
                             d.cpf.toLowerCase().includes(s) || 
                             d.vehiclePlateHorse.toLowerCase().includes(s);
                    }).length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-3 md:px-6 py-12 text-center text-slate-500">
                          Nenhum motorista encontrado.
                        </td>
                      </tr>
                    ) : drivers.filter(d => {
                      const s = driverSearch.toLowerCase();
                      return d.name.toLowerCase().includes(s) || 
                             d.cpf.toLowerCase().includes(s) || 
                             d.vehiclePlateHorse.toLowerCase().includes(s);
                    }).map(driver => (
                      <React.Fragment key={driver.id}>
                        <tr className="hover:bg-slate-50 transition-colors group cursor-pointer md:cursor-default" onClick={() => toggleDriverExpanded(driver.id)}>
                          <td className="px-2 py-2 md:px-6 md:py-4" onClick={(e) => { e.stopPropagation(); setSelectedDriverId(driver.id); setActiveTab('DRIVER_DETAIL'); }}>
                            <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{driver.name}</div>
                            <div className="text-xs text-slate-500 mt-1">CPF: {driver.cpf}</div>
                          </td>
                          <td className="px-2 py-2 md:px-6 md:py-4 hidden md:table-cell" onClick={(e) => { e.stopPropagation(); setSelectedDriverId(driver.id); setActiveTab('DRIVER_DETAIL'); }}>
                            <div className="font-semibold text-slate-800">{driver.vehicleType || 'Não Informado'}</div>
                            <div className="text-xs text-slate-500 mt-1">Placa: {driver.vehiclePlateHorse}</div>
                          </td>
                          <td className="px-2 py-2 md:px-6 md:py-4 text-center hidden md:table-cell" onClick={(e) => { e.stopPropagation(); setSelectedDriverId(driver.id); setActiveTab('DRIVER_DETAIL'); }}>
                            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
                              Ativo
                            </span>
                          </td>
                          <td className="px-2 py-2 md:px-6 md:py-4 text-right hidden md:table-cell">
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setFinanceDriverId(driver.id); 
                                setActiveTab('DRIVER_DETAIL'); 
                              }} 
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Acessar Financeiro do Motorista"
                            >
                              <CreditCard size={18} />
                            </button>
                          </td>
                        </tr>
                        {expandedDriverIds[driver.id] && (
                          <tr className="md:hidden bg-slate-50/80">
                            <td colSpan={1} className="px-3 py-3 border-b border-slate-100">
                              <div className="flex flex-col gap-3">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="block text-slate-500 font-medium">Veículo / Placa:</span>
                                    <span className="font-semibold text-slate-900">{driver.vehicleType || 'Não Informado'}</span>
                                    <span className="block text-slate-500">{driver.vehiclePlateHorse}</span>
                                  </div>
                                  <div>
                                    <span className="block text-slate-500 font-medium">Contato:</span>
                                    <span className="font-semibold text-slate-900">{driver.phone}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedDriverId(driver.id); setActiveTab('DRIVER_DETAIL'); }}
                                    className="flex-1 flex justify-center items-center gap-1 py-1.5 bg-indigo-50 text-indigo-600 rounded-md font-medium"
                                  >
                                    <CreditCard size={16} /> Abrir Cadastro
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                        </React.Fragment>
                      ))}
                  </tbody>`;

if (content.includes(targetStr)) {
    fs.writeFileSync(filepath, content.replace(targetStr, newStr));
    console.log('Success driver list');
} else {
    console.log('Driver list str not found');
}
