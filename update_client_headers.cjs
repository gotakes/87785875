const fs = require('fs');

let client = fs.readFileSync('src/components/Client.tsx', 'utf8');

client = client.replace(
  /<p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Valor Total<\/p>/,
  '<p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Frete Total da OS</p>'
);

client = client.replace(
  /<th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Valor Total<\/th>/,
  '<th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Frete Total da OS</th>'
);

fs.writeFileSync('src/components/Client.tsx', client);
