const fs = require('fs');
const file = 'src/components/PrintFiscalModal.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'retencoes: 0, // Simplificação - se houvesse INSS/SEST/SENAT, descontaria aqui',
  'retencoes: orders.reduce((sum, os) => sum + ((os.grossValue || 0) - (os.netValue || 0)), 0),'
);

fs.writeFileSync(file, content);
