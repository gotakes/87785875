const fs = require('fs');
let code = fs.readFileSync('src/components/Driver.tsx', 'utf8');

const regexStatusSpan = /<span className=\{\`text-xs font-semibold px-2 py-1 rounded-full \$\{order\.status === 'COMPLETED' \? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'\}\`\}>\s*\{order\.status === 'COMPLETED' \? 'Finalizada' : order\.status === 'IN_TRANSIT' \? 'Em Rota' : 'Pendente'\}\s*<\/span>/g;

const newStatusSpan = `<span className={\`text-xs font-semibold px-2 py-1 rounded-full \${order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : order.status === 'IN_TRANSIT' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}\`}>
            {order.status === 'COMPLETED' ? 'Finalizada' : order.status === 'IN_TRANSIT' ? 'Em Rota' : order.status === 'APPROVED' ? 'Aprovado' : 'Pendente'}
          </span>`;

code = code.replace(regexStatusSpan, newStatusSpan);

code = code.replace(
  /\{order\.status === 'PENDING' && \(/g,
  `{(order.status === 'PENDING_APPROVAL' || order.status === 'APPROVED') && (`
);

fs.writeFileSync('src/components/Driver.tsx', code);
