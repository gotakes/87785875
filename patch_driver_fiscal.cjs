const fs = require('fs');
const file = 'src/components/Driver.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Import PrintFiscalModal
if (!content.includes('PrintFiscalModal')) {
  content = content.replace("import PrintStatementModal from './PrintStatementModal';", "import PrintStatementModal from './PrintStatementModal';\nimport PrintFiscalModal from './PrintFiscalModal';");
}

// 2. Add INFORME to activeTab
content = content.replace("const [activeTab, setActiveTab] = useState<'PENDING' | 'COMPLETED'>('PENDING');", "const [activeTab, setActiveTab] = useState<'PENDING' | 'COMPLETED' | 'INFORME'>('PENDING');");

// 3. Add showFiscal state
content = content.replace("const [printOs, setPrintOs] = useState<OrderService | null>(null);", "const [printOs, setPrintOs] = useState<OrderService | null>(null);\n  const [showFiscal, setShowFiscal] = useState(false);");

// 4. Add the button to Tabs
const oldTabs = `<div className="flex bg-white border-b border-slate-200 no-print">
          <button 
            className={\`flex-1 py-3 text-sm font-bold border-b-2 transition-colors \${activeTab === 'PENDING' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
            onClick={() => setActiveTab('PENDING')}
          >
            Atuais ({pendingOrders.length})
          </button>
          <button 
            className={\`flex-1 py-3 text-sm font-bold border-b-2 transition-colors \${activeTab === 'COMPLETED' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
            onClick={() => setActiveTab('COMPLETED')}
          >
            Histórico ({completedOrders.length})
          </button>
        </div>`;
const newTabs = `<div className="flex bg-white border-b border-slate-200 no-print overflow-x-auto whitespace-nowrap">
          <button 
            className={\`flex-1 py-3 px-4 text-sm font-bold border-b-2 transition-colors \${activeTab === 'PENDING' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
            onClick={() => setActiveTab('PENDING')}
          >
            Atuais ({pendingOrders.length})
          </button>
          <button 
            className={\`flex-1 py-3 px-4 text-sm font-bold border-b-2 transition-colors \${activeTab === 'COMPLETED' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
            onClick={() => setActiveTab('COMPLETED')}
          >
            Histórico ({completedOrders.length})
          </button>
          <button 
            className={\`flex-1 py-3 px-4 text-sm font-bold border-b-2 transition-colors \${activeTab === 'INFORME' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
            onClick={() => setActiveTab('INFORME')}
          >
            Fiscal / IR
          </button>
        </div>`;
content = content.replace(oldTabs, newTabs);

// 5. Add Content for INFORME
const oldContent = `          {activeTab === 'COMPLETED' && (
            completedOrders.length === 0 ? (
              <div className="text-center mt-12 text-slate-500">
                <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                <p>Nenhuma viagem no histórico.</p>
              </div>
            ) : (
              completedOrders.map(renderOrderCard)
            )
          )}`;
          
const newContent = `          {activeTab === 'COMPLETED' && (
            completedOrders.length === 0 ? (
              <div className="text-center mt-12 text-slate-500">
                <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                <p>Nenhuma viagem no histórico.</p>
              </div>
            ) : (
              completedOrders.map(renderOrderCard)
            )
          )}
          
          {activeTab === 'INFORME' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in duration-300 text-center">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Informe de Rendimentos</h3>
              <p className="text-sm text-slate-500 mb-6">
                Emita seu extrato fiscal anual consolidado. Utilize este documento para comprovação de renda, emissão de NF-e e preenchimento da Declaração de Imposto de Renda (Carnê-Leão / DASN-SIMEI).
              </p>
              
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 text-left">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Resumo Anual ({new Date().getFullYear()})</p>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-600">Total de Viagens (Concluídas)</span>
                  <span className="font-bold text-slate-900">{completedOrders.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Valor Líquido Recebido</span>
                  <span className="font-bold text-indigo-700">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      completedOrders.reduce((sum, os) => sum + (os.netValue || 0), 0)
                    )}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => setShowFiscal(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <FileText size={18} />
                Gerar Informe Fiscal PDF
              </button>
            </div>
          )}`;
content = content.replace(oldContent, newContent);

// 6. Add PrintFiscalModal rendering
const oldModals = `{printOs && (
        <PrintOsModal 
          userRole="DRIVER"
          printOs={printOs} 
          onClose={() => setPrintOs(null)} 
          onWhatsApp={() => handleWhatsApp(printOs)} 
        />
      )}`;
const newModals = `{printOs && (
        <PrintOsModal 
          userRole="DRIVER"
          printOs={printOs} 
          onClose={() => setPrintOs(null)} 
          onWhatsApp={() => handleWhatsApp(printOs)} 
        />
      )}
      {showFiscal && (
        <PrintFiscalModal 
          driver={driver}
          orders={completedOrders}
          year={new Date().getFullYear().toString()}
          onClose={() => setShowFiscal(false)}
        />
      )}`;
content = content.replace(oldModals, newModals);

fs.writeFileSync(file, content);
console.log('Driver fiscal tab patched.');
