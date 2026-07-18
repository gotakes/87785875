const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');
code = code.trim();
if (code.endsWith('}}')) {
  code = code.substring(0, code.length - 1);
}
fs.writeFileSync('src/components/Admin.tsx', code);
