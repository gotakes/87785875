const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

// Add import if not present
if (!code.includes('PrintStatementModal')) {
  code = code.replace(/import PrintOsModal from '\.\/PrintOsModal';/, 
    "import PrintOsModal from './PrintOsModal';\nimport PrintStatementModal from './PrintStatementModal';");
}

// Add state
if (!code.includes('const [statementData, setStatementData]')) {
  code = code.replace(/const \[printOs, setPrintOs\] = useState<OrderService \| null>\(null\);/,
    "const [printOs, setPrintOs] = useState<OrderService | null>(null);\n  const [statementData, setStatementData] = useState<{orders: OrderService[], role: 'CLIENT' | 'DRIVER' | 'ADMIN_TO_CLIENT' | 'ADMIN_TO_DRIVER', targetName: string, targetDocument: string, driverBankDetails?: any} | null>(null);");
}

// Render the modal
if (!code.includes('<PrintStatementModal')) {
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
            const driver = drivers.find(d => d.cpf === statementData.targetDocument);
            if (driver) {
               const total = statementData.orders.reduce((sum, os) => sum + (os.netValue + (os.tollCost || 0) + (os.otherExpenses || 0)), 0);
               const osList = statementData.orders.map(os => \`- OS #\${os.number}: R$ \${(os.netValue + (os.tollCost || 0) + (os.otherExpenses || 0)).toFixed(2).replace('.', ',')}\`).join('%0A');
               const msg = \`Olá \${driver.name}, segue o resumo de pagamento das suas viagens:%0A%0A\${osList}%0A%0A*Total a receber: R$ \${total.toFixed(2).replace('.', ',')}*\`;
               window.open(\`https://wa.me/?text=\${msg}\`, '_blank');
            }
          }}
        />
      )}
      {printOs && (`);
}

// Update FINANCE_DRIVERS buttons to use it
// Replace WhatsApp button in FINANCE_DRIVERS
code = code.replace(/<button \n                      onClick=\{\(\) => \{\n                        const selectedOses = orders.filter\(os => os.driverId === financeDriverId && selectedFinanceOsIds\[os.id!\]\);\n                        if \(selectedOses.length === 0\) \{\n                          toast.error\('Nenhuma OS selecionada.'\);\n                          return;\n                        \}\n                        const total = selectedOses.reduce\(\(sum, os\) => sum \+ \(os.netValue \+ \(os.tollCost \|\| 0\) \+ \(os.otherExpenses \|\| 0\)\), 0\);\n                        const driver = drivers.find\(d => d.id === financeDriverId\);\n                        const osList = selectedOses.map\(os => `- OS #\$\{os.number\} \(\$\{new Date\(os.createdAt\).toLocaleDateString\('pt-BR'\)\}\): \$\{formatBRL\(os.netValue \+ \(os.tollCost \|\| 0\) \+ \(os.otherExpenses \|\| 0\)\)\}`\).join\('%0A'\);\n                        const msg = `Olá \$\{driver\?.name\}, segue o resumo de pagamento das suas viagens:%0A%0A\$\{osList\}%0A%0A\*Total a receber: \$\{formatBRL\(total\)\}\*`;\n                        window.open\(`https:\/\/wa.me\/\?text=\$\{msg\}`\, '_blank'\);\n                      \}\}\n                      className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"\n                    >\n                      WhatsApp\n                    <\/button>/g,
    `<button 
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
                    </button>`);

// Replace Marcar como Pago button
code = code.replace(/<button \n                      onClick=\{async \(\) => \{\n                        const selectedOses = orders.filter\(os => os.driverId === financeDriverId && selectedFinanceOsIds\[os.id!\]\);\n                        if \(selectedOses.length === 0\) \{\n                          toast.error\('Nenhuma OS selecionada.'\);\n                          return;\n                        \}\n                        let successCount = 0;\n                        for \(const os of selectedOses\) \{\n                          try \{\n                            const osRef = doc\(db, 'orders', os.id!\);\n                            await updateDoc\(osRef, \{ paymentStatusDriver: 'PAID' \}\);\n                            successCount\+\+;\n                          \} catch \(e\) \{\}\n                        \}\n                        if \(successCount > 0\) \{\n                           toast.success\(`\$\{successCount\} OSs marcadas como pagas!`\);\n                           setSelectedFinanceOsIds\(\{\}\);\n                        \}\n                      \}\}\n                      className="flex-1 bg-emerald-100 text-emerald-800 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-200 transition-colors"\n                    >\n                      Marcar como Pago\n                    <\/button>/g,
    `<button 
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
                    </button>`);

fs.writeFileSync('src/components/Admin.tsx', code);
