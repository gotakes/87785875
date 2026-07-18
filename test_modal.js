const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');
console.log(code.includes("print:block absolute inset-0 bg-white z-[9999]"));
