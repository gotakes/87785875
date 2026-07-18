const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

code = code.replace(/clientName: loadedClientOs \? loadedClientOs\.clientName : undefined,/g, 
  "clientName: loadedClientOs ? loadedClientOs.clientName : undefined,\n                      clientDocument: loadedClientOs ? loadedClientOs.clientDocument : undefined,");

fs.writeFileSync('src/components/Admin.tsx', code);
