const fs = require('fs');
let code = fs.readFileSync('src/components/Client.tsx', 'utf8');

code = code.replace(/<div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">/,
  '<>\n              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">');

code = code.replace(/<\/div>\n\s*\{Object\.values\(selectedOsIds\)/,
  '</div>\n              {Object.values(selectedOsIds)');

code = code.replace(/<\/div>\n              \)\}\n            \)\}/,
  '</div>\n              )}\n              </>\n            )}');

fs.writeFileSync('src/components/Client.tsx', code);
