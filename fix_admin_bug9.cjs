const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

code = code.replace(/<\/tr>\n\s*\)\)\n\s*\}\n\s*\{orders\.filter/g, '</tr>\n                          ))}\n                        \n                        {orders.filter');

fs.writeFileSync('src/components/Admin.tsx', code);
