const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

// Fix the activeTab === 'FINANCE_DRIVERS' block that might still be there.
// If it's there, we should just remove it. Wait, the regex `/{activeTab === 'FINANCE_DRIVERS' && \([\s\S]*?\{\/\* ================= PRINT LAYOUT ================= \*\/\}/`
// didn't match perfectly, so it left something behind.

code = code.replace(/\{activeTab === 'FINANCE_DRIVERS' && \([\s\S]*?\{\/\* ================= PRINT LAYOUT ================= \*\/\}/, "{/* ================= PRINT LAYOUT ================= */}");

// Fix any leftover `setActiveTab('FINANCE_DRIVERS')` in the code, for example in DRIVER_LIST.
// Actually, earlier I replaced it in `CLIENT_LIST` and `DRIVER_LIST` but maybe some were missed.
code = code.replace(/setActiveTab\('FINANCE_DRIVERS'\)/g, "setActiveTab('DRIVER_DETAIL')");
code = code.replace(/setFinanceDriverId\(d\.id\);/g, "setSelectedDriverId(d.id);");

// Let's add ClientDetailView
const clientDetailComponent = `
function ClientDetailView({ clientId, clients, orders, onBack, onGenerateStatement }: { clientId: string, clients: Client[], orders: OrderService[], onBack: () => void, onGenerateStatement: (oses: OrderService[], name: string, doc: string) => void }) {
  const [detailTab, setDetailTab] = useState<'INFO' | 'FINANCE'>('FINANCE');
  const [selectedOsIds, setSelectedOsIds] = useState<Record<string, boolean>>({});
  const client = clients.find(c => c.id === clientId);
  
  if (!client) return null;
  const clientOrders = orders.filter(o => o.clientId === clientId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="max-w-6xl mx-auto animate-in slide-in-from-right-4 duration-300 pb-12">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors"
        >
          <ArrowLeft size={20} /> Voltar para Lista
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
          <div>
            <h2 className="text-3xl font-black text-slate-900 font-display">{client.name}</h2>
            <p className="text-slate-500 font-medium mt-1">CNPJ/CPF: {client.document}</p>
          </div>
          <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
            <button onClick={() => setDetailTab('INFO')} className={\`px-6 py-2 rounded-lg font-bold text-sm transition-all \${detailTab === 'INFO' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}\`}>
              Dados Cadastrais
            </button>
            <button onClick={() => setDetailTab('FINANCE')} className={\`px-6 py-2 rounded-lg font-bold text-sm transition-all \${detailTab === 'FINANCE' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}\`}>
              Financeiro & OS
            </button>
          </div>
        </div>

        {detailTab === 'INFO' && (
          <div className="p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Informações do Cliente</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Nome/Razão Social</p>
                <p className="font-semibold text-slate-900">{client.name}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Documento</p>
                <p className="font-semibold text-slate-900">{client.document}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Telefone</p>
                <p className="font-semibold text-slate-900">{client.phone}</p>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 text-right">
                <span className="text-sm text-slate-400">A edição dos dados pode ser feita pelo cliente no próprio acesso.</span>
            </div>
          </div>
        )}

        {detailTab === 'FINANCE' && (
          <div className="p-8 bg-slate-50">
             <div className="flex justify-between items-end mb-6">
                <div>
                   <h3 className="text-xl font-bold text-slate-900">Histórico e Faturamento</h3>
                   <p className="text-sm text-slate-500">Selecione as OSs pendentes para gerar fatura ou marcar como recebido.</p>
                </div>
                <div className="flex gap-2">
                   <button 
                      onClick={() => {
                        const selected = clientOrders.filter(o => selectedOsIds[o.id!]);
                        if (selected.length === 0) return toast.error('Selecione pelo menos uma OS');
                        onGenerateStatement(selected, client.name, client.document);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
                    >
                      <FileText size={16} /> Gerar Fatura PDF
                    </button>
                    <button 
                      onClick={async () => {
                        const selected = clientOrders.filter(o => selectedOsIds[o.id!] && o.paymentStatusClient !== 'PAID');
                        if (selected.length === 0) return toast.error('Selecione OSs pendentes');
                        for (const os of selected) {
                          await updateDoc(doc(db, 'orders', os.id!), { paymentStatusClient: 'PAID' });
                        }
                        toast.success('Recebimento confirmado!');
                        setSelectedOsIds({});
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
                    >
                      <CheckCircle2 size={16} /> Marcar Recebido
                    </button>
                </div>
             </div>

             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 text-center">
                        <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" 
                          onChange={e => {
                            const val = e.target.checked;
                            const newSelection = {...selectedOsIds};
                            clientOrders.filter(o => o.paymentStatusClient !== 'PAID').forEach(o => newSelection[o.id!] = val);
                            setSelectedOsIds(newSelection);
                          }}
                        />
                      </th>
                      <th className="px-4 py-3 font-semibold">OS</th>
                      <th className="px-4 py-3 font-semibold">Data</th>
                      <th className="px-4 py-3 font-semibold">Rota</th>
                      <th className="px-4 py-3 font-semibold text-right">Valor</th>
                      <th className="px-4 py-3 font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clientOrders.map(os => (
                      <tr key={os.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-center">
                          <input type="checkbox" disabled={os.paymentStatusClient === 'PAID'} checked={!!selectedOsIds[os.id!]}
                            onChange={e => setSelectedOsIds({...selectedOsIds, [os.id!]: e.target.checked})}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                          />
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800">#{os.number}</td>
                        <td className="px-4 py-3 text-slate-500">{new Date(os.createdAt).toLocaleDateString('pt-BR')}</td>
                        <td className="px-4 py-3 text-slate-700 max-w-[200px] truncate">{os.origin.split(',')[0]} → {os.destinations?.[0]?.split(',')[0]}</td>
                        <td className="px-4 py-3 font-bold text-indigo-700 text-right">{formatBRL(os.totalValue || 0)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={\`px-2 py-1 text-[10px] font-bold uppercase rounded-full \${os.paymentStatusClient === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}\`}>
                            {os.paymentStatusClient === 'PAID' ? 'Recebido' : 'Pendente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {clientOrders.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500">Nenhuma OS encontrada</td></tr>}
                  </tbody>
                </table>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
`;

if (!code.includes('function ClientDetailView')) {
    code += "\n\n" + clientDetailComponent;
}

// 4. `src/components/Admin.tsx(1612,12): error TS2741: Property 'onGenerateStatement' is missing...`
code = code.replace(/<DriverDetailView \n\s*driverId=\{selectedDriverId\}\n\s*drivers=\{drivers\}\n\s*orders=\{orders\}\n\s*onBack=\{\(\) => \{\n\s*setSelectedDriverId\(null\);\n\s*setActiveTab\('DRIVER_LIST'\);\n\s*\}\} \n\s*onPrintOs=\{setPrintOs\}\n\s*onSendOsWhatsApp=\{sendOsWhatsApp\}\n\s*\/>/,
`<DriverDetailView 
            driverId={selectedDriverId}
            drivers={drivers}
            orders={orders}
            onBack={() => {
              setSelectedDriverId(null);
              setActiveTab('DRIVER_LIST');
            }} 
            onPrintOs={setPrintOs}
            onSendOsWhatsApp={sendOsWhatsApp}
            onGenerateStatement={(selectedOses, driver) => {
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
            }}
          />`);

fs.writeFileSync('src/components/Admin.tsx', code);
