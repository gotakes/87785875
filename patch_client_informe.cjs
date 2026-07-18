const fs = require('fs');
const file = 'src/components/Client.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add INFORME to Sidebar
const mapTab = `<button
            onClick={() => setActiveTab('MAP')}
            className={\`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 \${
              activeTab === 'MAP' ? 'bg-blue-800 text-white font-bold' : 'hover:bg-blue-800/50 hover:text-white font-medium'
            }\`}
          >
            <Map size={20} /> Mapa (Tempo Real)
          </button>`;

const informeTab = `<button
            onClick={() => setActiveTab('MAP')}
            className={\`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 \${
              activeTab === 'MAP' ? 'bg-blue-800 text-white font-bold' : 'hover:bg-blue-800/50 hover:text-white font-medium'
            }\`}
          >
            <Map size={20} /> Mapa (Tempo Real)
          </button>
          
          <button
            onClick={() => setActiveTab('INFORME')}
            className={\`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 \${
              activeTab === 'INFORME' ? 'bg-blue-800 text-white font-bold' : 'hover:bg-blue-800/50 hover:text-white font-medium'
            }\`}
          >
            <FileText size={20} /> Painel Fiscal / NFe
          </button>`;
          
content = content.replace(mapTab, informeTab);

// 2. Import PrintFiscalModal
if (!content.includes('PrintFiscalModal')) {
  content = content.replace("import PrintStatementModal from './PrintStatementModal';", "import PrintStatementModal from './PrintStatementModal';\nimport PrintFiscalModal from './PrintFiscalModal';");
}

// 3. Add showFiscal state
if (!content.includes('showFiscal')) {
  content = content.replace("const [printOs, setPrintOs] = useState<OrderService | null>(null);", "const [printOs, setPrintOs] = useState<OrderService | null>(null);\n  const [showFiscal, setShowFiscal] = useState(false);");
}

// 4. Add INFORME content logic
const newTabContent = `        {activeTab === 'INFORME' && (
          <div className="p-8 h-full overflow-y-auto animate-in fade-in duration-300">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Extrato Fiscal & Faturamento</h2>
              <p className="text-slate-500">Acompanhamento financeiro para emissão de Notas Fiscais (NFS-e).</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">OS Concluídas / Pagas</p>
                <p className="text-4xl font-black text-indigo-600">
                  {clientOrders.filter(os => os.status === 'COMPLETED').length}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Pago no Mês</p>
                <p className="text-3xl font-black text-emerald-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    clientOrders.filter(os => {
                      const osDate = new Date(os.createdAt);
                      const now = new Date();
                      return os.status === 'COMPLETED' && osDate.getMonth() === now.getMonth() && osDate.getFullYear() === now.getFullYear();
                    }).reduce((sum, os) => sum + (os.totalValue || 0), 0)
                  )}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Volume Acumulado (Ano)</p>
                <p className="text-3xl font-black text-indigo-900">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    clientOrders.filter(os => os.status === 'COMPLETED').reduce((sum, os) => sum + (os.totalValue || 0), 0)
                  )}
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Gerar Fechamento para Nota Fiscal</h3>
              <p className="text-sm text-slate-500 mb-6">
                Faça o download do extrato consolidado contendo todas as Ordens de Serviço finalizadas sob sua conta. Este documento serve como base para faturamento e emissão da NFS-e.
              </p>
              <button 
                onClick={() => setShowFiscal(true)}
                className="w-full md:w-auto px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm mx-auto"
              >
                <FileText size={18} />
                Exportar Extrato PDF
              </button>
            </div>
          </div>
        )}`;

content = content.replace("      </div>\n    </div>", `\n${newTabContent}\n      </div>\n    </div>`);

// 5. Add Modal rendering
const oldModals = `{printOs && (
        <PrintOsModal 
           userRole="CLIENT"
           printOs={printOs} 
           onClose={() => setPrintOs(null)} 
           onWhatsApp={() => handleWhatsApp(printOs)} 
        />
      )}`;
      
const newModals = `{printOs && (
        <PrintOsModal 
           userRole="CLIENT"
           printOs={printOs} 
           onClose={() => setPrintOs(null)} 
           onWhatsApp={() => handleWhatsApp(printOs)} 
        />
      )}
      {showFiscal && (
        <PrintFiscalModal 
          driver={{
            id: client.id,
            name: client.name,
            cpf: client.document,
            pixKeyType: client.document.length > 14 ? 'CNPJ' : 'CPF',
            phone: client.phone,
            pixKey: '',
            bank: '',
            agency: '',
            account: '',
            vehiclePlateHorse: '',
            vehiclePlateTrailer: '',
            vehicleType: '',
            axes: 0,
            status: 'PARKED',
            lat: 0,
            lng: 0,
            createdAt: client.createdAt
          }}
          orders={clientOrders.filter(os => os.status === 'COMPLETED')}
          year={new Date().getFullYear().toString()}
          onClose={() => setShowFiscal(false)}
        />
      )}`;
content = content.replace(oldModals, newModals);

fs.writeFileSync(file, content);
console.log('Client informe tab patched.');
