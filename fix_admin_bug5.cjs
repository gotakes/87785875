const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

code = code.replace(/<\/tr>\n\s*\)\)\}\n\s*\}\n\s*<\/tbody>/g, '</tr>\n                      ))\n                    )}\n                  </tbody>');

fs.writeFileSync('src/components/Admin.tsx', code);
