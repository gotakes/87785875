const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

code = code.replace(/void \}\)\) \{/, "void }) {");

fs.writeFileSync('src/components/Admin.tsx', code);
