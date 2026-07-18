const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

if (!code.includes('FINANCE_CLIENTS')) {
  // Add to Tab type
  code = code.replace(/type Tab = 'DASHBOARD' \| 'MAP' \| 'OS_CREATE' \| 'OS_LIST' \| 'DRIVER_LIST' \| 'CLIENT_LIST' \| 'DRIVER_DETAIL' \| 'FINANCE_DRIVERS' \| 'PRICING_TABLE';/, 
    "type Tab = 'DASHBOARD' | 'MAP' | 'OS_CREATE' | 'OS_LIST' | 'DRIVER_LIST' | 'CLIENT_LIST' | 'DRIVER_DETAIL' | 'FINANCE_DRIVERS' | 'FINANCE_CLIENTS' | 'PRICING_TABLE';");

  // Add financeClientId state
  code = code.replace(/const \[financeDriverId, setFinanceDriverId\] = useState<string>\(''\);/,
    "const [financeDriverId, setFinanceDriverId] = useState<string>('');\n  const [financeClientId, setFinanceClientId] = useState<string>('');\n  const [selectedFinanceClientOsIds, setSelectedFinanceClientOsIds] = useState<Record<string, boolean>>({});");

  // Add CreditCard button to Client List
  const clientListRow = `<td className="p-4 text-slate-600">-</td>`;
  const newClientListRow = `<td className="p-4 text-right">
                            <button 
                               onClick={() => {
                                 setFinanceClientId(c.id);
                                 setActiveTab('FINANCE_CLIENTS');
                               }} 
                               className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Acessar Financeiro do Cliente"
                            >
                              <CreditCard size={18} />
                            </button>
                          </td>`;
  code = code.replace(clientListRow, newClientListRow);
  
  // Replace the table header 
  code = code.replace(/<th className="p-4 font-bold text-slate-700">Data de Cadastro<\/th>/,
    `<th className="p-4 font-bold text-slate-700 text-right">Ações</th>`);
    
  // Also we need to render the FINANCE_CLIENTS block right after FINANCE_DRIVERS
  const financeDriversEnd = `          </div>
        )}

        {/* ================= PRINT LAYOUT ================= */}`;
  
  const financeClientsBlock = `          </div>
        )}

        {activeTab === 'FINANCE_CLIENTS' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            <div className="mb-8 flex items-center gap-4">
              <button 
                onClick={() => setActiveTab('CLIENT_LIST')} 
                className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft size={20} className="text-slate-600" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Financeiro de Clientes</h2>
                <p className="text-slate-500">Selecione o cliente e as OSs para calcular o valor a receber.</p>
              </div>
            </div>

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
                           toast.success(\`\${successCount} OSs marcadas como pagas!\`);
                           setSelectedFinanceClientOsIds({});
                        }
                      }}
                      className="flex-1 bg-white border border-indigo-200 text-indigo-700 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={16}/> Marcar como Pago
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
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
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
                      <th className="px-6 py-4 font-semibold text-center">Status</th>
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
                              {os.paymentStatusClient === 'PAID' ? 'PAGO' : 'PENDENTE'}
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

        {/* ================= PRINT LAYOUT ================= */}`;
  
  code = code.replace(financeDriversEnd, financeClientsBlock);
  fs.writeFileSync('src/components/Admin.tsx', code);
}
