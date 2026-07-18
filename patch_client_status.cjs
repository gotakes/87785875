const fs = require('fs');
let code = fs.readFileSync('src/components/Client.tsx', 'utf8');

const regexStatusClass = /<span className=\{\`text-xs font-bold px-2 py-1 rounded-full \$\{\s*os\.status === 'COMPLETED' \? 'bg-emerald-100 text-emerald-700' :\s*os\.status === 'IN_TRANSIT' \? 'bg-blue-100 text-blue-700' :\s*'bg-amber-100 text-amber-700'\s*\}\`\}>\s*\{os\.status === 'COMPLETED' \? 'Entregue' : os\.status === 'IN_TRANSIT' \? 'Em Trânsito' : 'Aguardando Coleta'\}\s*<\/span>/g;

const newStatusCode = `<span className={\`text-xs font-bold px-2 py-1 rounded-full \${
                        os.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                        os.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-700' :
                        os.status === 'APPROVED' ? 'bg-purple-100 text-purple-700' :
                        'bg-amber-100 text-amber-700'
                      }\`}>
                        {os.status === 'COMPLETED' ? 'Entregue' : 
                         os.status === 'IN_TRANSIT' ? 'Em Trânsito' : 
                         os.status === 'APPROVED' ? 'Aprovado (Aguard. Coleta)' : 
                         'Pendente (Aguard. Aprovação)'}
                      </span>`;

code = code.replace(regexStatusClass, newStatusCode);
fs.writeFileSync('src/components/Client.tsx', code);
