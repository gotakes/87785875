const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

const oldWhatsApp = /onWhatsApp=\{\(\) => \{\n\s*const driver = drivers\.find\(d => d\.cpf === statementData\.targetDocument\);\n\s*if \(driver\) \{\n\s*const total = statementData\.orders\.reduce\(\(sum, os\) => sum \+ \(os\.netValue \+ \(os\.tollCost \|\| 0\) \+ \(os\.otherExpenses \|\| 0\)\), 0\);\n\s*const osList = statementData\.orders\.map\(os => `- OS #\\$\\{os\.number\\}: R\\$ \\$\\{\(os\.netValue \+ \(os\.tollCost \|\| 0\) \+ \(os\.otherExpenses \|\| 0\)\)\.toFixed\(2\)\.replace\('\.', ','\)\\}`\)\.join\('%0A'\);\n\s*const msg = `Olá \\$\\{driver\.name\\}, segue o resumo de pagamento das suas viagens:%0A%0A\\$\\{osList\\}%0A%0A\*Total a receber: R\\$ \\$\\{total\.toFixed\(2\)\.replace\('\.', ','\)\\}\\*`;\n\s*window\.open\(`https:\/\/wa\.me\/\?text=\\$\\{msg\\}`, '_blank'\);\n\s*\}\n\s*\}\}/;

const newWhatsApp = `onWhatsApp={() => {
            if (statementData.role === 'ADMIN_TO_CLIENT') {
               const total = statementData.orders.reduce((sum, os) => sum + (os.totalValue || 0), 0);
               const osList = statementData.orders.map(os => \`- OS #\${os.number}: R$ \${(os.totalValue || 0).toFixed(2).replace('.', ',')}\`).join('%0A');
               const msg = \`Olá \${statementData.targetName}, segue o faturamento dos serviços de transporte prestados:%0A%0A\${osList}%0A%0A*Total a pagar: R$ \${total.toFixed(2).replace('.', ',')}*\`;
               window.open(\`https://wa.me/?text=\${msg}\`, '_blank');
            } else {
               const total = statementData.orders.reduce((sum, os) => sum + (os.netValue + (os.tollCost || 0) + (os.otherExpenses || 0)), 0);
               const osList = statementData.orders.map(os => \`- OS #\${os.number}: R$ \${(os.netValue + (os.tollCost || 0) + (os.otherExpenses || 0)).toFixed(2).replace('.', ',')}\`).join('%0A');
               const msg = \`Olá \${statementData.targetName}, segue o resumo de pagamento das suas viagens:%0A%0A\${osList}%0A%0A*Total a receber: R$ \${total.toFixed(2).replace('.', ',')}*\`;
               window.open(\`https://wa.me/?text=\${msg}\`, '_blank');
            }
          }}`;

code = code.replace(oldWhatsApp, newWhatsApp);
fs.writeFileSync('src/components/Admin.tsx', code);
