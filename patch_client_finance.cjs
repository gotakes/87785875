const fs = require('fs');
let code = fs.readFileSync('src/components/Client.tsx', 'utf8');

if (!code.includes('selectedOsIds')) {
  // Add state for selection
  code = code.replace(/const clientOrders = orders.filter\(o => o.clientId === client.id\);/,
    "const clientOrders = orders.filter(o => o.clientId === client.id);\n  const [selectedOsIds, setSelectedOsIds] = useState<Record<string, boolean>>({});");

  // Add PrintStatementModal import
  if (!code.includes('PrintStatementModal')) {
    code = code.replace(/import PrintOsModal from '\.\/PrintOsModal';/,
      "import PrintOsModal from './PrintOsModal';\nimport PrintStatementModal from './PrintStatementModal';");
  }

  // Add state for statement
  if (!code.includes('statementData')) {
    code = code.replace(/const \[printOs, setPrintOs\] = useState<OrderService \| null>\(null\);/,
      "const [printOs, setPrintOs] = useState<OrderService | null>(null);\n  const [statementData, setStatementData] = useState<{orders: OrderService[], role: 'CLIENT' | 'DRIVER' | 'ADMIN_TO_CLIENT' | 'ADMIN_TO_DRIVER', targetName: string, targetDocument: string} | null>(null);");
  }

  // Render PrintStatementModal
  code = code.replace(/\{printOs && \(/,
    `{statementData && (
        <PrintStatementModal
          orders={statementData.orders}
          role={statementData.role}
          targetName={statementData.targetName}
          targetDocument={statementData.targetDocument}
          onClose={() => setStatementData(null)}
          onWhatsApp={() => {
             const total = statementData.orders.reduce((sum, os) => sum + (os.totalValue || 0), 0);
             const osList = statementData.orders.map(os => \`- OS #\${os.number}: R$ \${(os.totalValue || 0).toFixed(2).replace('.', ',')}\`).join('%0A');
             const msg = \`Olá, segue o comprovante de faturamento das viagens realizadas para a empresa \${statementData.targetName}:%0A%0A\${osList}%0A%0A*Total: R$ \${total.toFixed(2).replace('.', ',')}*\`;
             window.open(\`https://wa.me/?text=\${msg}\`, '_blank');
          }}
        />
      )}
      {printOs && (`);

  // Update headers
  code = code.replace(/<th className="px-6 py-4 font-semibold uppercase tracking-wider">OS \/ Data<\/th>/,
    `<th className="px-6 py-4 font-semibold text-center w-16">
                        <input 
                           type="checkbox"
                           onChange={(e) => {
                             const checked = e.target.checked;
                             const newSelection = { ...selectedOsIds };
                             clientOrders.forEach(os => {
                               newSelection[os.id!] = checked;
                             });
                             setSelectedOsIds(newSelection);
                           }}
                           className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                      </th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">OS / Data</th>`);
                      
  // Also add Payment Status to headers
  code = code.replace(/<th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Frete Total da OS<\/th>/,
    `<th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Frete Total da OS</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-center">Pgto</th>`);

  // Update rows empty state
  code = code.replace(/<td colSpan=\{5\} className="px-6 py-12 text-center text-slate-500">/,
    `<td colSpan={7} className="px-6 py-12 text-center text-slate-500">`);
    
  // Update rows
  code = code.replace(/<td className="px-6 py-4">\n                          <div className="font-bold text-slate-900">#\{os.number\}<\/div>/g,
    `<td className="px-6 py-4 text-center">
                            <input 
                              type="checkbox"
                              checked={!!selectedOsIds[os.id!]}
                              onChange={(e) => {
                                setSelectedOsIds(prev => ({
                                  ...prev,
                                  [os.id!]: e.target.checked
                                }));
                              }}
                              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">#{os.number}</div>`);
                            
  code = code.replace(/<span className="font-bold text-emerald-600">\{new Intl.NumberFormat\('pt-BR', \{style: 'currency', currency: 'BRL'\}\).format\(os.totalValue \|\| 0\)\}<\/span>\n                        <\/td>\n                        <td className="px-6 py-4 text-center">/g,
    `<span className="font-bold text-emerald-600">{new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(os.totalValue || 0)}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={\`px-3 py-1 text-xs font-semibold rounded-full \${os.paymentStatusClient === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}\`}>
                            {os.paymentStatusClient === 'PAID' ? 'PAGO' : 'PENDENTE'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">`);

  // Add the floating Action Bar
  code = code.replace(/<\/table>\n              <\/div>/,
    `</table>
              </div>
              
              {Object.values(selectedOsIds).some(v => v) && (
                <div className="bg-indigo-50 border-t border-indigo-200 p-4 flex justify-between items-center sticky bottom-0 z-10 animate-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm font-semibold text-indigo-800">Total Selecionado</p>
                      <p className="text-2xl font-black text-indigo-700">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                          clientOrders.filter(os => selectedOsIds[os.id!]).reduce((sum, os) => sum + (os.totalValue || 0), 0)
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const selectedOses = clientOrders.filter(os => selectedOsIds[os.id!]);
                        setStatementData({
                          orders: selectedOses,
                          role: 'CLIENT',
                          targetName: client.name,
                          targetDocument: client.document
                        });
                      }}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
                    >
                      Gerar Relatório de Pgto
                    </button>
                  </div>
                </div>
              )}`);
  
  fs.writeFileSync('src/components/Client.tsx', code);
}
