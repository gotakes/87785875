const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');
code = code.replace(/\}\n\}$/, '}');
fs.writeFileSync('src/components/Admin.tsx', code);
