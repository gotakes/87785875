const fs = require('fs');
let code = fs.readFileSync('src/components/Client.tsx', 'utf8');

const regex = /<p className="text-\[\#ff3b00\] font-bold text-lg">\{new Intl\.NumberFormat\('pt-BR', \{ style: 'currency', currency: 'BRL' \}\)\.format\(osTotalValue\)\}<\/p>([\s\S]*?)<div className="flex justify-between items-center text-sm">\s*<span className="text-slate-600 font-semibold">Pedágio<\/span>\s*<span className="text-slate-900 font-bold">R\$ \{osTollValue\.toLocaleString\('pt-BR', \{ minimumFractionDigits: 2, maximumFractionDigits: 2 \}\)\}<\/span>\s*<\/div>/g;

code = code.replace(regex, `$1`);

fs.writeFileSync('src/components/Client.tsx', code);
