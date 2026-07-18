const fs = require('fs');
let code = fs.readFileSync('src/components/Driver.tsx', 'utf8');

if (!code.includes('selectedOsIds')) {
  // Add state for selection
  code = code.replace(/const completedOrders = orders\.filter\(o => o.status === 'COMPLETED'\)\.sort\(\(a,b\) => new Date\(b.createdAt\)\.getTime\(\) - new Date\(a.createdAt\)\.getTime\(\)\);/,
    "const completedOrders = orders.filter(o => o.status === 'COMPLETED').sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());\n  const [selectedOsIds, setSelectedOsIds] = useState<Record<string, boolean>>({});");

  // Add PrintStatementModal import
  if (!code.includes('PrintStatementModal')) {
    code = code.replace(/import PrintOsModal from '\.\/PrintOsModal';/,
      "import PrintOsModal from './PrintOsModal';\nimport PrintStatementModal from './PrintStatementModal';");
  }

  // Add state for statement
  if (!code.includes('statementData')) {
    code = code.replace(/const \[printOs, setPrintOs\] = useState<OrderService \| null>\(null\);/,
      "const [printOs, setPrintOs] = useState<OrderService | null>(null);\n  const [statementData, setStatementData] = useState<{orders: OrderService[], role: 'CLIENT' | 'DRIVER' | 'ADMIN_TO_CLIENT' | 'ADMIN_TO_DRIVER', targetName: string, targetDocument: string, driverBankDetails: any} | null>(null);");
  }

  // Render PrintStatementModal
  code = code.replace(/\{printOs && \(/,
    `{statementData && (
        <PrintStatementModal
          orders={statementData.orders}
          role={statementData.role}
          targetName={statementData.targetName}
          targetDocument={statementData.targetDocument}
          driverBankDetails={statementData.driverBankDetails}
          onClose={() => setStatementData(null)}
          onWhatsApp={() => {
             const total = statementData.orders.reduce((sum, os) => sum + (os.netValue + (os.tollCost || 0) + (os.otherExpenses || 0)), 0);
             const osList = statementData.orders.map(os => \`- OS #\${os.number}: R$ \${(os.netValue + (os.tollCost || 0) + (os.otherExpenses || 0)).toFixed(2).replace('.', ',')}\`).join('%0A');
             const msg = \`Olá, segue o extrato de cobrança das minhas viagens finalizadas:%0A%0A\${osList}%0A%0A*Total a receber: R$ \${total.toFixed(2).replace('.', ',')}*\`;
             window.open(\`https://wa.me/?text=\${msg}\`, '_blank');
          }}
        />
      )}
      {printOs && (`);

  // For driver, completed orders are listed as cards. We should add a checkbox to the COMPLETED orders card.
  const cardStart = `    <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">`;
  const newCardStart = `    <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
      {order.status === 'COMPLETED' && (
        <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
          <label className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2 py-1 rounded shadow-sm cursor-pointer">
            <span className="text-xs font-semibold text-slate-600">Selecionar</span>
            <input 
              type="checkbox"
              checked={!!selectedOsIds[order.id!]}
              onChange={(e) => {
                setSelectedOsIds(prev => ({
                  ...prev,
                  [order.id!]: e.target.checked
                }));
              }}
              disabled={order.paymentStatusDriver === 'PAID'}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
          </label>
          <span className={\`text-xs font-semibold px-2 py-1 rounded-full \${order.paymentStatusDriver === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}\`}>
             {order.paymentStatusDriver === 'PAID' ? 'PAGO' : 'PENDENTE'}
          </span>
        </div>
      )}
`;
  code = code.replace(cardStart, newCardStart);

  // Add the floating Action Bar at the end of the main div
  const endDivs = `          )}
        </div>
      </div>
    </div>`;
  const newEndDivs = `          )}
        </div>
        
        {activeTab === 'COMPLETED' && Object.values(selectedOsIds).some(v => v) && (
          <div className="bg-indigo-900 border-t border-indigo-700 p-4 flex flex-col items-center sticky bottom-0 z-20 shadow-lg print:hidden">
            <div className="w-full flex justify-between items-center mb-3">
              <p className="text-sm font-semibold text-indigo-200">Total Selecionado</p>
              <p className="text-2xl font-black text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  completedOrders.filter(os => selectedOsIds[os.id!]).reduce((sum, os) => sum + (os.netValue + (os.tollCost || 0) + (os.otherExpenses || 0)), 0)
                )}
              </p>
            </div>
            <button 
              onClick={() => {
                const selectedOses = completedOrders.filter(os => selectedOsIds[os.id!]);
                setStatementData({
                  orders: selectedOses,
                  role: 'DRIVER',
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
              className="w-full bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-400 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <FileText size={18} /> Gerar Cobrança (PDF)
            </button>
          </div>
        )}
      </div>
    </div>`;
  code = code.replace(endDivs, newEndDivs);
  
  // also fix the status badge in the header of the card so it doesn't overlap the new checkbox
  // Wait, I placed the absolute right-4 top-4, let's remove the status badge from text-right if it's completed
  code = code.replace(/<div className="text-right">\n\s*<span className=\{\`text-xs font-semibold px-2 py-1 rounded-full \$\{order.status === 'COMPLETED' \? 'bg-emerald-100 text-emerald-700' : order.status === 'IN_TRANSIT' \? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'\}\`\}>\n\s*\{order.status === 'COMPLETED' \? 'Finalizada' : order.status === 'IN_TRANSIT' \? 'Em Rota' : order.status === 'APPROVED' \? 'Aprovado' : 'Pendente'\}\n\s*<\/span>\n\s*<\/div>/,
    `<div className="text-right">
          {order.status !== 'COMPLETED' && (
            <span className={\`text-xs font-semibold px-2 py-1 rounded-full \${order.status === 'IN_TRANSIT' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}\`}>
              {order.status === 'IN_TRANSIT' ? 'Em Rota' : order.status === 'APPROVED' ? 'Aprovado' : 'Pendente'}
            </span>
          )}
        </div>`);

  fs.writeFileSync('src/components/Driver.tsx', code);
}
