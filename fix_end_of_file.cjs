const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

// fix the extra brace
code = code.replace(/  \);\n\}\n\}$/g, "  );\n}");
fs.writeFileSync('src/components/Admin.tsx', code);
