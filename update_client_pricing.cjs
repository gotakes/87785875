const fs = require('fs');
let client = fs.readFileSync('src/components/Client.tsx', 'utf8');

client = client.replace(
  /<span className="text-slate-800 font-bold">Custo Total<\/span>/,
  '<span className="text-slate-800 font-bold">Frete Total da OS</span>'
);

fs.writeFileSync('src/components/Client.tsx', client);
