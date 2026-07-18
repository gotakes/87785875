const fs = require('fs');
let code = fs.readFileSync('src/components/Client.tsx', 'utf8');

code = code.replace(/const newSelection = \{ \.\.\.selectedOsIds \};\n\s*clientOrders\.forEach\(os => \{\n\s*newSelection\[os\.id!\] = checked;\n\s*\}\);/,
  "const newSelection = { ...selectedOsIds };\n                             clientOrders.filter(os => os.paymentStatusClient !== 'PAID').forEach(os => {\n                               newSelection[os.id!] = checked;\n                             });");
                             
code = code.replace(/<td className="px-6 py-4 text-center">\n\s*<input \n\s*type="checkbox"\n\s*checked=\{!!selectedOsIds\[os\.id!\]\}\n\s*onChange=\{\(e\) => \{\n\s*setSelectedOsIds\(prev => \(\{\n\s*\.\.\.prev,\n\s*\[os\.id!\]: e\.target\.checked\n\s*\}\)\);\n\s*\}\}\n\s*className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"/g,
  `<td className="px-6 py-4 text-center">
                            <input 
                              type="checkbox"
                              checked={!!selectedOsIds[os.id!]}
                              onChange={(e) => {
                                setSelectedOsIds(prev => ({
                                  ...prev,
                                  [os.id!]: e.target.checked
                                }));
                              }}
                              disabled={os.paymentStatusClient === 'PAID'}
                              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"`);

fs.writeFileSync('src/components/Client.tsx', code);
