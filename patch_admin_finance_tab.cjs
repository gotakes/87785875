const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

// 1. Add FINANCE to Tab type
code = code.replace(/type Tab = 'DASHBOARD' \| 'MAP' \| 'OS_CREATE' \| 'OS_LIST' \| 'DRIVER_LIST' \| 'CLIENT_LIST' \| 'DRIVER_DETAIL' \| 'FINANCE_DRIVERS' \| 'FINANCE_CLIENTS' \| 'PRICING_TABLE';/,
  "type Tab = 'DASHBOARD' | 'MAP' | 'OS_CREATE' | 'OS_LIST' | 'DRIVER_LIST' | 'CLIENT_LIST' | 'DRIVER_DETAIL' | 'FINANCE_DRIVERS' | 'FINANCE_CLIENTS' | 'FINANCE' | 'PRICING_TABLE';");

// 2. Add state for finance sub-tab
code = code.replace(/const \[activeTab, setActiveTab\] = useState<Tab>\('DASHBOARD'\);/,
  "const [activeTab, setActiveTab] = useState<Tab>('DASHBOARD');\n  const [financeSubTab, setFinanceSubTab] = useState<'DRIVERS' | 'CLIENTS'>('CLIENTS');");

// 3. Add SidebarButton for Finance
const sidebarButtonReplacement = `<SidebarButton 
            active={activeTab === 'OS_LIST'} 
            icon={<FileArchive size={20} />} 
            label="Lista de OS" 
            onClick={() => setActiveTab('OS_LIST')} 
          />
          <SidebarButton 
            active={activeTab === 'FINANCE'} 
            icon={<Banknote size={20} />} 
            label="Financeiro" 
            onClick={() => setActiveTab('FINANCE')} 
          />`;

code = code.replace(/<SidebarButton \n            active=\{activeTab === 'OS_LIST'\} \n            icon=\{<FileArchive size=\{20\} \/>\} \n            label="Lista de OS" \n            onClick=\{\(\) => setActiveTab\('OS_LIST'\)\} \n          \/>/, sidebarButtonReplacement);

// 4. In CLIENT_LIST and DRIVER_LIST, remove the action buttons that point to FINANCE_CLIENTS and FINANCE_DRIVERS
// Actually, it's fine to keep them, they can just change activeTab to 'FINANCE' and setFinanceSubTab appropriately!
code = code.replace(/setFinanceClientId\(c\.id\);\n\s*setActiveTab\('FINANCE_CLIENTS'\);/g,
  "setFinanceClientId(c.id); setFinanceSubTab('CLIENTS'); setActiveTab('FINANCE');");
  
code = code.replace(/setFinanceDriverId\(d\.id\);\n\s*setActiveTab\('FINANCE_DRIVERS'\);/g,
  "setFinanceDriverId(d.id); setFinanceSubTab('DRIVERS'); setActiveTab('FINANCE');");

// 5. Replace the individual FINANCE_DRIVERS and FINANCE_CLIENTS blocks with a combined FINANCE block
const financeDriversRegex = /\{activeTab === 'FINANCE_DRIVERS' && \([\s\S]*?\{activeTab === 'FINANCE_CLIENTS' && \([\s\S]*?\{\/\* ================= PRINT LAYOUT ================= \*\/\}/;

const newFinanceBlock = `{activeTab === 'FINANCE' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            <div className="mb-8">
              <h2 className="text-3xl font-black font-display text-slate-900 tracking-tight">Financeiro</h2>
              <p className="text-slate-500 mt-2 font-medium">Gestão de pagamentos e recebimentos.</p>
            </div>
            
            <div className="flex gap-4 mb-8">
              <button 
                onClick={() => setFinanceSubTab('CLIENTS')}
                className={\`flex-1 py-4 px-6 rounded-2xl flex items-center gap-3 transition-all \${financeSubTab === 'CLIENTS' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}\`}
              >
                <div className={\`p-2 rounded-lg \${financeSubTab === 'CLIENTS' ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'}\`}>
                  <ArrowDownToLine size={20} />
                </div>
                <div className="text-left">
                  <div className="font-bold">Recebimentos (Clientes)</div>
                  <div className={\`text-xs \${financeSubTab === 'CLIENTS' ? 'text-indigo-100' : 'text-slate-400'}\`}>Faturar fretes realizados</div>
                </div>
              </button>
              
              <button 
                onClick={() => setFinanceSubTab('DRIVERS')}
                className={\`flex-1 py-4 px-6 rounded-2xl flex items-center gap-3 transition-all \${financeSubTab === 'DRIVERS' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}\`}
              >
                <div className={\`p-2 rounded-lg \${financeSubTab === 'DRIVERS' ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'}\`}>
                  <ArrowUpFromLine size={20} />
                </div>
                <div className="text-left">
                  <div className="font-bold">Pagamentos (Motoristas)</div>
                  <div className={\`text-xs \${financeSubTab === 'DRIVERS' ? 'text-emerald-100' : 'text-slate-400'}\`}>Acerto de comissões/fretes</div>
                </div>
              </button>
            </div>
            
            {financeSubTab === 'CLIENTS' && (
              <div className="animate-in fade-in duration-300">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-8 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Selecionar Cliente</label>
                      <select 
                        value={financeClientId} 
                        onChange={(e) => {
                          setFinanceClientId(e.target.value);
                          setSelectedFinanceClientOsIds({});
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">-- Escolha um Cliente --</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.document})</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-6 py-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm font-medium text-indigo-800">Total a Receber (Selecionadas)</p>
                          <p className="text-3xl font-black font-display text-indigo-700">
                            {formatBRL(
                              orders
                                .filter(os => os.clientId === financeClientId && selectedFinanceClientOsIds[os.id!])
                                .reduce((sum, os) => sum + (os.totalValue || 0), 0)
                            )}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                          <CircleDollarSign size={24} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            const selectedOses = orders.filter(os => os.clientId === financeClientId && selectedFinanceClientOsIds[os.id!]);
                            if (selectedOses.length === 0) {
                              toast.error('Nenhuma OS selecionada.');
                              return;
                            }
                            const client = clients.find(c => c.id === financeClientId);
                            if (client) {
                               setStatementData({
                                 orders: selectedOses,
                                 role: 'ADMIN_TO_CLIENT',
                                 targetName: client.name,
                                 targetDocument: client.document
                               });
                            }
                          }}
                          className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <FileText size={16}/> Gerar Fatura (PDF)
                        </button>
                        
                        <button 
                          onClick={async () => {
                            const selectedOses = orders.filter(os => os.clientId === financeClientId && selectedFinanceClientOsIds[os.id!]);
                            if (selectedOses.length === 0) {
                              toast.error('Nenhuma OS selecionada.');
                              return;
                            }
                            
                            let successCount = 0;
                            for (const os of selectedOses) {
                              try {
                                const osRef = doc(db, 'orders', os.id!);
                                await updateDoc(osRef, { paymentStatusClient: 'PAID' });
                                successCount++;
                              } catch (e) {}
                            }
                            if (successCount > 0) {
                               toast.success(\`\${successCount} OSs marcadas como recebidas!\`);
                               setSelectedFinanceClientOsIds({});
                            }
                          }}
                          className="flex-1 bg-white border border-indigo-200 text-indigo-700 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 size={16}/> Marcar Recebido
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
    
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">OSs do Cliente</h3>
                    <div className="text-sm text-slate-500">
                      Total: {orders.filter(os => os.clientId === financeClientId).length}
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                          <th className="px-6 py-4 font-semibold text-center w-16">
                            <input 
                               type="checkbox"
                               onChange={(e) => {
                                 const checked = e.target.checked;
                                 const newSelection = { ...selectedFinanceClientOsIds };
                                 orders.filter(os => os.clientId === financeClientId && os.paymentStatusClient !== 'PAID').forEach(os => {
                                   newSelection[os.id!] = checked;
                                 });
                                 setSelectedFinanceClientOsIds(newSelection);
                               }}
                               className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                            />
                          </th>
                          <th className="px-6 py-4 font-semibold">OS / Data</th>
                          <th className="px-6 py-4 font-semibold">Origem / Destino</th>
                          <th className="px-6 py-4 font-semibold">Veículo</th>
                          <th className="px-6 py-4 font-semibold text-right">Valor Faturado</th>
                          <th className="px-6 py-4 font-semibold text-center">Status Pgto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders
                          .filter(os => os.clientId === financeClientId)
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .map(os => (
                            <tr key={os.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 text-center">
                                <input 
                                   type="checkbox"
                                  checked={!!selectedFinanceClientOsIds[os.id!]}
                                  onChange={(e) => {
                                    setSelectedFinanceClientOsIds(prev => ({
                                      ...prev,
                                      [os.id!]: e.target.checked
                                    }));
                                  }}
                                  disabled={os.paymentStatusClient === 'PAID'}
                                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-bold text-slate-900">#{os.number}</div>
                                <div className="text-xs text-slate-500">{new Date(os.createdAt).toLocaleDateString('pt-BR')}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-slate-800">{os.origin.split(',')[0]}</div>
                                <div className="text-xs text-slate-500">→ {os.destinations[0]?.split(',')[0]}</div>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-slate-700">
                                {os.vehicleType}
                              </td>
                              <td className="px-6 py-4 text-right font-bold text-indigo-700">
                                {formatBRL(os.totalValue || 0)}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={\`px-3 py-1 text-xs font-semibold rounded-full \${os.paymentStatusClient === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}\`}>
                                  {os.paymentStatusClient === 'PAID' ? 'RECEBIDO' : 'PENDENTE'}
                                </span>
                              </td>
                            </tr>
                          ))}
                          
                          {orders.filter(os => os.clientId === financeClientId).length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                Nenhuma OS encontrada para este cliente.
                              </td>
                            </tr>
                          )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            
            {financeSubTab === 'DRIVERS' && (
              <div className="animate-in fade-in duration-300">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-8 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Selecionar Motorista</label>
                      <select 
                        value={financeDriverId}
                        onChange={(e) => {
                          setFinanceDriverId(e.target.value);
                          setSelectedFinanceOsIds({});
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="">-- Escolha um Motorista --</option>
                        {drivers.map(d => (
                          <option key={d.id} value={d.id}>{d.name} ({d.vehiclePlateHorse})</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-6 py-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm font-medium text-emerald-800">Total a Pagar (Selecionadas)</p>
                          <p className="text-3xl font-black font-display text-emerald-700">
                            {formatBRL(
                              orders
                                .filter(os => os.driverId === financeDriverId && selectedFinanceOsIds[os.id!])
                                .reduce((sum, os) => sum + (os.netValue + (os.tollCost || 0) + (os.otherExpenses || 0)), 0)
                            )}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                          <CircleDollarSign size={24} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            const selectedOses = orders.filter(os => os.driverId === financeDriverId && selectedFinanceOsIds[os.id!]);
                            if (selectedOses.length === 0) {
                              toast.error('Nenhuma OS selecionada.');
                              return;
                            }
                            const driver = drivers.find(d => d.id === financeDriverId);
                            if (driver) {
                               setStatementData({
                                 orders: selectedOses,
                                 role: 'ADMIN_TO_DRIVER',
                                 targetName: driver.name,
                                 targetDocument: driver.cpf,
                                 driverBankDetails: {
                                   bank: driver.bank,
                                   agency: driver.agency,
                                   account: driver.account,
                                   pix: driver.pixKey
                                 }
                               });
                            }
                          }}
                          className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <FileText size={16}/> Gerar Extrato (PDF)
                        </button>
                        
                        <button 
                          onClick={async () => {
                            const selectedOses = orders.filter(os => os.driverId === financeDriverId && selectedFinanceOsIds[os.id!]);
                            if (selectedOses.length === 0) {
                              toast.error('Nenhuma OS selecionada.');
                              return;
                            }
                            let successCount = 0;
                            for (const os of selectedOses) {
                              try {
                                const osRef = doc(db, 'orders', os.id!);
                                await updateDoc(osRef, { paymentStatusDriver: 'PAID' });
                                successCount++;
                              } catch (e) {}
                            }
                            if (successCount > 0) {
                               toast.success(\`\${successCount} OSs marcadas como pagas!\`);
                               setSelectedFinanceOsIds({});
                            }
                          }}
                          className="flex-1 bg-white border border-emerald-200 text-emerald-700 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 size={16}/> Marcar como Pago
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
    
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">OSs do Motorista</h3>
                    <div className="text-sm text-slate-500">
                      Total: {orders.filter(os => os.driverId === financeDriverId).length}
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                          <th className="px-6 py-4 font-semibold text-center w-16">
                            <input 
                               type="checkbox"
                               onChange={(e) => {
                                 const checked = e.target.checked;
                                 const newSelection = { ...selectedFinanceOsIds };
                                 orders.filter(os => os.driverId === financeDriverId && os.paymentStatusDriver !== 'PAID').forEach(os => {
                                   newSelection[os.id!] = checked;
                                 });
                                 setSelectedFinanceOsIds(newSelection);
                               }}
                               className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                            />
                          </th>
                          <th className="px-6 py-4 font-semibold">OS / Data</th>
                          <th className="px-6 py-4 font-semibold">Origem / Destino</th>
                          <th className="px-6 py-4 font-semibold">Veículo</th>
                          <th className="px-6 py-4 font-semibold text-right">Valor a Pagar</th>
                          <th className="px-6 py-4 font-semibold text-center">Status Pgto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders
                          .filter(os => os.driverId === financeDriverId)
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .map(os => (
                            <tr key={os.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 text-center">
                                <input 
                                   type="checkbox"
                                  checked={!!selectedFinanceOsIds[os.id!]}
                                  onChange={(e) => {
                                    setSelectedFinanceOsIds(prev => ({
                                      ...prev,
                                      [os.id!]: e.target.checked
                                    }));
                                  }}
                                  disabled={os.paymentStatusDriver === 'PAID'}
                                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-bold text-slate-900">#{os.number}</div>
                                <div className="text-xs text-slate-500">{new Date(os.createdAt).toLocaleDateString('pt-BR')}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-slate-800">{os.origin.split(',')[0]}</div>
                                <div className="text-xs text-slate-500">→ {os.destinations[0]?.split(',')[0]}</div>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-slate-700">
                                {os.vehicleType}
                              </td>
                              <td className="px-6 py-4 text-right font-bold text-emerald-700">
                                {formatBRL((os.netValue || 0) + (os.tollCost || 0) + (os.otherExpenses || 0))}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={\`px-3 py-1 text-xs font-semibold rounded-full \${os.paymentStatusDriver === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}\`}>
                                  {os.paymentStatusDriver === 'PAID' ? 'PAGO' : 'PENDENTE'}
                                </span>
                              </td>
                            </tr>
                          ))}
                          
                          {orders.filter(os => os.driverId === financeDriverId).length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                Nenhuma OS encontrada para este motorista.
                              </td>
                            </tr>
                          )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= PRINT LAYOUT ================= */}`;

code = code.replace(financeDriversRegex, newFinanceBlock);

// ensure the icons are imported
if (!code.includes('ArrowDownToLine')) {
  code = code.replace(/import \{ .*Banknote,/, (match) => match + " ArrowDownToLine, ArrowUpFromLine, ");
}
if (!code.includes('Banknote')) {
  code = code.replace(/import \{ /, "import { Banknote, ");
}

fs.writeFileSync('src/components/Admin.tsx', code);
