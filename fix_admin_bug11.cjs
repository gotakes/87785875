const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

code = code.replace(/<td className="p-4 text-slate-600">-<\/td>\n\s*<\/tr>\n\s*\)\)\n\s*\}\n\s*<\/tbody>/g, '<td className="p-4 text-slate-600">-</td>\n                        </tr>\n                      ))\n                    )}\n                  </tbody>');

fs.writeFileSync('src/components/Admin.tsx', code);
