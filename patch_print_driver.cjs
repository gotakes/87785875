const fs = require('fs');

let code = fs.readFileSync('src/components/PrintOsModal.tsx', 'utf8');

code = code.replace(
  /\{userRole === 'DRIVER' \? '-' : `R\$ \$\{.*?\}\`\}/,
  `{userRole === 'DRIVER' ? '' : \`R$ \${((printOs.grossValue || 0) + (printOs.tollCost || 0) + (printOs.otherExpenses || 0)).toFixed(2).replace('.',',')}\`}`
);

code = code.replace(
  /\{userRole === 'ADMIN' \? `- R\$ \$\{\(printOs\.carrierCommission \|\| 0\)\.toFixed\(2\)\.replace\('\.',','\)\}\` : '-'\}/,
  `{userRole === 'ADMIN' ? \`- R$ \${(printOs.carrierCommission || 0).toFixed(2).replace('.',',')}\` : ''}`
);

code = code.replace(
  /\{userRole === 'CLIENT' \? '-' : `R\$ \$\{\(printOs\.netValue \|\| 0\)\.toFixed\(2\)\.replace\('\.',','\)\}`\}/,
  `{userRole === 'CLIENT' ? '' : \`R$ \${(printOs.netValue || 0).toFixed(2).replace('.',',')}\`}`
);

fs.writeFileSync('src/components/PrintOsModal.tsx', code);
