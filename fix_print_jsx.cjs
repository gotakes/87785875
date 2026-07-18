const fs = require('fs');
let code = fs.readFileSync('src/components/PrintOsModal.tsx', 'utf8');

code = code.replace(
  /\`R\$ \$\{\(\(printOs\.grossValue/g,
  `{\`R$ \${((printOs.grossValue`
);

code = code.replace(
  /\)\.toFixed\(2\)\.replace\('\.',','\)\}\`/g,
  `).toFixed(2).replace('.',',')}\`}`
);

fs.writeFileSync('src/components/PrintOsModal.tsx', code);
