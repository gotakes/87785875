const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

code = code.replace(/\}\n\s*\.map\(os => \(/g, '\n                        .map(os => (');
code = code.replace(/<td className="p-4 text-slate-600">-<\/td>\n\s*<\/tr>\n\s*\)\)}\n\s*\}\n\s*<\/tbody>/g, '<td className="p-4 text-slate-600">-</td>\n                        </tr>\n                      ))\n                    )}\n                  </tbody>');
code = code.replace(/<\/td>\n\s*<\/tr>\n\s*\)\)}\n\s*\{orders\.filter/g, '</td>\n                            </tr>\n                          ))\n                        }\n                        \n                        {orders.filter');

fs.writeFileSync('src/components/Admin.tsx', code);
