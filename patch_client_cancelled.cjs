const fs = require('fs');
let code = fs.readFileSync('src/components/Client.tsx', 'utf8');

const badgeRegex = /os\.status === 'APPROVED' \? 'bg-purple-100 text-purple-700' :\s*'bg-amber-100 text-amber-700'/g;
code = code.replace(badgeRegex, "os.status === 'APPROVED' ? 'bg-purple-100 text-purple-700' : os.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'");

const labelRegex = /os\.status === 'APPROVED' \? 'Aprovado \(Aguard\. Coleta\)' :\s*'Pendente \(Aguard\. Aprovação\)'/g;
code = code.replace(labelRegex, "os.status === 'APPROVED' ? 'Aprovado (Aguard. Coleta)' : os.status === 'CANCELLED' ? 'Cancelada' : 'Pendente (Aguard. Aprovação)'");

fs.writeFileSync('src/components/Client.tsx', code);
