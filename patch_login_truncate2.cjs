const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf8');

code = code.replace(/ truncate/g, '');

fs.writeFileSync('src/components/Login.tsx', code);
console.log("Patched Login.tsx all truncates");
