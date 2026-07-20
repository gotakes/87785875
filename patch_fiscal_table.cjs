const fs = require('fs');
let file = 'src/components/PrintFiscalModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace table header
content = content.replace(/<th className="py-2 px-2 text-right">Valor Bruto<\/th>\s*<th className="py-2 px-2 text-right">Descontos<\/th>/g, "");

// Replace table row
content = content.replace(/<td className="py-2 px-2 text-right">\{formatBRL\(item\.bruto\)\}<\/td>\s*<td className="py-2 px-2 text-right text-red-600">\{formatBRL\(item\.descontos\)\}<\/td>/g, "");

// Replace table footer
const footerTarget = `<td colSpan={3} className="py-3 px-2 text-right uppercase text-slate-700">TOTAIS NO ANO:</td>
                  <td className="py-3 px-2 text-right">{formatBRL(fiscalData.resumo.bruto)}</td>
                  <td className="py-3 px-2 text-right text-red-600">{formatBRL(fiscalData.resumo.retencoes)}</td>
                  <td className="py-3 px-2 text-right text-indigo-900">{formatBRL(fiscalData.resumo.liquido)}</td>`;

const footerReplacement = `<td colSpan={3} className="py-3 px-2 text-right uppercase text-slate-700">TOTAIS NO ANO:</td>
                  <td className="py-3 px-2 text-right text-indigo-900">{formatBRL(fiscalData.resumo.liquido)}</td>`;

content = content.replace(footerTarget, footerReplacement);

// Fix colspans
content = content.replace(/<td colSpan=\{6\} className="py-4 text-center text-slate-500">Nenhum pagamento registrado neste período\.<\/td>/g, `<td colSpan={4} className="py-4 text-center text-slate-500">Nenhum pagamento registrado neste período.</td>`);

fs.writeFileSync(file, content);
console.log("Patched PrintFiscalModal.tsx table");
